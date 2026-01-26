import { Header } from '@/components/layout/Header';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { RoomStatusGrid } from '@/components/dashboard/RoomStatusGrid';
import { RecentActivity } from '@/components/dashboard/RecentActivity';
import { UpcomingReservations } from '@/components/dashboard/UpcomingReservations';
import { OccupancyChart } from '@/components/dashboard/OccupancyChart';
import { RevenueChart } from '@/components/dashboard/RevenueChart';
import { RoomTypeChart } from '@/components/dashboard/RoomTypeChart';
import { GuestInsights } from '@/components/dashboard/GuestInsights';
import { QuickActions } from '@/components/dashboard/QuickActions';
import { useRooms } from '@/hooks/useRooms';
import { useReservations } from '@/hooks/useReservations';
import { useGuests } from '@/hooks/useGuests';
import { useCurrency } from '@/contexts/CurrencyContext';
import {
  DoorOpen,
  DoorClosed,
  DollarSign,
  Percent,
  Users,
  BedDouble,
} from 'lucide-react';
import { isToday, parseISO } from 'date-fns';

export default function Dashboard() {
  const { data: rooms = [], isLoading: roomsLoading } = useRooms();
  const { data: reservations = [], isLoading: reservationsLoading } = useReservations();
  const { data: guests = [], isLoading: guestsLoading } = useGuests();
  const { formatPrice } = useCurrency();
  
  const today = new Date().toLocaleDateString('en-US', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  // Calculate stats from real data
  const totalRooms = rooms.length;
  const occupiedRooms = rooms.filter(r => r.status === 'occupied').length;
  const availableRooms = rooms.filter(r => r.status === 'available').length;
  const occupancyRate = totalRooms > 0 ? Math.round((occupiedRooms / totalRooms) * 100 * 10) / 10 : 0;
  
  const todayCheckIns = reservations.filter(r => 
    r.status === 'confirmed' && isToday(parseISO(r.check_in))
  ).length;
  
  const todayCheckOuts = reservations.filter(r => 
    r.status === 'checked_in' && isToday(parseISO(r.check_out))
  ).length;
  
  const totalRevenue = reservations
    .filter(r => r.payment_status === 'paid')
    .reduce((sum, r) => sum + r.total_amount, 0);
  
  const pendingReservations = reservations.filter(r => r.status === 'pending').length;
  const vipGuests = guests.filter(g => g.vip).length;

  // Transform rooms for components
  const roomsForGrid = rooms.map(r => ({
    id: r.id,
    number: r.number,
    floor: r.floor,
    type: r.type,
    status: r.status,
    pricePerNight: r.price_per_night,
    maxOccupancy: r.max_occupancy,
    amenities: r.amenities || [],
  }));

  const isLoading = roomsLoading || reservationsLoading || guestsLoading;

  return (
    <div className="min-h-screen">
      <Header 
        title="Dashboard" 
        subtitle={today}
      />
      
      <div className="p-6 space-y-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4">
          <StatsCard
            title="Occupancy Rate"
            value={isLoading ? '...' : `${occupancyRate}%`}
            subtitle={isLoading ? 'Loading...' : `${occupiedRooms} of ${totalRooms} rooms occupied`}
            icon={Percent}
            variant="accent"
          />
          <StatsCard
            title="Total Revenue"
            value={isLoading ? '...' : formatPrice(totalRevenue)}
            subtitle="From paid reservations"
            icon={DollarSign}
          />
          <StatsCard
            title="Check-ins Today"
            value={isLoading ? '...' : todayCheckIns}
            subtitle={vipGuests > 0 ? `${vipGuests} VIP guests total` : 'No VIP guests'}
            icon={DoorOpen}
            variant="success"
          />
          <StatsCard
            title="Check-outs Today"
            value={isLoading ? '...' : todayCheckOuts}
            subtitle="Scheduled departures"
            icon={DoorClosed}
          />
          <StatsCard
            title="Pending"
            value={isLoading ? '...' : pendingReservations}
            subtitle="Awaiting confirmation"
            icon={Users}
          />
          <StatsCard
            title="Available Rooms"
            value={isLoading ? '...' : availableRooms}
            subtitle={`${totalRooms} total rooms`}
            icon={BedDouble}
            variant="primary"
          />
        </div>

        {/* Revenue Chart */}
        <RevenueChart />

        {/* Room Status Grid */}
        {roomsForGrid.length > 0 && <RoomStatusGrid rooms={roomsForGrid} />}

        {/* Charts and Analytics Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <OccupancyChart rooms={rooms} />
          <RoomTypeChart rooms={rooms} />
          <GuestInsights guests={guests} />
        </div>

        {/* Reservations and Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3">
            <UpcomingReservations reservations={reservations} />
          </div>
          <QuickActions />
        </div>

        {/* Recent Activity */}
        <RecentActivity />
      </div>
    </div>
  );
}
