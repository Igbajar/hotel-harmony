import { format } from 'date-fns';
import { Reservation, Guest, Room } from '@/types/hotel';
import { mockGuests, mockRooms } from '@/data/mockData';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, Check, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface UpcomingReservationsProps {
  reservations: Reservation[];
}

const statusStyles = {
  pending: 'bg-warning/10 text-warning border-warning/20',
  confirmed: 'bg-success/10 text-success border-success/20',
  'checked-in': 'bg-primary/10 text-primary border-primary/20',
  'checked-out': 'bg-muted text-muted-foreground border-border',
  cancelled: 'bg-destructive/10 text-destructive border-destructive/20',
};

export function UpcomingReservations({ reservations }: UpcomingReservationsProps) {
  const getGuest = (guestId: string): Guest | undefined => 
    mockGuests.find(g => g.id === guestId);
  
  const getRoom = (roomId: string): Room | undefined => 
    mockRooms.find(r => r.id === roomId);

  return (
    <div className="rounded-xl border border-border bg-card animate-fade-in">
      <div className="flex items-center justify-between border-b border-border p-6">
        <div>
          <h3 className="text-lg font-semibold">Upcoming Reservations</h3>
          <p className="text-sm text-muted-foreground">Arrivals and departures</p>
        </div>
        <Button variant="outline" size="sm">View All</Button>
      </div>

      <div className="divide-y divide-border">
        {reservations.slice(0, 5).map((reservation, index) => {
          const guest = getGuest(reservation.guestId);
          const room = getRoom(reservation.roomId);
          if (!guest || !room) return null;

          return (
            <div
              key={reservation.id}
              className="flex items-center gap-4 p-4 hover:bg-secondary/50 transition-colors animate-fade-in"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <Avatar className="h-10 w-10">
                <AvatarFallback className={cn(
                  guest.vip ? 'bg-accent text-accent-foreground' : 'bg-primary text-primary-foreground'
                )}>
                  {guest.firstName[0]}{guest.lastName[0]}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-medium truncate">
                    {guest.firstName} {guest.lastName}
                  </p>
                  {guest.vip && (
                    <Badge variant="outline" className="bg-accent/10 text-accent border-accent/20 text-[10px]">
                      VIP
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">
                  Room {room.number} · {room.type.charAt(0).toUpperCase() + room.type.slice(1)}
                </p>
              </div>

              <div className="text-right">
                <p className="text-sm font-medium">
                  {format(reservation.checkIn, 'MMM dd')} - {format(reservation.checkOut, 'MMM dd')}
                </p>
                <p className="text-sm text-muted-foreground">
                  {reservation.adults} adults{reservation.children > 0 && `, ${reservation.children} children`}
                </p>
              </div>

              <Badge className={cn('capitalize', statusStyles[reservation.status])}>
                {reservation.status.replace('-', ' ')}
              </Badge>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>
                    <Check className="mr-2 h-4 w-4" /> Check In
                  </DropdownMenuItem>
                  <DropdownMenuItem>Edit Reservation</DropdownMenuItem>
                  <DropdownMenuItem className="text-destructive">
                    <X className="mr-2 h-4 w-4" /> Cancel
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          );
        })}
      </div>
    </div>
  );
}
