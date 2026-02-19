import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useCurrency } from '@/contexts/CurrencyContext';
import { useBarOrders } from '@/hooks/useBar';
import { useBarInventory } from '@/hooks/useInventory';
import { useInventoryTransactions } from '@/hooks/useInventory';
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Line, LineChart, CartesianGrid } from 'recharts';
import { TrendingUp, Trophy, Package, DollarSign } from 'lucide-react';
import { format, subDays, startOfDay, isAfter } from 'date-fns';

export function BarAnalytics() {
  const { formatPrice } = useCurrency();
  const { data: orders = [] } = useBarOrders();
  const { data: inventory = [] } = useBarInventory();
  const { data: transactions = [] } = useInventoryTransactions();

  // Daily revenue for last 14 days
  const dailyRevenue = useMemo(() => {
    const days: { date: string; revenue: number; orders: number }[] = [];
    for (let i = 13; i >= 0; i--) {
      const day = startOfDay(subDays(new Date(), i));
      const dayStr = format(day, 'yyyy-MM-dd');
      const dayOrders = orders.filter(o => format(new Date(o.created_at), 'yyyy-MM-dd') === dayStr);
      days.push({
        date: format(day, 'MMM dd'),
        revenue: dayOrders.reduce((s, o) => s + o.total_amount, 0),
        orders: dayOrders.length,
      });
    }
    return days;
  }, [orders]);

  // Top selling drinks
  const topDrinks = useMemo(() => {
    const drinkMap: Record<string, { name: string; qty: number; revenue: number }> = {};
    orders.forEach(o => {
      ((o as any).bar_order_items || []).forEach((item: any) => {
        const name = item.bar_drinks?.name || 'Unknown';
        if (!drinkMap[name]) drinkMap[name] = { name, qty: 0, revenue: 0 };
        drinkMap[name].qty += item.quantity;
        drinkMap[name].revenue += item.subtotal;
      });
    });
    return Object.values(drinkMap).sort((a, b) => b.revenue - a.revenue).slice(0, 10);
  }, [orders]);

  // Stock usage trends (last 14 days of sale transactions)
  const stockUsage = useMemo(() => {
    const days: { date: string; used: number; restocked: number }[] = [];
    for (let i = 13; i >= 0; i--) {
      const day = startOfDay(subDays(new Date(), i));
      const dayStr = format(day, 'yyyy-MM-dd');
      const dayTx = transactions.filter(t => format(new Date(t.created_at), 'yyyy-MM-dd') === dayStr);
      days.push({
        date: format(day, 'MMM dd'),
        used: Math.abs(dayTx.filter(t => t.type === 'sale').reduce((s, t) => s + t.quantity, 0)),
        restocked: dayTx.filter(t => t.type === 'purchase').reduce((s, t) => s + t.quantity, 0),
      });
    }
    return days;
  }, [transactions]);

  // Summary stats
  const todayRevenue = dailyRevenue[dailyRevenue.length - 1]?.revenue || 0;
  const todayOrders = dailyRevenue[dailyRevenue.length - 1]?.orders || 0;
  const totalRevenue = dailyRevenue.reduce((s, d) => s + d.revenue, 0);
  const lowStockCount = inventory.filter(i => i.drink && i.current_stock <= i.drink.reorder_point).length;

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <DollarSign className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Today's Revenue</p>
                <p className="text-lg font-bold">{formatPrice(todayRevenue)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-chart-2/10">
                <TrendingUp className="h-5 w-5 text-[hsl(var(--chart-2))]" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">14-Day Revenue</p>
                <p className="text-lg font-bold">{formatPrice(totalRevenue)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-chart-3/10">
                <Trophy className="h-5 w-5 text-[hsl(var(--chart-3))]" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Today's Orders</p>
                <p className="text-lg font-bold">{todayOrders}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-destructive/10">
                <Package className="h-5 w-5 text-destructive" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Low Stock Items</p>
                <p className="text-lg font-bold">{lowStockCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Daily Revenue Chart */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Daily Revenue (14 Days)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dailyRevenue}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="date" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `${(v / 1000).toFixed(0)}k`} />
                  <Tooltip
                    contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }}
                    formatter={(value: number) => [formatPrice(value), 'Revenue']}
                  />
                  <Bar dataKey="revenue" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Stock Usage Trends */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Stock Movement (14 Days)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={stockUsage}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="date" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }} />
                  <Line type="monotone" dataKey="used" stroke="hsl(var(--chart-1))" strokeWidth={2} name="Sold" dot={false} />
                  <Line type="monotone" dataKey="restocked" stroke="hsl(var(--chart-2))" strokeWidth={2} name="Restocked" dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="flex items-center justify-center gap-6 mt-2">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-[hsl(var(--chart-1))]" />
                <span className="text-xs text-muted-foreground">Sold</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-[hsl(var(--chart-2))]" />
                <span className="text-xs text-muted-foreground">Restocked</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Selling Drinks */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Top Selling Drinks</CardTitle>
        </CardHeader>
        <CardContent>
          {topDrinks.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">No sales data yet</p>
          ) : (
            <div className="space-y-2">
              {topDrinks.map((drink, i) => (
                <div key={drink.name} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50">
                  <span className="text-sm font-bold text-muted-foreground w-6 text-center">#{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{drink.name}</p>
                    <p className="text-xs text-muted-foreground">{drink.qty} units sold</p>
                  </div>
                  <p className="text-sm font-bold">{formatPrice(drink.revenue)}</p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
