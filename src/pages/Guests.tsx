import { useState } from 'react';
import { Header } from '@/components/layout/Header';
import { mockGuests } from '@/data/mockData';
import { Guest } from '@/types/hotel';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
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
  Search,
  Plus,
  Crown,
  Star,
  Mail,
  Phone,
  Globe,
  Calendar,
  BedDouble,
  MoreHorizontal,
  Filter,
  Download,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

function GuestCard({ guest }: { guest: Guest }) {
  return (
    <Card className="group hover:shadow-lg transition-all duration-300 animate-fade-in">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="h-14 w-14">
              <AvatarFallback className={cn(
                'text-lg',
                guest.vip ? 'bg-accent text-accent-foreground' : 'bg-primary text-primary-foreground'
              )}>
                {guest.firstName[0]}{guest.lastName[0]}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center gap-2">
                <CardTitle className="text-lg">
                  {guest.firstName} {guest.lastName}
                </CardTitle>
                {guest.vip && (
                  <Crown className="h-4 w-4 text-accent" />
                )}
              </div>
              <CardDescription className="flex items-center gap-1">
                <Globe className="h-3 w-3" />
                {guest.nationality || 'Unknown'}
              </CardDescription>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>View Profile</DropdownMenuItem>
              <DropdownMenuItem>Edit Guest</DropdownMenuItem>
              <DropdownMenuItem>View History</DropdownMenuItem>
              <DropdownMenuItem>Send Message</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Mail className="h-4 w-4" />
            <span className="truncate">{guest.email}</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Phone className="h-4 w-4" />
            <span>{guest.phone}</span>
          </div>
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-border">
          <div className="flex items-center gap-4">
            <div className="text-center">
              <p className="text-xl font-bold">{guest.totalStays}</p>
              <p className="text-xs text-muted-foreground">Stays</p>
            </div>
            <div className="text-center">
              <p className="text-xl font-bold text-accent">{guest.loyaltyPoints.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">Points</p>
            </div>
          </div>
          <Button size="sm" variant="outline">
            New Booking
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default function Guests() {
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredGuests = mockGuests.filter((guest) => {
    const searchLower = searchQuery.toLowerCase();
    return (
      guest.firstName.toLowerCase().includes(searchLower) ||
      guest.lastName.toLowerCase().includes(searchLower) ||
      guest.email.toLowerCase().includes(searchLower)
    );
  });

  const totalPoints = mockGuests.reduce((sum, g) => sum + g.loyaltyPoints, 0);
  const vipCount = mockGuests.filter((g) => g.vip).length;

  return (
    <div className="min-h-screen">
      <Header title="Guests" subtitle="Manage guest profiles and history" />

      <div className="p-6 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="animate-fade-in">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Guests</p>
                  <p className="text-3xl font-bold">{mockGuests.length}</p>
                </div>
                <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <BedDouble className="h-6 w-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="animate-fade-in" style={{ animationDelay: '50ms' }}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">VIP Guests</p>
                  <p className="text-3xl font-bold text-accent">{vipCount}</p>
                </div>
                <div className="h-12 w-12 rounded-xl bg-accent/10 flex items-center justify-center">
                  <Crown className="h-6 w-6 text-accent" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="animate-fade-in" style={{ animationDelay: '100ms' }}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Points</p>
                  <p className="text-3xl font-bold">{(totalPoints / 1000).toFixed(1)}K</p>
                </div>
                <div className="h-12 w-12 rounded-xl bg-success/10 flex items-center justify-center">
                  <Star className="h-6 w-6 text-success" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="animate-fade-in" style={{ animationDelay: '150ms' }}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Avg. Stays</p>
                  <p className="text-3xl font-bold">
                    {(mockGuests.reduce((sum, g) => sum + g.totalStays, 0) / mockGuests.length).toFixed(1)}
                  </p>
                </div>
                <div className="h-12 w-12 rounded-xl bg-room-cleaning/10 flex items-center justify-center">
                  <Calendar className="h-6 w-6 text-room-cleaning" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search guests by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button variant="outline" className="gap-2">
            <Filter className="h-4 w-4" />
            Filter
          </Button>
          <Button variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            Export
          </Button>
          <Button className="gap-2 bg-accent text-accent-foreground hover:bg-accent/90">
            <Plus className="h-4 w-4" />
            Add Guest
          </Button>
        </div>

        {/* Guest Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredGuests.map((guest, index) => (
            <div key={guest.id} style={{ animationDelay: `${index * 50}ms` }}>
              <GuestCard guest={guest} />
            </div>
          ))}
        </div>

        {filteredGuests.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <BedDouble className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold">No guests found</h3>
            <p className="text-muted-foreground">Try adjusting your search</p>
          </div>
        )}
      </div>
    </div>
  );
}
