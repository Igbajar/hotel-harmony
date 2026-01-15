import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Smartphone, Bell, Moon, Globe, RefreshCw, Wifi, Fingerprint, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormDescription } from '@/components/ui/form';
import { Separator } from '@/components/ui/separator';
import { useMobileAppSettings, useUpdateMobileAppSettings } from '@/hooks/useMobileAppSettings';
import { mobileAppSettingsSchema, MobileAppSettingsFormData } from '@/lib/validations';
import { toast } from '@/hooks/use-toast';

const languages = [
  { code: 'en', name: 'English' },
  { code: 'es', name: 'Spanish' },
  { code: 'fr', name: 'French' },
  { code: 'de', name: 'German' },
  { code: 'it', name: 'Italian' },
  { code: 'pt', name: 'Portuguese' },
  { code: 'zh', name: 'Chinese' },
  { code: 'ja', name: 'Japanese' },
  { code: 'ar', name: 'Arabic' },
];

export default function MobileAppSettings() {
  const { data: settings, isLoading } = useMobileAppSettings();
  const updateSettings = useUpdateMobileAppSettings();

  const form = useForm<MobileAppSettingsFormData>({
    resolver: zodResolver(mobileAppSettingsSchema),
    defaultValues: {
      pushNotifications: true,
      emailNotifications: true,
      smsNotifications: false,
      darkMode: false,
      language: 'en',
      autoSync: true,
      offlineMode: false,
      biometricAuth: false,
    },
  });

  useEffect(() => {
    if (settings) {
      form.reset({
        pushNotifications: settings.push_notifications ?? true,
        emailNotifications: settings.email_notifications ?? true,
        smsNotifications: settings.sms_notifications ?? false,
        darkMode: settings.dark_mode ?? false,
        language: settings.language ?? 'en',
        autoSync: settings.auto_sync ?? true,
        offlineMode: settings.offline_mode ?? false,
        biometricAuth: settings.biometric_auth ?? false,
      });
    }
  }, [settings, form]);

  const handleSubmit = async (data: MobileAppSettingsFormData) => {
    try {
      // Note: In production, get actual user ID from auth
      await updateSettings.mutateAsync({
        userId: 'demo-user',
        settings: data,
      });
      toast({
        title: 'Settings saved',
        description: 'Your mobile app settings have been updated successfully.',
      });
    } catch (error) {
      console.error('Failed to save settings:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-muted-foreground">Loading settings...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
            <Smartphone className="h-8 w-8 text-primary" />
            Mobile App Settings
          </h1>
          <p className="mt-1 text-muted-foreground">
            Configure mobile app preferences for staff and guests
          </p>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Notifications Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5 text-primary" />
                  Notifications
                </CardTitle>
                <CardDescription>
                  Manage how you receive updates and alerts
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="pushNotifications"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Push Notifications</FormLabel>
                        <FormDescription>
                          Receive instant alerts on your device
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="emailNotifications"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Email Notifications</FormLabel>
                        <FormDescription>
                          Receive updates via email
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="smsNotifications"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">SMS Notifications</FormLabel>
                        <FormDescription>
                          Receive text message alerts
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Appearance Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Moon className="h-5 w-5 text-primary" />
                  Appearance
                </CardTitle>
                <CardDescription>
                  Customize the look and feel of the app
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="darkMode"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Dark Mode</FormLabel>
                        <FormDescription>
                          Use dark theme for reduced eye strain
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="language"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5 flex-1">
                        <FormLabel className="text-base flex items-center gap-2">
                          <Globe className="h-4 w-4" />
                          Language
                        </FormLabel>
                        <FormDescription>
                          Select your preferred language
                        </FormDescription>
                      </div>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger className="w-[180px]">
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {languages.map(lang => (
                            <SelectItem key={lang.code} value={lang.code}>
                              {lang.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Data & Sync Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <RefreshCw className="h-5 w-5 text-primary" />
                  Data & Sync
                </CardTitle>
                <CardDescription>
                  Control how your data is synchronized
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="autoSync"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Auto Sync</FormLabel>
                        <FormDescription>
                          Automatically sync data when connected
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="offlineMode"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base flex items-center gap-2">
                          <Wifi className="h-4 w-4" />
                          Offline Mode
                        </FormLabel>
                        <FormDescription>
                          Enable offline access to essential features
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Security Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Fingerprint className="h-5 w-5 text-primary" />
                  Security
                </CardTitle>
                <CardDescription>
                  Configure security and authentication options
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="biometricAuth"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Biometric Authentication</FormLabel>
                        <FormDescription>
                          Use fingerprint or face recognition to login
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <div className="rounded-lg bg-muted/50 p-4">
                  <p className="text-sm text-muted-foreground">
                    Additional security features like two-factor authentication can be configured in the main security settings.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          <Separator />

          <div className="flex justify-end">
            <Button type="submit" size="lg" disabled={updateSettings.isPending}>
              <Save className="h-4 w-4 mr-2" />
              {updateSettings.isPending ? 'Saving...' : 'Save Settings'}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
