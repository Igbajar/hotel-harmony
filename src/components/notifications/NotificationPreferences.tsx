import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Bell, CalendarDays, LogIn, LogOut, ClipboardList, HardDrive, Info, Volume2, BellRing, Mail } from 'lucide-react';
import { useNotificationPreferences } from '@/hooks/useNotificationPreferences';
import { toast } from '@/hooks/use-toast';

const notificationTypes = [
  { key: 'reservation_enabled' as const, label: 'Reservations', description: 'New bookings and reservation updates', icon: CalendarDays, color: 'text-blue-500' },
  { key: 'check_in_enabled' as const, label: 'Check-Ins', description: 'Guest arrival notifications', icon: LogIn, color: 'text-green-500' },
  { key: 'check_out_enabled' as const, label: 'Check-Outs', description: 'Guest departure notifications', icon: LogOut, color: 'text-orange-500' },
  { key: 'housekeeping_enabled' as const, label: 'Housekeeping', description: 'Cleaning tasks and updates', icon: ClipboardList, color: 'text-purple-500' },
  { key: 'backup_enabled' as const, label: 'Backups', description: 'Backup completion alerts', icon: HardDrive, color: 'text-cyan-500' },
  { key: 'system_enabled' as const, label: 'System', description: 'General system notifications', icon: Info, color: 'text-muted-foreground' },
];

const deliveryChannels = [
  { key: 'sound_enabled' as const, label: 'Sound Alerts', description: 'Play a chime for critical notifications', icon: Volume2 },
  { key: 'push_enabled' as const, label: 'Browser Push', description: 'Show desktop notifications when tab is not focused', icon: BellRing },
  { key: 'email_digest_enabled' as const, label: 'Daily Email Digest', description: 'Receive a summary of unread notifications daily', icon: Mail },
];

export function NotificationPreferences() {
  const { preferences, isLoading, updatePreferences } = useNotificationPreferences();

  const toggle = (key: string, value: boolean) => {
    updatePreferences(
      { [key]: value },
      {
        onSuccess: () => toast({ title: 'Preferences updated' }),
        onError: () => toast({ title: 'Failed to update', variant: 'destructive' }),
      }
    );
  };

  if (isLoading) return null;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-primary" />
            Notification Types
          </CardTitle>
          <CardDescription>Choose which notification types you want to receive</CardDescription>
        </CardHeader>
        <CardContent className="space-y-1">
          {notificationTypes.map((type, i) => (
            <div key={type.key}>
              <div className="flex items-center justify-between py-3">
                <div className="flex items-center gap-3">
                  <type.icon className={`h-5 w-5 ${type.color}`} />
                  <div>
                    <Label className="text-sm font-medium">{type.label}</Label>
                    <p className="text-xs text-muted-foreground">{type.description}</p>
                  </div>
                </div>
                <Switch
                  checked={preferences[type.key]}
                  onCheckedChange={(v) => toggle(type.key, v)}
                />
              </div>
              {i < notificationTypes.length - 1 && <Separator />}
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Volume2 className="h-5 w-5 text-primary" />
            Delivery Channels
          </CardTitle>
          <CardDescription>Configure how you receive notifications</CardDescription>
        </CardHeader>
        <CardContent className="space-y-1">
          {deliveryChannels.map((channel, i) => (
            <div key={channel.key}>
              <div className="flex items-center justify-between py-3">
                <div className="flex items-center gap-3">
                  <channel.icon className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <Label className="text-sm font-medium">{channel.label}</Label>
                    <p className="text-xs text-muted-foreground">{channel.description}</p>
                  </div>
                </div>
                <Switch
                  checked={preferences[channel.key]}
                  onCheckedChange={(v) => toggle(channel.key, v)}
                />
              </div>
              {i < deliveryChannels.length - 1 && <Separator />}
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
