import { useState, useMemo } from 'react';
import { format, subDays, startOfMonth, endOfMonth, eachDayOfInterval, subMonths, differenceInDays } from 'date-fns';
import { 
  Download, FileText, TrendingUp, TrendingDown, Users, Bed, DollarSign, 
  Calendar, BarChart3, PieChart, Activity, ArrowUpRight, ArrowDownRight,
  Filter, RefreshCw, Printer, Building2, Star, Clock, CheckCircle2
} from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  BarChart, Bar, LineChart, Line, PieChart as RePieChart, Pie, Cell, 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';
import { useCurrency } from '@/contexts/CurrencyContext';
import { mockRooms, mockGuests, mockReservations, mockStaff, mockRoomServiceOrders } from '@/data/mockData';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';

type DateRange = '7d' | '30d' | '90d' | '12m';

const CHART_COLORS = [
  'hsl(var(--chart-1))',
  'hsl(var(--chart-2))',
  'hsl(var(--chart-3))',
  'hsl(var(--chart-4))',
  'hsl(var(--chart-5))',
];

// Generate revenue data for the selected period
const generateRevenueData = (range: DateRange) => {
  const days = range === '7d' ? 7 : range === '30d' ? 30 : range === '90d' ? 90 : 365;
  const data = [];
  
  for (let i = days - 1; i >= 0; i--) {
    const date = subDays(new Date(), i);
    const baseRevenue = 5000 + Math.random() * 3000;
    const roomRevenue = baseRevenue * 0.7;
    const foodRevenue = baseRevenue * 0.2;
    const otherRevenue = baseRevenue * 0.1;
    
    data.push({
      date: range === '12m' ? format(date, 'MMM') : format(date, 'MMM dd'),
      revenue: Math.round(baseRevenue),
      rooms: Math.round(roomRevenue),
      food: Math.round(foodRevenue),
      other: Math.round(otherRevenue),
    });
  }
  
  // Aggregate by month for 12m view
  if (range === '12m') {
    const monthly: Record<string, { revenue: number; rooms: number; food: number; other: number; count: number }> = {};
    data.forEach(d => {
      if (!monthly[d.date]) {
        monthly[d.date] = { revenue: 0, rooms: 0, food: 0, other: 0, count: 0 };
      }
      monthly[d.date].revenue += d.revenue;
      monthly[d.date].rooms += d.rooms;
      monthly[d.date].food += d.food;
      monthly[d.date].other += d.other;
      monthly[d.date].count++;
    });
    return Object.entries(monthly).map(([date, values]) => ({
      date,
      revenue: Math.round(values.revenue),
      rooms: Math.round(values.rooms),
      food: Math.round(values.food),
      other: Math.round(values.other),
    }));
  }
  
  return range === '7d' ? data : data.filter((_, i) => i % (range === '30d' ? 1 : 3) === 0);
};

// Generate occupancy data
const generateOccupancyData = (range: DateRange) => {
  const days = range === '7d' ? 7 : range === '30d' ? 30 : range === '90d' ? 90 : 365;
  const data = [];
  
  for (let i = days - 1; i >= 0; i--) {
    const date = subDays(new Date(), i);
    const occupancy = 40 + Math.random() * 50;
    
    data.push({
      date: range === '12m' ? format(date, 'MMM') : format(date, 'MMM dd'),
      occupancy: Math.round(occupancy),
      adr: Math.round(180 + Math.random() * 80),
      revpar: Math.round(occupancy * (180 + Math.random() * 80) / 100),
    });
  }
  
  if (range === '12m') {
    const monthly: Record<string, { occupancy: number; adr: number; revpar: number; count: number }> = {};
    data.forEach(d => {
      if (!monthly[d.date]) {
        monthly[d.date] = { occupancy: 0, adr: 0, revpar: 0, count: 0 };
      }
      monthly[d.date].occupancy += d.occupancy;
      monthly[d.date].adr += d.adr;
      monthly[d.date].revpar += d.revpar;
      monthly[d.date].count++;
    });
    return Object.entries(monthly).map(([date, values]) => ({
      date,
      occupancy: Math.round(values.occupancy / values.count),
      adr: Math.round(values.adr / values.count),
      revpar: Math.round(values.revpar / values.count),
    }));
  }
  
  return range === '7d' ? data : data.filter((_, i) => i % (range === '30d' ? 1 : 3) === 0);
};

