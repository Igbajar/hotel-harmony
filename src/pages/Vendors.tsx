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
import { Separator } from '@/components/ui/separator';
import { toast } from '@/hooks/use-toast';
import { useCurrency } from '@/contexts/CurrencyContext';
import { useVendors, useCreateVendor, useDeleteVendor, usePurchaseOrders, useCreatePurchaseOrder, useReceivePurchaseOrder, useVendorPayments, useCreateVendorPayment } from '@/hooks/useVendors';
import { useBarDrinks } from '@/hooks/useBar';
import { Plus, Truck, CreditCard, Trash2, Package, CheckCircle } from 'lucide-react';

export default function Vendors() {
  const { formatPrice } = useCurrency();
  const { data: vendors = [] } = useVendors();
  const { data: purchaseOrders = [] } = usePurchaseOrders();
  const { data: payments = [] } = useVendorPayments();
  const { data: drinks = [] } = useBarDrinks();
  const createVendor = useCreateVendor();
  const deleteVendor = useDeleteVendor();
  const createPO = useCreatePurchaseOrder();
  const receivePO = useReceivePurchaseOrder();
  const createPayment = useCreateVendorPayment();

  const [vendorOpen, setVendorOpen] = useState(false);
  const [poOpen, setPoOpen] = useState(false);
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [vendorForm, setVendorForm] = useState({ name: '', contact_person: '', email: '', phone: '', address: '', payment_terms: 'Net 30', status: 'active', notes: '', products_supplied: [] as string[] });
  const [poForm, setPoForm] = useState({ vendor_id: '', expected_delivery: '', notes: '', items: [{ drink_id: '', quantity: 1, unit_price: 0 }] });
  const [paymentForm, setPaymentForm] = useState({ vendor_id: '', po_id: '' as string | null, amount: 0, payment_method: 'bank_transfer', payment_date: new Date().toISOString().split('T')[0], reference: '', notes: '' });

  const handleAddVendor = async () => {
    if (!vendorForm.name) { toast({ title: 'Error', description: 'Vendor name required', variant: 'destructive' }); return; }
    try {
      await createVendor.mutateAsync(vendorForm);
      setVendorForm({ name: '', contact_person: '', email: '', phone: '', address: '', payment_terms: 'Net 30', status: 'active', notes: '', products_supplied: [] });
      setVendorOpen(false);
      toast({ title: 'Vendor Added' });
    } catch { toast({ title: 'Error', variant: 'destructive' }); }
  };

  const handleCreatePO = async () => {
    if (!poForm.vendor_id || poForm.items.some(i => !i.drink_id)) { toast({ title: 'Error', description: 'Fill all fields', variant: 'destructive' }); return; }
    try {
      await createPO.mutateAsync({ ...poForm, items: poForm.items.filter(i => i.drink_id) });
      setPoForm({ vendor_id: '', expected_delivery: '', notes: '', items: [{ drink_id: '', quantity: 1, unit_price: 0 }] });
      setPoOpen(false);
      toast({ title: 'Purchase Order Created' });
    } catch { toast({ title: 'Error', variant: 'destructive' }); }
  };

  const handleReceive = async (po: any) => {
    try {
      await receivePO.mutateAsync({
        po_id: po.id,
        items: po.items.map((i: any) => ({ id: i.id, drink_id: i.drink_id, received_quantity: i.quantity })),
      });
      toast({ title: 'PO Received', description: 'Inventory has been updated' });
    } catch { toast({ title: 'Error', variant: 'destructive' }); }
  };

  const handlePayment = async () => {
    if (!paymentForm.vendor_id || !paymentForm.amount) { toast({ title: 'Error', description: 'Fill required fields', variant: 'destructive' }); return; }
    try {
      await createPayment.mutateAsync({ ...paymentForm, po_id: paymentForm.po_id || null });
      setPaymentForm({ vendor_id: '', po_id: '', amount: 0, payment_method: 'bank_transfer', payment_date: new Date().toISOString().split('T')[0], reference: '', notes: '' });
      setPaymentOpen(false);
      toast({ title: 'Payment Recorded' });
    } catch { toast({ title: 'Error', variant: 'destructive' }); }
  };

  const addPOItem = () => setPoForm(f => ({ ...f, items: [...f.items, { drink_id: '', quantity: 1, unit_price: 0 }] }));
  const updatePOItem = (i: number, field: string, value: any) => setPoForm(f => ({ ...f, items: f.items.map((item, idx) => idx === i ? { ...item, [field]: value } : item) }));

  return (
    <div className="flex flex-col min-h-screen">
      <Header title="Vendors & Procurement" subtitle="Manage suppliers, purchase orders, and payments" />
      <div className="flex-1 p-6 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground">Vendors</p><p className="text-2xl font-bold">{vendors.length}</p></CardContent></Card>
          <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground">Purchase Orders</p><p className="text-2xl font-bold">{purchaseOrders.length}</p></CardContent></Card>
          <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground">Pending POs</p><p className="text-2xl font-bold">{purchaseOrders.filter(p => p.status !== 'received' && p.status !== 'cancelled').length}</p></CardContent></Card>
          <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground">Total Payments</p><p className="text-2xl font-bold">{formatPrice(payments.reduce((s, p) => s + p.amount, 0))}</p></CardContent></Card>
        </div>

        <div className="flex flex-wrap gap-2">
          <Dialog open={vendorOpen} onOpenChange={setVendorOpen}>
            <DialogTrigger asChild><Button size="sm" className="gap-2"><Plus className="h-4 w-4" /> Add Vendor</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Add Vendor</DialogTitle></DialogHeader>
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div><Label>Name *</Label><Input value={vendorForm.name} onChange={e => setVendorForm(f => ({ ...f, name: e.target.value }))} /></div>
                  <div><Label>Contact Person</Label><Input value={vendorForm.contact_person} onChange={e => setVendorForm(f => ({ ...f, contact_person: e.target.value }))} /></div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div><Label>Email</Label><Input value={vendorForm.email} onChange={e => setVendorForm(f => ({ ...f, email: e.target.value }))} /></div>
                  <div><Label>Phone</Label><Input value={vendorForm.phone} onChange={e => setVendorForm(f => ({ ...f, phone: e.target.value }))} /></div>
                </div>
                <div><Label>Address</Label><Input value={vendorForm.address} onChange={e => setVendorForm(f => ({ ...f, address: e.target.value }))} /></div>
                <div><Label>Payment Terms</Label><Input value={vendorForm.payment_terms} onChange={e => setVendorForm(f => ({ ...f, payment_terms: e.target.value }))} /></div>
                <Button onClick={handleAddVendor} className="w-full" disabled={createVendor.isPending}>Add Vendor</Button>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={poOpen} onOpenChange={setPoOpen}>
            <DialogTrigger asChild><Button size="sm" variant="outline" className="gap-2"><Truck className="h-4 w-4" /> New Purchase Order</Button></DialogTrigger>
            <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
              <DialogHeader><DialogTitle>New Purchase Order</DialogTitle></DialogHeader>
              <div className="space-y-4">
                <div><Label>Vendor *</Label>
                  <Select value={poForm.vendor_id} onValueChange={v => setPoForm(f => ({ ...f, vendor_id: v }))}>
                    <SelectTrigger><SelectValue placeholder="Select vendor" /></SelectTrigger>
                    <SelectContent>{vendors.map(v => <SelectItem key={v.id} value={v.id}>{v.name}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div><Label>Expected Delivery</Label><Input type="date" value={poForm.expected_delivery} onChange={e => setPoForm(f => ({ ...f, expected_delivery: e.target.value }))} /></div>
                <Separator />
                <div className="space-y-3">
                  <div className="flex items-center justify-between"><Label className="font-semibold">Items</Label><Button size="sm" variant="outline" onClick={addPOItem}><Plus className="h-3 w-3 mr-1" /> Add</Button></div>
                  {poForm.items.map((item, i) => (
                    <div key={i} className="grid grid-cols-[1fr_80px_100px] gap-2">
                      <Select value={item.drink_id} onValueChange={v => updatePOItem(i, 'drink_id', v)}>
                        <SelectTrigger><SelectValue placeholder="Drink" /></SelectTrigger>
                        <SelectContent>{drinks.map(d => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}</SelectContent>
                      </Select>
                      <Input type="number" placeholder="Qty" value={item.quantity || ''} onChange={e => updatePOItem(i, 'quantity', parseInt(e.target.value) || 0)} />
                      <Input type="number" placeholder="Price" value={item.unit_price || ''} onChange={e => updatePOItem(i, 'unit_price', parseFloat(e.target.value) || 0)} />
                    </div>
                  ))}
                  <p className="text-sm font-bold text-right">Total: {formatPrice(poForm.items.reduce((s, i) => s + i.quantity * i.unit_price, 0))}</p>
                </div>
                <Button onClick={handleCreatePO} className="w-full" disabled={createPO.isPending}>Create PO</Button>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={paymentOpen} onOpenChange={setPaymentOpen}>
            <DialogTrigger asChild><Button size="sm" variant="outline" className="gap-2"><CreditCard className="h-4 w-4" /> Record Payment</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Record Payment</DialogTitle></DialogHeader>
              <div className="space-y-3">
                <div><Label>Vendor *</Label>
                  <Select value={paymentForm.vendor_id} onValueChange={v => setPaymentForm(f => ({ ...f, vendor_id: v }))}>
                    <SelectTrigger><SelectValue placeholder="Select vendor" /></SelectTrigger>
                    <SelectContent>{vendors.map(v => <SelectItem key={v.id} value={v.id}>{v.name}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div><Label>Amount *</Label><Input type="number" value={paymentForm.amount || ''} onChange={e => setPaymentForm(f => ({ ...f, amount: parseFloat(e.target.value) || 0 }))} /></div>
                <div><Label>Method</Label>
                  <Select value={paymentForm.payment_method} onValueChange={v => setPaymentForm(f => ({ ...f, payment_method: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                      <SelectItem value="cash">Cash</SelectItem>
                      <SelectItem value="cheque">Cheque</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div><Label>Date</Label><Input type="date" value={paymentForm.payment_date} onChange={e => setPaymentForm(f => ({ ...f, payment_date: e.target.value }))} /></div>
                <div><Label>Reference</Label><Input value={paymentForm.reference} onChange={e => setPaymentForm(f => ({ ...f, reference: e.target.value }))} placeholder="e.g. Transfer ref" /></div>
                <Button onClick={handlePayment} className="w-full" disabled={createPayment.isPending}>Record Payment</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <Tabs defaultValue="vendors">
          <TabsList>
            <TabsTrigger value="vendors">Vendors</TabsTrigger>
            <TabsTrigger value="orders">Purchase Orders</TabsTrigger>
            <TabsTrigger value="payments">Payments</TabsTrigger>
          </TabsList>

          <TabsContent value="vendors">
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Contact</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>Payment Terms</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {vendors.length === 0 ? (
                      <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">No vendors yet</TableCell></TableRow>
                    ) : vendors.map(v => (
                      <TableRow key={v.id}>
                        <TableCell className="font-medium">{v.name}</TableCell>
                        <TableCell>{v.contact_person || '-'}<br /><span className="text-xs text-muted-foreground">{v.email}</span></TableCell>
                        <TableCell>{v.phone || '-'}</TableCell>
                        <TableCell>{v.payment_terms}</TableCell>
                        <TableCell><Badge variant={v.status === 'active' ? 'secondary' : 'outline'}>{v.status}</Badge></TableCell>
                        <TableCell>
                          <Button variant="ghost" size="icon" onClick={() => { if (confirm('Delete vendor?')) deleteVendor.mutate(v.id); }}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="orders">
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>PO #</TableHead>
                      <TableHead>Vendor</TableHead>
                      <TableHead>Items</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Expected</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {purchaseOrders.length === 0 ? (
                      <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">No purchase orders</TableCell></TableRow>
                    ) : purchaseOrders.map(po => (
                      <TableRow key={po.id}>
                        <TableCell className="font-medium">{po.po_number}</TableCell>
                        <TableCell>{(po.vendor as any)?.name || '-'}</TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {po.items?.map(i => (
                              <Badge key={i.id} variant="secondary" className="text-xs">{i.drink?.name} x{i.quantity}</Badge>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell className="font-bold">{formatPrice(po.total_amount)}</TableCell>
                        <TableCell><Badge variant={po.status === 'received' ? 'default' : 'outline'} className="capitalize">{po.status}</Badge></TableCell>
                        <TableCell className="text-sm">{po.expected_delivery || '-'}</TableCell>
                        <TableCell>
                          {po.status !== 'received' && po.status !== 'cancelled' && (
                            <Button size="sm" variant="outline" className="gap-1" onClick={() => handleReceive(po)} disabled={receivePO.isPending}>
                              <CheckCircle className="h-3 w-3" /> Receive
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="payments">
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Vendor</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Method</TableHead>
                      <TableHead>Reference</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {payments.length === 0 ? (
                      <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">No payments recorded</TableCell></TableRow>
                    ) : payments.map(p => (
                      <TableRow key={p.id}>
                        <TableCell>{new Date(p.payment_date).toLocaleDateString()}</TableCell>
                        <TableCell className="font-medium">{vendors.find(v => v.id === p.vendor_id)?.name || '-'}</TableCell>
                        <TableCell className="font-bold">{formatPrice(p.amount)}</TableCell>
                        <TableCell><Badge variant="outline" className="capitalize">{p.payment_method.replace('_', ' ')}</Badge></TableCell>
                        <TableCell className="text-sm text-muted-foreground">{p.reference || '-'}</TableCell>
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
