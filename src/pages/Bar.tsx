import { useState, useMemo } from 'react';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from '@/hooks/use-toast';
import { useCurrency } from '@/contexts/CurrencyContext';
import { useBarCategories, useBarDrinks, useCreateBarDrink, useCreateBarOrder, useBarOrders, BarDrink, BarDrinkMeasure } from '@/hooks/useBar';
import { Wine, Plus, Trash2, ShoppingCart, X, CreditCard, Banknote, History, BarChart3 } from 'lucide-react';
import { DrinkImportExport } from '@/components/bar/DrinkImportExport';
import { BarAnalytics } from '@/components/bar/BarAnalytics';
import { useBarInventory } from '@/hooks/useInventory';
import { cn } from '@/lib/utils';

interface CartItem {
  drink: BarDrink;
  measure: BarDrinkMeasure;
  quantity: number;
}

export default function Bar() {
  const { formatPrice } = useCurrency();
  const { data: categories = [] } = useBarCategories();
  const { data: drinks = [], isLoading } = useBarDrinks();
  const { data: orders = [] } = useBarOrders();
  const { data: inventory = [] } = useBarInventory();
  const createDrink = useCreateBarDrink();
  const createOrder = useCreateBarOrder();

  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [addDrinkOpen, setAddDrinkOpen] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);

  // Build stock lookup map: drink_id -> current_stock
  const stockMap = useMemo(() => {
    const map: Record<string, number> = {};
    inventory.forEach(inv => { map[inv.drink_id] = inv.current_stock; });
    return map;
  }, [inventory]);

  // New drink form
  const [newDrink, setNewDrink] = useState({
    name: '',
    category_id: '',
    description: '',
    measures: [{ measure_name: 'Tot', measure_ml: 25, price: 0, stock_deduction: 1 }],
  });

  const filteredDrinks = useMemo(() => {
    if (activeCategory === 'all') return drinks.filter(d => d.available);
    return drinks.filter(d => d.available && d.category_id === activeCategory);
  }, [drinks, activeCategory]);

  const cartTotal = cart.reduce((sum, item) => sum + item.measure.price * item.quantity, 0);

  const addToCart = (drink: BarDrink, measure: BarDrinkMeasure) => {
    setCart(prev => {
      const existing = prev.find(c => c.drink.id === drink.id && c.measure.id === measure.id);
      if (existing) {
        return prev.map(c =>
          c.drink.id === drink.id && c.measure.id === measure.id
            ? { ...c, quantity: c.quantity + 1 }
            : c
        );
      }
      return [...prev, { drink, measure, quantity: 1 }];
    });
  };

  const removeFromCart = (drinkId: string, measureId: string) => {
    setCart(prev => prev.filter(c => !(c.drink.id === drinkId && c.measure.id === measureId)));
  };

  const updateCartQuantity = (drinkId: string, measureId: string, delta: number) => {
    setCart(prev =>
      prev.map(c => {
        if (c.drink.id === drinkId && c.measure.id === measureId) {
          const newQty = c.quantity + delta;
          return newQty <= 0 ? c : { ...c, quantity: newQty };
        }
        return c;
      }).filter(c => c.quantity > 0)
    );
  };

  const handleCheckout = async () => {
    if (cart.length === 0) return;
    try {
      await createOrder.mutateAsync({
        payment_method: paymentMethod,
        items: cart.map(c => ({
          drink_id: c.drink.id,
          measure_id: c.measure.id,
          quantity: c.quantity,
          unit_price: c.measure.price,
          subtotal: c.measure.price * c.quantity,
          stock_deduction: c.measure.stock_deduction,
        })),
      });
      setCart([]);
      toast({ title: 'Sale Complete', description: `${formatPrice(cartTotal)} received via ${paymentMethod}` });
    } catch {
      toast({ title: 'Error', description: 'Failed to process sale', variant: 'destructive' });
    }
  };

  const handleAddDrink = async () => {
    if (!newDrink.name || !newDrink.category_id || newDrink.measures.length === 0) {
      toast({ title: 'Error', description: 'Fill in all required fields', variant: 'destructive' });
      return;
    }
    try {
      await createDrink.mutateAsync({
        name: newDrink.name,
        category_id: newDrink.category_id,
        description: newDrink.description || undefined,
        measures: newDrink.measures.filter(m => m.measure_name && m.price > 0),
      });
      setNewDrink({ name: '', category_id: '', description: '', measures: [{ measure_name: 'Tot', measure_ml: 25, price: 0, stock_deduction: 1 }] });
      setAddDrinkOpen(false);
      toast({ title: 'Drink Added', description: `${newDrink.name} has been added to the menu` });
    } catch {
      toast({ title: 'Error', description: 'Failed to add drink', variant: 'destructive' });
    }
  };

  const addMeasure = () => {
    setNewDrink(prev => ({
      ...prev,
      measures: [...prev.measures, { measure_name: '', measure_ml: 0, price: 0, stock_deduction: 1 }],
    }));
  };

  const updateMeasure = (index: number, field: string, value: any) => {
    setNewDrink(prev => ({
      ...prev,
      measures: prev.measures.map((m, i) => i === index ? { ...m, [field]: value } : m),
    }));
  };

  const removeMeasure = (index: number) => {
    setNewDrink(prev => ({ ...prev, measures: prev.measures.filter((_, i) => i !== index) }));
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header title="Bar POS" subtitle="Sell drinks and manage bar orders" />

      <div className="flex-1 p-6">
        <div className="flex gap-2 mb-4">
          <Dialog open={addDrinkOpen} onOpenChange={setAddDrinkOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="gap-2"><Plus className="h-4 w-4" /> Add Drink</Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
              <DialogHeader><DialogTitle>Add New Drink</DialogTitle></DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Name *</Label>
                    <Input value={newDrink.name} onChange={e => setNewDrink(prev => ({ ...prev, name: e.target.value }))} placeholder="e.g. Hennessy" />
                  </div>
                  <div className="space-y-2">
                    <Label>Category *</Label>
                    <Select value={newDrink.category_id} onValueChange={v => setNewDrink(prev => ({ ...prev, category_id: v }))}>
                      <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                      <SelectContent>
                        {categories.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Input value={newDrink.description} onChange={e => setNewDrink(prev => ({ ...prev, description: e.target.value }))} placeholder="Optional description" />
                </div>
                <Separator />
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-base font-semibold">Measures & Prices</Label>
                    <Button type="button" variant="outline" size="sm" onClick={addMeasure}><Plus className="h-3 w-3 mr-1" /> Add Measure</Button>
                  </div>
                  {newDrink.measures.map((m, i) => (
                    <div key={i} className="grid grid-cols-[1fr_80px_100px_auto] gap-2 items-end">
                      <div>
                        <Label className="text-xs">Name</Label>
                        <Input value={m.measure_name} onChange={e => updateMeasure(i, 'measure_name', e.target.value)} placeholder="Tot" />
                      </div>
                      <div>
                        <Label className="text-xs">ml</Label>
                        <Input type="number" value={m.measure_ml || ''} onChange={e => updateMeasure(i, 'measure_ml', parseInt(e.target.value) || 0)} />
                      </div>
                      <div>
                        <Label className="text-xs">Price *</Label>
                        <Input type="number" value={m.price || ''} onChange={e => updateMeasure(i, 'price', parseFloat(e.target.value) || 0)} />
                      </div>
                      <Button type="button" variant="ghost" size="icon" onClick={() => removeMeasure(i)} disabled={newDrink.measures.length === 1}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  ))}
                </div>
                <Button onClick={handleAddDrink} className="w-full" disabled={createDrink.isPending}>
                  {createDrink.isPending ? 'Adding...' : 'Add Drink'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
          <DrinkImportExport />
          <Button variant="outline" size="sm" className="gap-2" onClick={() => { setShowHistory(!showHistory); setShowAnalytics(false); }}>
            <History className="h-4 w-4" /> {showHistory ? 'Hide' : ''} History
          </Button>
          <Button variant="outline" size="sm" className="gap-2" onClick={() => { setShowAnalytics(!showAnalytics); setShowHistory(false); }}>
            <BarChart3 className="h-4 w-4" /> {showAnalytics ? 'Hide' : ''} Analytics
          </Button>
        </div>

        {showAnalytics ? (
          <BarAnalytics />
        ) : showHistory ? (
          <Card>
            <CardHeader><CardTitle>Recent Orders</CardTitle></CardHeader>
            <CardContent>
              {orders.length === 0 ? (
                <p className="text-muted-foreground text-sm text-center py-8">No orders yet</p>
              ) : (
                <div className="space-y-3">
                  {orders.slice(0, 20).map(order => (
                    <div key={order.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium text-sm">{order.order_number}</p>
                        <p className="text-xs text-muted-foreground">{new Date(order.created_at).toLocaleString()}</p>
                        <div className="flex gap-1 mt-1">
                          {(order as any).bar_order_items?.map((item: any) => (
                            <Badge key={item.id} variant="secondary" className="text-xs">
                              {item.bar_drinks?.name} x{item.quantity}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">{formatPrice(order.total_amount)}</p>
                        <Badge variant="outline" className="text-xs capitalize">{order.payment_method}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Drink Menu */}
            <div className="lg:col-span-2 space-y-4">
              {/* Category Tabs */}
              <ScrollArea className="w-full">
                <div className="flex gap-2 pb-2">
                  <Button
                    variant={activeCategory === 'all' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setActiveCategory('all')}
                  >
                    All
                  </Button>
                  {categories.map(cat => (
                    <Button
                      key={cat.id}
                      variant={activeCategory === cat.id ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setActiveCategory(cat.id)}
                    >
                      {cat.name}
                    </Button>
                  ))}
                </div>
              </ScrollArea>

              {/* Drink Grid */}
              {isLoading ? (
                <p className="text-center text-muted-foreground py-12">Loading drinks...</p>
              ) : filteredDrinks.length === 0 ? (
                <div className="text-center py-12">
                  <Wine className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                  <p className="font-medium">No drinks found</p>
                  <p className="text-sm text-muted-foreground">Add drinks to get started</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {filteredDrinks.map(drink => (
                    <Card key={drink.id} className="overflow-hidden">
                      <CardContent className="p-3">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-semibold text-sm truncate">{drink.name}</h3>
                          <Badge
                            variant={stockMap[drink.id] <= (drink.reorder_point || 5) ? 'destructive' : 'secondary'}
                            className="text-[10px] px-1.5 py-0 shrink-0 ml-1"
                          >
                            {stockMap[drink.id] != null ? stockMap[drink.id] : '—'}
                          </Badge>
                        </div>
                        {drink.description && (
                          <p className="text-xs text-muted-foreground mb-2 line-clamp-1">{drink.description}</p>
                        )}
                        <div className="flex flex-wrap gap-1">
                          {drink.measures?.map(measure => (
                            <Button
                              key={measure.id}
                              variant="outline"
                              size="sm"
                              className="text-xs h-8 gap-1 hover:bg-primary hover:text-primary-foreground"
                              onClick={() => addToCart(drink, measure)}
                            >
                              {measure.measure_name}
                              <span className="font-bold">{formatPrice(measure.price)}</span>
                            </Button>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>

            {/* Cart / Order Panel */}
            <div className="space-y-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <ShoppingCart className="h-5 w-5" />
                    Current Order
                    {cart.length > 0 && (
                      <Badge className="ml-auto">{cart.reduce((s, c) => s + c.quantity, 0)}</Badge>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {cart.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-6">Tap a drink to add it</p>
                  ) : (
                    <>
                      <ScrollArea className="max-h-[40vh]">
                        <div className="space-y-2 pr-2">
                          {cart.map(item => (
                            <div key={`${item.drink.id}-${item.measure.id}`} className="flex items-center gap-2 p-2 border rounded-lg">
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate">{item.drink.name}</p>
                                <p className="text-xs text-muted-foreground">{item.measure.measure_name} • {formatPrice(item.measure.price)}</p>
                              </div>
                              <div className="flex items-center gap-1">
                                <Button variant="outline" size="icon" className="h-6 w-6" onClick={() => updateCartQuantity(item.drink.id, item.measure.id, -1)}>-</Button>
                                <span className="w-6 text-center text-sm font-medium">{item.quantity}</span>
                                <Button variant="outline" size="icon" className="h-6 w-6" onClick={() => updateCartQuantity(item.drink.id, item.measure.id, 1)}>+</Button>
                              </div>
                              <p className="text-sm font-bold w-16 text-right">{formatPrice(item.measure.price * item.quantity)}</p>
                              <Button variant="ghost" size="icon" className="h-6 w-6 shrink-0" onClick={() => removeFromCart(item.drink.id, item.measure.id)}>
                                <X className="h-3 w-3" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      </ScrollArea>

                      <Separator />

                      <div className="flex items-center justify-between font-bold text-lg">
                        <span>Total</span>
                        <span>{formatPrice(cartTotal)}</span>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-xs">Payment Method</Label>
                        <div className="grid grid-cols-3 gap-2">
                          {[
                            { value: 'cash', label: 'Cash', icon: Banknote },
                            { value: 'card', label: 'Card', icon: CreditCard },
                            { value: 'room', label: 'Room', icon: Wine },
                          ].map(pm => (
                            <Button
                              key={pm.value}
                              variant={paymentMethod === pm.value ? 'default' : 'outline'}
                              size="sm"
                              className="gap-1"
                              onClick={() => setPaymentMethod(pm.value)}
                            >
                              <pm.icon className="h-3 w-3" />
                              {pm.label}
                            </Button>
                          ))}
                        </div>
                      </div>

                      <Button
                        className="w-full h-12 text-base font-bold"
                        onClick={handleCheckout}
                        disabled={createOrder.isPending}
                      >
                        {createOrder.isPending ? 'Processing...' : `Charge ${formatPrice(cartTotal)}`}
                      </Button>

                      <Button variant="ghost" size="sm" className="w-full" onClick={() => setCart([])}>
                        Clear Order
                      </Button>
                    </>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
