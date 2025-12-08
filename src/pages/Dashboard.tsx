import { Header } from '@/components/layout/Header';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { RoomStatusGrid } from '@/components/dashboard/RoomStatusGrid';
import { RecentActivity } from '@/components/dashboard/RecentActivity';
import { UpcomingReservations } from '@/components/dashboard/UpcomingReservations';
import { OccupancyChart } from '@/components/dashboard/OccupancyChart';
import { mockRooms, mockReservations, mockDashboardStats } from '@/data/mockData';
import { useCurrency } from '@/contexts/CurrencyContext';
import {
  DoorOpen,
  DoorClosed,
  DollarSign,
  Percent,
} from 'lucide-react';

export default function Dashboard() {
  const stats = mockDashboardStats;
  const { formatPrice } = useCurrency();
  const today = new Date().toLocaleDateString('en-US', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  return (
    <div className="min-h-screen">
      <Header 
        title="Dashboard" 
        subtitle={today}
      />
      
      <div className="p-6 space-y-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard
            title="Occupancy Rate"
            value={`${stats.occupancyRate}%`}
            subtitle="5 of 12 rooms occupied"
            icon={Percent}
            trend={{ value: 8.2, isPositive: true }}
            variant="accent"
          />
          <StatsCard
            title="Today's Revenue"
            value={formatPrice(stats.revenue)}
            subtitle="From all sources"
            icon={DollarSign}
            trend={{ value: 12.5, isPositive: true }}
          />
          <StatsCard
            title="Check-ins Today"
            value={stats.todayCheckIns}
            subtitle="2 VIP guests"
            icon={DoorOpen}
            variant="success"
          />
          <StatsCard
            title="Check-outs Today"
            value={stats.todayCheckOuts}
            subtitle="All on schedule"
            icon={DoorClosed}
          />
        </div>

        {/* Room Status Grid */}
        <RoomStatusGrid rooms={mockRooms} />

        {/* Charts and Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <UpcomingReservations reservations={mockReservations} />
          </div>
          <div className="space-y-6">
            <OccupancyChart />
          </div>
        </div>

        {/* Recent Activity */}
        <RecentActivity />
      </div>
    </div>
  );
}
