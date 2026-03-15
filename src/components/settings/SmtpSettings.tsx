import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Mail, Save, TestTube, Loader2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useSiteSettings, useUpdateSiteSetting } from '@/hooks/useSiteSettings';

interface SmtpConfig {
  host: string;
  port: string;
  username: string;
  password: string;
  encryption: 'none' | 'tls' | 'ssl';
  from_email: string;
  from_name: string;
  enabled: boolean;
}

const defaultConfig: SmtpConfig = {
  host: '',
  port: '587',
  username: '',
  password: '',
  encryption: 'tls',
  from_email: '',
  from_name: '',
  enabled: false,
};

export function SmtpSettings() {
  const { data: settings, isLoading } = useSiteSettings();
  const updateSetting = useUpdateSiteSetting();
  const [isTesting, setIsTesting] = useState(false);

  const saved: SmtpConfig = settings?.smtp_config
    ? (typeof settings.smtp_config === 'string' ? JSON.parse(settings.smtp_config) : settings.smtp_config)
    : defaultConfig;

  const [config, setConfig] = useState<SmtpConfig>(saved);

  const update = (key: keyof SmtpConfig, value: string | boolean) => {
    setConfig(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = () => {
    updateSetting.mutate(
      { key: 'smtp_config', value: config },
      {
        onSuccess: () => toast({ title: 'SMTP settings saved', description: 'Your email configuration has been updated.' }),
        onError: () => toast({ title: 'Error', description: 'Failed to save SMTP settings.', variant: 'destructive' }),
      }
    );
  };

  const handleTest = async () => {
    if (!config.host || !config.from_email) {
      toast({ title: 'Missing fields', description: 'Please fill in host and sender email first.', variant: 'destructive' });
      return;
    }
    setIsTesting(true);
    await new Promise(r => setTimeout(r, 2000));
    setIsTesting(false);
    toast({ title: 'Test email queued', description: `A test email will be sent to ${config.from_email} once SMTP is fully integrated.` });
  };

  if (isLoading) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mail className="h-5 w-5 text-primary" />
          SMTP / Email Configuration
        </CardTitle>
        <CardDescription>
          Configure outgoing email settings for notifications, invoices, and guest communications.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Enable toggle */}
        <div className="flex items-center justify-between rounded-lg border border-border p-4">
          <div>
            <p className="font-medium">Enable Email Sending</p>
            <p className="text-sm text-muted-foreground">Turn on to send emails via your SMTP server</p>
          </div>
          <Switch checked={config.enabled} onCheckedChange={v => update('enabled', v)} />
        </div>

        <div className={config.enabled ? '' : 'opacity-50 pointer-events-none'}>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>SMTP Host</Label>
              <Input placeholder="smtp.example.com" value={config.host} onChange={e => update('host', e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Port</Label>
              <Input placeholder="587" value={config.port} onChange={e => update('port', e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Username</Label>
              <Input placeholder="user@example.com" value={config.username} onChange={e => update('username', e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Password</Label>
              <Input type="password" placeholder="••••••••" value={config.password} onChange={e => update('password', e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Encryption</Label>
              <Select value={config.encryption} onValueChange={v => update('encryption', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="tls">TLS</SelectItem>
                  <SelectItem value="ssl">SSL</SelectItem>
                  <SelectItem value="none">None</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Sender Name</Label>
              <Input placeholder="HotelPro" value={config.from_name} onChange={e => update('from_name', e.target.value)} />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label>Sender Email</Label>
              <Input placeholder="noreply@yourhotel.com" value={config.from_email} onChange={e => update('from_email', e.target.value)} />
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <Button onClick={handleSave} disabled={updateSetting.isPending}>
              <Save className="mr-2 h-4 w-4" />
              Save Settings
            </Button>
            <Button variant="outline" onClick={handleTest} disabled={isTesting}>
              {isTesting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <TestTube className="mr-2 h-4 w-4" />}
              Send Test Email
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
