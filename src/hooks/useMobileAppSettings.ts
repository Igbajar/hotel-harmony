import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import type { MobileAppSettingsFormData } from '@/lib/validations';

export interface MobileAppSettings {
  id: string;
  user_id?: string;
  push_notifications: boolean;
  email_notifications: boolean;
  sms_notifications: boolean;
  dark_mode: boolean;
  language: string;
  auto_sync: boolean;
  offline_mode: boolean;
  biometric_auth: boolean;
  created_at: string;
  updated_at: string;
}

const defaultSettings: Omit<MobileAppSettings, 'id' | 'user_id' | 'created_at' | 'updated_at'> = {
  push_notifications: true,
  email_notifications: true,
  sms_notifications: false,
  dark_mode: false,
  language: 'en',
  auto_sync: true,
  offline_mode: false,
  biometric_auth: false,
};

export function useMobileAppSettings(userId?: string) {
  return useQuery({
    queryKey: ['mobile-app-settings', userId],
    queryFn: async () => {
      if (!userId) return defaultSettings as MobileAppSettings;

      const { data, error } = await supabase
        .from('mobile_app_settings')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();
      
      if (error) throw error;
      return data || (defaultSettings as MobileAppSettings);
    },
    enabled: true,
  });
}

export function useUpdateMobileAppSettings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId, settings }: { userId: string; settings: MobileAppSettingsFormData }) => {
      const { data: existing } = await supabase
        .from('mobile_app_settings')
        .select('id')
        .eq('user_id', userId)
        .maybeSingle();

      if (existing) {
        const { data, error } = await supabase
          .from('mobile_app_settings')
          .update({
            push_notifications: settings.pushNotifications,
            email_notifications: settings.emailNotifications,
            sms_notifications: settings.smsNotifications,
            dark_mode: settings.darkMode,
            language: settings.language,
            auto_sync: settings.autoSync,
            offline_mode: settings.offlineMode,
            biometric_auth: settings.biometricAuth,
          })
          .eq('user_id', userId)
          .select()
          .single();
        
        if (error) throw error;
        return data;
      } else {
        const { data, error } = await supabase
          .from('mobile_app_settings')
          .insert({
            user_id: userId,
            push_notifications: settings.pushNotifications,
            email_notifications: settings.emailNotifications,
            sms_notifications: settings.smsNotifications,
            dark_mode: settings.darkMode,
            language: settings.language,
            auto_sync: settings.autoSync,
            offline_mode: settings.offlineMode,
            biometric_auth: settings.biometricAuth,
          })
          .select()
          .single();
        
        if (error) throw error;
        return data;
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['mobile-app-settings', variables.userId] });
      toast({ title: 'Settings Saved', description: 'Your mobile app settings have been updated.' });
    },
    onError: (error: Error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });
}
