import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

// Types
export interface BarCategory {
  id: string;
  name: string;
  sort_order: number;
  created_at: string;
}

export interface BarDrink {
  id: string;
  name: string;
  category_id: string;
  description: string | null;
  image_url: string | null;
  available: boolean;
  reorder_point: number;
  created_at: string;
  updated_at: string;
  category?: BarCategory;
  measures?: BarDrinkMeasure[];
}

export interface BarDrinkMeasure {
  id: string;
  drink_id: string;
  measure_name: string;
  measure_ml: number | null;
  price: number;
  stock_deduction: number;
  sort_order: number;
  created_at: string;
}

export interface BarOrder {
  id: string;
  order_number: string;
  bartender_id: string | null;
  guest_id: string | null;
  room_id: string | null;
  total_amount: number;
  payment_method: string;
  status: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
  items?: BarOrderItem[];
}

export interface BarOrderItem {
  id: string;
  order_id: string;
  drink_id: string;
  measure_id: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
  created_at: string;
  drink?: BarDrink;
  measure?: BarDrinkMeasure;
}

// Categories
export function useBarCategories() {
  return useQuery({
    queryKey: ['bar-categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('bar_categories')
        .select('*')
        .order('sort_order');
      if (error) throw error;
      return data as BarCategory[];
    },
  });
}

// Drinks with measures
export function useBarDrinks() {
  return useQuery({
    queryKey: ['bar-drinks'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('bar_drinks')
        .select('*, bar_drink_measures(*)')
        .order('name');
      if (error) throw error;
      return (data as any[]).map(d => ({
        ...d,
        measures: (d.bar_drink_measures || []).sort((a: any, b: any) => a.sort_order - b.sort_order),
      })) as BarDrink[];
    },
  });
}

export function useCreateBarDrink() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      name: string;
      category_id: string;
      description?: string;
      available?: boolean;
      reorder_point?: number;
      measures: { measure_name: string; measure_ml?: number; price: number; stock_deduction?: number; sort_order?: number }[];
    }) => {
      const { measures, ...drinkData } = input;
      const { data: drink, error } = await supabase.from('bar_drinks').insert(drinkData).select().single();
      if (error) throw error;

      if (measures.length > 0) {
        const measureRows = measures.map((m, i) => ({
          drink_id: drink.id,
          measure_name: m.measure_name,
          measure_ml: m.measure_ml || null,
          price: m.price,
          stock_deduction: m.stock_deduction ?? 1,
          sort_order: m.sort_order ?? i,
        }));
        const { error: mError } = await supabase.from('bar_drink_measures').insert(measureRows);
        if (mError) throw mError;
      }

      // Create inventory record
      const { error: invError } = await supabase.from('bar_inventory').insert({
        drink_id: drink.id,
        current_stock: 0,
        unit: 'bottles',
      });
      if (invError) throw invError;

      return drink;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['bar-drinks'] }),
  });
}

export function useDeleteBarDrink() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('bar_drinks').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['bar-drinks'] });
      qc.invalidateQueries({ queryKey: ['bar-inventory'] });
    },
  });
}

// Bar Orders
export function useBarOrders() {
  return useQuery({
    queryKey: ['bar-orders'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('bar_orders')
        .select('*, bar_order_items(*, bar_drinks(name), bar_drink_measures(measure_name))')
        .order('created_at', { ascending: false })
        .limit(50);
      if (error) throw error;
      return (data as any[]).map(o => ({
        ...o,
        items: o.bar_order_items || [],
      })) as BarOrder[];
    },
  });
}

export function useCreateBarOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      payment_method?: string;
      notes?: string;
      items: { drink_id: string; measure_id: string; quantity: number; unit_price: number; subtotal: number; stock_deduction: number }[];
    }) => {
      const totalAmount = input.items.reduce((sum, i) => sum + i.subtotal, 0);

      const { data: order, error } = await supabase.from('bar_orders').insert({
        order_number: 'TEMP',
        total_amount: totalAmount,
        payment_method: input.payment_method || 'cash',
        status: 'completed',
        notes: input.notes || null,
      }).select().single();
      if (error) throw error;

      // Insert order items
      const orderItems = input.items.map(i => ({
        order_id: order.id,
        drink_id: i.drink_id,
        measure_id: i.measure_id,
        quantity: i.quantity,
        unit_price: i.unit_price,
        subtotal: i.subtotal,
      }));
      const { error: itemsError } = await supabase.from('bar_order_items').insert(orderItems);
      if (itemsError) throw itemsError;

      // Deduct inventory
      for (const item of input.items) {
        const deduction = item.stock_deduction * item.quantity;
        // Get current stock
        const { data: inv } = await supabase
          .from('bar_inventory')
          .select('current_stock')
          .eq('drink_id', item.drink_id)
          .single();

        if (inv) {
          await supabase
            .from('bar_inventory')
            .update({ current_stock: Math.max(0, inv.current_stock - deduction), updated_at: new Date().toISOString() })
            .eq('drink_id', item.drink_id);
        }

        // Log transaction
        await supabase.from('bar_inventory_transactions').insert({
          drink_id: item.drink_id,
          type: 'sale',
          quantity: -deduction,
          reference_id: order.id,
          notes: `Bar sale - Order ${order.order_number}`,
        });
      }

      return order;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['bar-orders'] });
      qc.invalidateQueries({ queryKey: ['bar-inventory'] });
    },
  });
}
