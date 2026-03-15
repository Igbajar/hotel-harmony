import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { History, CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { useBackupHistory } from '@/hooks/useBackupSchedule';
import { format } from 'date-fns';

const statusConfig: Record<string, { icon: React.ElementType; variant: 'default' | 'destructive' | 'secondary' }> = {
  completed: { icon: CheckCircle2, variant: 'default' },
  failed: { icon: XCircle, variant: 'destructive' },
  pending: { icon: Loader2, variant: 'secondary' },
};

export function BackupHistoryCard() {
  const { data: history = [], isLoading } = useBackupHistory();

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <History className="h-5 w-5 text-primary" />
          <div>
            <CardTitle>Backup History</CardTitle>
            <CardDescription>Recent backup activity log.</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center py-6"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>
        ) : history.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-6">No backups recorded yet.</p>
        ) : (
          <ScrollArea className="max-h-[300px]">
            <div className="space-y-3">
              {history.map((entry) => {
                const cfg = statusConfig[entry.status] || statusConfig.pending;
                const Icon = cfg.icon;
                return (
                  <div key={entry.id} className="flex items-start gap-3 rounded-lg border border-border p-3">
                    <Icon className={`h-4 w-4 mt-0.5 flex-shrink-0 ${entry.status === 'pending' ? 'animate-spin' : ''}`} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge variant={cfg.variant} className="text-xs capitalize">{entry.status}</Badge>
                        <Badge variant="outline" className="text-xs capitalize">{entry.type}</Badge>
                        <span className="text-xs text-muted-foreground ml-auto">
                          {format(new Date(entry.created_at), 'MMM d, yyyy HH:mm')}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {entry.record_count} records from {entry.tables_included.length} tables
                      </p>
                      {entry.error_message && (
                        <p className="text-xs text-destructive mt-1">{entry.error_message}</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}
