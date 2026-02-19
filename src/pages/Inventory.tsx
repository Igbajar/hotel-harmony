import { useState } from 'react';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from '@/hooks/use-toast';
import { useBarInventory, useInventoryTransactions, useAdjustStock } from '@/hooks/useInventory';
import { useBarDrinks } from '@/hooks/useBar';
import { useVendors } from '@/hooks/useVendors';
import { Package, AlertTriangle, ArrowUpCircle, ArrowDownCircle, ClipboardCheck, Trash2 } from 'lucide-react';

export default function Inventory() {
  const { data: inventory = [], isLoading } = useBarInventory();
  const { data: transactions = [] } = useInventoryTransactions();
  const { data: drinks = [] } = useBarDrinks();
  const { data: vendors = [] } = useVendors();
  const adjustStock = useAdjustStock();

  const [adjustOpen, setAdjustOpen] = useState(false);
  const [adjustForm, setAdjustForm] = useState({ drink_id: '', quantity: 0, type: 'purchase' as 'purchase' | 'wastage' | 'adjustment' | 'stocktake', notes: '', vendor_id: '' });

  const lowStockItems = inventory.filter(i => i.drink && i.current_stock <= (i.drink.reorder_point || 5));
  const totalItems = inventory.length;
  const totalStock = inventory.reduce((s, i) => s + i.current_stock, 0);

  const handleAdjust = async () => {
    if (!adjustForm.drink_id || adjustForm.quantity === 0 && adjustForm.type !== 'stocktake') {
      toast({ title: 'Error', description: 'Select a drink and enter quantity', variant: 'destructive' });
      return;
    }
    try {
      const qty = adjustForm.type === 'wastage' ? -Math.abs(adjustForm.quantity) : adjustForm.quantity;
      await adjustStock.mutateAsync({ ...adjustForm, quantity: qty, vendor_id: adjustForm.vendor_id || undefined });
      setAdjustOpen(false);
      setAdjustForm({ drink_id: '', quantity: 0, type: 'purchase', notes: '', vendor_id: '' });
      toast({ title: 'Stock Updated', description: `Inventory has been updated` });
    } catch {
      toast({ title: 'Error', description: 'Failed to update stock', variant: 'destructive' });
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'purchase': return 'bg-green-500/10 text-green-500';
      case 'sale': return 'bg-blue-500/10 text-blue-500';
      case 'wastage': return 'bg-destructive/10 text-destructive';
      case 'adjustment': return 'bg-yellow-500/10 text-yellow-500';
      case 'stocktake': return 'bg-purple-500/10 text-purple-500';
      default: return '';
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header title="Inventory" subtitle="Track stock levels and manage inventory" />
      <div className="flex-1 p-6 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground">Total Items</p><p className="text-2xl font-bold">{totalItems}</p></CardContent></Card>
          <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground">Total Stock</p><p className="text-2xl font-bold">{totalStock}</p></CardContent></Card>
          <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground">Low Stock</p><p className="text-2xl font-bold text-destructive">{lowStockItems.length}</p></CardContent></Card>
          <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground">Transactions</p><p className="text-2xl font-bold">{transactions.length}</p></CardContent></Card>
        </div>

        <div className="flex gap-2">
          <Dialog open={adjustOpen} onOpenChange={setAdjustOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="gap-2"><ArrowUpCircle className="h-4 w-4" /> Adjust Stock</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Adjust Stock</DialogTitle></DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Drink</Label>
                  <Select value={adjustForm.drink_id} onValueChange={v => setAdjustForm(f => ({ ...f, drink_id: v }))}>
                    <SelectTrigger><SelectValue placeholder="Select drink" /></SelectTrigger>
                    <SelectContent>
                      {drinks.map(d => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Type</Label>
                  <Select value={adjustForm.type} onValueChange={(v: any) => setAdjustForm(f => ({ ...f, type: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="purchase">Restock (Purchase)</SelectItem>
                      <SelectItem value="wastage">Wastage / Breakage</SelectItem>
                      <SelectItem value="adjustment">Adjustment</SelectItem>
                      <SelectItem value="stocktake">Stock Take (Set Exact)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {adjustForm.type === 'purchase' && (
                  <div className="space-y-2">
                    <Label>Vendor (Supplier)</Label>
                    <Select value={adjustForm.vendor_id} onValueChange={v => setAdjustForm(f => ({ ...f, vendor_id: v }))}>
                      <SelectTrigger><SelectValue placeholder="Select vendor" /></SelectTrigger>
                      <SelectContent>
                        {vendors.filter(v => v.status === 'active').map(v => <SelectItem key={v.id} value={v.id}>{v.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                )}
                <div className="space-y-2">
                  <Label>{adjustForm.type === 'stocktake' ? 'Actual Count' : 'Quantity'}</Label>
                  <Input type="number" value={adjustForm.quantity || ''} onChange={e => setAdjustForm(f => ({ ...f, quantity: parseFloat(e.target.value) || 0 }))} />
                </div>
                <div className="space-y-2">
                  <Label>Notes</Label>
                  <Input value={adjustForm.notes} onChange={e => setAdjustForm(f => ({ ...f, notes: e.target.value }))} placeholder="Optional notes" />
                </div>
                <Button onClick={handleAdjust} className="w-full" disabled={adjustStock.isPending}>
                  {adjustStock.isPending ? 'Updating...' : 'Update Stock'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <Tabs defaultValue="stock">
          <TabsList>
            <TabsTrigger value="stock">Stock Levels</TabsTrigger>
            <TabsTrigger value="transactions">Transactions</TabsTrigger>
            <TabsTrigger value="alerts">Low Stock Alerts</TabsTrigger>
          </TabsList>

          <TabsContent value="stock">
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Drink</TableHead>
                      <TableHead>Stock</TableHead>
                      <TableHead>Unit</TableHead>
                      <TableHead>Reorder Point</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Last Restock</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoading ? (
                      <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">Loading...</TableCell></TableRow>
                    ) : inventory.length === 0 ? (
                      <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">No inventory items. Add drinks first.</TableCell></TableRow>
                    ) : (
                      inventory.map(item => (
                        <TableRow key={item.id}>
                          <TableCell className="font-medium">{item.drink?.name || 'Unknown'}</TableCell>
                          <TableCell className="font-bold">{item.current_stock}</TableCell>
                          <TableCell className="capitalize">{item.unit}</TableCell>
                          <TableCell>{item.drink?.reorder_point || 5}</TableCell>
                          <TableCell>
                            {item.current_stock <= (item.drink?.reorder_point || 5) ? (
                              <Badge variant="destructive" className="gap-1"><AlertTriangle className="h-3 w-3" /> Low</Badge>
                            ) : (
                              <Badge variant="secondary">OK</Badge>
                            )}
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {item.last_restock_at ? new Date(item.last_restock_at).toLocaleDateString() : 'Never'}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="transactions">
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Drink</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Quantity</TableHead>
                      <TableHead>Notes</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {transactions.length === 0 ? (
                      <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">No transactions yet</TableCell></TableRow>
                    ) : (
                      transactions.map(tx => (
                        <TableRow key={tx.id}>
                          <TableCell className="text-sm">{new Date(tx.created_at).toLocaleString()}</TableCell>
                          <TableCell className="font-medium">{tx.drink?.name || 'Unknown'}</TableCell>
                          <TableCell>
                            <Badge className={getTypeColor(tx.type)} variant="secondary">{tx.type}</Badge>
                          </TableCell>
                          <TableCell className={tx.quantity > 0 ? 'text-green-500 font-medium' : 'text-destructive font-medium'}>
                            {tx.quantity > 0 ? '+' : ''}{tx.quantity}
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">{tx.notes || '-'}</TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="alerts">
            <Card>
              <CardContent className="p-6">
                {lowStockItems.length === 0 ? (
                  <div className="text-center py-8">
                    <Package className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                    <p className="font-medium">All stock levels are healthy</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {lowStockItems.map(item => (
                      <div key={item.id} className="flex items-center justify-between p-3 border border-destructive/30 rounded-lg bg-destructive/5">
                        <div className="flex items-center gap-3">
                          <AlertTriangle className="h-5 w-5 text-destructive" />
                          <div>
                            <p className="font-medium">{item.drink?.name}</p>
                            <p className="text-xs text-muted-foreground">Current: {item.current_stock} {item.unit} • Reorder at: {item.drink?.reorder_point}</p>
                          </div>
                        </div>
                        <Button size="sm" variant="outline" onClick={() => {
                          setAdjustForm({ drink_id: item.drink_id, quantity: 0, type: 'purchase', notes: '', vendor_id: '' });
                          setAdjustOpen(true);
                        }}>
                          Restock
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
