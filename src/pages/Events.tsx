import { useState } from 'react';
import { Calendar, Plus, MapPin, Clock, Users, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { format } from 'date-fns';

interface HotelEvent {
  id: string;
  name: string;
  type: string;
  venue: string;
  date: string;
  startTime: string;
  endTime: string;
  attendees: number;
  capacity: number;
  status: 'upcoming' | 'in_progress' | 'completed' | 'cancelled';
  organizer: string;
}

const mockEvents: HotelEvent[] = [
  { id: '1', name: 'Annual Business Conference', type: 'Conference', venue: 'Grand Ballroom', date: '2026-03-25', startTime: '09:00', endTime: '17:00', attendees: 150, capacity: 200, status: 'upcoming', organizer: 'Acme Corp' },
  { id: '2', name: 'Wedding Reception - Smith', type: 'Wedding', venue: 'Garden Terrace', date: '2026-03-28', startTime: '18:00', endTime: '23:00', attendees: 80, capacity: 120, status: 'upcoming', organizer: 'Smith Family' },
  { id: '3', name: 'Tech Meetup March', type: 'Meetup', venue: 'Meeting Room A', date: '2026-03-20', startTime: '14:00', endTime: '16:00', attendees: 30, capacity: 40, status: 'in_progress', organizer: 'DevHub' },
  { id: '4', name: 'Charity Gala Dinner', type: 'Gala', venue: 'Grand Ballroom', date: '2026-04-05', startTime: '19:00', endTime: '23:00', attendees: 0, capacity: 250, status: 'upcoming', organizer: 'City Foundation' },
  { id: '5', name: 'Corporate Training Day', type: 'Training', venue: 'Meeting Room B', date: '2026-03-15', startTime: '10:00', endTime: '16:00', attendees: 25, capacity: 30, status: 'completed', organizer: 'InnovateTech' },
];

const statusColors: Record<string, string> = {
  upcoming: 'bg-blue-500/10 text-blue-500',
  in_progress: 'bg-green-500/10 text-green-500',
  completed: 'bg-muted text-muted-foreground',
  cancelled: 'bg-destructive/10 text-destructive',
};

export default function Events() {
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  const filtered = mockEvents.filter((e) => {
    if (search && !e.name.toLowerCase().includes(search.toLowerCase()) && !e.organizer.toLowerCase().includes(search.toLowerCase())) return false;
    if (typeFilter !== 'all' && e.type !== typeFilter) return false;
    if (statusFilter !== 'all' && e.status !== statusFilter) return false;
    return true;
  });

  const types = [...new Set(mockEvents.map((e) => e.type))];

  const stats = {
    total: mockEvents.length,
    upcoming: mockEvents.filter((e) => e.status === 'upcoming').length,
    inProgress: mockEvents.filter((e) => e.status === 'in_progress').length,
    totalAttendees: mockEvents.reduce((s, e) => s + e.attendees, 0),
  };

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Calendar className="h-6 w-6 text-primary" />
            Events & Conferences
          </h1>
          <p className="text-muted-foreground text-sm mt-1">Manage event hall bookings and conferences</p>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" /> New Event
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Total Events</p>
            <p className="text-2xl font-bold">{stats.total}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Upcoming</p>
            <p className="text-2xl font-bold text-blue-500">{stats.upcoming}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">In Progress</p>
            <p className="text-2xl font-bold text-green-500">{stats.inProgress}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Total Attendees</p>
            <p className="text-2xl font-bold">{stats.totalAttendees}</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search events or organizers..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[150px]"><SelectValue placeholder="Type" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {types.map((t) => (<SelectItem key={t} value={t}>{t}</SelectItem>))}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[150px]"><SelectValue placeholder="Status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="upcoming">Upcoming</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Events Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Event</TableHead>
                <TableHead>Type</TableHead>
                <TableHead className="hidden md:table-cell">Venue</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="hidden lg:table-cell">Time</TableHead>
                <TableHead className="hidden md:table-cell">Attendees</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">No events found</TableCell>
                </TableRow>
              ) : (
                filtered.map((event) => (
                  <TableRow key={event.id} className="cursor-pointer hover:bg-muted/50">
                    <TableCell>
                      <div>
                        <p className="font-medium">{event.name}</p>
                        <p className="text-xs text-muted-foreground">{event.organizer}</p>
                      </div>
                    </TableCell>
                    <TableCell><Badge variant="outline">{event.type}</Badge></TableCell>
                    <TableCell className="hidden md:table-cell">
                      <span className="flex items-center gap-1 text-sm"><MapPin className="h-3 w-3" />{event.venue}</span>
                    </TableCell>
                    <TableCell className="text-sm">{format(new Date(event.date), 'MMM d, yyyy')}</TableCell>
                    <TableCell className="hidden lg:table-cell text-sm">
                      <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{event.startTime} - {event.endTime}</span>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <span className="flex items-center gap-1 text-sm"><Users className="h-3 w-3" />{event.attendees}/{event.capacity}</span>
                    </TableCell>
                    <TableCell>
                      <Badge className={statusColors[event.status]}>{event.status.replace('_', ' ')}</Badge>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
