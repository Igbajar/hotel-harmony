import { useState } from 'react';
import { Header } from '@/components/layout/Header';
import { mockRooms } from '@/data/mockData';
import { Room, RoomStatus } from '@/types/hotel';
import { AddRoomDialog } from '@/components/dialogs/AddRoomDialog';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useCurrency } from '@/contexts/CurrencyContext';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  BedDouble,
  Wrench,
  Sparkles,
  Clock,
  Check,
  Search,
  Plus,
  Grid3X3,
  List,
  Wifi,
  Tv,
  Wind,
  Wine,
  Bath,
  MountainSnow,
  Users,
  MoreVertical,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const statusConfig: Record<RoomStatus, { label: string; color: string; bgColor: string; icon: React.ElementType }> = {
  available: { label: 'Available', color: 'text-room-available', bgColor: 'bg-room-available', icon: Check },
  occupied: { label: 'Occupied', color: 'text-room-occupied', bgColor: 'bg-room-occupied', icon: BedDouble },
  reserved: { label: 'Reserved', color: 'text-room-reserved', bgColor: 'bg-room-reserved', icon: Clock },
  maintenance: { label: 'Maintenance', color: 'text-room-maintenance', bgColor: 'bg-room-maintenance', icon: Wrench },
  cleaning: { label: 'Cleaning', color: 'text-room-cleaning', bgColor: 'bg-room-cleaning', icon: Sparkles },
};

const amenityIcons: Record<string, React.ElementType> = {
  WiFi: Wifi,
  TV: Tv,
  AC: Wind,
  'Mini Bar': Wine,
  Jacuzzi: Bath,
  Balcony: MountainSnow,
};

function RoomCard({ room }: { room: Room }) {
  const config = statusConfig[room.status];
  const StatusIcon = config.icon;
  const { formatPrice } = useCurrency();

  return (
    <Card className="group hover:shadow-lg transition-all duration-300 animate-fade-in overflow-hidden">
      <div className={cn('h-1.5', config.bgColor)} />
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className={cn(
              'flex h-12 w-12 items-center justify-center rounded-xl',
              config.bgColor,
              'text-white'
            )}>
              <span className="text-lg font-bold">{room.number}</span>
            </div>
            <div>
              <CardTitle className="text-lg">Room {room.number}</CardTitle>
              <CardDescription className="capitalize">{room.type} · Floor {room.floor}</CardDescription>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-popover border border-border shadow-lg z-50">
              <DropdownMenuItem>View Details</DropdownMenuItem>
              <DropdownMenuItem>Edit Room</DropdownMenuItem>
              <DropdownMenuItem>Change Status</DropdownMenuItem>
              <DropdownMenuItem>Maintenance Request</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <Badge variant="outline" className={cn('gap-1.5', config.color)}>
            <StatusIcon className="h-3 w-3" />
            {config.label}
          </Badge>
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <Users className="h-4 w-4" />
            <span>Max {room.maxOccupancy}</span>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {room.amenities.slice(0, 4).map((amenity) => {
            const Icon = amenityIcons[amenity] || Wifi;
            return (
              <div
                key={amenity}
                className="flex items-center gap-1 rounded-md bg-secondary px-2 py-1 text-xs text-muted-foreground"
              >
                <Icon className="h-3 w-3" />
                {amenity}
              </div>
            );
          })}
          {room.amenities.length > 4 && (
            <div className="flex items-center rounded-md bg-secondary px-2 py-1 text-xs text-muted-foreground">
              +{room.amenities.length - 4} more
            </div>
          )}
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-border">
          <div className="flex items-center gap-1 text-lg font-bold">
            {formatPrice(room.pricePerNight)}
            <span className="text-sm font-normal text-muted-foreground">/night</span>
          </div>
          <Button size="sm" variant="outline">
            {room.status === 'available' ? 'Book Now' : 'View'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default function Rooms() {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [addRoomOpen, setAddRoomOpen] = useState(false);

  const filteredRooms = mockRooms.filter((room) => {
    const matchesStatus = statusFilter === 'all' || room.status === statusFilter;
    const matchesType = typeFilter === 'all' || room.type === typeFilter;
    const matchesSearch = room.number.includes(searchQuery);
    return matchesStatus && matchesType && matchesSearch;
  });

  const statusCounts = mockRooms.reduce((acc, room) => {
    acc[room.status] = (acc[room.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="min-h-screen">
      <Header title="Rooms" subtitle="Manage all hotel rooms" />

      <div className="p-6 space-y-6">
        {/* Status Summary */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {Object.entries(statusConfig).map(([status, config]) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status === statusFilter ? 'all' : status)}
              className={cn(
                'flex items-center gap-3 rounded-xl border p-4 transition-all duration-200',
                status === statusFilter
                  ? 'border-accent bg-accent/5 shadow-sm'
                  : 'border-border bg-card hover:border-accent/50'
              )}
            >
              <div className={cn('h-3 w-3 rounded-full', config.bgColor)} />
              <div className="text-left">
                <p className="text-sm font-medium">{config.label}</p>
                <p className="text-2xl font-bold">{statusCounts[status] || 0}</p>
              </div>
            </button>
          ))}
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search rooms..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-full sm:w-40">
              <SelectValue placeholder="Room Type" />
            </SelectTrigger>
            <SelectContent className="bg-popover border border-border shadow-lg z-50">
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="single">Single</SelectItem>
              <SelectItem value="double">Double</SelectItem>
              <SelectItem value="suite">Suite</SelectItem>
              <SelectItem value="deluxe">Deluxe</SelectItem>
              <SelectItem value="presidential">Presidential</SelectItem>
            </SelectContent>
          </Select>
          <div className="flex gap-2">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'outline'}
              size="icon"
              onClick={() => setViewMode('grid')}
            >
              <Grid3X3 className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'outline'}
              size="icon"
              onClick={() => setViewMode('list')}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
          <Button className="gap-2 bg-accent text-accent-foreground hover:bg-accent/90" onClick={() => setAddRoomOpen(true)}>
            <Plus className="h-4 w-4" />
            Add Room
          </Button>
        </div>

        <AddRoomDialog open={addRoomOpen} onOpenChange={setAddRoomOpen} />

        {/* Rooms Grid */}
        <div className={cn(
          'grid gap-4',
          viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' : 'grid-cols-1'
        )}>
          {filteredRooms.map((room, index) => (
            <div key={room.id} style={{ animationDelay: `${index * 50}ms` }}>
              <RoomCard room={room} />
            </div>
          ))}
        </div>

        {filteredRooms.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <BedDouble className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold">No rooms found</h3>
            <p className="text-muted-foreground">Try adjusting your filters</p>
          </div>
        )}
      </div>
    </div>
  );
}
