import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import type { CampaignFormData } from '@/lib/validations';

export interface Campaign {
  id: string;
  name: string;
  description?: string;
  type: string;
  status: 'draft' | 'active' | 'paused' | 'completed' | 'cancelled';
  start_date?: string;
  end_date?: string;
  budget?: number;
  target_audience?: string;
  created_at: string;
  updated_at: string;
}

export function useCampaigns() {
  return useQuery({
    queryKey: ['campaigns'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('campaigns')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as Campaign[];
    },
  });
}

export function useCreateCampaign() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (campaign: CampaignFormData) => {
      const { data, error } = await supabase
        .from('campaigns')
        .insert({
          name: campaign.name,
          description: campaign.description || null,
          type: campaign.type,
          status: campaign.status,
          start_date: campaign.startDate?.toISOString().split('T')[0] || null,
          end_date: campaign.endDate?.toISOString().split('T')[0] || null,
          budget: campaign.budget || null,
          target_audience: campaign.targetAudience || null,
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
      toast({ title: 'Campaign Created', description: 'The campaign has been created successfully.' });
    },
    onError: (error: Error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });
}

export function useUpdateCampaign() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, campaign }: { id: string; campaign: Partial<CampaignFormData> }) => {
      const updateData: Record<string, unknown> = {};
      if (campaign.name !== undefined) updateData.name = campaign.name;
      if (campaign.description !== undefined) updateData.description = campaign.description;
      if (campaign.type !== undefined) updateData.type = campaign.type;
      if (campaign.status !== undefined) updateData.status = campaign.status;
      if (campaign.startDate !== undefined) updateData.start_date = campaign.startDate?.toISOString().split('T')[0];
      if (campaign.endDate !== undefined) updateData.end_date = campaign.endDate?.toISOString().split('T')[0];
      if (campaign.budget !== undefined) updateData.budget = campaign.budget;
      if (campaign.targetAudience !== undefined) updateData.target_audience = campaign.targetAudience;

      const { data, error } = await supabase
        .from('campaigns')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
      toast({ title: 'Campaign Updated', description: 'The campaign has been updated.' });
    },
    onError: (error: Error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });
}

export function useDeleteCampaign() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('campaigns')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
      toast({ title: 'Campaign Deleted', description: 'The campaign has been removed.' });
    },
    onError: (error: Error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });
}
