import { useState, useMemo } from 'react';
import { format } from 'date-fns';
import {
  UtensilsCrossed, Plus, Search, Filter, MoreHorizontal, Edit, Trash2,
  ChefHat, Clock, Check, X, AlertCircle, Printer, Bell, Coffee,
  Wine, Salad, Cake, Sandwich, Receipt, ShoppingCart, Users,
  DollarSign, TrendingUp, Eye, Play, CheckCircle2, Timer, Send
} from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useCurrency } from '@/contexts/CurrencyContext';
import { mockMenuItems } from '@/data/mockData';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';
import type { MenuItem, MenuCategory } from '@/types/hotel';

type OrderStatus = 'pending' | 'preparing' | 'ready' | 'served' | 'cancelled';
type OrderType = 'dine-in' | 'room-service' | 'takeaway';

interface OrderItem {
  id: string;
  menuItem: MenuItem;
  quantity: number;
  notes?: string;
  status: 'pending' | 'preparing' | 'ready';
}

interface Order {
  id: string;
  orderNumber: string;
  type: OrderType;
  tableNumber?: string;
  roomNumber?: string;
  items: OrderItem[];
  status: OrderStatus;
  subtotal: number;
  tax: number;
  total: number;
  createdAt: Date;
  preparedAt?: Date;
  servedAt?: Date;
  notes?: string;
}

interface KitchenTicket {
  id: string;
  orderId: string;
  orderNumber: string;
  items: OrderItem[];
  priority: 'normal' | 'rush';
  createdAt: Date;
  startedAt?: Date;
  completedAt?: Date;
}

const categoryIcons: Record<MenuCategory, React.ReactNode> = {
  breakfast: <Coffee className="h-4 w-4" />,
  lunch: <Sandwich className="h-4 w-4" />,
  dinner: <UtensilsCrossed className="h-4 w-4" />,
  snacks: <Salad className="h-4 w-4" />,
  beverages: <Wine className="h-4 w-4" />,
  desserts: <Cake className="h-4 w-4" />,
};

const categoryLabels: Record<MenuCategory, string> = {
  breakfast: 'Breakfast',
  lunch: 'Lunch',
  dinner: 'Dinner',
  snacks: 'Snacks',
  beverages: 'Beverages',
  desserts: 'Desserts',
};

const orderStatusStyles: Record<OrderStatus, string> = {
  pending: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
  preparing: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
  ready: 'bg-green-500/10 text-green-600 border-green-500/20',
  served: 'bg-muted text-muted-foreground',
  cancelled: 'bg-red-500/10 text-red-600 border-red-500/20',
};

// Generate mock orders
const generateMockOrders = (): Order[] => {
  const orders: Order[] = [];
  const statuses: OrderStatus[] = ['pending', 'preparing', 'ready', 'served'];
  const types: OrderType[] = ['dine-in', 'room-service', 'takeaway'];
  
  for (let i = 0; i < 12; i++) {
    const orderItems: OrderItem[] = [];
    const numItems = Math.floor(Math.random() * 4) + 1;
    const selectedItems = [...mockMenuItems].sort(() => Math.random() - 0.5).slice(0, numItems);
    
    selectedItems.forEach((item, j) => {
      orderItems.push({
        id: `oi-${i}-${j}`,
        menuItem: item,
        quantity: Math.floor(Math.random() * 3) + 1,
        status: statuses[Math.min(i % 4, 2)] as 'pending' | 'preparing' | 'ready',
      });
    });

    const subtotal = orderItems.reduce((sum, oi) => sum + oi.menuItem.price * oi.quantity, 0);
    const tax = subtotal * 0.1;
    const type = types[i % 3];

    orders.push({
      id: `order-${i}`,
      orderNumber: `ORD-${String(i + 1).padStart(4, '0')}`,
      type,
      tableNumber: type === 'dine-in' ? String(Math.floor(Math.random() * 20) + 1) : undefined,
      roomNumber: type === 'room-service' ? String(100 + Math.floor(Math.random() * 20)) : undefined,
      items: orderItems,
      status: statuses[i % 4],
      subtotal,
      tax,
      total: subtotal + tax,
      createdAt: new Date(Date.now() - (i * 15 * 60 * 1000)),
      notes: i === 0 ? 'No onions please' : undefined,
    });
  }

  return orders;
};

