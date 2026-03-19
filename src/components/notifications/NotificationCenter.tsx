import { useState, useEffect } from 'react';
import { Bell, CheckCheck, CalendarDays, LogIn, LogOut, ClipboardList, HardDrive, Info, Trash2, BellRing } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useNotifications, useUnreadCount, useMarkAsRead, useMarkAllAsRead, useClearNotifications } from '@/hooks/useNotifications';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';

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

export function NotificationCenter() {
  const { data: notifications = [] } = useNotifications();
  const { data: unreadCount = 0 } = useUnreadCount();
  const markAsRead = useMarkAsRead();
  const markAllAsRead = useMarkAllAsRead();
  const clearRead = useClearNotifications();

  const [pushSupported] = useState(() => typeof Notification !== 'undefined');
  const [pushPermission, setPushPermission] = useState<NotificationPermission>(
    typeof Notification !== 'undefined' ? Notification.permission : 'denied'
  );

  const handleEnablePush = async () => {
    if (!pushSupported) return;
    const result = await Notification.requestPermission();
    setPushPermission(result);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-[10px] bg-destructive">
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-96 bg-popover border border-border shadow-lg z-50">
        <div className="flex items-center justify-between px-4 py-2">
          <DropdownMenuLabel className="p-0">Notifications</DropdownMenuLabel>
          <div className="flex gap-1">
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-xs gap-1"
                onClick={() => markAllAsRead.mutate()}
              >
                <CheckCheck className="h-3.5 w-3.5" />
                Mark all read
              </Button>
            )}
            {notifications.some(n => n.read) && (
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-xs gap-1 text-muted-foreground"
                onClick={() => clearRead.mutate()}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            )}
          </div>
        </div>
        <DropdownMenuSeparator />
        {pushSupported && pushPermission !== 'granted' && (
          <div className="px-4 py-2 bg-muted/50">
            <button
              onClick={handleEnablePush}
              className="w-full flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              <BellRing className="h-3.5 w-3.5" />
              {pushPermission === 'denied'
                ? 'Push notifications blocked — enable in browser settings'
                : 'Enable browser push notifications for critical alerts'}
            </button>
          </div>
        )}
        {pushSupported && pushPermission === 'granted' && (
          <div className="px-4 py-1.5 bg-muted/30">
            <span className="flex items-center gap-2 text-xs text-muted-foreground">
              <BellRing className="h-3.5 w-3.5 text-green-500" />
              Push notifications enabled
            </span>
          </div>
        )}
        <ScrollArea className="max-h-[400px]">
          {notifications.length === 0 ? (
            <div className="py-8 text-center text-sm text-muted-foreground">
              No notifications yet
            </div>
          ) : (
            notifications.map((notif) => {
              const Icon = typeIcons[notif.type] || Info;
              const color = typeColors[notif.type] || 'text-muted-foreground';
              return (
                <button
                  key={notif.id}
                  className={cn(
                    'w-full flex items-start gap-3 px-4 py-3 text-left hover:bg-muted/50 transition-colors border-b border-border/50 last:border-0',
                    !notif.read && 'bg-primary/5'
                  )}
                  onClick={() => {
                    if (!notif.read) markAsRead.mutate(notif.id);
                  }}
                >
                  <div className={cn('mt-0.5 flex-shrink-0', color)}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={cn('text-sm font-medium', !notif.read && 'text-foreground')}>
                        {notif.title}
                      </span>
                      {!notif.read && (
                        <span className="h-2 w-2 rounded-full bg-primary flex-shrink-0" />
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground truncate">{notif.message}</p>
                    <p className="text-xs text-muted-foreground/70 mt-0.5">
                      {formatDistanceToNow(new Date(notif.created_at), { addSuffix: true })}
                    </p>
                  </div>
                </button>
              );
            })
          )}
        </ScrollArea>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
