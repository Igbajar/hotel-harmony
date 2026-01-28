import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export interface HousekeepingStaff {
  id: string;
  staff_id: string | null;
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
  shift: 'morning' | 'afternoon' | 'night';
  status: 'available' | 'busy' | 'off-duty';
  tasks_completed: number;
  average_time: number;
  rating: number;
  created_at: string;
  updated_at: string;
}

export interface HousekeepingTask {
  id: string;
  room_id: string | null;
  assigned_to: string | null;
  type: 'daily-cleaning' | 'checkout-cleaning' | 'deep-cleaning' | 'turndown' | 'maintenance-request' | 'laundry';
  status: 'pending' | 'in-progress' | 'completed' | 'verified';
  priority: 'low' | 'normal' | 'high' | 'urgent';
  notes: string | null;
  estimated_duration: number;
  actual_duration: number | null;
  scheduled_for: string;
  started_at: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
  rooms?: {
    id: string;
    number: string;
    type: string;
  };
  housekeeping_staff?: HousekeepingStaff;
}

export function useHousekeepingTasks() {
  return useQuery({
    queryKey: ['housekeeping-tasks'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('housekeeping_tasks')
        .select(`
          *,
          rooms (id, number, type),
          housekeeping_staff (*)
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as HousekeepingTask[];
    },
  });
}

export function useHousekeepingStaff() {
  return useQuery({
    queryKey: ['housekeeping-staff'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('housekeeping_staff')
        .select('*')
        .order('first_name', { ascending: true });
      
      if (error) throw error;
      return data as HousekeepingStaff[];
    },
  });
}

export function useCreateHousekeepingTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (task: Omit<HousekeepingTask, 'id' | 'created_at' | 'updated_at' | 'rooms' | 'housekeeping_staff'>) => {
      const { data, error } = await supabase
        .from('housekeeping_tasks')
        .insert(task)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['housekeeping-tasks'] });
      toast({ title: 'Task Created', description: 'Housekeeping task has been created.' });
    },
    onError: (error: Error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });
}

export function useUpdateHousekeepingTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<HousekeepingTask> }) => {
      const { data, error } = await supabase
        .from('housekeeping_tasks')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['housekeeping-tasks'] });
      toast({ title: 'Task Updated', description: 'Housekeeping task has been updated.' });
    },
    onError: (error: Error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });
}

export function useCreateHousekeepingStaff() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (staff: Omit<HousekeepingStaff, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('housekeeping_staff')
        .insert(staff)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['housekeeping-staff'] });
      toast({ title: 'Staff Added', description: 'Housekeeping staff has been added.' });
    },
    onError: (error: Error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });
}
