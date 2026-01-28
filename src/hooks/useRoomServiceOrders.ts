import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export interface RoomServiceOrderItem {
  id: string;
  order_id: string;
  menu_item_id: string | null;
  quantity: number;
  special_instructions: string | null;
  subtotal: number;
  menu_items?: {
    id: string;
    name: string;
    price: number;
    category: string;
  };
}

export interface RoomServiceOrder {
  id: string;
  room_id: string | null;
  guest_id: string | null;
  status: 'pending' | 'preparing' | 'delivering' | 'delivered' | 'cancelled';
  total_amount: number;
  delivery_fee: number;
  special_instructions: string | null;
  estimated_delivery: string | null;
  created_at: string;
  updated_at: string;
  rooms?: {
    id: string;
    number: string;
  };
  guests?: {
    id: string;
    first_name: string;
    last_name: string;
  };
  room_service_order_items?: RoomServiceOrderItem[];
}

export function useRoomServiceOrders() {
  return useQuery({
    queryKey: ['room-service-orders'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('room_service_orders')
        .select(`
          *,
          rooms (id, number),
          guests (id, first_name, last_name),
          room_service_order_items (
            *,
            menu_items (id, name, price, category)
          )
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as RoomServiceOrder[];
    },
  });
}

export interface CreateOrderData {
  room_id: string;
  guest_id: string;
  items: Array<{
    menu_item_id: string;
    quantity: number;
    special_instructions?: string;
    subtotal: number;
  }>;
  total_amount: number;
  delivery_fee: number;
  special_instructions?: string;
}

export function useCreateRoomServiceOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (orderData: CreateOrderData) => {
      // Create the order first
      const { data: order, error: orderError } = await supabase
        .from('room_service_orders')
        .insert({
          room_id: orderData.room_id,
          guest_id: orderData.guest_id,
          total_amount: orderData.total_amount,
          delivery_fee: orderData.delivery_fee,
          special_instructions: orderData.special_instructions || null,
          status: 'pending',
          estimated_delivery: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
        })
        .select()
        .single();
      
      if (orderError) throw orderError;

      // Create the order items
      const orderItems = orderData.items.map(item => ({
        order_id: order.id,
        menu_item_id: item.menu_item_id,
        quantity: item.quantity,
        special_instructions: item.special_instructions || null,
        subtotal: item.subtotal,
      }));

      const { error: itemsError } = await supabase
        .from('room_service_order_items')
        .insert(orderItems);

      if (itemsError) throw itemsError;

      return order;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['room-service-orders'] });
      toast({ title: 'Order Placed', description: 'Room service order has been placed.' });
    },
    onError: (error: Error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });
}

export function useUpdateOrderStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: RoomServiceOrder['status'] }) => {
      const { data, error } = await supabase
        .from('room_service_orders')
        .update({ status })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['room-service-orders'] });
      toast({ 
        title: 'Order Updated', 
        description: `Order status changed to ${variables.status}.` 
      });
    },
    onError: (error: Error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });
}
