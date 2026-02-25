import { useState } from 'react';
import { useSiteSettings, useUpdateSiteSetting } from '@/hooks/useSiteSettings';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { Save, Plus, Trash2, Globe, Image, FileText, Link2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

export default function SiteManagement() {
  const { data: settings, isLoading } = useSiteSettings();
  const updateSetting = useUpdateSiteSetting();
  const [editValues, setEditValues] = useState<Record<string, any>>({});

  const getValue = (key: string) => {
    return key in editValues ? editValues[key] : (settings?.[key] ?? '');
  };

  const setValue = (key: string, value: any) => {
    setEditValues(prev => ({ ...prev, [key]: value }));
  };

  const saveSetting = async (key: string) => {
    const value = getValue(key);
    try {
      await updateSetting.mutateAsync({ key, value });
      setEditValues(prev => {
        const updated = { ...prev };
        delete updated[key];
        return updated;
      });
      toast({ title: 'Saved', description: `${key.replace(/_/g, ' ')} updated.` });
    } catch {
      toast({ title: 'Error', description: 'Failed to save.', variant: 'destructive' });
    }
  };

  const saveAll = async () => {
    const keys = Object.keys(editValues);
    if (keys.length === 0) {
      toast({ title: 'No changes', description: 'Nothing to save.' });
      return;
    }
    try {
      for (const key of keys) {
        await updateSetting.mutateAsync({ key, value: editValues[key] });
      }
      setEditValues({});
      toast({ title: 'All changes saved', description: `${keys.length} settings updated.` });
    } catch {
      toast({ title: 'Error', description: 'Failed to save some settings.', variant: 'destructive' });
    }
  };

  // Extra links management
  const extraLinks: Array<{ label: string; url: string }> = getValue('footer_extra_links') || [];
  const addLink = () => {
    setValue('footer_extra_links', [...extraLinks, { label: '', url: '' }]);
  };
  const updateLink = (index: number, field: string, value: string) => {
    const updated = [...extraLinks];
    updated[index] = { ...updated[index], [field]: value };
    setValue('footer_extra_links', updated);
  };
  const removeLink = (index: number) => {
    setValue('footer_extra_links', extraLinks.filter((_, i) => i !== index));
  };

  // Extra images management
  const extraImages: Array<{ url: string; alt: string }> = getValue('footer_extra_images') || [];
  const addImage = () => {
    setValue('footer_extra_images', [...extraImages, { url: '', alt: '' }]);
  };
  const updateImage = (index: number, field: string, value: string) => {
    const updated = [...extraImages];
    updated[index] = { ...updated[index], [field]: value };
    setValue('footer_extra_images', updated);
  };
  const removeImage = (index: number) => {
    setValue('footer_extra_images', extraImages.filter((_, i) => i !== index));
  };

  if (isLoading) {
    return <div className="p-6 text-muted-foreground">Loading settings...</div>;
  }

  const hasChanges = Object.keys(editValues).length > 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
            <Globe className="h-8 w-8 text-primary" />
            Site Management
          </h1>
          <p className="mt-1 text-muted-foreground">Edit site identity, branding, and footer content</p>
        </div>
        {hasChanges && (
          <Button onClick={saveAll} className="gap-2">
            <Save className="h-4 w-4" />
            Save All Changes
          </Button>
        )}
      </div>

      {/* Site Identity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-accent" />
            Site Identity
          </CardTitle>
          <CardDescription>Site name, slogan, and branding</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Site Name</Label>
              <Input
                value={getValue('site_name')}
                onChange={(e) => setValue('site_name', e.target.value)}
                placeholder="HotelPro"
              />
            </div>
            <div className="space-y-2">
              <Label>Slogan</Label>
              <Input
                value={getValue('site_slogan')}
                onChange={(e) => setValue('site_slogan', e.target.value)}
                placeholder="Complete Hotel Management System"
              />
            </div>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Logo URL</Label>
              <Input
                value={getValue('site_logo_url')}
                onChange={(e) => setValue('site_logo_url', e.target.value)}
                placeholder="https://example.com/logo.png"
              />
            </div>
            <div className="space-y-2">
              <Label>Favicon URL</Label>
              <Input
                value={getValue('site_favicon_url')}
                onChange={(e) => setValue('site_favicon_url', e.target.value)}
                placeholder="https://example.com/favicon.ico"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Footer Content */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Link2 className="h-5 w-5 text-accent" />
            Footer Content
          </CardTitle>
          <CardDescription>Edit footer text, links, and branding displayed on all pages</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Footer Text</Label>
            <Textarea
              value={getValue('footer_text')}
              onChange={(e) => setValue('footer_text', e.target.value)}
              placeholder="Developed by..."
              rows={2}
            />
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Main Link URL</Label>
              <Input
                value={getValue('footer_link_url')}
                onChange={(e) => setValue('footer_link_url', e.target.value)}
                placeholder="https://www.rajabgi.com"
              />
            </div>
            <div className="space-y-2">
              <Label>Main Link Label</Label>
              <Input
                value={getValue('footer_link_label')}
                onChange={(e) => setValue('footer_link_label', e.target.value)}
                placeholder="Rajabgi Services Limited"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>WhatsApp Number</Label>
            <Input
              value={getValue('footer_whatsapp')}
              onChange={(e) => setValue('footer_whatsapp', e.target.value)}
              placeholder="+2348032864085"
            />
          </div>

          <Separator />

          {/* Extra Links */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <Label className="text-sm font-semibold">Additional Links</Label>
              <Button size="sm" variant="outline" onClick={addLink} className="gap-1">
                <Plus className="h-3 w-3" /> Add Link
              </Button>
            </div>
            {extraLinks.map((link, i) => (
              <div key={i} className="flex items-center gap-2 mb-2">
                <Input
                  value={link.label}
                  onChange={(e) => updateLink(i, 'label', e.target.value)}
                  placeholder="Link label"
                  className="flex-1"
                />
                <Input
                  value={link.url}
                  onChange={(e) => updateLink(i, 'url', e.target.value)}
                  placeholder="https://..."
                  className="flex-1"
                />
                <Button size="icon" variant="ghost" onClick={() => removeLink(i)} className="text-destructive shrink-0">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>

          <Separator />

          {/* Extra Images */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <Label className="text-sm font-semibold">Footer Images</Label>
              <Button size="sm" variant="outline" onClick={addImage} className="gap-1">
                <Plus className="h-3 w-3" /> Add Image
              </Button>
            </div>
            {extraImages.map((img, i) => (
              <div key={i} className="flex items-center gap-2 mb-2">
                <Input
                  value={img.url}
                  onChange={(e) => updateImage(i, 'url', e.target.value)}
                  placeholder="Image URL"
                  className="flex-1"
                />
                <Input
                  value={img.alt}
                  onChange={(e) => updateImage(i, 'alt', e.target.value)}
                  placeholder="Alt text"
                  className="flex-1"
                />
                <Button size="icon" variant="ghost" onClick={() => removeImage(i)} className="text-destructive shrink-0">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
