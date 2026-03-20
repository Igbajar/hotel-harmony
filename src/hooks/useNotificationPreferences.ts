import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface NotificationPreferences {
  id: string;
  user_id: string;
  reservation_enabled: boolean;
  check_in_enabled: boolean;
  check_out_enabled: boolean;
  housekeeping_enabled: boolean;
  backup_enabled: boolean;
  system_enabled: boolean;
  email_digest_enabled: boolean;
  sound_enabled: boolean;
  push_enabled: boolean;
  created_at: string;
  updated_at: string;
}

const defaults: Omit<NotificationPreferences, 'id' | 'user_id' | 'created_at' | 'updated_at'> = {
  reservation_enabled: true,
  check_in_enabled: true,
  check_out_enabled: true,
  housekeeping_enabled: true,
  backup_enabled: true,
  system_enabled: true,
  email_digest_enabled: false,
  sound_enabled: true,
  push_enabled: true,
};

export function useNotificationPreferences() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['notification-preferences', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data, error } = await supabase
        .from('notification_preferences')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();
      if (error) throw error;
      return data as NotificationPreferences | null;
    },
    enabled: !!user?.id,
  });

  const upsert = useMutation({
    mutationFn: async (prefs: Partial<NotificationPreferences>) => {
      if (!user?.id) throw new Error('Not authenticated');
      const { error } = await supabase
        .from('notification_preferences')
        .upsert({ user_id: user.id, ...prefs }, { onConflict: 'user_id' });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notification-preferences'] });
    },
  });

  // Merge saved prefs with defaults
  const preferences: typeof defaults = {
    ...defaults,
    ...(query.data ? {
      reservation_enabled: query.data.reservation_enabled,
      check_in_enabled: query.data.check_in_enabled,
      check_out_enabled: query.data.check_out_enabled,
      housekeeping_enabled: query.data.housekeeping_enabled,
      backup_enabled: query.data.backup_enabled,
      system_enabled: query.data.system_enabled,
      email_digest_enabled: query.data.email_digest_enabled,
      sound_enabled: query.data.sound_enabled,
      push_enabled: query.data.push_enabled,
    } : {}),
  };

  return {
    preferences,
    isLoading: query.isLoading,
    updatePreferences: upsert.mutate,
    isUpdating: upsert.isPending,
  };
}
