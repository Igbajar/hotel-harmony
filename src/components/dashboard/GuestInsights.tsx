import { mockGuests, mockReservations } from '@/data/mockData';
import { Crown, Users, TrendingUp, Star } from 'lucide-react';
import { cn } from '@/lib/utils';

const vipCount = mockGuests.filter(g => g.vip).length;
const totalLoyaltyPoints = mockGuests.reduce((sum, g) => sum + g.loyaltyPoints, 0);
const avgStays = Math.round(mockGuests.reduce((sum, g) => sum + g.totalStays, 0) / mockGuests.length);
const returningGuests = mockGuests.filter(g => g.totalStays > 1).length;

const insights = [
  {
    label: 'VIP Guests',
    value: vipCount,
    icon: Crown,
    color: 'text-[hsl(var(--chart-2))]',
    bgColor: 'bg-[hsl(var(--chart-2))]/10',
  },
  {
    label: 'Total Guests',
    value: mockGuests.length,
    icon: Users,
    color: 'text-[hsl(var(--chart-1))]',
    bgColor: 'bg-[hsl(var(--chart-1))]/10',
  },
  {
    label: 'Avg. Stays',
    value: avgStays,
    icon: TrendingUp,
    color: 'text-[hsl(var(--chart-3))]',
    bgColor: 'bg-[hsl(var(--chart-3))]/10',
  },
  {
    label: 'Returning',
    value: `${Math.round((returningGuests / mockGuests.length) * 100)}%`,
    icon: Star,
    color: 'text-[hsl(var(--chart-4))]',
    bgColor: 'bg-[hsl(var(--chart-4))]/10',
  },
];

export function GuestInsights() {
  return (
    <div className="rounded-xl border border-border bg-card p-6 animate-fade-in">
      <div className="mb-6">
        <h3 className="text-lg font-semibold">Guest Insights</h3>
        <p className="text-sm text-muted-foreground">Loyalty & demographics</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {insights.map((insight) => (
          <div
            key={insight.label}
            className="flex items-center gap-3 rounded-lg bg-secondary/50 p-3"
          >
            <div className={cn('flex h-10 w-10 items-center justify-center rounded-lg', insight.bgColor)}>
              <insight.icon className={cn('h-5 w-5', insight.color)} />
            </div>
            <div>
              <p className="text-xl font-bold">{insight.value}</p>
              <p className="text-xs text-muted-foreground">{insight.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 pt-4 border-t border-border">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Total Loyalty Points</span>
          <span className="text-lg font-semibold text-[hsl(var(--chart-2))]">
            {totalLoyaltyPoints.toLocaleString()}
          </span>
        </div>
      </div>
    </div>
  );
}
