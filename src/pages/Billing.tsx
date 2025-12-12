import { useState, useMemo } from 'react';
import { format, subDays } from 'date-fns';
import {
  DollarSign, CreditCard, Banknote, Smartphone, Building2, Plus, Search,
  FileText, Download, Printer, MoreHorizontal, Check, X, RefreshCw,
  ArrowUpRight, ArrowDownRight, Receipt, Split, Undo2, Eye, Filter,
  ChevronDown, Calendar, Clock, User, Bed, AlertCircle, CheckCircle2
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
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { useCurrency } from '@/contexts/CurrencyContext';
import { mockGuests, mockRooms, mockReservations } from '@/data/mockData';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';
import type { PaymentMethod } from '@/types/hotel';

type InvoiceStatus = 'draft' | 'pending' | 'partial' | 'paid' | 'overdue' | 'cancelled' | 'refunded';
type TransactionType = 'payment' | 'refund' | 'adjustment';

interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

interface Invoice {
  id: string;
  invoiceNumber: string;
  guestId: string;
  reservationId: string;
  items: InvoiceItem[];
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  discount: number;
  total: number;
  paidAmount: number;
  status: InvoiceStatus;
  dueDate: Date;
  createdAt: Date;
  notes?: string;
}

interface Payment {
  id: string;
  invoiceId: string;
  amount: number;
  method: PaymentMethod;
  reference?: string;
  transactionType: TransactionType;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  processedBy: string;
  createdAt: Date;
  notes?: string;
}

// Generate mock invoices
const generateMockInvoices = (): Invoice[] => {
  return mockReservations.map((res, index) => {
    const room = mockRooms.find(r => r.id === res.roomId);
    const nights = Math.ceil((new Date(res.checkOut).getTime() - new Date(res.checkIn).getTime()) / (1000 * 60 * 60 * 24));
    const roomCharge = (room?.pricePerNight || 200) * nights;
    const extras = Math.random() > 0.5 ? Math.round(Math.random() * 200) : 0;
    const subtotal = roomCharge + extras;
    const taxAmount = subtotal * 0.12;
    const discount = Math.random() > 0.7 ? Math.round(subtotal * 0.1) : 0;
    const total = subtotal + taxAmount - discount;
    
    const statuses: InvoiceStatus[] = ['paid', 'pending', 'partial', 'overdue', 'draft'];
    const status = statuses[index % statuses.length];
    const paidAmount = status === 'paid' ? total : status === 'partial' ? total * 0.5 : status === 'draft' ? 0 : res.paidAmount;

    const items: InvoiceItem[] = [
      {
        id: `item-${res.id}-1`,
        description: `Room ${room?.number || 'N/A'} - ${room?.type || 'Standard'} (${nights} nights)`,
        quantity: nights,
        unitPrice: room?.pricePerNight || 200,
        total: roomCharge,
      },
    ];

    if (extras > 0) {
      items.push({
        id: `item-${res.id}-2`,
        description: 'Room Service & Extras',
        quantity: 1,
        unitPrice: extras,
        total: extras,
      });
    }

    return {
      id: `inv-${res.id}`,
      invoiceNumber: `INV-${2024}${String(index + 1).padStart(4, '0')}`,
      guestId: res.guestId,
      reservationId: res.id,
      items,
      subtotal,
      taxRate: 12,
      taxAmount,
      discount,
      total,
      paidAmount,
      status,
      dueDate: new Date(res.checkOut),
      createdAt: new Date(res.createdAt),
      notes: status === 'overdue' ? 'Payment reminder sent' : undefined,
    };
  });
};

// Generate mock payments
const generateMockPayments = (invoices: Invoice[]): Payment[] => {
  const payments: Payment[] = [];
  const methods: PaymentMethod[] = ['card', 'cash', 'transfer', 'mobile'];
  const processors = ['John Smith', 'Sarah Williams', 'Michael Chen'];

  invoices.forEach((inv, index) => {
    if (inv.paidAmount > 0) {
      const isSplit = Math.random() > 0.7 && inv.paidAmount > 200;
      
      if (isSplit) {
        const firstPayment = Math.round(inv.paidAmount * 0.6);
        payments.push({
          id: `pay-${inv.id}-1`,
          invoiceId: inv.id,
          amount: firstPayment,
          method: methods[index % methods.length],
          reference: `REF${Date.now()}${index}A`,
          transactionType: 'payment',
          status: 'completed',
          processedBy: processors[index % processors.length],
          createdAt: subDays(new Date(), Math.floor(Math.random() * 10)),
        });
        payments.push({
          id: `pay-${inv.id}-2`,
          invoiceId: inv.id,
          amount: inv.paidAmount - firstPayment,
          method: methods[(index + 1) % methods.length],
          reference: `REF${Date.now()}${index}B`,
          transactionType: 'payment',
          status: 'completed',
          processedBy: processors[(index + 1) % processors.length],
          createdAt: subDays(new Date(), Math.floor(Math.random() * 5)),
        });
      } else {
        payments.push({
          id: `pay-${inv.id}`,
          invoiceId: inv.id,
          amount: inv.paidAmount,
          method: methods[index % methods.length],
          reference: `REF${Date.now()}${index}`,
          transactionType: 'payment',
          status: 'completed',
          processedBy: processors[index % processors.length],
          createdAt: subDays(new Date(), Math.floor(Math.random() * 14)),
        });
      }
    }
  });

  return payments;
};

const paymentMethodIcons: Record<PaymentMethod, React.ReactNode> = {
  cash: <Banknote className="h-4 w-4" />,
  card: <CreditCard className="h-4 w-4" />,
  transfer: <Building2 className="h-4 w-4" />,
  mobile: <Smartphone className="h-4 w-4" />,
};

const paymentMethodLabels: Record<PaymentMethod, string> = {
  cash: 'Cash',
  card: 'Credit/Debit Card',
  transfer: 'Bank Transfer',
  mobile: 'Mobile Money',
};

const statusStyles: Record<InvoiceStatus, string> = {
  draft: 'bg-muted text-muted-foreground',
  pending: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
  partial: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
  paid: 'bg-green-500/10 text-green-600 border-green-500/20',
  overdue: 'bg-red-500/10 text-red-600 border-red-500/20',
  cancelled: 'bg-muted text-muted-foreground line-through',
  refunded: 'bg-purple-500/10 text-purple-600 border-purple-500/20',
};

export default function Billing() {
  const { formatPrice } = useCurrency();
  const [invoices, setInvoices] = useState<Invoice[]>(() => generateMockInvoices());
  const [payments, setPayments] = useState<Payment[]>(() => generateMockPayments(invoices));
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [activeTab, setActiveTab] = useState('invoices');
  
  // Dialog states
  const [viewInvoice, setViewInvoice] = useState<Invoice | null>(null);
  const [paymentDialog, setPaymentDialog] = useState<{ open: boolean; invoice: Invoice | null; isSplit: boolean }>({ open: false, invoice: null, isSplit: false });
  const [refundDialog, setRefundDialog] = useState<{ open: boolean; invoice: Invoice | null }>({ open: false, invoice: null });
  const [newInvoiceDialog, setNewInvoiceDialog] = useState(false);

  // Payment form state
  const [paymentForm, setPaymentForm] = useState({
    amount: 0,
    method: 'card' as PaymentMethod,
    reference: '',
    notes: '',
  });

  // Split payment state
  const [splitPayments, setSplitPayments] = useState<Array<{ amount: number; method: PaymentMethod }>>([
    { amount: 0, method: 'card' },
    { amount: 0, method: 'cash' },
  ]);

  // Refund form state
  const [refundForm, setRefundForm] = useState({
    amount: 0,
    reason: '',
  });

  // Calculate stats
  const stats = useMemo(() => {
    const totalRevenue = invoices.reduce((sum, inv) => sum + inv.paidAmount, 0);
    const pendingAmount = invoices.filter(inv => ['pending', 'partial', 'overdue'].includes(inv.status))
      .reduce((sum, inv) => sum + (inv.total - inv.paidAmount), 0);
    const overdueCount = invoices.filter(inv => inv.status === 'overdue').length;
    const todayPayments = payments.filter(p => 
      format(p.createdAt, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd') && 
      p.transactionType === 'payment'
    ).reduce((sum, p) => sum + p.amount, 0);

    return { totalRevenue, pendingAmount, overdueCount, todayPayments };
  }, [invoices, payments]);

  // Filter invoices
  const filteredInvoices = useMemo(() => {
    return invoices.filter(inv => {
      const guest = mockGuests.find(g => g.id === inv.guestId);
      const matchesSearch = 
        inv.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        guest?.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        guest?.lastName.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || inv.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [invoices, searchTerm, statusFilter]);

  const getGuest = (guestId: string) => mockGuests.find(g => g.id === guestId);
  const getRoom = (reservationId: string) => {
    const res = mockReservations.find(r => r.id === reservationId);
    return res ? mockRooms.find(r => r.id === res.roomId) : null;
  };

  const handleRecordPayment = () => {
    if (!paymentDialog.invoice) return;
    
    const invoice = paymentDialog.invoice;
    const totalPaymentAmount = paymentDialog.isSplit 
      ? splitPayments.reduce((sum, p) => sum + p.amount, 0)
      : paymentForm.amount;

    if (totalPaymentAmount <= 0) {
      toast({ title: "Invalid Amount", description: "Payment amount must be greater than 0", variant: "destructive" });
      return;
    }

    const remaining = invoice.total - invoice.paidAmount;
    if (totalPaymentAmount > remaining) {
      toast({ title: "Invalid Amount", description: "Payment exceeds remaining balance", variant: "destructive" });
      return;
    }

    // Create payment records
    const newPayments: Payment[] = paymentDialog.isSplit
      ? splitPayments.filter(p => p.amount > 0).map((p, i) => ({
          id: `pay-${Date.now()}-${i}`,
          invoiceId: invoice.id,
          amount: p.amount,
          method: p.method,
          reference: `REF${Date.now()}${i}`,
          transactionType: 'payment' as TransactionType,
          status: 'completed' as const,
          processedBy: 'Current User',
          createdAt: new Date(),
        }))
      : [{
          id: `pay-${Date.now()}`,
          invoiceId: invoice.id,
          amount: paymentForm.amount,
          method: paymentForm.method,
          reference: paymentForm.reference || `REF${Date.now()}`,
          transactionType: 'payment' as TransactionType,
          status: 'completed' as const,
          processedBy: 'Current User',
          createdAt: new Date(),
          notes: paymentForm.notes,
        }];

    setPayments(prev => [...prev, ...newPayments]);

    // Update invoice
    const newPaidAmount = invoice.paidAmount + totalPaymentAmount;
    const newStatus: InvoiceStatus = newPaidAmount >= invoice.total ? 'paid' : 'partial';
    
    setInvoices(prev => prev.map(inv => 
      inv.id === invoice.id 
        ? { ...inv, paidAmount: newPaidAmount, status: newStatus }
        : inv
    ));

    setPaymentDialog({ open: false, invoice: null, isSplit: false });
    setPaymentForm({ amount: 0, method: 'card', reference: '', notes: '' });
    setSplitPayments([{ amount: 0, method: 'card' }, { amount: 0, method: 'cash' }]);

    toast({ title: "Payment Recorded", description: `${formatPrice(totalPaymentAmount)} payment has been recorded` });
  };

  const handleRefund = () => {
    if (!refundDialog.invoice) return;
    
    const invoice = refundDialog.invoice;
    if (refundForm.amount <= 0 || refundForm.amount > invoice.paidAmount) {
      toast({ title: "Invalid Amount", description: "Refund amount is invalid", variant: "destructive" });
      return;
    }

    // Create refund record
    const refundPayment: Payment = {
      id: `ref-${Date.now()}`,
      invoiceId: invoice.id,
      amount: -refundForm.amount,
      method: 'transfer',
      reference: `REFUND-${Date.now()}`,
      transactionType: 'refund',
      status: 'completed',
      processedBy: 'Current User',
      createdAt: new Date(),
      notes: refundForm.reason,
    };

    setPayments(prev => [...prev, refundPayment]);

    // Update invoice
    const newPaidAmount = invoice.paidAmount - refundForm.amount;
    const newStatus: InvoiceStatus = newPaidAmount <= 0 ? 'refunded' : 'partial';
    
    setInvoices(prev => prev.map(inv => 
      inv.id === invoice.id 
        ? { ...inv, paidAmount: newPaidAmount, status: newStatus }
        : inv
    ));

    setRefundDialog({ open: false, invoice: null });
    setRefundForm({ amount: 0, reason: '' });

    toast({ title: "Refund Processed", description: `${formatPrice(refundForm.amount)} has been refunded` });
  };

  const MetricCard = ({ title, value, icon: Icon, trend, trendValue, variant = 'default' }: {
    title: string;
    value: string;
    icon: React.ElementType;
    trend?: 'up' | 'down';
    trendValue?: string;
    variant?: 'default' | 'warning' | 'danger';
  }) => (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className={cn(
              "text-2xl font-bold",
              variant === 'warning' && "text-amber-600",
              variant === 'danger' && "text-red-600"
            )}>{value}</p>
          </div>
          <div className={cn(
            "p-2 rounded-lg",
            variant === 'default' && "bg-primary/10",
            variant === 'warning' && "bg-amber-500/10",
            variant === 'danger' && "bg-red-500/10"
          )}>
            <Icon className={cn(
              "h-5 w-5",
              variant === 'default' && "text-primary",
              variant === 'warning' && "text-amber-600",
              variant === 'danger' && "text-red-600"
            )} />
          </div>
        </div>
        {trend && trendValue && (
          <div className={cn(
            "flex items-center gap-1 mt-3 text-sm",
            trend === 'up' ? "text-green-600" : "text-red-600"
          )}>
            {trend === 'up' ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
            <span>{trendValue}</span>
            <span className="text-muted-foreground">vs last period</span>
          </div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="flex flex-col h-full">
      <Header title="Billing & Payments" subtitle="Manage invoices, payments, and refunds" />
      
      <div className="flex-1 overflow-auto p-6 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard 
            title="Total Revenue" 
            value={formatPrice(stats.totalRevenue)} 
            icon={DollarSign}
            trend="up"
            trendValue="+12.5%"
          />
          <MetricCard 
            title="Today's Payments" 
            value={formatPrice(stats.todayPayments)} 
            icon={CreditCard}
          />
          <MetricCard 
            title="Pending Amount" 
            value={formatPrice(stats.pendingAmount)} 
            icon={Clock}
            variant="warning"
          />
          <MetricCard 
            title="Overdue Invoices" 
            value={stats.overdueCount.toString()} 
            icon={AlertCircle}
            variant={stats.overdueCount > 0 ? 'danger' : 'default'}
          />
        </div>

        {/* Main Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <div className="flex flex-col sm:flex-row justify-between gap-4">
            <TabsList>
              <TabsTrigger value="invoices" className="gap-2">
                <FileText className="h-4 w-4" />
                Invoices
              </TabsTrigger>
              <TabsTrigger value="payments" className="gap-2">
                <CreditCard className="h-4 w-4" />
                Payments
              </TabsTrigger>
              <TabsTrigger value="refunds" className="gap-2">
                <Undo2 className="h-4 w-4" />
                Refunds
              </TabsTrigger>
            </TabsList>
            
            <Button onClick={() => setNewInvoiceDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              New Invoice
            </Button>
          </div>

          {/* Invoices Tab */}
          <TabsContent value="invoices" className="space-y-4">
            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search invoices or guests..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[160px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="partial">Partial</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="overdue">Overdue</SelectItem>
                  <SelectItem value="refunded">Refunded</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Invoices Table */}
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Invoice</TableHead>
                      <TableHead>Guest</TableHead>
                      <TableHead>Room</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                      <TableHead className="text-right">Paid</TableHead>
                      <TableHead className="text-center">Status</TableHead>
                      <TableHead>Due Date</TableHead>
                      <TableHead className="w-[50px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredInvoices.map((invoice) => {
                      const guest = getGuest(invoice.guestId);
                      const room = getRoom(invoice.reservationId);
                      const balance = invoice.total - invoice.paidAmount;
                      
                      return (
                        <TableRow key={invoice.id}>
                          <TableCell>
                            <div className="font-medium">{invoice.invoiceNumber}</div>
                            <div className="text-xs text-muted-foreground">
                              {format(invoice.createdAt, 'MMM dd, yyyy')}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="font-medium">{guest?.firstName} {guest?.lastName}</div>
                            <div className="text-xs text-muted-foreground">{guest?.email}</div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Bed className="h-4 w-4 text-muted-foreground" />
                              <span>{room?.number || 'N/A'}</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-right font-medium">
                            {formatPrice(invoice.total)}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="font-medium">{formatPrice(invoice.paidAmount)}</div>
                            {balance > 0 && (
                              <div className="text-xs text-muted-foreground">
                                {formatPrice(balance)} due
                              </div>
                            )}
                          </TableCell>
                          <TableCell className="text-center">
                            <Badge variant="outline" className={statusStyles[invoice.status]}>
                              {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">{format(invoice.dueDate, 'MMM dd, yyyy')}</div>
                          </TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => setViewInvoice(invoice)}>
                                  <Eye className="h-4 w-4 mr-2" />
                                  View Details
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <Printer className="h-4 w-4 mr-2" />
                                  Print Invoice
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <Download className="h-4 w-4 mr-2" />
                                  Download PDF
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                {balance > 0 && invoice.status !== 'cancelled' && (
                                  <>
                                    <DropdownMenuItem onClick={() => {
                                      setPaymentForm({ ...paymentForm, amount: balance });
                                      setPaymentDialog({ open: true, invoice, isSplit: false });
                                    }}>
                                      <DollarSign className="h-4 w-4 mr-2" />
                                      Record Payment
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => {
                                      const half = Math.round(balance / 2);
                                      setSplitPayments([
                                        { amount: half, method: 'card' },
                                        { amount: balance - half, method: 'cash' },
                                      ]);
                                      setPaymentDialog({ open: true, invoice, isSplit: true });
                                    }}>
                                      <Split className="h-4 w-4 mr-2" />
                                      Split Payment
                                    </DropdownMenuItem>
                                  </>
                                )}
                                {invoice.paidAmount > 0 && invoice.status !== 'refunded' && (
                                  <DropdownMenuItem onClick={() => {
                                    setRefundForm({ amount: invoice.paidAmount, reason: '' });
                                    setRefundDialog({ open: true, invoice });
                                  }}>
                                    <Undo2 className="h-4 w-4 mr-2" />
                                    Process Refund
                                  </DropdownMenuItem>
                                )}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Payments Tab */}
          <TabsContent value="payments" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Payment History</CardTitle>
                <CardDescription>All payment transactions</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Reference</TableHead>
                      <TableHead>Invoice</TableHead>
                      <TableHead>Method</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                      <TableHead>Processed By</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead className="text-center">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {payments
                      .filter(p => p.transactionType === 'payment')
                      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
                      .map((payment) => {
                        const invoice = invoices.find(i => i.id === payment.invoiceId);
                        
                        return (
                          <TableRow key={payment.id}>
                            <TableCell className="font-mono text-sm">{payment.reference}</TableCell>
                            <TableCell>{invoice?.invoiceNumber || 'N/A'}</TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                {paymentMethodIcons[payment.method]}
                                <span>{paymentMethodLabels[payment.method]}</span>
                              </div>
                            </TableCell>
                            <TableCell className="text-right font-medium text-green-600">
                              +{formatPrice(payment.amount)}
                            </TableCell>
                            <TableCell>{payment.processedBy}</TableCell>
                            <TableCell>{format(payment.createdAt, 'MMM dd, yyyy HH:mm')}</TableCell>
                            <TableCell className="text-center">
                              <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/20">
                                <CheckCircle2 className="h-3 w-3 mr-1" />
                                {payment.status}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Refunds Tab */}
          <TabsContent value="refunds" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Refund History</CardTitle>
                <CardDescription>All refund transactions</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Reference</TableHead>
                      <TableHead>Invoice</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                      <TableHead>Reason</TableHead>
                      <TableHead>Processed By</TableHead>
                      <TableHead>Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {payments
                      .filter(p => p.transactionType === 'refund')
                      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
                      .map((refund) => {
                        const invoice = invoices.find(i => i.id === refund.invoiceId);
                        
                        return (
                          <TableRow key={refund.id}>
                            <TableCell className="font-mono text-sm">{refund.reference}</TableCell>
                            <TableCell>{invoice?.invoiceNumber || 'N/A'}</TableCell>
                            <TableCell className="text-right font-medium text-red-600">
                              {formatPrice(Math.abs(refund.amount))}
                            </TableCell>
                            <TableCell>{refund.notes || '-'}</TableCell>
                            <TableCell>{refund.processedBy}</TableCell>
                            <TableCell>{format(refund.createdAt, 'MMM dd, yyyy HH:mm')}</TableCell>
                          </TableRow>
                        );
                      })}
                    {payments.filter(p => p.transactionType === 'refund').length === 0 && (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                          No refunds recorded
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* View Invoice Dialog */}
      <Dialog open={!!viewInvoice} onOpenChange={() => setViewInvoice(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Invoice {viewInvoice?.invoiceNumber}</DialogTitle>
            <DialogDescription>Invoice details and line items</DialogDescription>
          </DialogHeader>
          {viewInvoice && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Guest</p>
                  <p className="font-medium">
                    {getGuest(viewInvoice.guestId)?.firstName} {getGuest(viewInvoice.guestId)?.lastName}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Status</p>
                  <Badge variant="outline" className={statusStyles[viewInvoice.status]}>
                    {viewInvoice.status.charAt(0).toUpperCase() + viewInvoice.status.slice(1)}
                  </Badge>
                </div>
                <div>
                  <p className="text-muted-foreground">Created</p>
                  <p className="font-medium">{format(viewInvoice.createdAt, 'MMM dd, yyyy')}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Due Date</p>
                  <p className="font-medium">{format(viewInvoice.dueDate, 'MMM dd, yyyy')}</p>
                </div>
              </div>

              <Separator />

              <div>
                <h4 className="font-medium mb-3">Line Items</h4>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Description</TableHead>
                      <TableHead className="text-center">Qty</TableHead>
                      <TableHead className="text-right">Unit Price</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {viewInvoice.items.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>{item.description}</TableCell>
                        <TableCell className="text-center">{item.quantity}</TableCell>
                        <TableCell className="text-right">{formatPrice(item.unitPrice)}</TableCell>
                        <TableCell className="text-right">{formatPrice(item.total)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>{formatPrice(viewInvoice.subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tax ({viewInvoice.taxRate}%)</span>
                  <span>{formatPrice(viewInvoice.taxAmount)}</span>
                </div>
                {viewInvoice.discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount</span>
                    <span>-{formatPrice(viewInvoice.discount)}</span>
                  </div>
                )}
                <Separator />
                <div className="flex justify-between font-semibold text-lg">
                  <span>Total</span>
                  <span>{formatPrice(viewInvoice.total)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Paid</span>
                  <span className="text-green-600">{formatPrice(viewInvoice.paidAmount)}</span>
                </div>
                <div className="flex justify-between font-medium">
                  <span>Balance Due</span>
                  <span className={viewInvoice.total - viewInvoice.paidAmount > 0 ? 'text-amber-600' : ''}>
                    {formatPrice(viewInvoice.total - viewInvoice.paidAmount)}
                  </span>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setViewInvoice(null)}>Close</Button>
            <Button variant="outline">
              <Printer className="h-4 w-4 mr-2" />
              Print
            </Button>
            <Button>
              <Download className="h-4 w-4 mr-2" />
              Download PDF
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Payment Dialog */}
      <Dialog open={paymentDialog.open} onOpenChange={(open) => setPaymentDialog({ ...paymentDialog, open })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{paymentDialog.isSplit ? 'Split Payment' : 'Record Payment'}</DialogTitle>
            <DialogDescription>
              Invoice: {paymentDialog.invoice?.invoiceNumber} • 
              Balance: {paymentDialog.invoice && formatPrice(paymentDialog.invoice.total - paymentDialog.invoice.paidAmount)}
            </DialogDescription>
          </DialogHeader>

          {paymentDialog.isSplit ? (
            <div className="space-y-4">
              {splitPayments.map((payment, index) => (
                <div key={index} className="grid grid-cols-2 gap-4 p-4 border rounded-lg">
                  <div className="space-y-2">
                    <Label>Amount</Label>
                    <Input
                      type="number"
                      value={payment.amount}
                      onChange={(e) => {
                        const newPayments = [...splitPayments];
                        newPayments[index].amount = parseFloat(e.target.value) || 0;
                        setSplitPayments(newPayments);
                      }}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Payment Method</Label>
                    <Select
                      value={payment.method}
                      onValueChange={(v: PaymentMethod) => {
                        const newPayments = [...splitPayments];
                        newPayments[index].method = v;
                        setSplitPayments(newPayments);
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="cash">Cash</SelectItem>
                        <SelectItem value="card">Credit/Debit Card</SelectItem>
                        <SelectItem value="transfer">Bank Transfer</SelectItem>
                        <SelectItem value="mobile">Mobile Money</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              ))}
              <Button
                variant="outline"
                className="w-full"
                onClick={() => setSplitPayments([...splitPayments, { amount: 0, method: 'card' }])}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Payment Method
              </Button>
              <div className="flex justify-between font-medium p-3 bg-muted rounded-lg">
                <span>Total</span>
                <span>{formatPrice(splitPayments.reduce((sum, p) => sum + p.amount, 0))}</span>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Amount</Label>
                <Input
                  type="number"
                  value={paymentForm.amount}
                  onChange={(e) => setPaymentForm({ ...paymentForm, amount: parseFloat(e.target.value) || 0 })}
                />
              </div>
              <div className="space-y-2">
                <Label>Payment Method</Label>
                <Select
                  value={paymentForm.method}
                  onValueChange={(v: PaymentMethod) => setPaymentForm({ ...paymentForm, method: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cash">
                      <div className="flex items-center gap-2">
                        <Banknote className="h-4 w-4" />
                        Cash
                      </div>
                    </SelectItem>
                    <SelectItem value="card">
                      <div className="flex items-center gap-2">
                        <CreditCard className="h-4 w-4" />
                        Credit/Debit Card
                      </div>
                    </SelectItem>
                    <SelectItem value="transfer">
                      <div className="flex items-center gap-2">
                        <Building2 className="h-4 w-4" />
                        Bank Transfer
                      </div>
                    </SelectItem>
                    <SelectItem value="mobile">
                      <div className="flex items-center gap-2">
                        <Smartphone className="h-4 w-4" />
                        Mobile Money
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Reference (Optional)</Label>
                <Input
                  value={paymentForm.reference}
                  onChange={(e) => setPaymentForm({ ...paymentForm, reference: e.target.value })}
                  placeholder="Transaction reference"
                />
              </div>
              <div className="space-y-2">
                <Label>Notes (Optional)</Label>
                <Textarea
                  value={paymentForm.notes}
                  onChange={(e) => setPaymentForm({ ...paymentForm, notes: e.target.value })}
                  placeholder="Additional notes..."
                  rows={2}
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setPaymentDialog({ open: false, invoice: null, isSplit: false })}>
              Cancel
            </Button>
            <Button onClick={handleRecordPayment}>
              <Check className="h-4 w-4 mr-2" />
              Record Payment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Refund Dialog */}
      <Dialog open={refundDialog.open} onOpenChange={(open) => setRefundDialog({ ...refundDialog, open })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Process Refund</DialogTitle>
            <DialogDescription>
              Invoice: {refundDialog.invoice?.invoiceNumber} • 
              Paid: {refundDialog.invoice && formatPrice(refundDialog.invoice.paidAmount)}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Refund Amount</Label>
              <Input
                type="number"
                value={refundForm.amount}
                onChange={(e) => setRefundForm({ ...refundForm, amount: parseFloat(e.target.value) || 0 })}
                max={refundDialog.invoice?.paidAmount}
              />
              <p className="text-xs text-muted-foreground">
                Maximum refundable: {refundDialog.invoice && formatPrice(refundDialog.invoice.paidAmount)}
              </p>
            </div>
            <div className="space-y-2">
              <Label>Reason for Refund</Label>
              <Textarea
                value={refundForm.reason}
                onChange={(e) => setRefundForm({ ...refundForm, reason: e.target.value })}
                placeholder="Enter reason for refund..."
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setRefundDialog({ open: false, invoice: null })}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleRefund}>
              <Undo2 className="h-4 w-4 mr-2" />
              Process Refund
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* New Invoice Dialog (placeholder) */}
      <Dialog open={newInvoiceDialog} onOpenChange={setNewInvoiceDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Invoice</DialogTitle>
            <DialogDescription>Generate a new invoice for a guest</DialogDescription>
          </DialogHeader>
          <div className="py-8 text-center text-muted-foreground">
            <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Invoice creation form would go here.</p>
            <p className="text-sm">Select guest, add line items, set due date, etc.</p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setNewInvoiceDialog(false)}>Cancel</Button>
            <Button onClick={() => {
              setNewInvoiceDialog(false);
              toast({ title: "Feature Coming Soon", description: "Invoice creation will be available soon" });
            }}>Create Invoice</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
