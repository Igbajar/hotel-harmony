import { useState } from 'react';
import { useCurrency } from '@/contexts/CurrencyContext';
import { useMenuItems, MenuItem } from '@/hooks/useMenuItems';
import { useRoomServiceOrders, useCreateRoomServiceOrder, useUpdateOrderStatus, RoomServiceOrder } from '@/hooks/useRoomServiceOrders';
import { useRooms } from '@/hooks/useRooms';
import { useGuests } from '@/hooks/useGuests';
import { useReservations } from '@/hooks/useReservations';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { toast } from '@/hooks/use-toast';
import {
  ConciergeBell,
  Search,
  Plus,
  Minus,
  Clock,
  ChefHat,
  Truck,
  CheckCircle,
  XCircle,
  ShoppingCart,
  Utensils,
  Coffee,
  Cake,
  Salad,
  Wine,
  Timer,
  BedDouble,
  User,
  Leaf,
  Wheat,
  Loader2,
} from 'lucide-react';

type MenuCategory = 'breakfast' | 'lunch' | 'dinner' | 'snacks' | 'beverages' | 'desserts';
type OrderStatus = 'pending' | 'preparing' | 'delivering' | 'delivered' | 'cancelled';

const categoryIcons: Record<MenuCategory, React.ElementType> = {
  breakfast: Coffee,
  lunch: Salad,
  dinner: Utensils,
  snacks: ChefHat,
  beverages: Wine,
  desserts: Cake,
};

const categoryLabels: Record<MenuCategory, string> = {
  breakfast: 'Breakfast',
  lunch: 'Lunch',
  dinner: 'Dinner',
  snacks: 'Snacks',
  beverages: 'Beverages',
  desserts: 'Desserts',
};

