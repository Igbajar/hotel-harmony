import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export interface BackupHistoryEntry {
  id: string;
  type: string;
  status: string;
  tables_included: string[];
  record_count: number;
  file_size_bytes: number | null;
  error_message: string | null;
  created_by: string | null;
  created_at: string;
  completed_at: string | null;
}

export function useBackupHistory() {
  return useQuery({
    queryKey: ['backup-history'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('backup_history')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);
      if (error) throw error;
      return data as BackupHistoryEntry[];
    },
  });
}

export function useLogBackup() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (entry: {
      type: string;
      status: string;
      tables_included: string[];
      record_count: number;
      file_size_bytes?: number;
      error_message?: string;
    }) => {
      const { data, error } = await supabase
        .from('backup_history')
        .insert({
          type: entry.type,
          status: entry.status,
          tables_included: entry.tables_included,
          record_count: entry.record_count,
          file_size_bytes: entry.file_size_bytes || null,
          error_message: entry.error_message || null,
          completed_at: entry.status === 'completed' ? new Date().toISOString() : null,
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['backup-history'] });
    },
  });
}

export interface BackupScheduleConfig {
  enabled: boolean;
  frequency: 'daily' | 'weekly' | 'monthly';
  time: string; // HH:MM
  dayOfWeek?: number; // 0-6 for weekly
  dayOfMonth?: number; // 1-28 for monthly
  tables: string[];
  notifyOnComplete: boolean;
}

const DEFAULT_SCHEDULE: BackupScheduleConfig = {
  enabled: false,
  frequency: 'daily',
  time: '02:00',
  dayOfWeek: 0,
  dayOfMonth: 1,
  tables: [],
  notifyOnComplete: true,
};

export function useBackupSchedule() {
  return useQuery({
    queryKey: ['backup-schedule'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('site_settings')
        .select('value')
        .eq('key', 'backup_schedule')
        .maybeSingle();
      if (error) throw error;
      if (!data) return DEFAULT_SCHEDULE;
      return { ...DEFAULT_SCHEDULE, ...(data.value as Record<string, unknown>) } as BackupScheduleConfig;
    },
  });
}

export function useSaveBackupSchedule() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (config: BackupScheduleConfig) => {
      const { error } = await supabase
        .from('site_settings')
        .upsert(
          { key: 'backup_schedule', value: config as any, updated_at: new Date().toISOString() },
          { onConflict: 'key' }
        );
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['backup-schedule'] });
      toast({ title: 'Schedule Saved', description: 'Backup schedule has been updated.' });
    },
    onError: (e: Error) => {
      toast({ title: 'Error', description: e.message, variant: 'destructive' });
    },
  });
}
