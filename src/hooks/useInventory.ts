import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface BarInventoryItem {
  id: string;
  drink_id: string;
  current_stock: number;
  unit: string;
  last_restock_at: string | null;
  created_at: string;
  updated_at: string;
  drink?: { id: string; name: string; reorder_point: number; category_id: string };
}

export interface InventoryTransaction {
  id: string;
  drink_id: string;
  type: string;
  quantity: number;
  notes: string | null;
  reference_id: string | null;
  user_id: string | null;
  created_at: string;
  drink?: { name: string };
}

export function useBarInventory() {
  return useQuery({
    queryKey: ['bar-inventory'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('bar_inventory')
        .select('*, bar_drinks(id, name, reorder_point, category_id)')
        .order('created_at');
      if (error) throw error;
      return (data as any[]).map(d => ({ ...d, drink: d.bar_drinks })) as BarInventoryItem[];
    },
  });
}

export function useInventoryTransactions(drinkId?: string) {
  return useQuery({
    queryKey: ['inventory-transactions', drinkId],
    queryFn: async () => {
      let query = supabase
        .from('bar_inventory_transactions')
        .select('*, bar_drinks(name)')
        .order('created_at', { ascending: false })
        .limit(100);

      if (drinkId) query = query.eq('drink_id', drinkId);

      const { data, error } = await query;
      if (error) throw error;
      return (data as any[]).map(d => ({ ...d, drink: d.bar_drinks })) as InventoryTransaction[];
    },
  });
}

export function useAdjustStock() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: { drink_id: string; quantity: number; type: 'purchase' | 'wastage' | 'adjustment' | 'stocktake'; notes?: string; vendor_id?: string }) => {
      // Get current stock
      const { data: inv, error: fetchError } = await supabase
        .from('bar_inventory')
        .select('current_stock')
        .eq('drink_id', input.drink_id)
        .single();
      if (fetchError) throw fetchError;

      let newStock: number;
      if (input.type === 'stocktake') {
        newStock = input.quantity; // Set absolute value
      } else {
        newStock = Math.max(0, (inv?.current_stock || 0) + input.quantity);
      }

      const { error: updateError } = await supabase
        .from('bar_inventory')
        .update({
          current_stock: newStock,
          updated_at: new Date().toISOString(),
          ...(input.type === 'purchase' ? { last_restock_at: new Date().toISOString() } : {}),
        })
        .eq('drink_id', input.drink_id);
      if (updateError) throw updateError;

      // Log transaction
      const transactionQty = input.type === 'stocktake'
        ? input.quantity - (inv?.current_stock || 0)
        : input.quantity;

      const { error: txError } = await supabase.from('bar_inventory_transactions').insert({
        drink_id: input.drink_id,
        type: input.type,
        quantity: transactionQty,
        notes: input.vendor_id && input.type === 'purchase'
          ? `${input.notes ? input.notes + ' | ' : ''}Vendor restock`
          : input.notes || null,
        reference_id: input.vendor_id || null,
      });
      if (txError) throw txError;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['bar-inventory'] });
      qc.invalidateQueries({ queryKey: ['inventory-transactions'] });
    },
  });
}
