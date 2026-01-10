import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { differenceInDays } from 'date-fns';

export interface Reservation {
  id: string;
  guest_id: string;
  room_id: string;
  check_in: string;
  check_out: string;
  adults: number;
  children: number;
  status: 'pending' | 'confirmed' | 'checked_in' | 'checked_out' | 'cancelled';
  payment_status: 'pending' | 'partial' | 'paid' | 'refunded';
  total_amount: number;
  special_requests?: string;
  confirmation_code?: string;
  created_at: string;
  updated_at: string;
  guests?: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
  };
  rooms?: {
    id: string;
    number: string;
    type: string;
    price_per_night: number;
  };
}

export function useReservations() {
  return useQuery({
    queryKey: ['reservations'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('reservations')
        .select(`
          *,
          guests (id, first_name, last_name, email),
          rooms (id, number, type, price_per_night)
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as Reservation[];
    },
  });
}

export interface CreateReservationData {
  guestId: string;
  roomId: string;
  checkIn: Date;
  checkOut: Date;
  adults: number;
  children: number;
  specialRequests?: string;
  pricePerNight: number;
}

export function useCreateReservation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (reservation: CreateReservationData) => {
      const nights = differenceInDays(reservation.checkOut, reservation.checkIn);
      const totalAmount = nights * reservation.pricePerNight;

      const { data, error } = await supabase
        .from('reservations')
        .insert({
          guest_id: reservation.guestId,
          room_id: reservation.roomId,
          check_in: reservation.checkIn.toISOString().split('T')[0],
          check_out: reservation.checkOut.toISOString().split('T')[0],
          adults: reservation.adults,
          children: reservation.children,
          special_requests: reservation.specialRequests || null,
          total_amount: totalAmount,
          status: 'pending',
          payment_status: 'pending',
        })
        .select(`
          *,
          guests (id, first_name, last_name, email),
          rooms (id, number, type, price_per_night)
        `)
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['reservations'] });
      toast({ 
        title: 'Reservation Created', 
        description: `Confirmation: ${data.confirmation_code}` 
      });
    },
    onError: (error: Error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });
}

export function useUpdateReservation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Reservation> }) => {
      const { data, error } = await supabase
        .from('reservations')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reservations'] });
      toast({ title: 'Reservation Updated', description: 'The reservation has been updated.' });
    },
    onError: (error: Error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });
}

export function useCancelReservation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('reservations')
        .update({ status: 'cancelled' })
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reservations'] });
      toast({ title: 'Reservation Cancelled', description: 'The reservation has been cancelled.' });
    },
    onError: (error: Error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });
}