export default function Reports() {
  const { formatPrice } = useCurrency();
  const [dateRange, setDateRange] = useState<DateRange>('30d');
  const [activeTab, setActiveTab] = useState('overview');

  const revenueData = useMemo(() => generateRevenueData(dateRange), [dateRange]);
  const occupancyData = useMemo(() => generateOccupancyData(dateRange), [dateRange]);

  // Calculate summary metrics
  const totalRevenue = revenueData.reduce((sum, d) => sum + d.revenue, 0);
  const avgOccupancy = Math.round(occupancyData.reduce((sum, d) => sum + d.occupancy, 0) / occupancyData.length);
  const avgADR = Math.round(occupancyData.reduce((sum, d) => sum + d.adr, 0) / occupancyData.length);
  const avgRevPAR = Math.round(occupancyData.reduce((sum, d) => sum + d.revpar, 0) / occupancyData.length);

  // Room type distribution
  const roomTypeData = useMemo(() => {
    const counts: Record<string, number> = {};
    mockRooms.forEach(room => {
      counts[room.type] = (counts[room.type] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      value,
    }));
  }, []);

  // Guest demographics (by nationality)
  const guestDemographics = useMemo(() => {
    const counts: Record<string, number> = {};
    mockGuests.forEach(guest => {
      const nat = guest.nationality || 'Unknown';
      counts[nat] = (counts[nat] || 0) + 1;
    });
    return Object.entries(counts)
      .map(([name, value]) => ({ name, value, percentage: Math.round((value / mockGuests.length) * 100) }))
      .sort((a, b) => b.value - a.value);
  }, []);

  // Reservation status breakdown
  const reservationStatusData = useMemo(() => {
    const counts: Record<string, number> = {};
    mockReservations.forEach(res => {
      counts[res.status] = (counts[res.status] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({
      name: name.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
      value,
    }));
  }, []);

  // Staff performance data
  const staffPerformanceData = useMemo(() => {
    return mockStaff
      .filter(s => s.status === 'active')
      .map(s => ({
        name: `${s.firstName} ${s.lastName.charAt(0)}.`,
        department: s.department,
        score: s.performanceScore,
        tasks: s.tasksCompleted,
        hours: s.hoursWorked,
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 10);
  }, []);

  // Department performance
  const departmentData = useMemo(() => {
    const depts: Record<string, { count: number; totalScore: number; totalTasks: number }> = {};
    mockStaff.filter(s => s.status === 'active').forEach(s => {
      if (!depts[s.department]) {
        depts[s.department] = { count: 0, totalScore: 0, totalTasks: 0 };
      }
      depts[s.department].count++;
      depts[s.department].totalScore += s.performanceScore;
      depts[s.department].totalTasks += s.tasksCompleted;
    });
    return Object.entries(depts).map(([name, data]) => ({
      name,
      avgScore: (data.totalScore / data.count).toFixed(1),
      totalTasks: data.totalTasks,
      staffCount: data.count,
    }));
  }, []);

  // Room service analytics
  const roomServiceData = useMemo(() => {
    const statusCounts: Record<string, number> = {};
    let totalAmount = 0;
    mockRoomServiceOrders.forEach(order => {
      statusCounts[order.status] = (statusCounts[order.status] || 0) + 1;
      totalAmount += order.totalAmount;
    });
    return {
      totalOrders: mockRoomServiceOrders.length,
      totalRevenue: totalAmount,
      avgOrderValue: totalAmount / mockRoomServiceOrders.length,
      statusBreakdown: Object.entries(statusCounts).map(([name, value]) => ({
        name: name.charAt(0).toUpperCase() + name.slice(1),
        value,
      })),
    };
  }, []);

  const handleExport = (reportType: string) => {
    toast({
      title: "Export Started",
      description: `Exporting ${reportType} report as PDF...`,
    });
  };

  const MetricCard = ({ 
    title, 
    value, 
    change, 
    changeType, 
    icon: Icon,
    subtitle 
  }: { 
    title: string; 
    value: string; 
    change?: string; 
    changeType?: 'positive' | 'negative' | 'neutral';
    icon: React.ElementType;
    subtitle?: string;
  }) => (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold">{value}</p>
            {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
          </div>
          <div className="p-2 bg-primary/10 rounded-lg">
            <Icon className="h-5 w-5 text-primary" />
          </div>
        </div>
        {change && (
          <div className={cn(
            "flex items-center gap-1 mt-3 text-sm",
            changeType === 'positive' && "text-green-600",
            changeType === 'negative' && "text-red-600",
            changeType === 'neutral' && "text-muted-foreground"
          )}>
            {changeType === 'positive' && <ArrowUpRight className="h-4 w-4" />}
            {changeType === 'negative' && <ArrowDownRight className="h-4 w-4" />}
            <span>{change}</span>
            <span className="text-muted-foreground">vs last period</span>
          </div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="flex flex-col h-full">
      <Header title="Reports & Analytics" subtitle="Comprehensive hotel performance insights" />
      
      <div className="flex-1 overflow-auto p-6 space-y-6">
        {/* Controls */}
        <div className="flex flex-col sm:flex-row justify-between gap-4">
          <div className="flex items-center gap-2">
            <Select value={dateRange} onValueChange={(v: DateRange) => setDateRange(v)}>
              <SelectTrigger className="w-[140px]">
                <Calendar className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">Last 7 days</SelectItem>
                <SelectItem value="30d">Last 30 days</SelectItem>
                <SelectItem value="90d">Last 90 days</SelectItem>
                <SelectItem value="12m">Last 12 months</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="icon">
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => handleExport('Full')}>
              <Printer className="h-4 w-4 mr-2" />
              Print
            </Button>
            <Button onClick={() => handleExport('Full')}>
              <Download className="h-4 w-4 mr-2" />
              Export PDF
            </Button>
          </div>
        </div>

        {/* Summary Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard 
            title="Total Revenue" 
            value={formatPrice(totalRevenue)} 
            change="+12.5%"
            changeType="positive"
            icon={DollarSign}
            subtitle={`${dateRange === '7d' ? '7 days' : dateRange === '30d' ? '30 days' : dateRange === '90d' ? '90 days' : '12 months'}`}
          />
          <MetricCard 
            title="Avg. Occupancy" 
            value={`${avgOccupancy}%`} 
            change="+5.2%"
            changeType="positive"
            icon={Bed}
          />
          <MetricCard 
            title="Avg. Daily Rate" 
            value={formatPrice(avgADR)} 
            change="+8.1%"
            changeType="positive"
            icon={TrendingUp}
          />
          <MetricCard 
            title="RevPAR" 
            value={formatPrice(avgRevPAR)} 
            change="+15.3%"
            changeType="positive"
            icon={Activity}
          />
        </div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-5 h-auto">
            <TabsTrigger value="overview" className="gap-2">
              <BarChart3 className="h-4 w-4" />
              <span className="hidden sm:inline">Overview</span>
            </TabsTrigger>
            <TabsTrigger value="revenue" className="gap-2">
              <DollarSign className="h-4 w-4" />
              <span className="hidden sm:inline">Revenue</span>
            </TabsTrigger>
            <TabsTrigger value="occupancy" className="gap-2">
              <Bed className="h-4 w-4" />
              <span className="hidden sm:inline">Occupancy</span>
            </TabsTrigger>
            <TabsTrigger value="guests" className="gap-2">
              <Users className="h-4 w-4" />
              <span className="hidden sm:inline">Guests</span>
            </TabsTrigger>
            <TabsTrigger value="staff" className="gap-2">
              <Building2 className="h-4 w-4" />
              <span className="hidden sm:inline">Staff</span>
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Revenue Trend */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Revenue Trend</CardTitle>
                  <CardDescription>Daily revenue breakdown by category</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={revenueData}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="date" tick={{ fontSize: 12 }} className="text-muted-foreground" />
                      <YAxis tick={{ fontSize: 12 }} className="text-muted-foreground" />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'hsl(var(--card))', 
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px'
                        }} 
                      />
                      <Legend />
                      <Area type="monotone" dataKey="rooms" stackId="1" stroke={CHART_COLORS[0]} fill={CHART_COLORS[0]} fillOpacity={0.6} name="Rooms" />
                      <Area type="monotone" dataKey="food" stackId="1" stroke={CHART_COLORS[1]} fill={CHART_COLORS[1]} fillOpacity={0.6} name="F&B" />
                      <Area type="monotone" dataKey="other" stackId="1" stroke={CHART_COLORS[2]} fill={CHART_COLORS[2]} fillOpacity={0.6} name="Other" />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Occupancy Trend */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Occupancy Rate</CardTitle>
                  <CardDescription>Daily occupancy percentage</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={occupancyData}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                      <YAxis tick={{ fontSize: 12 }} domain={[0, 100]} />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'hsl(var(--card))', 
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px'
                        }} 
                      />
                      <Line type="monotone" dataKey="occupancy" stroke={CHART_COLORS[0]} strokeWidth={2} dot={false} name="Occupancy %" />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
              {/* Room Type Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Room Types</CardTitle>
                  <CardDescription>Distribution by category</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={200}>
                    <RePieChart>
                      <Pie
                        data={roomTypeData}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={80}
                        paddingAngle={2}
                        dataKey="value"
                      >
                        {roomTypeData.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </RePieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Reservation Status */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Reservations</CardTitle>
                  <CardDescription>Status breakdown</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={reservationStatusData} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis type="number" />
                      <YAxis dataKey="name" type="category" width={80} tick={{ fontSize: 11 }} />
                      <Tooltip />
                      <Bar dataKey="value" fill={CHART_COLORS[0]} radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Room Service Stats */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Room Service</CardTitle>
                  <CardDescription>Order statistics</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Total Orders</span>
                    <span className="font-semibold">{roomServiceData.totalOrders}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Total Revenue</span>
                    <span className="font-semibold">{formatPrice(roomServiceData.totalRevenue)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Avg. Order Value</span>
                    <span className="font-semibold">{formatPrice(roomServiceData.avgOrderValue)}</span>
                  </div>
                  <Separator />
                  <div className="space-y-2">
                    {roomServiceData.statusBreakdown.map((item, i) => (
                      <div key={item.name} className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: CHART_COLORS[i % CHART_COLORS.length] }} />
                        <span className="text-sm flex-1">{item.name}</span>
                        <Badge variant="secondary">{item.value}</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Revenue Tab */}
          <TabsContent value="revenue" className="space-y-6">
            <div className="grid lg:grid-cols-4 gap-4">
              <MetricCard title="Room Revenue" value={formatPrice(totalRevenue * 0.7)} change="+10.2%" changeType="positive" icon={Bed} />
              <MetricCard title="F&B Revenue" value={formatPrice(totalRevenue * 0.2)} change="+18.5%" changeType="positive" icon={Activity} />
              <MetricCard title="Other Revenue" value={formatPrice(totalRevenue * 0.1)} change="+5.1%" changeType="positive" icon={TrendingUp} />
              <MetricCard title="Total Revenue" value={formatPrice(totalRevenue)} change="+12.5%" changeType="positive" icon={DollarSign} />
            </div>

            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Revenue Breakdown</CardTitle>
                    <CardDescription>Detailed revenue analysis by source</CardDescription>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => handleExport('Revenue')}>
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={revenueData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))', 
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }} 
                    />
                    <Legend />
                    <Bar dataKey="rooms" fill={CHART_COLORS[0]} name="Room Revenue" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="food" fill={CHART_COLORS[1]} name="F&B Revenue" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="other" fill={CHART_COLORS[2]} name="Other" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Revenue Table */}
            <Card>
              <CardHeader>
                <CardTitle>Revenue Details</CardTitle>
                <CardDescription>Daily revenue breakdown</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead className="text-right">Room Revenue</TableHead>
                      <TableHead className="text-right">F&B Revenue</TableHead>
                      <TableHead className="text-right">Other</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {revenueData.slice(0, 10).map((row) => (
                      <TableRow key={row.date}>
                        <TableCell className="font-medium">{row.date}</TableCell>
                        <TableCell className="text-right">{formatPrice(row.rooms)}</TableCell>
                        <TableCell className="text-right">{formatPrice(row.food)}</TableCell>
                        <TableCell className="text-right">{formatPrice(row.other)}</TableCell>
                        <TableCell className="text-right font-semibold">{formatPrice(row.revenue)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Occupancy Tab */}
          <TabsContent value="occupancy" className="space-y-6">
            <div className="grid lg:grid-cols-4 gap-4">
              <MetricCard title="Avg. Occupancy" value={`${avgOccupancy}%`} change="+5.2%" changeType="positive" icon={Bed} />
              <MetricCard title="Avg. Daily Rate" value={formatPrice(avgADR)} change="+8.1%" changeType="positive" icon={DollarSign} />
              <MetricCard title="RevPAR" value={formatPrice(avgRevPAR)} change="+15.3%" changeType="positive" icon={TrendingUp} />
              <MetricCard title="Total Rooms" value={mockRooms.length.toString()} icon={Building2} subtitle="Available inventory" />
            </div>

            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Occupancy & ADR Trends</CardTitle>
                    <CardDescription>Historical occupancy and average daily rate</CardDescription>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => handleExport('Occupancy')}>
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart data={occupancyData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                    <YAxis yAxisId="left" tick={{ fontSize: 12 }} domain={[0, 100]} />
                    <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 12 }} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))', 
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }} 
                    />
                    <Legend />
                    <Line yAxisId="left" type="monotone" dataKey="occupancy" stroke={CHART_COLORS[0]} strokeWidth={2} name="Occupancy %" />
                    <Line yAxisId="right" type="monotone" dataKey="adr" stroke={CHART_COLORS[1]} strokeWidth={2} name="ADR" />
                    <Line yAxisId="right" type="monotone" dataKey="revpar" stroke={CHART_COLORS[2]} strokeWidth={2} name="RevPAR" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Room Status Overview */}
            <div className="grid lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Current Room Status</CardTitle>
                  <CardDescription>Real-time room availability</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {[
                    { status: 'Available', count: mockRooms.filter(r => r.status === 'available').length, color: 'bg-green-500' },
                    { status: 'Occupied', count: mockRooms.filter(r => r.status === 'occupied').length, color: 'bg-blue-500' },
                    { status: 'Reserved', count: mockRooms.filter(r => r.status === 'reserved').length, color: 'bg-amber-500' },
                    { status: 'Maintenance', count: mockRooms.filter(r => r.status === 'maintenance').length, color: 'bg-red-500' },
                    { status: 'Cleaning', count: mockRooms.filter(r => r.status === 'cleaning').length, color: 'bg-purple-500' },
                  ].map((item) => (
                    <div key={item.status} className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <div className={cn("w-3 h-3 rounded-full", item.color)} />
                          <span>{item.status}</span>
                        </div>
                        <span className="font-medium">{item.count} rooms</span>
                      </div>
                      <Progress value={(item.count / mockRooms.length) * 100} className="h-2" />
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Room Type Performance</CardTitle>
                  <CardDescription>Revenue by room category</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={roomTypeData} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis type="number" />
                      <YAxis dataKey="name" type="category" width={100} tick={{ fontSize: 12 }} />
                      <Tooltip />
                      <Bar dataKey="value" fill={CHART_COLORS[0]} radius={[0, 4, 4, 0]} name="Rooms" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Guests Tab */}
          <TabsContent value="guests" className="space-y-6">
            <div className="grid lg:grid-cols-4 gap-4">
              <MetricCard title="Total Guests" value={mockGuests.length.toString()} icon={Users} change="+8 new" changeType="positive" />
              <MetricCard title="VIP Guests" value={mockGuests.filter(g => g.vip).length.toString()} icon={Star} />
              <MetricCard title="Repeat Guests" value={`${Math.round((mockGuests.filter(g => g.totalStays > 1).length / mockGuests.length) * 100)}%`} icon={CheckCircle2} />
              <MetricCard title="Avg. Loyalty Points" value={Math.round(mockGuests.reduce((sum, g) => sum + g.loyaltyPoints, 0) / mockGuests.length).toLocaleString()} icon={Activity} />
            </div>

            <div className="grid lg:grid-cols-2 gap-6">
              {/* Guest Demographics */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Guest Demographics</CardTitle>
                      <CardDescription>Guests by nationality</CardDescription>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => handleExport('Guests')}>
                      <Download className="h-4 w-4 mr-2" />
                      Export
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {guestDemographics.map((demo, i) => (
                      <div key={demo.name} className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: CHART_COLORS[i % CHART_COLORS.length] }} />
                            <span>{demo.name}</span>
                          </div>
                          <span className="font-medium">{demo.value} ({demo.percentage}%)</span>
                        </div>
                        <Progress value={demo.percentage} className="h-2" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Guest Types */}
              <Card>
                <CardHeader>
                  <CardTitle>Guest Segments</CardTitle>
                  <CardDescription>Distribution by guest type</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={250}>
                    <RePieChart>
                      <Pie
                        data={[
                          { name: 'VIP', value: mockGuests.filter(g => g.vip).length },
                          { name: 'Repeat', value: mockGuests.filter(g => !g.vip && g.totalStays > 1).length },
                          { name: 'New', value: mockGuests.filter(g => !g.vip && g.totalStays === 1).length },
                        ]}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={90}
                        paddingAngle={2}
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {[0, 1, 2].map((index) => (
                          <Cell key={`cell-${index}`} fill={CHART_COLORS[index]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </RePieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* Guest Table */}
            <Card>
              <CardHeader>
                <CardTitle>Top Guests by Loyalty Points</CardTitle>
                <CardDescription>Most valuable guests</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Guest</TableHead>
                      <TableHead>Nationality</TableHead>
                      <TableHead className="text-center">Total Stays</TableHead>
                      <TableHead className="text-center">VIP</TableHead>
                      <TableHead className="text-right">Loyalty Points</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {[...mockGuests].sort((a, b) => b.loyaltyPoints - a.loyaltyPoints).slice(0, 6).map((guest) => (
                      <TableRow key={guest.id}>
                        <TableCell>
                          <div className="font-medium">{guest.firstName} {guest.lastName}</div>
                          <div className="text-xs text-muted-foreground">{guest.email}</div>
                        </TableCell>
                        <TableCell>{guest.nationality || 'N/A'}</TableCell>
                        <TableCell className="text-center">{guest.totalStays}</TableCell>
                        <TableCell className="text-center">
                          {guest.vip ? <Star className="h-4 w-4 text-amber-500 mx-auto fill-amber-500" /> : '-'}
                        </TableCell>
                        <TableCell className="text-right font-semibold">{guest.loyaltyPoints.toLocaleString()}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Staff Tab */}
          <TabsContent value="staff" className="space-y-6">
            <div className="grid lg:grid-cols-4 gap-4">
              <MetricCard title="Total Staff" value={mockStaff.filter(s => s.status === 'active').length.toString()} icon={Users} subtitle="Active employees" />
              <MetricCard title="Avg. Performance" value={(mockStaff.reduce((sum, s) => sum + s.performanceScore, 0) / mockStaff.length).toFixed(1)} icon={Star} />
              <MetricCard title="Total Tasks" value={mockStaff.reduce((sum, s) => sum + s.tasksCompleted, 0).toLocaleString()} icon={CheckCircle2} />
              <MetricCard title="Avg. Hours/Week" value={Math.round(mockStaff.reduce((sum, s) => sum + s.hoursWorked, 0) / mockStaff.length / 52).toString()} icon={Clock} />
            </div>

            <div className="grid lg:grid-cols-2 gap-6">
              {/* Top Performers */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Top Performers</CardTitle>
                      <CardDescription>Staff ranked by performance score</CardDescription>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => handleExport('Staff')}>
                      <Download className="h-4 w-4 mr-2" />
                      Export
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={staffPerformanceData} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis type="number" domain={[0, 5]} />
                      <YAxis dataKey="name" type="category" width={100} tick={{ fontSize: 11 }} />
                      <Tooltip />
                      <Bar dataKey="score" fill={CHART_COLORS[2]} radius={[0, 4, 4, 0]} name="Score" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Department Performance */}
              <Card>
                <CardHeader>
                  <CardTitle>Department Overview</CardTitle>
                  <CardDescription>Performance by department</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Department</TableHead>
                        <TableHead className="text-center">Staff</TableHead>
                        <TableHead className="text-center">Avg. Score</TableHead>
                        <TableHead className="text-right">Tasks</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {departmentData.map((dept) => (
                        <TableRow key={dept.name}>
                          <TableCell className="font-medium">{dept.name}</TableCell>
                          <TableCell className="text-center">{dept.staffCount}</TableCell>
                          <TableCell className="text-center">
                            <div className="flex items-center justify-center gap-1">
                              <Star className="h-3 w-3 text-amber-500 fill-amber-500" />
                              <span>{dept.avgScore}</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-right">{dept.totalTasks.toLocaleString()}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>

            {/* Staff Details Table */}
            <Card>
              <CardHeader>
                <CardTitle>Staff Performance Details</CardTitle>
                <CardDescription>Complete staff performance metrics</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Staff Member</TableHead>
                      <TableHead>Department</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead className="text-center">Score</TableHead>
                      <TableHead className="text-right">Tasks</TableHead>
                      <TableHead className="text-right">Hours</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mockStaff.filter(s => s.status === 'active').slice(0, 8).map((staff) => (
                      <TableRow key={staff.id}>
                        <TableCell className="font-medium">{staff.firstName} {staff.lastName}</TableCell>
                        <TableCell>{staff.department}</TableCell>
                        <TableCell>
                          <Badge variant="secondary">{staff.role}</Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex items-center justify-center gap-1">
                            <Star className="h-3 w-3 text-amber-500 fill-amber-500" />
                            <span>{staff.performanceScore}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">{staff.tasksCompleted.toLocaleString()}</TableCell>
                        <TableCell className="text-right">{staff.hoursWorked.toLocaleString()}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
