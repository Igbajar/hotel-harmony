import { cn } from '@/lib/utils';
import { LogIn, LogOut, CalendarPlus, CreditCard, MessageSquare } from 'lucide-react';

interface Activity {
  id: string;
  type: 'check-in' | 'check-out' | 'reservation' | 'payment' | 'message';
  title: string;
  description: string;
  time: string;
  room?: string;
}

const activities: Activity[] = [
  { id: '1', type: 'check-in', title: 'Guest Check-In', description: 'John Smith checked into Room 201', time: '10 mins ago', room: '201' },
  { id: '2', type: 'reservation', title: 'New Reservation', description: 'Emma Johnson booked Room 305', time: '25 mins ago', room: '305' },
  { id: '3', type: 'payment', title: 'Payment Received', description: '$660 received for Room 102', time: '1 hour ago', room: '102' },
  { id: '4', type: 'check-out', title: 'Guest Check-Out', description: 'Michael Brown checked out of Room 401', time: '2 hours ago', room: '401' },
  { id: '5', type: 'message', title: 'Guest Request', description: 'Room 201 requested extra towels', time: '3 hours ago', room: '201' },
];

const activityConfig = {
  'check-in': { icon: LogIn, color: 'bg-success/10 text-success' },
  'check-out': { icon: LogOut, color: 'bg-muted text-muted-foreground' },
  'reservation': { icon: CalendarPlus, color: 'bg-accent/10 text-accent' },
  'payment': { icon: CreditCard, color: 'bg-primary/10 text-primary' },
  'message': { icon: MessageSquare, color: 'bg-room-cleaning/10 text-room-cleaning' },
};

export function RecentActivity() {
  return (
    <div className="rounded-xl border border-border bg-card p-6 animate-fade-in">
      <div className="mb-6">
        <h3 className="text-lg font-semibold">Recent Activity</h3>
        <p className="text-sm text-muted-foreground">Latest updates from your hotel</p>
      </div>

      <div className="space-y-4">
        {activities.map((activity, index) => {
          const config = activityConfig[activity.type];
          const Icon = config.icon;
          return (
            <div
              key={activity.id}
              className="flex items-start gap-4 animate-fade-in"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className={cn('flex h-10 w-10 items-center justify-center rounded-lg', config.color)}>
                <Icon className="h-5 w-5" />
              </div>
              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium">{activity.title}</p>
                  {activity.room && (
                    <span className="rounded-md bg-secondary px-2 py-0.5 text-xs font-medium">
                      Room {activity.room}
                    </span>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">{activity.description}</p>
                <p className="text-xs text-muted-foreground">{activity.time}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
