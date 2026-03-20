import { useState } from 'react';
import { Bell, CheckCheck, Trash2, Filter, CalendarDays, LogIn, LogOut, ClipboardList, HardDrive, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useNotifications, useMarkAsRead, useMarkAllAsRead, useClearNotifications, type Notification } from '@/hooks/useNotifications';
import { cn } from '@/lib/utils';
import { formatDistanceToNow, format } from 'date-fns';

const typeIcons: Record<string, React.ElementType> = {
  reservation: CalendarDays,
  check_in: LogIn,
  check_out: LogOut,
  housekeeping: ClipboardList,
  backup: HardDrive,
  system: Info,
};

const typeColors: Record<string, string> = {
  reservation: 'text-blue-500',
  check_in: 'text-green-500',
  check_out: 'text-orange-500',
  housekeeping: 'text-purple-500',
  backup: 'text-cyan-500',
  system: 'text-muted-foreground',
};

const typeLabels: Record<string, string> = {
  reservation: 'Reservation',
  check_in: 'Check In',
  check_out: 'Check Out',
  housekeeping: 'Housekeeping',
  backup: 'Backup',
  system: 'System',
};

export default function Notifications() {
  const { data: notifications = [], isLoading } = useNotifications();
  const markAsRead = useMarkAsRead();
  const markAllAsRead = useMarkAllAsRead();
  const clearRead = useClearNotifications();

  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const filtered = notifications.filter((n) => {
    if (typeFilter !== 'all' && n.type !== typeFilter) return false;
    if (statusFilter === 'unread' && n.read) return false;
    if (statusFilter === 'read' && !n.read) return false;
    return true;
  });

  const allSelected = filtered.length > 0 && filtered.every((n) => selected.has(n.id));

  const toggleAll = () => {
    if (allSelected) {
      setSelected(new Set());
    } else {
      setSelected(new Set(filtered.map((n) => n.id)));
    }
  };

  const toggleOne = (id: string) => {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelected(next);
  };

  const bulkMarkRead = () => {
    selected.forEach((id) => {
      const notif = notifications.find((n) => n.id === id);
      if (notif && !notif.read) markAsRead.mutate(id);
    });
    setSelected(new Set());
  };

  const unreadCount = notifications.filter((n) => !n.read).length;
  const uniqueTypes = [...new Set(notifications.map((n) => n.type))];

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Bell className="h-6 w-6" />
            Notifications
            {unreadCount > 0 && (
              <Badge variant="destructive" className="ml-2">{unreadCount} unread</Badge>
            )}
          </h1>
          <p className="text-muted-foreground text-sm mt-1">Full notification history and management</p>
        </div>
        <div className="flex gap-2">
          {unreadCount > 0 && (
            <Button variant="outline" size="sm" onClick={() => markAllAsRead.mutate()} className="gap-1">
              <CheckCheck className="h-4 w-4" /> Mark All Read
            </Button>
          )}
          {notifications.some((n) => n.read) && (
            <Button variant="outline" size="sm" onClick={() => clearRead.mutate()} className="gap-1 text-destructive">
              <Trash2 className="h-4 w-4" /> Clear Read
            </Button>
          )}
        </div>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Filters</span>
            </div>
            <div className="flex gap-2 flex-wrap">
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-[150px] h-8 text-xs">
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  {uniqueTypes.map((t) => (
                    <SelectItem key={t} value={t}>{typeLabels[t] || t}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[130px] h-8 text-xs">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="unread">Unread</SelectItem>
                  <SelectItem value="read">Read</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {selected.size > 0 && (
              <div className="flex gap-2 ml-auto">
                <Button variant="secondary" size="sm" className="h-8 text-xs" onClick={bulkMarkRead}>
                  Mark {selected.size} as Read
                </Button>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="py-12 text-center text-muted-foreground">Loading…</div>
          ) : filtered.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground">No notifications match your filters</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-10">
                    <Checkbox checked={allSelected} onCheckedChange={toggleAll} />
                  </TableHead>
                  <TableHead className="w-10">Type</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead className="hidden md:table-cell">Message</TableHead>
                  <TableHead className="w-[140px]">Time</TableHead>
                  <TableHead className="w-[80px]">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((notif) => {
                  const Icon = typeIcons[notif.type] || Info;
                  const color = typeColors[notif.type] || 'text-muted-foreground';
                  return (
                    <TableRow
                      key={notif.id}
                      className={cn('cursor-pointer', !notif.read && 'bg-primary/5')}
                      onClick={() => {
                        if (!notif.read) markAsRead.mutate(notif.id);
                      }}
                    >
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        <Checkbox
                          checked={selected.has(notif.id)}
                          onCheckedChange={() => toggleOne(notif.id)}
                        />
                      </TableCell>
                      <TableCell>
                        <Icon className={cn('h-4 w-4', color)} />
                      </TableCell>
                      <TableCell className="font-medium">{notif.title}</TableCell>
                      <TableCell className="hidden md:table-cell text-muted-foreground text-sm max-w-xs truncate">
                        {notif.message}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(notif.created_at), { addSuffix: true })}
                      </TableCell>
                      <TableCell>
                        {!notif.read ? (
                          <Badge variant="default" className="text-[10px]">Unread</Badge>
                        ) : (
                          <Badge variant="secondary" className="text-[10px]">Read</Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
