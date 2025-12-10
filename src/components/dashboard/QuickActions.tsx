import { Button } from '@/components/ui/button';
import { 
  Plus, 
  CalendarPlus, 
  UserPlus, 
  ClipboardList,
  Utensils,
  Wrench
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const actions = [
  { label: 'New Reservation', icon: CalendarPlus, path: '/reservations', color: 'bg-[hsl(var(--chart-1))]' },
  { label: 'Add Guest', icon: UserPlus, path: '/guests', color: 'bg-[hsl(var(--chart-3))]' },
  { label: 'Room Service', icon: Utensils, path: '/room-service', color: 'bg-[hsl(var(--chart-2))]' },
  { label: 'Maintenance', icon: Wrench, path: '/rooms', color: 'bg-[hsl(var(--chart-5))]' },
];

export function QuickActions() {
  const navigate = useNavigate();

  return (
    <div className="rounded-xl border border-border bg-card p-6 animate-fade-in">
      <div className="mb-4">
        <h3 className="text-lg font-semibold">Quick Actions</h3>
        <p className="text-sm text-muted-foreground">Common tasks</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {actions.map((action) => (
          <Button
            key={action.label}
            variant="outline"
            className="h-auto flex-col gap-2 py-4 hover:bg-secondary/80"
            onClick={() => navigate(action.path)}
          >
            <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${action.color}`}>
              <action.icon className="h-5 w-5 text-white" />
            </div>
            <span className="text-xs font-medium">{action.label}</span>
          </Button>
        ))}
      </div>
    </div>
  );
}
