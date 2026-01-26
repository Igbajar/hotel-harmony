import { Crown, Users, TrendingUp, Star } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Guest } from '@/hooks/useGuests';

interface GuestInsightsProps {
  guests: Guest[];
}

export function GuestInsights({ guests }: GuestInsightsProps) {
  const vipCount = guests.filter(g => g.vip).length;
  const totalGuests = guests.length;

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
      value: totalGuests,
      icon: Users,
      color: 'text-[hsl(var(--chart-1))]',
      bgColor: 'bg-[hsl(var(--chart-1))]/10',
    },
    {
      label: 'This Month',
      value: guests.filter(g => {
        const createdAt = new Date(g.created_at);
        const now = new Date();
        return createdAt.getMonth() === now.getMonth() && createdAt.getFullYear() === now.getFullYear();
      }).length,
      icon: TrendingUp,
      color: 'text-[hsl(var(--chart-3))]',
      bgColor: 'bg-[hsl(var(--chart-3))]/10',
    },
    {
      label: 'VIP Rate',
      value: totalGuests > 0 ? `${Math.round((vipCount / totalGuests) * 100)}%` : '0%',
      icon: Star,
      color: 'text-[hsl(var(--chart-4))]',
      bgColor: 'bg-[hsl(var(--chart-4))]/10',
    },
  ];

  return (
    <div className="rounded-xl border border-border bg-card p-6 animate-fade-in">
      <div className="mb-6">
        <h3 className="text-lg font-semibold">Guest Insights</h3>
        <p className="text-sm text-muted-foreground">
          {totalGuests > 0 ? 'Guest demographics' : 'No guests registered'}
        </p>
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
    </div>
  );
}
