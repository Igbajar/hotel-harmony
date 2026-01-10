import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { guestSchema, type GuestFormData } from '@/lib/validations';
import { useCreateGuest } from '@/hooks/useGuests';

interface AddGuestDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddGuestDialog({ open, onOpenChange }: AddGuestDialogProps) {
  const createGuest = useCreateGuest();
  
  const { register, handleSubmit, formState: { errors }, reset, setValue, watch } = useForm<GuestFormData>({
    resolver: zodResolver(guestSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      idType: '',
      idNumber: '',
      nationality: '',
      address: '',
      vip: false,
      notes: '',
    },
  });

  const vipValue = watch('vip');

  const onSubmit = async (data: GuestFormData) => {
    try {
      await createGuest.mutateAsync(data);
      onOpenChange(false);
      reset();
    } catch {
      // Error handled by hook
    }
  };

  const handleClose = () => {
    onOpenChange(false);
    reset();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add New Guest</DialogTitle>
          <DialogDescription>Register a new guest in the system</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name *</Label>
              <Input
                id="firstName"
                placeholder="John"
                {...register('firstName')}
              />
              {errors.firstName && <p className="text-sm text-destructive">{errors.firstName.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name *</Label>
              <Input
                id="lastName"
                placeholder="Doe"
                {...register('lastName')}
              />
              {errors.lastName && <p className="text-sm text-destructive">{errors.lastName.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                placeholder="john@example.com"
                {...register('email')}
              />
              {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone *</Label>
              <Input
                id="phone"
                placeholder="+1 234 567 890"
                {...register('phone')}
              />
              {errors.phone && <p className="text-sm text-destructive">{errors.phone.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="idNumber">ID Number</Label>
              <Input
                id="idNumber"
                placeholder="Passport/ID"
                {...register('idNumber')}
              />
              {errors.idNumber && <p className="text-sm text-destructive">{errors.idNumber.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="nationality">Nationality</Label>
              <Input
                id="nationality"
                placeholder="Country"
                {...register('nationality')}
              />
              {errors.nationality && <p className="text-sm text-destructive">{errors.nationality.message}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Address</Label>
            <Textarea
              id="address"
              placeholder="Full address"
              {...register('address')}
              rows={2}
            />
            {errors.address && <p className="text-sm text-destructive">{errors.address.message}</p>}
          </div>

          <div className="flex items-center justify-between rounded-lg border border-border p-4">
            <div>
              <Label htmlFor="vip" className="font-medium">VIP Guest</Label>
              <p className="text-sm text-muted-foreground">Mark this guest as a VIP member</p>
            </div>
            <Switch
              id="vip"
              checked={vipValue}
              onCheckedChange={(checked) => setValue('vip', checked)}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>Cancel</Button>
            <Button type="submit" disabled={createGuest.isPending}>
              {createGuest.isPending ? 'Adding...' : 'Add Guest'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
