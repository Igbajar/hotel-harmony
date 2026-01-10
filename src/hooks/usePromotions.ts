import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import type { PromotionFormData } from '@/lib/validations';

export interface Promotion {
  id: string;
  code: string;
  name: string;
  description?: string;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  min_stay?: number;
  max_uses?: number;
  used_count: number;
  start_date: string;
  end_date: string;
  active: boolean;
  room_types?: string[];
  created_at: string;
  updated_at: string;
}

export function usePromotions() {
  return useQuery({
    queryKey: ['promotions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('promotions')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as Promotion[];
    },
  });
}

export function useCreatePromotion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (promotion: PromotionFormData) => {
      const { data, error } = await supabase
        .from('promotions')
        .insert({
          code: promotion.code,
          name: promotion.name,
          description: promotion.description || null,
          discount_type: promotion.discountType,
          discount_value: promotion.discountValue,
          min_stay: promotion.minStay || null,
          max_uses: promotion.maxUses || null,
          start_date: promotion.startDate.toISOString().split('T')[0],
          end_date: promotion.endDate.toISOString().split('T')[0],
          active: promotion.active,
          room_types: promotion.roomTypes || null,
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['promotions'] });
      toast({ title: 'Promotion Created', description: 'The promotion has been created successfully.' });
    },
    onError: (error: Error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });
}

export function useUpdatePromotion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, promotion }: { id: string; promotion: Partial<PromotionFormData> }) => {
      const updateData: Record<string, unknown> = {};
      if (promotion.code !== undefined) updateData.code = promotion.code;
      if (promotion.name !== undefined) updateData.name = promotion.name;
      if (promotion.description !== undefined) updateData.description = promotion.description;
      if (promotion.discountType !== undefined) updateData.discount_type = promotion.discountType;
      if (promotion.discountValue !== undefined) updateData.discount_value = promotion.discountValue;
      if (promotion.minStay !== undefined) updateData.min_stay = promotion.minStay;
      if (promotion.maxUses !== undefined) updateData.max_uses = promotion.maxUses;
      if (promotion.startDate !== undefined) updateData.start_date = promotion.startDate.toISOString().split('T')[0];
      if (promotion.endDate !== undefined) updateData.end_date = promotion.endDate.toISOString().split('T')[0];
      if (promotion.active !== undefined) updateData.active = promotion.active;
      if (promotion.roomTypes !== undefined) updateData.room_types = promotion.roomTypes;

      const { data, error } = await supabase
        .from('promotions')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['promotions'] });
      toast({ title: 'Promotion Updated', description: 'The promotion has been updated.' });
    },
    onError: (error: Error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });
}

export function useDeletePromotion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('promotions')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['promotions'] });
      toast({ title: 'Promotion Deleted', description: 'The promotion has been removed.' });
    },
    onError: (error: Error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });
}

export function useTogglePromotion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, active }: { id: string; active: boolean }) => {
      const { data, error } = await supabase
        .from('promotions')
        .update({ active })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['promotions'] });
      toast({ 
        title: data.active ? 'Promotion Activated' : 'Promotion Deactivated', 
        description: `The promotion "${data.name}" has been ${data.active ? 'activated' : 'deactivated'}.` 
      });
    },
    onError: (error: Error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });
}
