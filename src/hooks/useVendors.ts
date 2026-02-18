import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface Vendor {
  id: string;
  name: string;
  contact_person: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  payment_terms: string;
  products_supplied: string[] | null;
  status: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface PurchaseOrder {
  id: string;
  po_number: string;
  vendor_id: string;
  status: string;
  total_amount: number;
  expected_delivery: string | null;
  actual_delivery: string | null;
  notes: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  vendor?: Vendor;
  items?: PurchaseOrderItem[];
}

export interface PurchaseOrderItem {
  id: string;
  po_id: string;
  drink_id: string;
  quantity: number;
  unit_price: number;
  received_quantity: number;
  subtotal: number;
  created_at: string;
  drink?: { name: string };
}

export interface VendorPayment {
  id: string;
  vendor_id: string;
  po_id: string | null;
  amount: number;
  payment_method: string;
  payment_date: string;
  reference: string | null;
  notes: string | null;
  created_at: string;
}

export function useVendors() {
  return useQuery({
    queryKey: ['vendors'],
    queryFn: async () => {
      const { data, error } = await supabase.from('vendors').select('*').order('name');
      if (error) throw error;
      return data as Vendor[];
    },
  });
}

export function useCreateVendor() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: Omit<Vendor, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase.from('vendors').insert(input).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['vendors'] }),
  });
}

export function useUpdateVendor() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Vendor> & { id: string }) => {
      const { error } = await supabase.from('vendors').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['vendors'] }),
  });
}

export function useDeleteVendor() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('vendors').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['vendors'] }),
  });
}

export function usePurchaseOrders() {
  return useQuery({
    queryKey: ['purchase-orders'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('purchase_orders')
        .select('*, vendors(name), purchase_order_items(*, bar_drinks(name))')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data as any[]).map(po => ({
        ...po,
        vendor: po.vendors,
        items: (po.purchase_order_items || []).map((item: any) => ({ ...item, drink: item.bar_drinks })),
      })) as PurchaseOrder[];
    },
  });
}

export function useCreatePurchaseOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      vendor_id: string;
      expected_delivery?: string;
      notes?: string;
      items: { drink_id: string; quantity: number; unit_price: number }[];
    }) => {
      const totalAmount = input.items.reduce((sum, i) => sum + i.quantity * i.unit_price, 0);

      const { data: po, error } = await supabase.from('purchase_orders').insert({
        po_number: 'TEMP',
        vendor_id: input.vendor_id,
        total_amount: totalAmount,
        expected_delivery: input.expected_delivery || null,
        notes: input.notes || null,
        status: 'draft',
      }).select().single();
      if (error) throw error;

      const poItems = input.items.map(i => ({
        po_id: po.id,
        drink_id: i.drink_id,
        quantity: i.quantity,
        unit_price: i.unit_price,
        subtotal: i.quantity * i.unit_price,
      }));
      const { error: itemsError } = await supabase.from('purchase_order_items').insert(poItems);
      if (itemsError) throw itemsError;

      return po;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['purchase-orders'] }),
  });
}

export function useReceivePurchaseOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: { po_id: string; items: { id: string; drink_id: string; received_quantity: number }[] }) => {
      // Update PO status
      const { error: poError } = await supabase.from('purchase_orders').update({
        status: 'received',
        actual_delivery: new Date().toISOString().split('T')[0],
        updated_at: new Date().toISOString(),
      }).eq('id', input.po_id);
      if (poError) throw poError;

      // Update each item and add to inventory
      for (const item of input.items) {
        await supabase.from('purchase_order_items').update({
          received_quantity: item.received_quantity,
        }).eq('id', item.id);

        // Add to inventory
        const { data: inv } = await supabase
          .from('bar_inventory')
          .select('current_stock')
          .eq('drink_id', item.drink_id)
          .single();

        if (inv) {
          await supabase.from('bar_inventory').update({
            current_stock: inv.current_stock + item.received_quantity,
            last_restock_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          }).eq('drink_id', item.drink_id);
        }

        await supabase.from('bar_inventory_transactions').insert({
          drink_id: item.drink_id,
          type: 'purchase',
          quantity: item.received_quantity,
          reference_id: input.po_id,
          notes: `Received from PO`,
        });
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['purchase-orders'] });
      qc.invalidateQueries({ queryKey: ['bar-inventory'] });
      qc.invalidateQueries({ queryKey: ['inventory-transactions'] });
    },
  });
}

export function useVendorPayments(vendorId?: string) {
  return useQuery({
    queryKey: ['vendor-payments', vendorId],
    queryFn: async () => {
      let query = supabase.from('vendor_payments').select('*').order('payment_date', { ascending: false });
      if (vendorId) query = query.eq('vendor_id', vendorId);
      const { data, error } = await query;
      if (error) throw error;
      return data as VendorPayment[];
    },
  });
}

export function useCreateVendorPayment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: Omit<VendorPayment, 'id' | 'created_at'>) => {
      const { data, error } = await supabase.from('vendor_payments').insert(input).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['vendor-payments'] }),
  });
}
