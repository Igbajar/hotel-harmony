import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import type { Room } from '@/hooks/useRooms';

interface OccupancyChartProps {
  rooms: Room[];
}

export function OccupancyChart({ rooms }: OccupancyChartProps) {
  // Calculate occupancy from real room data
  const totalRooms = rooms.length;
  const occupiedRooms = rooms.filter(r => r.status === 'occupied').length;
  const currentOccupancy = totalRooms > 0 ? Math.round((occupiedRooms / totalRooms) * 100) : 0;

  // Generate weekly trend data based on current occupancy (simulated variance)
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const todayIndex = new Date().getDay();
  const adjustedIndex = todayIndex === 0 ? 6 : todayIndex - 1; // Convert to Mon=0

  const data = days.map((day, index) => {
    // Add some variance around current occupancy for visualization
    const variance = (index - adjustedIndex) * 5;
    const occupancy = Math.max(0, Math.min(100, currentOccupancy + variance + Math.floor(Math.random() * 10) - 5));
    return {
      day,
      occupancy: index <= adjustedIndex ? occupancy : currentOccupancy,
    };
  });

  return (
    <div className="rounded-xl border border-border bg-card p-6 animate-fade-in">
      <div className="mb-6">
        <h3 className="text-lg font-semibold">Occupancy Rate</h3>
        <p className="text-sm text-muted-foreground">
          {totalRooms > 0 ? `Current: ${currentOccupancy}%` : 'No rooms configured'}
        </p>
      </div>

      <div className="h-[200px]">
        {totalRooms > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <defs>
                <linearGradient id="occupancyGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(var(--accent))" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="hsl(var(--accent))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="day"
                axisLine={false}
                tickLine={false}
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                domain={[0, 100]}
                tickFormatter={(value) => `${value}%`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                }}
                formatter={(value: number) => [`${value}%`, 'Occupancy']}
              />
              <Area
                type="monotone"
                dataKey="occupancy"
                stroke="hsl(var(--accent))"
                strokeWidth={2}
                fill="url(#occupancyGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex h-full items-center justify-center text-muted-foreground">
            Add rooms to see occupancy data
          </div>
        )}
      </div>
    </div>
  );
}
