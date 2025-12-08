import { useState } from 'react';
import { Header } from '@/components/layout/Header';
import { mockReservations, mockGuests, mockRooms } from '@/data/mockData';
import { ReservationStatus } from '@/types/hotel';
import { format, addDays, startOfWeek, eachDayOfInterval } from 'date-fns';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Calendar,
  List,
  Search,
  Plus,
  ChevronLeft,
  ChevronRight,
  Filter,
  MoreHorizontal,
  Check,
  X,
  Eye,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const statusStyles: Record<ReservationStatus, string> = {
  pending: 'bg-warning/10 text-warning border-warning/20',
  confirmed: 'bg-success/10 text-success border-success/20',
  'checked-in': 'bg-primary/10 text-primary border-primary/20',
  'checked-out': 'bg-muted text-muted-foreground border-border',
  cancelled: 'bg-destructive/10 text-destructive border-destructive/20',
};

function CalendarView() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const startOfCurrentWeek = startOfWeek(currentDate, { weekStartsOn: 1 });
  const weekDays = eachDayOfInterval({
    start: startOfCurrentWeek,
    end: addDays(startOfCurrentWeek, 6),
  });

  const reservationsWithDetails = mockReservations.map(res => ({
    ...res,
    guest: mockGuests.find(g => g.id === res.guestId),
    room: mockRooms.find(r => r.id === res.roomId),
  }));

  return (
    <div className="rounded-xl border border-border bg-card animate-fade-in">
      {/* Calendar Header */}
      <div className="flex items-center justify-between border-b border-border p-4">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => setCurrentDate(addDays(currentDate, -7))}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={() => setCurrentDate(addDays(currentDate, 7))}>
            <ChevronRight className="h-4 w-4" />
          </Button>
          <h3 className="text-lg font-semibold ml-2">
            {format(startOfCurrentWeek, 'MMMM yyyy')}
          </h3>
        </div>
        <Button variant="outline" onClick={() => setCurrentDate(new Date())}>
          Today
        </Button>
      </div>

      {/* Calendar Grid */}
      <div className="overflow-x-auto">
        <div className="min-w-[800px]">
          {/* Day Headers */}
          <div className="grid grid-cols-[120px_repeat(7,1fr)] border-b border-border">
            <div className="p-3 text-sm font-medium text-muted-foreground">Room</div>
            {weekDays.map((day) => (
              <div
                key={day.toString()}
                className={cn(
                  'p-3 text-center border-l border-border',
                  format(day, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd') && 'bg-accent/10'
                )}
              >
                <p className="text-xs text-muted-foreground">{format(day, 'EEE')}</p>
                <p className={cn(
                  'text-lg font-semibold',
                  format(day, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd') && 'text-accent'
                )}>
                  {format(day, 'd')}
                </p>
              </div>
            ))}
          </div>

          {/* Room Rows */}
          {mockRooms.slice(0, 6).map((room) => (
            <div key={room.id} className="grid grid-cols-[120px_repeat(7,1fr)] border-b border-border last:border-b-0">
              <div className="p-3 flex items-center gap-2">
                <span className="font-medium">{room.number}</span>
                <Badge variant="outline" className="text-[10px] capitalize">
                  {room.type}
                </Badge>
              </div>
              {weekDays.map((day, dayIndex) => {
                const reservation = reservationsWithDetails.find(
                  (res) =>
                    res.room?.id === room.id &&
                    new Date(res.checkIn) <= day &&
                    new Date(res.checkOut) > day
                );

                return (
                  <div
                    key={day.toString()}
                    className={cn(
                      'p-1 border-l border-border min-h-[60px]',
                      format(day, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd') && 'bg-accent/5'
                    )}
                  >
                    {reservation && reservation.guest && (
                      <div
                        className={cn(
                          'rounded-md p-2 text-xs cursor-pointer transition-all hover:opacity-80',
                          statusStyles[reservation.status]
                        )}
                      >
                        <p className="font-medium truncate">
                          {reservation.guest.firstName} {reservation.guest.lastName[0]}.
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ListView() {
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const reservationsWithDetails = mockReservations
    .map(res => ({
      ...res,
      guest: mockGuests.find(g => g.id === res.guestId),
      room: mockRooms.find(r => r.id === res.roomId),
    }))
    .filter(res => statusFilter === 'all' || res.status === statusFilter);

  return (
    <div className="rounded-xl border border-border bg-card animate-fade-in">
      <div className="flex items-center justify-between border-b border-border p-4">
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search reservations..." className="pl-10 w-64" />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="confirmed">Confirmed</SelectItem>
              <SelectItem value="checked-in">Checked In</SelectItem>
              <SelectItem value="checked-out">Checked Out</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button className="gap-2 bg-accent text-accent-foreground hover:bg-accent/90">
          <Plus className="h-4 w-4" />
          New Reservation
        </Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Guest</TableHead>
            <TableHead>Room</TableHead>
            <TableHead>Check-in</TableHead>
            <TableHead>Check-out</TableHead>
            <TableHead>Guests</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="w-12"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {reservationsWithDetails.map((reservation) => (
            <TableRow key={reservation.id} className="animate-fade-in">
              <TableCell>
                <div className="flex items-center gap-3">
                  <Avatar className="h-9 w-9">
                    <AvatarFallback className={cn(
                      reservation.guest?.vip ? 'bg-accent text-accent-foreground' : 'bg-primary text-primary-foreground'
                    )}>
                      {reservation.guest?.firstName[0]}{reservation.guest?.lastName[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">
                      {reservation.guest?.firstName} {reservation.guest?.lastName}
                    </p>
                    <p className="text-sm text-muted-foreground">{reservation.guest?.email}</p>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <div>
                  <p className="font-medium">Room {reservation.room?.number}</p>
                  <p className="text-sm text-muted-foreground capitalize">{reservation.room?.type}</p>
                </div>
              </TableCell>
              <TableCell>{format(reservation.checkIn, 'MMM dd, yyyy')}</TableCell>
              <TableCell>{format(reservation.checkOut, 'MMM dd, yyyy')}</TableCell>
              <TableCell>
                {reservation.adults} adults
                {reservation.children > 0 && `, ${reservation.children} children`}
              </TableCell>
              <TableCell>
                <div>
                  <p className="font-medium">${reservation.totalAmount}</p>
                  <p className="text-sm text-muted-foreground">
                    {reservation.paidAmount === reservation.totalAmount ? 'Paid' : `$${reservation.paidAmount} paid`}
                  </p>
                </div>
              </TableCell>
              <TableCell>
                <Badge className={cn('capitalize', statusStyles[reservation.status])}>
                  {reservation.status.replace('-', ' ')}
                </Badge>
              </TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>
                      <Eye className="mr-2 h-4 w-4" /> View Details
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Check className="mr-2 h-4 w-4" /> Check In
                    </DropdownMenuItem>
                    <DropdownMenuItem>Edit</DropdownMenuItem>
                    <DropdownMenuItem className="text-destructive">
                      <X className="mr-2 h-4 w-4" /> Cancel
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

export default function Reservations() {
  return (
    <div className="min-h-screen">
      <Header title="Reservations" subtitle="Manage bookings and check-ins" />

      <div className="p-6">
        <Tabs defaultValue="list" className="space-y-6">
          <div className="flex items-center justify-between">
            <TabsList>
              <TabsTrigger value="list" className="gap-2">
                <List className="h-4 w-4" />
                List View
              </TabsTrigger>
              <TabsTrigger value="calendar" className="gap-2">
                <Calendar className="h-4 w-4" />
                Calendar View
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="list">
            <ListView />
          </TabsContent>

          <TabsContent value="calendar">
            <CalendarView />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
