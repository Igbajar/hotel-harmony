import { cn } from '@/lib/utils';
import { Room, RoomStatus } from '@/types/hotel';
import { BedDouble, Wrench, Sparkles, Clock, Check } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useCurrency } from '@/contexts/CurrencyContext';

interface RoomStatusGridProps {
  rooms: Room[];
}

const statusConfig: Record<RoomStatus, { label: string; color: string; icon: React.ElementType }> = {
  available: { label: 'Available', color: 'bg-room-available', icon: Check },
  occupied: { label: 'Occupied', color: 'bg-room-occupied', icon: BedDouble },
  reserved: { label: 'Reserved', color: 'bg-room-reserved', icon: Clock },
  maintenance: { label: 'Maintenance', color: 'bg-room-maintenance', icon: Wrench },
  cleaning: { label: 'Cleaning', color: 'bg-room-cleaning', icon: Sparkles },
};

export function RoomStatusGrid({ rooms }: RoomStatusGridProps) {
  const { formatPrice } = useCurrency();
  
  const statusCounts = rooms.reduce((acc, room) => {
    acc[room.status] = (acc[room.status] || 0) + 1;
    return acc;
  }, {} as Record<RoomStatus, number>);

  return (
    <div className="rounded-xl border border-border bg-card p-6 animate-fade-in">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Room Overview</h3>
          <p className="text-sm text-muted-foreground">Quick view of all rooms</p>
        </div>
        <div className="flex gap-4">
          {Object.entries(statusConfig).map(([status, config]) => (
            <div key={status} className="flex items-center gap-2 text-sm">
              <div className={cn('h-3 w-3 rounded-full', config.color)} />
              <span className="text-muted-foreground">
                {config.label} ({statusCounts[status as RoomStatus] || 0})
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-6 gap-3">
        {rooms.map((room) => {
          const config = statusConfig[room.status];
          const Icon = config.icon;
          return (
            <Tooltip key={room.id} delayDuration={0}>
              <TooltipTrigger asChild>
                <button
                  className={cn(
                    'relative flex flex-col items-center justify-center rounded-lg p-4 transition-all duration-200',
                    'hover:scale-105 hover:shadow-lg',
                    config.color,
                    'text-white'
                  )}
                >
                  <Icon className="mb-1 h-5 w-5" />
                  <span className="text-lg font-bold">{room.number}</span>
                  <span className="text-[10px] uppercase tracking-wide opacity-80">
                    {room.type}
                  </span>
                </button>
              </TooltipTrigger>
              <TooltipContent side="top" className="text-center bg-popover border border-border z-50">
                <p className="font-semibold">Room {room.number}</p>
                <p className="text-sm text-muted-foreground capitalize">{room.type} - {room.status}</p>
                <p className="text-sm font-medium">{formatPrice(room.pricePerNight)}/night</p>
              </TooltipContent>
            </Tooltip>
          );
        })}
      </div>
    </div>
  );
}
