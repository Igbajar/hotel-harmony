import { useState } from 'react';
import { format } from 'date-fns';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Plus, Megaphone, Tag, Calendar, DollarSign, Users, MoreHorizontal, Pencil, Trash2, Play, Pause, Copy, Percent, Hash } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Switch } from '@/components/ui/switch';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';
import { useCampaigns, useCreateCampaign, useUpdateCampaign, useDeleteCampaign } from '@/hooks/useCampaigns';
import { usePromotions, useCreatePromotion, useUpdatePromotion, useDeletePromotion } from '@/hooks/usePromotions';
import { campaignSchema, promotionSchema, CampaignFormData, PromotionFormData } from '@/lib/validations';
import { useCurrency } from '@/contexts/CurrencyContext';
import { toast } from '@/hooks/use-toast';
import type { Tables } from '@/integrations/supabase/types';

const campaignTypes = ['Email', 'SMS', 'Social Media', 'Display Ads', 'Direct Mail', 'Push Notification'];
const roomTypes = ['single', 'double', 'suite', 'deluxe', 'presidential'] as const;

const statusColors: Record<string, string> = {
  draft: 'bg-muted text-muted-foreground',
  active: 'bg-green-500/10 text-green-600 border-green-500/20',
  paused: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20',
  completed: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
  cancelled: 'bg-red-500/10 text-red-600 border-red-500/20',
};

