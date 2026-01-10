import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import type { RoomFormData } from '@/lib/validations';

export interface Room {
  id: string;
  number: string;
  floor: number;
  type: 'single' | 'double' | 'suite' | 'deluxe' | 'presidential';
  status: 'available' | 'occupied' | 'maintenance' | 'cleaning';
  price_per_night: number;
  max_occupancy: number;
  amenities: string[];
  description?: string;
  created_at: string;
  updated_at: string;
}

export function useRooms() {
  return useQuery({
    queryKey: ['rooms'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('rooms')
        .select('*')
        .order('number');
      
      if (error) throw error;
      return data as Room[];
    },
  });
}

export function useCreateRoom() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (room: RoomFormData) => {
      const { data, error } = await supabase
        .from('rooms')
        .insert({
          number: room.number,
          floor: room.floor,
          type: room.type,
          status: room.status,
          price_per_night: room.pricePerNight,
          max_occupancy: room.maxOccupancy,
          amenities: room.amenities,
          description: room.description || null,
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rooms'] });
      toast({ title: 'Room Created', description: 'The room has been added successfully.' });
    },
    onError: (error: Error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });
}

export function useUpdateRoom() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, room }: { id: string; room: Partial<RoomFormData> }) => {
      const updateData: Record<string, unknown> = {};
      if (room.number !== undefined) updateData.number = room.number;
      if (room.floor !== undefined) updateData.floor = room.floor;
      if (room.type !== undefined) updateData.type = room.type;
      if (room.status !== undefined) updateData.status = room.status;
      if (room.pricePerNight !== undefined) updateData.price_per_night = room.pricePerNight;
      if (room.maxOccupancy !== undefined) updateData.max_occupancy = room.maxOccupancy;
      if (room.amenities !== undefined) updateData.amenities = room.amenities;
      if (room.description !== undefined) updateData.description = room.description;

      const { data, error } = await supabase
        .from('rooms')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rooms'] });
      toast({ title: 'Room Updated', description: 'The room has been updated successfully.' });
    },
    onError: (error: Error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });
}

export function useDeleteRoom() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('rooms')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rooms'] });
      toast({ title: 'Room Deleted', description: 'The room has been removed.' });
    },
    onError: (error: Error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });
}