const statusConfig: Record<OrderStatus, { label: string; color: string; icon: React.ElementType }> = {
  pending: { label: 'Pending', color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30', icon: Clock },
  preparing: { label: 'Preparing', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30', icon: ChefHat },
  delivering: { label: 'Delivering', color: 'bg-purple-500/20 text-purple-400 border-purple-500/30', icon: Truck },
  delivered: { label: 'Delivered', color: 'bg-green-500/20 text-green-400 border-green-500/30', icon: CheckCircle },
  cancelled: { label: 'Cancelled', color: 'bg-red-500/20 text-red-400 border-red-500/30', icon: XCircle },
};

interface CartItem {
  menuItem: MenuItem;
  quantity: number;
  specialInstructions?: string;
}

export default function RoomService() {
  const { formatPrice } = useCurrency();
  const { data: menuItems = [], isLoading: menuLoading } = useMenuItems();
  const { data: orders = [], isLoading: ordersLoading } = useRoomServiceOrders();
  const { data: rooms = [] } = useRooms();
  const { data: reservations = [] } = useReservations();
  const createOrder = useCreateRoomServiceOrder();
  const updateStatus = useUpdateOrderStatus();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<MenuCategory | 'all'>('all');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedRoom, setSelectedRoom] = useState('');
  const [orderNotes, setOrderNotes] = useState('');
  const [isNewOrderDialogOpen, setIsNewOrderDialogOpen] = useState(false);

  const occupiedRooms = rooms.filter(r => r.status === 'occupied');

  const filteredMenuItems = menuItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.description?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false);
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    return matchesSearch && matchesCategory && item.available;
  });

  const addToCart = (item: MenuItem) => {
    setCart(prev => {
      const existing = prev.find(c => c.menuItem.id === item.id);
      if (existing) {
        return prev.map(c => 
          c.menuItem.id === item.id 
            ? { ...c, quantity: c.quantity + 1 }
            : c
        );
      }
      return [...prev, { menuItem: item, quantity: 1 }];
    });
  };

  const removeFromCart = (itemId: string) => {
    setCart(prev => {
      const existing = prev.find(c => c.menuItem.id === itemId);
      if (existing && existing.quantity > 1) {
        return prev.map(c => 
          c.menuItem.id === itemId 
            ? { ...c, quantity: c.quantity - 1 }
            : c
        );
      }
      return prev.filter(c => c.menuItem.id !== itemId);
    });
  };

  const getCartItemQuantity = (itemId: string) => {
    return cart.find(c => c.menuItem.id === itemId)?.quantity || 0;
  };

  const cartTotal = cart.reduce((sum, item) => sum + item.menuItem.price * item.quantity, 0);
  const deliveryFee = 5;
  const totalWithDelivery = cartTotal + deliveryFee;

  const placeOrder = () => {
    if (!selectedRoom || cart.length === 0) {
      toast({
        title: "Cannot place order",
        description: "Please select a room and add items to cart",
        variant: "destructive",
      });
      return;
    }

    // Find guest for the selected room from active reservations
    const activeReservation = reservations.find(r => 
      r.room_id === selectedRoom && r.status === 'checked_in'
    );

    if (!activeReservation) {
      toast({
        title: "No active guest",
        description: "No guest is currently checked in to this room",
        variant: "destructive",
      });
      return;
    }

    createOrder.mutate({
      room_id: selectedRoom,
      guest_id: activeReservation.guest_id,
      items: cart.map(c => ({
        menu_item_id: c.menuItem.id,
        quantity: c.quantity,
        special_instructions: c.specialInstructions,
        subtotal: c.menuItem.price * c.quantity,
      })),
      total_amount: totalWithDelivery,
      delivery_fee: deliveryFee,
      special_instructions: orderNotes,
    }, {
      onSuccess: () => {
        setCart([]);
        setSelectedRoom('');
        setOrderNotes('');
        setIsNewOrderDialogOpen(false);
      }
    });
  };

  const handleUpdateOrderStatus = (orderId: string, newStatus: OrderStatus) => {
    updateStatus.mutate({ id: orderId, status: newStatus });
  };

  const activeOrders = orders.filter(o => ['pending', 'preparing', 'delivering'].includes(o.status));
  const completedOrders = orders.filter(o => ['delivered', 'cancelled'].includes(o.status));

  const isLoading = menuLoading || ordersLoading;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
            <ConciergeBell className="h-8 w-8 text-primary" />
            Room Service
          </h1>
          <p className="mt-1 text-muted-foreground">
            Manage orders and menu items
          </p>
        </div>

        <Dialog open={isNewOrderDialogOpen} onOpenChange={setIsNewOrderDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              New Order
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
            <DialogHeader>
              <DialogTitle>Create Room Service Order</DialogTitle>
              <DialogDescription>
                Select items from the menu and assign to an occupied room
              </DialogDescription>
            </DialogHeader>

            <div className="grid lg:grid-cols-3 gap-4 flex-1 overflow-hidden">
              {/* Menu Section */}
              <div className="lg:col-span-2 space-y-4 overflow-hidden flex flex-col">
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search menu..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                  <Select value={selectedCategory} onValueChange={(v) => setSelectedCategory(v as MenuCategory | 'all')}>
                    <SelectTrigger className="w-[140px]">
                      <SelectValue placeholder="Category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Items</SelectItem>
                      {Object.entries(categoryLabels).map(([key, label]) => (
                        <SelectItem key={key} value={key}>{label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <ScrollArea className="flex-1 pr-4">
                  {filteredMenuItems.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <Utensils className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">No menu items found</p>
                    </div>
                  ) : (
                    <div className="grid sm:grid-cols-2 gap-3">
                      {filteredMenuItems.map(item => {
                        const qty = getCartItemQuantity(item.id);
                        const Icon = categoryIcons[item.category as MenuCategory] || Utensils;

                        return (
                          <div
                            key={item.id}
                            className={`p-3 rounded-lg border transition-all ${
                              qty > 0 ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
                            }`}
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  <Icon className="h-4 w-4 text-primary flex-shrink-0" />
                                  <h4 className="font-medium text-sm truncate">{item.name}</h4>
                                </div>
                                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{item.description}</p>
                                <div className="flex items-center gap-2 mt-2">
                                  <span className="font-semibold text-primary">{formatPrice(item.price)}</span>
                                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                                    <Timer className="h-3 w-3" />
                                    {item.preparation_time}min
                                  </span>
                                  {item.dietary && item.dietary.length > 0 && (
                                    <div className="flex gap-1">
                                      {item.dietary.includes('vegetarian') && (
                                        <Leaf className="h-3 w-3 text-green-500" />
                                      )}
                                      {item.dietary.includes('gluten-free') && (
                                        <Wheat className="h-3 w-3 text-amber-500" />
                                      )}
                                    </div>
                                  )}
                                </div>
                              </div>
                              <div className="flex items-center gap-1">
                                {qty > 0 ? (
                                  <>
                                    <Button size="icon" variant="outline" className="h-7 w-7" onClick={() => removeFromCart(item.id)}>
                                      <Minus className="h-3 w-3" />
                                    </Button>
                                    <span className="w-6 text-center text-sm font-medium">{qty}</span>
                                    <Button size="icon" variant="outline" className="h-7 w-7" onClick={() => addToCart(item)}>
                                      <Plus className="h-3 w-3" />
                                    </Button>
                                  </>
                                ) : (
                                  <Button size="sm" variant="outline" onClick={() => addToCart(item)}>
                                    <Plus className="h-3 w-3 mr-1" />
                                    Add
                                  </Button>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </ScrollArea>
              </div>

              {/* Cart Section */}
              <div className="border-l border-border pl-4 flex flex-col">
                <div className="flex items-center gap-2 mb-3">
                  <ShoppingCart className="h-4 w-4 text-primary" />
                  <h3 className="font-semibold">Order Summary</h3>
                  {cart.length > 0 && (
                    <Badge variant="secondary" className="ml-auto">{cart.length}</Badge>
                  )}
                </div>

                <div className="space-y-3 mb-4">
                  <div className="space-y-2">
                    <Label htmlFor="room-select">Deliver to Room</Label>
                    <Select value={selectedRoom} onValueChange={setSelectedRoom}>
                      <SelectTrigger id="room-select">
                        <SelectValue placeholder="Select room" />
                      </SelectTrigger>
                      <SelectContent>
                        {occupiedRooms.map(room => (
                          <SelectItem key={room.id} value={room.id}>
                            <span className="flex items-center gap-2">
                              <BedDouble className="h-4 w-4" />
                              Room {room.number}
                            </span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="order-notes">Special Instructions</Label>
                    <Textarea
                      id="order-notes"
                      placeholder="Allergies, preferences..."
                      value={orderNotes}
                      onChange={(e) => setOrderNotes(e.target.value)}
                      className="h-20 resize-none"
                    />
                  </div>
                </div>

                <ScrollArea className="flex-1 mb-4">
                  {cart.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <ShoppingCart className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">Cart is empty</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {cart.map(item => (
                        <div key={item.menuItem.id} className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{item.menuItem.name}</p>
                            <p className="text-xs text-muted-foreground">{formatPrice(item.menuItem.price)} × {item.quantity}</p>
                          </div>
                          <div className="flex items-center gap-1">
                            <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => removeFromCart(item.menuItem.id)}>
                              <Minus className="h-3 w-3" />
                            </Button>
                            <span className="w-4 text-center text-sm">{item.quantity}</span>
                            <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => addToCart(item.menuItem)}>
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </ScrollArea>

                <Separator className="my-3" />

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>{formatPrice(cartTotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Delivery Fee</span>
                    <span>{formatPrice(deliveryFee)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-semibold text-base">
                    <span>Total</span>
                    <span className="text-primary">{formatPrice(totalWithDelivery)}</span>
                  </div>
                </div>

                <Button 
                  className="w-full mt-4" 
                  disabled={cart.length === 0 || !selectedRoom || createOrder.isPending}
                  onClick={placeOrder}
                >
                  {createOrder.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : null}
                  Place Order
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-yellow-500/20">
                <Clock className="h-5 w-5 text-yellow-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{orders.filter(o => o.status === 'pending').length}</p>
                <p className="text-xs text-muted-foreground">Pending</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/20">
                <ChefHat className="h-5 w-5 text-blue-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{orders.filter(o => o.status === 'preparing').length}</p>
                <p className="text-xs text-muted-foreground">Preparing</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-500/20">
                <Truck className="h-5 w-5 text-purple-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{orders.filter(o => o.status === 'delivering').length}</p>
                <p className="text-xs text-muted-foreground">Delivering</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-500/20">
                <CheckCircle className="h-5 w-5 text-green-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{orders.filter(o => o.status === 'delivered').length}</p>
                <p className="text-xs text-muted-foreground">Delivered</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Orders Tabs */}
      <Tabs defaultValue="active" className="space-y-4">
        <TabsList>
          <TabsTrigger value="active" className="gap-2">
            Active Orders
            {activeOrders.length > 0 && (
              <Badge variant="secondary" className="ml-1">{activeOrders.length}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
          <TabsTrigger value="menu">Menu Items</TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-4">
          {activeOrders.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <ConciergeBell className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                <h3 className="font-semibold mb-1">No active orders</h3>
                <p className="text-sm text-muted-foreground">Create a new order to get started</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {activeOrders.map(order => {
                const room = order.rooms;
                const guest = order.guests;
                const statusInfo = statusConfig[order.status];
                const StatusIcon = statusInfo.icon;

                return (
                  <Card key={order.id} className="overflow-hidden">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-lg flex items-center gap-2">
                            <BedDouble className="h-4 w-4" />
                            Room {room?.number || 'N/A'}
                          </CardTitle>
                          <CardDescription className="flex items-center gap-1 mt-1">
                            <User className="h-3 w-3" />
                            {guest ? `${guest.first_name} ${guest.last_name}` : 'Unknown Guest'}
                          </CardDescription>
                        </div>
                        <Badge className={statusInfo.color}>
                          <StatusIcon className="h-3 w-3 mr-1" />
                          {statusInfo.label}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="space-y-2">
                        {order.room_service_order_items?.map((item, idx) => (
                          <div key={idx} className="flex justify-between text-sm">
                            <span>{item.quantity}× {item.menu_items?.name || 'Unknown Item'}</span>
                            <span className="text-muted-foreground">{formatPrice(item.subtotal)}</span>
                          </div>
                        ))}
                      </div>

                      {order.special_instructions && (
                        <div className="p-2 rounded-lg bg-muted/50 text-xs text-muted-foreground">
                          <strong>Note:</strong> {order.special_instructions}
                        </div>
                      )}

                      <Separator />

                      <div className="flex justify-between font-semibold">
                        <span>Total</span>
                        <span className="text-primary">{formatPrice(order.total_amount)}</span>
                      </div>

                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>Ordered {new Date(order.created_at).toLocaleTimeString()}</span>
                        {order.estimated_delivery && (
                          <span className="flex items-center gap-1">
                            <Timer className="h-3 w-3" />
                            ETA {new Date(order.estimated_delivery).toLocaleTimeString()}
                          </span>
                        )}
                      </div>

                      <div className="flex gap-2 pt-2">
                        {order.status === 'pending' && (
                          <>
                            <Button size="sm" variant="outline" className="flex-1" onClick={() => handleUpdateOrderStatus(order.id, 'preparing')}>
                              <ChefHat className="h-3 w-3 mr-1" />
                              Start Prep
                            </Button>
                            <Button size="sm" variant="destructive" className="flex-1" onClick={() => handleUpdateOrderStatus(order.id, 'cancelled')}>
                              Cancel
                            </Button>
                          </>
                        )}
                        {order.status === 'preparing' && (
                          <Button size="sm" className="w-full" onClick={() => handleUpdateOrderStatus(order.id, 'delivering')}>
                            <Truck className="h-3 w-3 mr-1" />
                            Ready for Delivery
                          </Button>
                        )}
                        {order.status === 'delivering' && (
                          <Button size="sm" className="w-full" onClick={() => handleUpdateOrderStatus(order.id, 'delivered')}>
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Mark Delivered
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>

        <TabsContent value="completed" className="space-y-4">
          {completedOrders.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <CheckCircle className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                <h3 className="font-semibold mb-1">No completed orders</h3>
                <p className="text-sm text-muted-foreground">Completed orders will appear here</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {completedOrders.map(order => {
                const room = order.rooms;
                const guest = order.guests;
                const statusInfo = statusConfig[order.status];
                const StatusIcon = statusInfo.icon;

                return (
                  <Card key={order.id} className="opacity-75 hover:opacity-100 transition-opacity">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-lg">Room {room?.number || 'N/A'}</CardTitle>
                          <CardDescription>{guest ? `${guest.first_name} ${guest.last_name}` : 'Unknown Guest'}</CardDescription>
                        </div>
                        <Badge className={statusInfo.color}>
                          <StatusIcon className="h-3 w-3 mr-1" />
                          {statusInfo.label}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">
                          {order.room_service_order_items?.length || 0} item{(order.room_service_order_items?.length || 0) !== 1 ? 's' : ''}
                        </span>
                        <span className="font-semibold">{formatPrice(order.total_amount)}</span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">
                        {new Date(order.updated_at).toLocaleString()}
                      </p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>

        <TabsContent value="menu" className="space-y-4">
          <div className="flex gap-2 flex-wrap">
            <Button
              variant={selectedCategory === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory('all')}
            >
              All
            </Button>
            {Object.entries(categoryLabels).map(([key, label]) => {
              const Icon = categoryIcons[key as MenuCategory];
              return (
                <Button
                  key={key}
                  variant={selectedCategory === key ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedCategory(key as MenuCategory)}
                  className="gap-1"
                >
                  <Icon className="h-3 w-3" />
                  {label}
                </Button>
              );
            })}
          </div>

          {menuItems.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Utensils className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                <h3 className="font-semibold mb-1">No menu items</h3>
                <p className="text-sm text-muted-foreground">Add menu items to get started</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filteredMenuItems.map(item => {
                const Icon = categoryIcons[item.category as MenuCategory] || Utensils;
                return (
                  <Card key={item.id}>
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          <div className="p-2 rounded-lg bg-primary/10">
                            <Icon className="h-4 w-4 text-primary" />
                          </div>
                          <div>
                            <CardTitle className="text-sm">{item.name}</CardTitle>
                            <CardDescription className="text-xs">{categoryLabels[item.category as MenuCategory]}</CardDescription>
                          </div>
                        </div>
                        <Badge variant={item.available ? 'default' : 'secondary'}>
                          {item.available ? 'Available' : 'Unavailable'}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{item.description}</p>
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-lg text-primary">{formatPrice(item.price)}</span>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Timer className="h-3 w-3" />
                          {item.preparation_time} min
                        </div>
                      </div>
                      {item.dietary && item.dietary.length > 0 && (
                        <div className="flex gap-1 mt-2">
                          {item.dietary.map(d => (
                            <Badge key={d} variant="outline" className="text-[10px]">
                              {d}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
