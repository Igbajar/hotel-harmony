import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Clock, Loader2, Timer } from 'lucide-react';
import { useBackupSchedule, useSaveBackupSchedule, type BackupScheduleConfig } from '@/hooks/useBackupSchedule';

const DAYS_OF_WEEK = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

interface BackupScheduleCardProps {
  availableTables: { key: string; label: string }[];
}

export function BackupScheduleCard({ availableTables }: BackupScheduleCardProps) {
  const { data: schedule, isLoading } = useBackupSchedule();
  const saveSchedule = useSaveBackupSchedule();
  const [config, setConfig] = useState<BackupScheduleConfig | null>(null);

  useEffect(() => {
    if (schedule && !config) {
      setConfig({
        ...schedule,
        tables: schedule.tables.length > 0 ? schedule.tables : availableTables.map(t => t.key),
      });
    }
  }, [schedule, availableTables, config]);

  if (isLoading || !config) return null;

  const handleSave = () => saveSchedule.mutate(config);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Timer className="h-5 w-5 text-primary" />
            <div>
              <CardTitle>Scheduled Backups</CardTitle>
              <CardDescription>Configure automatic backup schedule with notifications.</CardDescription>
            </div>
          </div>
          <Badge variant={config.enabled ? 'default' : 'secondary'}>
            {config.enabled ? 'Active' : 'Disabled'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* Enable toggle */}
        <div className="flex items-center justify-between">
          <Label htmlFor="schedule-enabled">Enable scheduled backups</Label>
          <Switch
            id="schedule-enabled"
            checked={config.enabled}
            onCheckedChange={(enabled) => setConfig({ ...config, enabled })}
          />
        </div>

        {config.enabled && (
          <>
            {/* Frequency */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Frequency</Label>
                <Select
                  value={config.frequency}
                  onValueChange={(v) => setConfig({ ...config, frequency: v as any })}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Time (24h)</Label>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <Input
                    type="time"
                    value={config.time}
                    onChange={(e) => setConfig({ ...config, time: e.target.value })}
                  />
                </div>
              </div>
            </div>

            {config.frequency === 'weekly' && (
              <div className="space-y-2">
                <Label>Day of Week</Label>
                <Select
                  value={String(config.dayOfWeek ?? 0)}
                  onValueChange={(v) => setConfig({ ...config, dayOfWeek: parseInt(v) })}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {DAYS_OF_WEEK.map((day, i) => (
                      <SelectItem key={i} value={String(i)}>{day}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {config.frequency === 'monthly' && (
              <div className="space-y-2">
                <Label>Day of Month</Label>
                <Select
                  value={String(config.dayOfMonth ?? 1)}
                  onValueChange={(v) => setConfig({ ...config, dayOfMonth: parseInt(v) })}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 28 }, (_, i) => (
                      <SelectItem key={i + 1} value={String(i + 1)}>{i + 1}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Notify toggle */}
            <div className="flex items-center justify-between">
              <Label htmlFor="notify-complete">Create notification when backup completes</Label>
              <Switch
                id="notify-complete"
                checked={config.notifyOnComplete}
                onCheckedChange={(notifyOnComplete) => setConfig({ ...config, notifyOnComplete })}
              />
            </div>
          </>
        )}

        <Button onClick={handleSave} disabled={saveSchedule.isPending} className="w-full">
          {saveSchedule.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Save Schedule
        </Button>
      </CardContent>
    </Card>
  );
}
