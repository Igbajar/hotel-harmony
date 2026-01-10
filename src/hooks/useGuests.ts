import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import type { GuestFormData } from '@/lib/validations';

export interface Guest {
  id: string;
  user_id?: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  address?: string;
  id_type?: string;
  id_number?: string;
  nationality?: string;
  date_of_birth?: string;
  notes?: string;
  vip: boolean;
  created_at: string;
  updated_at: string;
}

export function useGuests() {
  return useQuery({
    queryKey: ['guests'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('guests')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as Guest[];
    },
  });
}

export function useCreateGuest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (guest: GuestFormData) => {
      const { data, error } = await supabase
        .from('guests')
        .insert({
          first_name: guest.firstName,
          last_name: guest.lastName,
          email: guest.email,
          phone: guest.phone || null,
          address: guest.address || null,
          id_type: guest.idType || null,
          id_number: guest.idNumber || null,
          nationality: guest.nationality || null,
          notes: guest.notes || null,
          vip: guest.vip,
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['guests'] });
      toast({ title: 'Guest Added', description: 'The guest has been registered successfully.' });
    },
    onError: (error: Error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });
}

export function useUpdateGuest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, guest }: { id: string; guest: Partial<GuestFormData> }) => {
      const updateData: Record<string, unknown> = {};
      if (guest.firstName !== undefined) updateData.first_name = guest.firstName;
      if (guest.lastName !== undefined) updateData.last_name = guest.lastName;
      if (guest.email !== undefined) updateData.email = guest.email;
      if (guest.phone !== undefined) updateData.phone = guest.phone;
      if (guest.address !== undefined) updateData.address = guest.address;
      if (guest.idType !== undefined) updateData.id_type = guest.idType;
      if (guest.idNumber !== undefined) updateData.id_number = guest.idNumber;
      if (guest.nationality !== undefined) updateData.nationality = guest.nationality;
      if (guest.notes !== undefined) updateData.notes = guest.notes;
      if (guest.vip !== undefined) updateData.vip = guest.vip;

      const { data, error } = await supabase
        .from('guests')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['guests'] });
      toast({ title: 'Guest Updated', description: 'The guest information has been updated.' });
    },
    onError: (error: Error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });
}

export function useDeleteGuest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('guests')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['guests'] });
      toast({ title: 'Guest Removed', description: 'The guest has been removed from the system.' });
    },
    onError: (error: Error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });
}
