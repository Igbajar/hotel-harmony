import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Trash2 } from 'lucide-react';
import { useCurrency } from '@/contexts/CurrencyContext';
import { invoiceSchema, type InvoiceFormData } from '@/lib/validations';
import { useGuests } from '@/hooks/useGuests';
import { useReservations } from '@/hooks/useReservations';
import { useCreateInvoice } from '@/hooks/useInvoices';

interface NewInvoiceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface InvoiceItem {
  description: string;
  quantity: number;
  unitPrice: number;
}

export function NewInvoiceDialog({ open, onOpenChange }: NewInvoiceDialogProps) {
  const { formatPrice } = useCurrency();
  const { data: guests = [] } = useGuests();
  const { data: reservations = [] } = useReservations();
  const createInvoice = useCreateInvoice();

  const [items, setItems] = useState<InvoiceItem[]>([
    { description: '', quantity: 1, unitPrice: 0 }
  ]);

  const { register, handleSubmit, formState: { errors }, reset, setValue, watch } = useForm<InvoiceFormData>({
    resolver: zodResolver(invoiceSchema),
    defaultValues: {
      guestId: '',
      reservationId: '',
      taxRate: 12,
      discount: 0,
      notes: '',
      items: [{ description: '', quantity: 1, unitPrice: 0 }],
    },
  });

  const watchGuestId = watch('guestId');
  const watchReservationId = watch('reservationId');
  const watchTaxRate = watch('taxRate');
  const watchDiscount = watch('discount');

  const guestReservations = reservations.filter(r => r.guest_id === watchGuestId);

  const addItem = () => {
    const newItems = [...items, { description: '', quantity: 1, unitPrice: 0 }];
    setItems(newItems);
    setValue('items', newItems);
  };

  const removeItem = (index: number) => {
    if (items.length > 1) {
      const newItems = items.filter((_, i) => i !== index);
      setItems(newItems);
      setValue('items', newItems);
    }
  };

  const updateItem = (index: number, field: keyof InvoiceItem, value: string | number) => {
    const newItems = items.map((item, i) => 
      i === index ? { ...item, [field]: value } : item
    );
    setItems(newItems);
    setValue('items', newItems);
  };

  const subtotal = items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
  const taxAmount = subtotal * (watchTaxRate / 100);
  const discount = watchDiscount || 0;
  const total = subtotal + taxAmount - discount;

  const onSubmit = async (data: InvoiceFormData) => {
    try {
      await createInvoice.mutateAsync({
        guestId: data.guestId,
        reservationId: data.reservationId || undefined,
        taxRate: data.taxRate,
        discount: data.discount,
        notes: data.notes,
        items: items.filter(item => item.description && item.unitPrice > 0),
      });
      handleClose();
    } catch {
      // Error handled by hook
    }
  };

  const handleClose = () => {
    onOpenChange(false);
    reset();
    setItems([{ description: '', quantity: 1, unitPrice: 0 }]);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[650px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Invoice</DialogTitle>
          <DialogDescription>Generate an invoice for a guest</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Guest *</Label>
              <Select 
                value={watchGuestId} 
                onValueChange={(value) => {
                  setValue('guestId', value);
                  setValue('reservationId', '');
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a guest" />
                </SelectTrigger>
                <SelectContent>
                  {guests.map((guest) => (
                    <SelectItem key={guest.id} value={guest.id}>
                      {guest.first_name} {guest.last_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.guestId && <p className="text-sm text-destructive">{errors.guestId.message}</p>}
            </div>
            <div className="space-y-2">
              <Label>Reservation (Optional)</Label>
              <Select 
                value={watchReservationId} 
                onValueChange={(value) => setValue('reservationId', value)}
                disabled={!watchGuestId}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Link to reservation" />
                </SelectTrigger>
                <SelectContent>
                  {guestReservations.map((res) => (
                    <SelectItem key={res.id} value={res.id}>
                      Room {res.rooms?.number} - {res.status}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Invoice Items *</Label>
              <Button type="button" variant="outline" size="sm" onClick={addItem} className="gap-1">
                <Plus className="h-3 w-3" />
                Add Item
              </Button>
            </div>
            <div className="space-y-2">
              {items.map((item, index) => (
                <div key={index} className="grid grid-cols-12 gap-2 items-end">
                  <div className="col-span-5">
                    {index === 0 && <Label className="text-xs text-muted-foreground">Description</Label>}
                    <Input
                      placeholder="Item description"
                      value={item.description}
                      onChange={(e) => updateItem(index, 'description', e.target.value)}
                    />
                  </div>
                  <div className="col-span-2">
                    {index === 0 && <Label className="text-xs text-muted-foreground">Qty</Label>}
                    <Input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value) || 1)}
                    />
                  </div>
                  <div className="col-span-3">
                    {index === 0 && <Label className="text-xs text-muted-foreground">Unit Price</Label>}
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="0.00"
                      value={item.unitPrice || ''}
                      onChange={(e) => updateItem(index, 'unitPrice', parseFloat(e.target.value) || 0)}
                    />
                  </div>
                  <div className="col-span-2 flex items-center gap-2">
                    <span className="text-sm font-medium">{formatPrice(item.quantity * item.unitPrice)}</span>
                    {items.length > 1 && (
                      <Button type="button" variant="ghost" size="icon" className="h-8 w-8" onClick={() => removeItem(index)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
            {errors.items && <p className="text-sm text-destructive">{errors.items.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="taxRate">Tax Rate (%)</Label>
              <Input
                id="taxRate"
                type="number"
                min="0"
                max="100"
                {...register('taxRate')}
              />
              {errors.taxRate && <p className="text-sm text-destructive">{errors.taxRate.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="discount">Discount ($)</Label>
              <Input
                id="discount"
                type="number"
                min="0"
                {...register('discount')}
              />
              {errors.discount && <p className="text-sm text-destructive">{errors.discount.message}</p>}
            </div>
          </div>

          <div className="rounded-lg border border-border p-4 space-y-2 bg-muted/30">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Subtotal</span>
              <span>{formatPrice(subtotal)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Tax ({watchTaxRate}%)</span>
              <span>{formatPrice(taxAmount)}</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Discount</span>
                <span className="text-destructive">-{formatPrice(discount)}</span>
              </div>
            )}
            <div className="flex justify-between font-bold text-lg pt-2 border-t border-border">
              <span>Total</span>
              <span>{formatPrice(total)}</span>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              placeholder="Additional notes..."
              {...register('notes')}
              rows={2}
            />
            {errors.notes && <p className="text-sm text-destructive">{errors.notes.message}</p>}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>Cancel</Button>
            <Button type="submit" disabled={createInvoice.isPending}>
              {createInvoice.isPending ? 'Creating...' : 'Create Invoice'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