export default function Restaurant() {
  const { formatPrice } = useCurrency();
  const [menuItems, setMenuItems] = useState<MenuItem[]>(mockMenuItems);
  const [orders, setOrders] = useState<Order[]>(() => generateMockOrders());
  const [activeTab, setActiveTab] = useState('pos');
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  // POS State
  const [cart, setCart] = useState<OrderItem[]>([]);
  const [orderType, setOrderType] = useState<OrderType>('dine-in');
  const [tableNumber, setTableNumber] = useState('');
  const [roomNumber, setRoomNumber] = useState('');
  const [orderNotes, setOrderNotes] = useState('');

  // Dialog states
  const [menuItemDialog, setMenuItemDialog] = useState<{ open: boolean; item: MenuItem | null }>({ open: false, item: null });
  const [orderDialog, setOrderDialog] = useState<Order | null>(null);
  const [kotView, setKotView] = useState(false);

  // Menu form state
  const [menuForm, setMenuForm] = useState({
    name: '',
    description: '',
    category: 'lunch' as MenuCategory,
    price: 0,
    preparationTime: 15,
    available: true,
  });

  // Stats
  const stats = useMemo(() => {
    const todayOrders = orders.filter(o => 
      format(o.createdAt, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd')
    );
    const activeOrders = orders.filter(o => ['pending', 'preparing', 'ready'].includes(o.status));
    const totalRevenue = todayOrders.filter(o => o.status === 'served').reduce((sum, o) => sum + o.total, 0);
    const avgOrderValue = todayOrders.length > 0 ? totalRevenue / todayOrders.filter(o => o.status === 'served').length : 0;

    return {
      todayOrders: todayOrders.length,
      activeOrders: activeOrders.length,
      totalRevenue,
      avgOrderValue: avgOrderValue || 0,
    };
  }, [orders]);

  // Kitchen tickets (pending and preparing orders)
  const kitchenTickets = useMemo(() => {
    return orders
      .filter(o => ['pending', 'preparing'].includes(o.status))
      .map(o => ({
        id: `kot-${o.id}`,
        orderId: o.id,
        orderNumber: o.orderNumber,
        items: o.items,
        priority: o.notes?.toLowerCase().includes('rush') ? 'rush' as const : 'normal' as const,
        createdAt: o.createdAt,
        startedAt: o.status === 'preparing' ? new Date() : undefined,
      }));
  }, [orders]);

  // Filtered menu items
  const filteredMenuItems = useMemo(() => {
    return menuItems.filter(item => {
      const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter;
      return matchesSearch && matchesCategory;
    });
  }, [menuItems, searchTerm, categoryFilter]);

  // Cart calculations
  const cartSubtotal = cart.reduce((sum, item) => sum + item.menuItem.price * item.quantity, 0);
  const cartTax = cartSubtotal * 0.1;
  const cartTotal = cartSubtotal + cartTax;

  const addToCart = (menuItem: MenuItem) => {
    const existing = cart.find(c => c.menuItem.id === menuItem.id);
    if (existing) {
      setCart(cart.map(c => 
        c.menuItem.id === menuItem.id 
          ? { ...c, quantity: c.quantity + 1 }
          : c
      ));
    } else {
      setCart([...cart, {
        id: `cart-${Date.now()}`,
        menuItem,
        quantity: 1,
        status: 'pending',
      }]);
    }
    toast({ title: "Added to Order", description: `${menuItem.name} added` });
  };

  const updateCartQuantity = (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      setCart(cart.filter(c => c.id !== itemId));
    } else {
      setCart(cart.map(c => c.id === itemId ? { ...c, quantity } : c));
    }
  };

  const clearCart = () => {
    setCart([]);
    setTableNumber('');
    setRoomNumber('');
    setOrderNotes('');
  };

  const placeOrder = () => {
    if (cart.length === 0) {
      toast({ title: "Empty Order", description: "Add items to the order first", variant: "destructive" });
      return;
    }

    if (orderType === 'dine-in' && !tableNumber) {
      toast({ title: "Table Required", description: "Please enter a table number", variant: "destructive" });
      return;
    }

    if (orderType === 'room-service' && !roomNumber) {
      toast({ title: "Room Required", description: "Please enter a room number", variant: "destructive" });
      return;
    }

    const newOrder: Order = {
      id: `order-${Date.now()}`,
      orderNumber: `ORD-${String(orders.length + 1).padStart(4, '0')}`,
      type: orderType,
      tableNumber: orderType === 'dine-in' ? tableNumber : undefined,
      roomNumber: orderType === 'room-service' ? roomNumber : undefined,
      items: cart,
      status: 'pending',
      subtotal: cartSubtotal,
      tax: cartTax,
      total: cartTotal,
      createdAt: new Date(),
      notes: orderNotes || undefined,
    };

    setOrders([newOrder, ...orders]);
    clearCart();
    toast({ title: "Order Placed", description: `${newOrder.orderNumber} sent to kitchen` });
  };

  const updateOrderStatus = (orderId: string, status: OrderStatus) => {
    setOrders(orders.map(o => 
      o.id === orderId 
        ? { 
            ...o, 
            status,
            preparedAt: status === 'ready' ? new Date() : o.preparedAt,
            servedAt: status === 'served' ? new Date() : o.servedAt,
          }
        : o
    ));
    toast({ title: "Order Updated", description: `Order status changed to ${status}` });
  };

  const handleSaveMenuItem = () => {
    if (menuItemDialog.item) {
      // Edit existing
      setMenuItems(menuItems.map(m => 
        m.id === menuItemDialog.item!.id 
          ? { ...m, ...menuForm }
          : m
      ));
      toast({ title: "Menu Updated", description: `${menuForm.name} has been updated` });
    } else {
      // Add new
      const newItem: MenuItem = {
        id: `menu-${Date.now()}`,
        ...menuForm,
      };
      setMenuItems([...menuItems, newItem]);
      toast({ title: "Menu Item Added", description: `${menuForm.name} has been added` });
    }
    setMenuItemDialog({ open: false, item: null });
    setMenuForm({ name: '', description: '', category: 'lunch', price: 0, preparationTime: 15, available: true });
  };

  const openEditMenuItem = (item: MenuItem) => {
    setMenuForm({
      name: item.name,
      description: item.description,
      category: item.category,
      price: item.price,
      preparationTime: item.preparationTime,
      available: item.available,
    });
    setMenuItemDialog({ open: true, item });
  };

  const toggleItemAvailability = (itemId: string) => {
    setMenuItems(menuItems.map(m => 
      m.id === itemId ? { ...m, available: !m.available } : m
    ));
  };

  const MetricCard = ({ title, value, icon: Icon, subtitle }: {
    title: string;
    value: string;
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
      </CardContent>
    </Card>
  );

  return (
    <div className="flex flex-col h-full">
      <Header title="Restaurant & Bar" subtitle="Menu management, POS, and kitchen operations" />
      
      <div className="flex-1 overflow-auto p-6 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard title="Today's Orders" value={stats.todayOrders.toString()} icon={Receipt} />
          <MetricCard title="Active Orders" value={stats.activeOrders.toString()} icon={Clock} subtitle="Pending & Preparing" />
          <MetricCard title="Today's Revenue" value={formatPrice(stats.totalRevenue)} icon={DollarSign} />
          <MetricCard title="Avg. Order Value" value={formatPrice(stats.avgOrderValue)} icon={TrendingUp} />
        </div>

        {/* Main Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <div className="flex flex-col sm:flex-row justify-between gap-4">
            <TabsList>
              <TabsTrigger value="pos" className="gap-2">
                <ShoppingCart className="h-4 w-4" />
                POS
              </TabsTrigger>
              <TabsTrigger value="orders" className="gap-2">
                <Receipt className="h-4 w-4" />
                Orders
              </TabsTrigger>
              <TabsTrigger value="kitchen" className="gap-2">
                <ChefHat className="h-4 w-4" />
                Kitchen
                {kitchenTickets.length > 0 && (
                  <Badge variant="destructive" className="ml-1 h-5 w-5 p-0 justify-center">
                    {kitchenTickets.length}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="menu" className="gap-2">
                <UtensilsCrossed className="h-4 w-4" />
                Menu
              </TabsTrigger>
            </TabsList>
          </div>

          {/* POS Tab */}
          <TabsContent value="pos" className="space-y-4">
            <div className="grid lg:grid-cols-3 gap-6">
              {/* Menu Items */}
              <div className="lg:col-span-2 space-y-4">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search menu..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                    <SelectTrigger className="w-[160px]">
                      <SelectValue placeholder="Category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      {Object.entries(categoryLabels).map(([key, label]) => (
                        <SelectItem key={key} value={key}>{label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
                  {filteredMenuItems.filter(m => m.available).map((item) => (
                    <Card 
                      key={item.id} 
                      className="cursor-pointer hover:border-primary/50 transition-colors"
                      onClick={() => addToCart(item)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              {categoryIcons[item.category]}
                              <Badge variant="secondary" className="text-xs">
                                {categoryLabels[item.category]}
                              </Badge>
                            </div>
                            <h3 className="font-semibold truncate">{item.name}</h3>
                            <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                              {item.description}
                            </p>
                            <div className="flex items-center gap-2 mt-2">
                              <Clock className="h-3 w-3 text-muted-foreground" />
                              <span className="text-xs text-muted-foreground">{item.preparationTime} min</span>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-bold text-lg">{formatPrice(item.price)}</div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Cart */}
              <div className="lg:col-span-1">
                <Card className="sticky top-4">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">Current Order</CardTitle>
                      {cart.length > 0 && (
                        <Button variant="ghost" size="sm" onClick={clearCart}>
                          Clear
                        </Button>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Order Type */}
                    <div className="grid grid-cols-3 gap-2">
                      {(['dine-in', 'room-service', 'takeaway'] as OrderType[]).map((type) => (
                        <Button
                          key={type}
                          variant={orderType === type ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setOrderType(type)}
                          className="text-xs"
                        >
                          {type === 'dine-in' ? 'Dine-In' : type === 'room-service' ? 'Room' : 'Takeaway'}
                        </Button>
                      ))}
                    </div>

                    {orderType === 'dine-in' && (
                      <Input
                        placeholder="Table Number"
                        value={tableNumber}
                        onChange={(e) => setTableNumber(e.target.value)}
                      />
                    )}

                    {orderType === 'room-service' && (
                      <Input
                        placeholder="Room Number"
                        value={roomNumber}
                        onChange={(e) => setRoomNumber(e.target.value)}
                      />
                    )}

                    <Separator />

                    {/* Cart Items */}
                    <ScrollArea className="h-[300px]">
                      {cart.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                          <ShoppingCart className="h-8 w-8 mx-auto mb-2 opacity-50" />
                          <p className="text-sm">No items in order</p>
                          <p className="text-xs">Click menu items to add</p>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {cart.map((item) => (
                            <div key={item.id} className="flex items-center justify-between gap-2">
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-sm truncate">{item.menuItem.name}</p>
                                <p className="text-xs text-muted-foreground">
                                  {formatPrice(item.menuItem.price)} each
                                </p>
                              </div>
                              <div className="flex items-center gap-2">
                                <Button
                                  variant="outline"
                                  size="icon"
                                  className="h-7 w-7"
                                  onClick={() => updateCartQuantity(item.id, item.quantity - 1)}
                                >
                                  -
                                </Button>
                                <span className="w-6 text-center text-sm">{item.quantity}</span>
                                <Button
                                  variant="outline"
                                  size="icon"
                                  className="h-7 w-7"
                                  onClick={() => updateCartQuantity(item.id, item.quantity + 1)}
                                >
                                  +
                                </Button>
                              </div>
                              <div className="w-16 text-right font-medium text-sm">
                                {formatPrice(item.menuItem.price * item.quantity)}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </ScrollArea>

                    {cart.length > 0 && (
                      <>
                        <Separator />
                        
                        <Textarea
                          placeholder="Order notes (allergies, preferences)..."
                          value={orderNotes}
                          onChange={(e) => setOrderNotes(e.target.value)}
                          rows={2}
                          className="text-sm"
                        />

                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Subtotal</span>
                            <span>{formatPrice(cartSubtotal)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Tax (10%)</span>
                            <span>{formatPrice(cartTax)}</span>
                          </div>
                          <Separator />
                          <div className="flex justify-between font-bold text-lg">
                            <span>Total</span>
                            <span>{formatPrice(cartTotal)}</span>
                          </div>
                        </div>

                        <Button className="w-full" size="lg" onClick={placeOrder}>
                          <Send className="h-4 w-4 mr-2" />
                          Send to Kitchen
                        </Button>
                      </>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Orders Tab */}
          <TabsContent value="orders" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Order History</CardTitle>
                <CardDescription>All orders from today</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Order #</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Items</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                      <TableHead className="text-center">Status</TableHead>
                      <TableHead>Time</TableHead>
                      <TableHead className="w-[50px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {orders.map((order) => (
                      <TableRow key={order.id}>
                        <TableCell className="font-mono font-medium">{order.orderNumber}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">
                              {order.type === 'dine-in' && `Table ${order.tableNumber}`}
                              {order.type === 'room-service' && `Room ${order.roomNumber}`}
                              {order.type === 'takeaway' && 'Takeaway'}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                          </div>
                          <div className="text-xs text-muted-foreground truncate max-w-[200px]">
                            {order.items.map(i => i.menuItem.name).join(', ')}
                          </div>
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {formatPrice(order.total)}
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge variant="outline" className={orderStatusStyles[order.status]}>
                            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">{format(order.createdAt, 'HH:mm')}</div>
                          <div className="text-xs text-muted-foreground">{format(order.createdAt, 'MMM dd')}</div>
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => setOrderDialog(order)}>
                                <Eye className="h-4 w-4 mr-2" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Printer className="h-4 w-4 mr-2" />
                                Print Receipt
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              {order.status === 'pending' && (
                                <DropdownMenuItem onClick={() => updateOrderStatus(order.id, 'preparing')}>
                                  <Play className="h-4 w-4 mr-2" />
                                  Start Preparing
                                </DropdownMenuItem>
                              )}
                              {order.status === 'preparing' && (
                                <DropdownMenuItem onClick={() => updateOrderStatus(order.id, 'ready')}>
                                  <CheckCircle2 className="h-4 w-4 mr-2" />
                                  Mark Ready
                                </DropdownMenuItem>
                              )}
                              {order.status === 'ready' && (
                                <DropdownMenuItem onClick={() => updateOrderStatus(order.id, 'served')}>
                                  <Check className="h-4 w-4 mr-2" />
                                  Mark Served
                                </DropdownMenuItem>
                              )}
                              {['pending', 'preparing'].includes(order.status) && (
                                <DropdownMenuItem 
                                  className="text-destructive"
                                  onClick={() => updateOrderStatus(order.id, 'cancelled')}
                                >
                                  <X className="h-4 w-4 mr-2" />
                                  Cancel Order
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Kitchen Tab (KOT) */}
          <TabsContent value="kitchen" className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold">Kitchen Display System</h2>
                <p className="text-sm text-muted-foreground">
                  {kitchenTickets.length} active ticket{kitchenTickets.length !== 1 ? 's' : ''}
                </p>
              </div>
              <Button variant="outline" onClick={() => setKotView(!kotView)}>
                <Printer className="h-4 w-4 mr-2" />
                {kotView ? 'Card View' : 'Ticket View'}
              </Button>
            </div>

            {kitchenTickets.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <ChefHat className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                  <h3 className="font-semibold mb-2">No Active Orders</h3>
                  <p className="text-sm text-muted-foreground">
                    Kitchen is clear! New orders will appear here.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {kitchenTickets.map((ticket) => {
                  const order = orders.find(o => o.id === ticket.orderId);
                  const elapsedMinutes = Math.floor((Date.now() - ticket.createdAt.getTime()) / 60000);
                  const isUrgent = elapsedMinutes > 15;
                  
                  return (
                    <Card 
                      key={ticket.id} 
                      className={cn(
                        "border-2",
                        isUrgent && "border-red-500 bg-red-500/5",
                        ticket.priority === 'rush' && "border-amber-500 bg-amber-500/5",
                        order?.status === 'preparing' && "border-blue-500"
                      )}
                    >
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <CardTitle className="text-lg font-mono">{ticket.orderNumber}</CardTitle>
                            <CardDescription>
                              {order?.type === 'dine-in' && `Table ${order.tableNumber}`}
                              {order?.type === 'room-service' && `Room ${order.roomNumber}`}
                              {order?.type === 'takeaway' && 'Takeaway'}
                            </CardDescription>
                          </div>
                          <div className="text-right">
                            <div className={cn(
                              "flex items-center gap-1 text-sm font-medium",
                              isUrgent && "text-red-600"
                            )}>
                              <Timer className="h-4 w-4" />
                              {elapsedMinutes} min
                            </div>
                            {ticket.priority === 'rush' && (
                              <Badge variant="destructive" className="mt-1">RUSH</Badge>
                            )}
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <Separator />
                        {ticket.items.map((item, i) => (
                          <div key={i} className="flex items-start justify-between gap-2">
                            <div className="flex items-start gap-2">
                              <Badge variant="outline" className="mt-0.5">{item.quantity}x</Badge>
                              <div>
                                <p className="font-medium text-sm">{item.menuItem.name}</p>
                                {item.notes && (
                                  <p className="text-xs text-muted-foreground">{item.notes}</p>
                                )}
                              </div>
                            </div>
                            <Badge 
                              variant="outline" 
                              className={cn(
                                "text-xs",
                                item.status === 'ready' && "bg-green-500/10 text-green-600",
                                item.status === 'preparing' && "bg-blue-500/10 text-blue-600"
                              )}
                            >
                              {item.status}
                            </Badge>
                          </div>
                        ))}
                        {order?.notes && (
                          <>
                            <Separator />
                            <div className="flex items-start gap-2 text-sm">
                              <AlertCircle className="h-4 w-4 text-amber-500 mt-0.5" />
                              <p className="text-muted-foreground">{order.notes}</p>
                            </div>
                          </>
                        )}
                        <Separator />
                        <div className="flex gap-2">
                          {order?.status === 'pending' && (
                            <Button 
                              className="flex-1" 
                              onClick={() => updateOrderStatus(order.id, 'preparing')}
                            >
                              <Play className="h-4 w-4 mr-2" />
                              Start
                            </Button>
                          )}
                          {order?.status === 'preparing' && (
                            <Button 
                              className="flex-1" 
                              onClick={() => updateOrderStatus(order.id, 'ready')}
                            >
                              <Bell className="h-4 w-4 mr-2" />
                              Ready
                            </Button>
                          )}
                          <Button variant="outline" size="icon">
                            <Printer className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>

          {/* Menu Management Tab */}
          <TabsContent value="menu" className="space-y-4">
            <div className="flex flex-col sm:flex-row justify-between gap-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1 sm:w-[300px]">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search menu items..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="w-[160px]">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {Object.entries(categoryLabels).map(([key, label]) => (
                      <SelectItem key={key} value={key}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={() => {
                setMenuForm({ name: '', description: '', category: 'lunch', price: 0, preparationTime: 15, available: true });
                setMenuItemDialog({ open: true, item: null });
              }}>
                <Plus className="h-4 w-4 mr-2" />
                Add Item
              </Button>
            </div>

            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Item</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead className="text-right">Price</TableHead>
                      <TableHead className="text-center">Prep Time</TableHead>
                      <TableHead className="text-center">Available</TableHead>
                      <TableHead className="w-[50px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredMenuItems.map((item) => (
                      <TableRow key={item.id} className={!item.available ? 'opacity-50' : ''}>
                        <TableCell>
                          <div className="font-medium">{item.name}</div>
                          <div className="text-xs text-muted-foreground line-clamp-1">{item.description}</div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="gap-1">
                            {categoryIcons[item.category]}
                            {categoryLabels[item.category]}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {formatPrice(item.price)}
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex items-center justify-center gap-1 text-sm text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            {item.preparationTime} min
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <Switch
                            checked={item.available}
                            onCheckedChange={() => toggleItemAvailability(item.id)}
                          />
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => openEditMenuItem(item)}>
                                <Edit className="h-4 w-4 mr-2" />
                                Edit Item
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                className="text-destructive"
                                onClick={() => {
                                  setMenuItems(menuItems.filter(m => m.id !== item.id));
                                  toast({ title: "Item Deleted", description: `${item.name} has been removed` });
                                }}
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete Item
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Order Detail Dialog */}
      <Dialog open={!!orderDialog} onOpenChange={() => setOrderDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Order {orderDialog?.orderNumber}</DialogTitle>
            <DialogDescription>
              {orderDialog?.type === 'dine-in' && `Table ${orderDialog.tableNumber}`}
              {orderDialog?.type === 'room-service' && `Room ${orderDialog.roomNumber}`}
              {orderDialog?.type === 'takeaway' && 'Takeaway Order'}
              {' • '}
              {orderDialog && format(orderDialog.createdAt, 'MMM dd, yyyy HH:mm')}
            </DialogDescription>
          </DialogHeader>
          {orderDialog && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className={orderStatusStyles[orderDialog.status]}>
                  {orderDialog.status.charAt(0).toUpperCase() + orderDialog.status.slice(1)}
                </Badge>
              </div>

              <Separator />

              <div className="space-y-3">
                {orderDialog.items.map((item, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Badge variant="outline">{item.quantity}x</Badge>
                      <div>
                        <p className="font-medium">{item.menuItem.name}</p>
                        {item.notes && (
                          <p className="text-xs text-muted-foreground">{item.notes}</p>
                        )}
                      </div>
                    </div>
                    <span className="font-medium">{formatPrice(item.menuItem.price * item.quantity)}</span>
                  </div>
                ))}
              </div>

              {orderDialog.notes && (
                <>
                  <Separator />
                  <div className="flex items-start gap-2">
                    <AlertCircle className="h-4 w-4 text-amber-500 mt-0.5" />
                    <p className="text-sm text-muted-foreground">{orderDialog.notes}</p>
                  </div>
                </>
              )}

              <Separator />

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>{formatPrice(orderDialog.subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tax (10%)</span>
                  <span>{formatPrice(orderDialog.tax)}</span>
                </div>
                <Separator />
                <div className="flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span>{formatPrice(orderDialog.total)}</span>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setOrderDialog(null)}>Close</Button>
            <Button variant="outline">
              <Printer className="h-4 w-4 mr-2" />
              Print Receipt
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Menu Item Dialog */}
      <Dialog open={menuItemDialog.open} onOpenChange={(open) => setMenuItemDialog({ ...menuItemDialog, open })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{menuItemDialog.item ? 'Edit Menu Item' : 'Add Menu Item'}</DialogTitle>
            <DialogDescription>
              {menuItemDialog.item ? 'Update the menu item details' : 'Add a new item to the menu'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Item Name</Label>
              <Input
                value={menuForm.name}
                onChange={(e) => setMenuForm({ ...menuForm, name: e.target.value })}
                placeholder="e.g., Grilled Salmon"
              />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                value={menuForm.description}
                onChange={(e) => setMenuForm({ ...menuForm, description: e.target.value })}
                placeholder="Describe the dish..."
                rows={2}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Category</Label>
                <Select
                  value={menuForm.category}
                  onValueChange={(v: MenuCategory) => setMenuForm({ ...menuForm, category: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(categoryLabels).map(([key, label]) => (
                      <SelectItem key={key} value={key}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Price</Label>
                <Input
                  type="number"
                  value={menuForm.price}
                  onChange={(e) => setMenuForm({ ...menuForm, price: parseFloat(e.target.value) || 0 })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Prep Time (minutes)</Label>
                <Input
                  type="number"
                  value={menuForm.preparationTime}
                  onChange={(e) => setMenuForm({ ...menuForm, preparationTime: parseInt(e.target.value) || 15 })}
                />
              </div>
              <div className="space-y-2">
                <Label>Available</Label>
                <div className="flex items-center h-10">
                  <Switch
                    checked={menuForm.available}
                    onCheckedChange={(checked) => setMenuForm({ ...menuForm, available: checked })}
                  />
                  <span className="ml-2 text-sm text-muted-foreground">
                    {menuForm.available ? 'Yes' : 'No'}
                  </span>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setMenuItemDialog({ open: false, item: null })}>
              Cancel
            </Button>
            <Button onClick={handleSaveMenuItem}>
              {menuItemDialog.item ? 'Save Changes' : 'Add Item'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