export default function Marketing() {
  const { formatPrice } = useCurrency();
  const { data: campaigns = [], isLoading: campaignsLoading } = useCampaigns();
  const { data: promotions = [], isLoading: promotionsLoading } = usePromotions();
  const createCampaign = useCreateCampaign();
  const updateCampaign = useUpdateCampaign();
  const deleteCampaign = useDeleteCampaign();
  const createPromotion = useCreatePromotion();
  const updatePromotion = useUpdatePromotion();
  const deletePromotion = useDeletePromotion();
  
  const [campaignDialogOpen, setCampaignDialogOpen] = useState(false);
  const [promotionDialogOpen, setPromotionDialogOpen] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState<Tables<'campaigns'> | null>(null);
  const [editingPromotion, setEditingPromotion] = useState<Tables<'promotions'> | null>(null);

  const campaignForm = useForm<CampaignFormData>({
    resolver: zodResolver(campaignSchema),
    defaultValues: {
      name: '',
      description: '',
      type: '',
      status: 'draft',
      budget: 0,
      targetAudience: '',
    },
  });

  const promotionForm = useForm<PromotionFormData>({
    resolver: zodResolver(promotionSchema),
    defaultValues: {
      code: '',
      name: '',
      description: '',
      discountType: 'percentage',
      discountValue: 10,
      minStay: 1,
      active: true,
      roomTypes: [],
    },
  });

  const openCampaignDialog = (campaign?: Tables<'campaigns'>) => {
    if (campaign) {
      setEditingCampaign(campaign);
      campaignForm.reset({
        name: campaign.name,
        description: campaign.description || '',
        type: campaign.type,
        status: campaign.status,
        startDate: campaign.start_date ? new Date(campaign.start_date) : undefined,
        endDate: campaign.end_date ? new Date(campaign.end_date) : undefined,
        budget: campaign.budget || 0,
        targetAudience: campaign.target_audience || '',
      });
    } else {
      setEditingCampaign(null);
      campaignForm.reset({
        name: '',
        description: '',
        type: '',
        status: 'draft',
        budget: 0,
        targetAudience: '',
      });
    }
    setCampaignDialogOpen(true);
  };

  const openPromotionDialog = (promotion?: Tables<'promotions'>) => {
    if (promotion) {
      setEditingPromotion(promotion);
      promotionForm.reset({
        code: promotion.code,
        name: promotion.name,
        description: promotion.description || '',
        discountType: promotion.discount_type,
        discountValue: promotion.discount_value,
        minStay: promotion.min_stay || 1,
        maxUses: promotion.max_uses || undefined,
        startDate: new Date(promotion.start_date),
        endDate: new Date(promotion.end_date),
        active: promotion.active ?? true,
        roomTypes: (promotion.room_types as typeof roomTypes[number][]) || [],
      });
    } else {
      setEditingPromotion(null);
      promotionForm.reset({
        code: '',
        name: '',
        description: '',
        discountType: 'percentage',
        discountValue: 10,
        minStay: 1,
        active: true,
        roomTypes: [],
      });
    }
    setPromotionDialogOpen(true);
  };

  const handleCampaignSubmit = async (data: CampaignFormData) => {
    try {
      const campaignData = {
        name: data.name,
        description: data.description || null,
        type: data.type,
        status: data.status,
        start_date: data.startDate ? format(data.startDate, 'yyyy-MM-dd') : null,
        end_date: data.endDate ? format(data.endDate, 'yyyy-MM-dd') : null,
        budget: data.budget || null,
        target_audience: data.targetAudience || null,
      };

      if (editingCampaign) {
        await updateCampaign.mutateAsync({ id: editingCampaign.id, campaign: campaignData });
      } else {
        await createCampaign.mutateAsync(campaignData as any);
      }
      setCampaignDialogOpen(false);
    } catch (error) {
      console.error('Failed to save campaign:', error);
    }
  };

  const handlePromotionSubmit = async (data: PromotionFormData) => {
    try {
      const promotionData = {
        code: data.code.toUpperCase(),
        name: data.name,
        description: data.description || null,
        discount_type: data.discountType,
        discount_value: data.discountValue,
        min_stay: data.minStay || null,
        max_uses: data.maxUses || null,
        start_date: format(data.startDate, 'yyyy-MM-dd'),
        end_date: format(data.endDate, 'yyyy-MM-dd'),
        active: data.active,
        room_types: data.roomTypes?.length ? data.roomTypes : null,
      };

      if (editingPromotion) {
        await updatePromotion.mutateAsync({ id: editingPromotion.id, promotion: promotionData as any });
      } else {
        await createPromotion.mutateAsync(promotionData as any);
      }
      setPromotionDialogOpen(false);
    } catch (error) {
      console.error('Failed to save promotion:', error);
    }
  };

  const handleDeleteCampaign = async (id: string) => {
    if (confirm('Are you sure you want to delete this campaign?')) {
      await deleteCampaign.mutateAsync(id);
    }
  };

  const handleDeletePromotion = async (id: string) => {
    if (confirm('Are you sure you want to delete this promotion?')) {
      await deletePromotion.mutateAsync(id);
    }
  };

  const toggleCampaignStatus = async (campaign: Tables<'campaigns'>) => {
    const newStatus: 'active' | 'paused' = campaign.status === 'active' ? 'paused' : 'active';
    await updateCampaign.mutateAsync({ id: campaign.id, campaign: { status: newStatus } });
  };

  const togglePromotionActive = async (promotion: Tables<'promotions'>) => {
    await updatePromotion.mutateAsync({ id: promotion.id, promotion: { active: !promotion.active } });
  };

  const copyPromoCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast({ title: 'Copied!', description: `Promo code ${code} copied to clipboard` });
  };

  const activeCampaigns = campaigns.filter(c => c.status === 'active').length;
  const activePromotions = promotions.filter(p => p.active).length;
  const totalBudget = campaigns.reduce((sum, c) => sum + (c.budget || 0), 0);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
            <Megaphone className="h-8 w-8 text-primary" />
            Marketing & Promotions
          </h1>
          <p className="mt-1 text-muted-foreground">
            Manage campaigns, discounts, and promotional offers
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Megaphone className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Active Campaigns</p>
                <p className="text-2xl font-bold">{activeCampaigns}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-500/10">
                <Tag className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Active Promotions</p>
                <p className="text-2xl font-bold">{activePromotions}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/10">
                <DollarSign className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Budget</p>
                <p className="text-2xl font-bold">{formatPrice(totalBudget)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-500/10">
                <Users className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Redemptions</p>
                <p className="text-2xl font-bold">{promotions.reduce((sum, p) => sum + (p.used_count || 0), 0)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="campaigns" className="space-y-4">
        <TabsList>
          <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
          <TabsTrigger value="promotions">Promotions & Discounts</TabsTrigger>
        </TabsList>

        {/* Campaigns Tab */}
        <TabsContent value="campaigns" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Marketing Campaigns</h2>
            <Button onClick={() => openCampaignDialog()}>
              <Plus className="h-4 w-4 mr-2" />
              New Campaign
            </Button>
          </div>

          {campaignsLoading ? (
            <div className="text-center py-12 text-muted-foreground">Loading campaigns...</div>
          ) : campaigns.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Megaphone className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                <h3 className="font-semibold mb-2">No campaigns yet</h3>
                <p className="text-muted-foreground mb-4">Create your first marketing campaign to get started</p>
                <Button onClick={() => openCampaignDialog()}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Campaign
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {campaigns.map(campaign => (
                <Card key={campaign.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg">{campaign.name}</CardTitle>
                        <CardDescription className="line-clamp-2 mt-1">
                          {campaign.description || 'No description'}
                        </CardDescription>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => openCampaignDialog(campaign)}>
                            <Pencil className="h-4 w-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => toggleCampaignStatus(campaign)}>
                            {campaign.status === 'active' ? (
                              <>
                                <Pause className="h-4 w-4 mr-2" />
                                Pause
                              </>
                            ) : (
                              <>
                                <Play className="h-4 w-4 mr-2" />
                                Activate
                              </>
                            )}
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            className="text-destructive"
                            onClick={() => handleDeleteCampaign(campaign.id)}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge variant="outline" className={statusColors[campaign.status]}>
                        {campaign.status}
                      </Badge>
                      <Badge variant="secondary">{campaign.type}</Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="flex items-center gap-1.5 text-muted-foreground">
                        <Calendar className="h-3.5 w-3.5" />
                        {campaign.start_date ? format(new Date(campaign.start_date), 'MMM d') : 'Not set'}
                        {campaign.end_date && ` - ${format(new Date(campaign.end_date), 'MMM d')}`}
                      </div>
                      <div className="flex items-center gap-1.5 text-muted-foreground">
                        <DollarSign className="h-3.5 w-3.5" />
                        {campaign.budget ? formatPrice(campaign.budget) : 'No budget'}
                      </div>
                    </div>
                    {campaign.target_audience && (
                      <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                        <Users className="h-3.5 w-3.5" />
                        {campaign.target_audience}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Promotions Tab */}
        <TabsContent value="promotions" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Promo Codes & Discounts</h2>
            <Button onClick={() => openPromotionDialog()}>
              <Plus className="h-4 w-4 mr-2" />
              New Promotion
            </Button>
          </div>

          {promotionsLoading ? (
            <div className="text-center py-12 text-muted-foreground">Loading promotions...</div>
          ) : promotions.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Tag className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                <h3 className="font-semibold mb-2">No promotions yet</h3>
                <p className="text-muted-foreground mb-4">Create discount codes to attract more guests</p>
                <Button onClick={() => openPromotionDialog()}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Promotion
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {promotions.map(promotion => (
                <Card key={promotion.id} className={cn("hover:shadow-md transition-shadow", !promotion.active && "opacity-60")}>
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <code className="text-lg font-mono font-bold bg-muted px-2 py-0.5 rounded">
                            {promotion.code}
                          </code>
                          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => copyPromoCode(promotion.code)}>
                            <Copy className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                        <CardTitle className="text-base">{promotion.name}</CardTitle>
                      </div>
                      <Switch
                        checked={promotion.active ?? false}
                        onCheckedChange={() => togglePromotionActive(promotion)}
                      />
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-lg font-semibold">
                        {promotion.discount_type === 'percentage' ? (
                          <><Percent className="h-4 w-4 mr-1" />{promotion.discount_value}% OFF</>
                        ) : (
                          <><DollarSign className="h-4 w-4 mr-1" />{formatPrice(promotion.discount_value)} OFF</>
                        )}
                      </Badge>
                    </div>
                    {promotion.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2">{promotion.description}</p>
                    )}
                    <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5" />
                        {format(new Date(promotion.start_date), 'MMM d')} - {format(new Date(promotion.end_date), 'MMM d')}
                      </div>
                      {promotion.max_uses && (
                        <div className="flex items-center gap-1.5">
                          <Hash className="h-3.5 w-3.5" />
                          {promotion.used_count || 0} / {promotion.max_uses} used
                        </div>
                      )}
                    </div>
                    {promotion.room_types && promotion.room_types.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {promotion.room_types.map(type => (
                          <Badge key={type} variant="outline" className="text-xs capitalize">{type}</Badge>
                        ))}
                      </div>
                    )}
                    <div className="pt-2 flex gap-2">
                      <Button variant="outline" size="sm" className="flex-1" onClick={() => openPromotionDialog(promotion)}>
                        <Pencil className="h-3.5 w-3.5 mr-1" />
                        Edit
                      </Button>
                      <Button variant="outline" size="sm" className="text-destructive hover:text-destructive" onClick={() => handleDeletePromotion(promotion.id)}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Campaign Dialog */}
      <Dialog open={campaignDialogOpen} onOpenChange={setCampaignDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingCampaign ? 'Edit Campaign' : 'Create Campaign'}</DialogTitle>
            <DialogDescription>
              {editingCampaign ? 'Update your marketing campaign details' : 'Set up a new marketing campaign'}
            </DialogDescription>
          </DialogHeader>
          <Form {...campaignForm}>
            <form onSubmit={campaignForm.handleSubmit(handleCampaignSubmit)} className="space-y-4">
              <FormField
                control={campaignForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Campaign Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Summer Sale 2025" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={campaignForm.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Campaign Type</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {campaignTypes.map(type => (
                          <SelectItem key={type} value={type}>{type}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={campaignForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Campaign description..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={campaignForm.control}
                  name="startDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Start Date</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button variant="outline" className={cn("pl-3 text-left font-normal", !field.value && "text-muted-foreground")}>
                              {field.value ? format(field.value, "PPP") : "Pick a date"}
                              <Calendar className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <CalendarComponent mode="single" selected={field.value} onSelect={field.onChange} />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={campaignForm.control}
                  name="endDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>End Date</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button variant="outline" className={cn("pl-3 text-left font-normal", !field.value && "text-muted-foreground")}>
                              {field.value ? format(field.value, "PPP") : "Pick a date"}
                              <Calendar className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <CalendarComponent mode="single" selected={field.value} onSelect={field.onChange} />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={campaignForm.control}
                  name="budget"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Budget</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="5000" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={campaignForm.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="draft">Draft</SelectItem>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="paused">Paused</SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                          <SelectItem value="cancelled">Cancelled</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={campaignForm.control}
                name="targetAudience"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Target Audience</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., VIP guests, returning customers" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setCampaignDialogOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={createCampaign.isPending || updateCampaign.isPending}>
                  {editingCampaign ? 'Save Changes' : 'Create Campaign'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Promotion Dialog */}
      <Dialog open={promotionDialogOpen} onOpenChange={setPromotionDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingPromotion ? 'Edit Promotion' : 'Create Promotion'}</DialogTitle>
            <DialogDescription>
              {editingPromotion ? 'Update your promotional offer' : 'Create a new discount code for guests'}
            </DialogDescription>
          </DialogHeader>
          <Form {...promotionForm}>
            <form onSubmit={promotionForm.handleSubmit(handlePromotionSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={promotionForm.control}
                  name="code"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Promo Code</FormLabel>
                      <FormControl>
                        <Input placeholder="SUMMER25" className="uppercase font-mono" {...field} onChange={(e) => field.onChange(e.target.value.toUpperCase())} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={promotionForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Summer Discount" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={promotionForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Promotion details..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={promotionForm.control}
                  name="discountType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Discount Type</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="percentage">Percentage (%)</SelectItem>
                          <SelectItem value="fixed">Fixed Amount ($)</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={promotionForm.control}
                  name="discountValue"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Discount Value</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="25" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={promotionForm.control}
                  name="startDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Start Date</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button variant="outline" className={cn("pl-3 text-left font-normal", !field.value && "text-muted-foreground")}>
                              {field.value ? format(field.value, "PPP") : "Pick a date"}
                              <Calendar className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <CalendarComponent mode="single" selected={field.value} onSelect={field.onChange} />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={promotionForm.control}
                  name="endDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>End Date</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button variant="outline" className={cn("pl-3 text-left font-normal", !field.value && "text-muted-foreground")}>
                              {field.value ? format(field.value, "PPP") : "Pick a date"}
                              <Calendar className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <CalendarComponent mode="single" selected={field.value} onSelect={field.onChange} />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={promotionForm.control}
                  name="minStay"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Minimum Stay (nights)</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="1" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={promotionForm.control}
                  name="maxUses"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Max Uses (optional)</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="100" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={promotionForm.control}
                name="roomTypes"
                render={() => (
                  <FormItem>
                    <FormLabel>Applicable Room Types</FormLabel>
                    <div className="flex flex-wrap gap-2 pt-2">
                      {roomTypes.map(type => (
                        <FormField
                          key={type}
                          control={promotionForm.control}
                          name="roomTypes"
                          render={({ field }) => (
                            <label className="flex items-center gap-2 cursor-pointer">
                              <Checkbox
                                checked={field.value?.includes(type)}
                                onCheckedChange={(checked) => {
                                  const current = field.value || [];
                                  if (checked) {
                                    field.onChange([...current, type]);
                                  } else {
                                    field.onChange(current.filter(t => t !== type));
                                  }
                                }}
                              />
                              <span className="text-sm capitalize">{type}</span>
                            </label>
                          )}
                        />
                      ))}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">Leave empty for all room types</p>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={promotionForm.control}
                name="active"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between rounded-lg border p-3">
                    <div>
                      <FormLabel className="text-base">Active</FormLabel>
                      <p className="text-sm text-muted-foreground">Enable this promotion for use</p>
                    </div>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setPromotionDialogOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={createPromotion.isPending || updatePromotion.isPending}>
                  {editingPromotion ? 'Save Changes' : 'Create Promotion'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
