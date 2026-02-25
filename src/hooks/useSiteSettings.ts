import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export type SiteSettingKey = 
  | 'site_name' | 'site_slogan' | 'site_logo_url' | 'site_favicon_url'
  | 'footer_text' | 'footer_link_url' | 'footer_link_label' | 'footer_whatsapp'
  | 'footer_extra_links' | 'footer_extra_images';

export function useSiteSettings() {
  return useQuery({
    queryKey: ['site-settings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('site_settings')
        .select('key, value');
      if (error) throw error;
      const settings: Record<string, any> = {};
      data?.forEach((row: any) => {
        settings[row.key] = row.value;
      });
      return settings;
    },
    staleTime: 1000 * 60 * 5,
  });
}

export function useSiteSetting(key: SiteSettingKey) {
  const { data: settings, isLoading } = useSiteSettings();
  return {
    value: settings?.[key] ?? null,
    isLoading,
  };
}

export function useUpdateSiteSetting() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ key, value }: { key: string; value: any }) => {
      const { error } = await supabase
        .from('site_settings')
        .update({ value: JSON.stringify(value) })
        .eq('key', key);
      if (error) {
        // Try upsert if row doesn't exist
        const { error: upsertError } = await supabase
          .from('site_settings')
          .upsert({ key, value: JSON.stringify(value) }, { onConflict: 'key' });
        if (upsertError) throw upsertError;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['site-settings'] });
    },
  });
}
