import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { useCurrency } from '@/contexts/CurrencyContext';

const data = [
  { month: 'Jan', rooms: 18500, services: 4200, restaurant: 3800 },
  { month: 'Feb', rooms: 22100, services: 5100, restaurant: 4500 },
  { month: 'Mar', rooms: 19800, services: 4800, restaurant: 4100 },
  { month: 'Apr', rooms: 25600, services: 6200, restaurant: 5400 },
  { month: 'May', rooms: 28900, services: 7100, restaurant: 6200 },
  { month: 'Jun', rooms: 32400, services: 8500, restaurant: 7800 },
];

export function RevenueChart() {
  const { formatPrice } = useCurrency();

  return (
    <div className="rounded-xl border border-border bg-card p-6 animate-fade-in">
      <div className="mb-6">
        <h3 className="text-lg font-semibold">Revenue Breakdown</h3>
        <p className="text-sm text-muted-foreground">Monthly revenue by category</p>
      </div>

      <div className="h-[280px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} barCategoryGap="20%">
            <XAxis
              dataKey="month"
              axisLine={false}
              tickLine={false}
              tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
              tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
              }}
              formatter={(value: number, name: string) => [
                formatPrice(value),
                name === 'rooms' ? 'Room Revenue' : name === 'services' ? 'Services' : 'Restaurant'
              ]}
            />
            <Bar
              dataKey="rooms"
              fill="hsl(var(--chart-1))"
              radius={[4, 4, 0, 0]}
            />
            <Bar
              dataKey="services"
              fill="hsl(var(--chart-2))"
              radius={[4, 4, 0, 0]}
            />
            <Bar
              dataKey="restaurant"
              fill="hsl(var(--chart-3))"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-4 flex items-center justify-center gap-6">
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full bg-[hsl(var(--chart-1))]" />
          <span className="text-sm text-muted-foreground">Rooms</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full bg-[hsl(var(--chart-2))]" />
          <span className="text-sm text-muted-foreground">Services</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full bg-[hsl(var(--chart-3))]" />
          <span className="text-sm text-muted-foreground">Restaurant</span>
        </div>
      </div>
    </div>
  );
}
