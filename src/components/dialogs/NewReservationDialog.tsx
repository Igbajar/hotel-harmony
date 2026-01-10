import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Textarea } from '@/components/ui/textarea';
import { CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { reservationSchema, type ReservationFormData } from '@/lib/validations';
import { useGuests } from '@/hooks/useGuests';
import { useRooms } from '@/hooks/useRooms';
import { useCreateReservation } from '@/hooks/useReservations';

interface NewReservationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function NewReservationDialog({ open, onOpenChange }: NewReservationDialogProps) {
  const { data: guests = [] } = useGuests();
  const { data: rooms = [] } = useRooms();
  const createReservation = useCreateReservation();
  
  const [checkIn, setCheckIn] = useState<Date | undefined>();
  const [checkOut, setCheckOut] = useState<Date | undefined>();

  const availableRooms = rooms.filter(room => room.status === 'available');

  const { register, handleSubmit, formState: { errors }, reset, setValue, watch, setError, clearErrors } = useForm<ReservationFormData>({
    resolver: zodResolver(reservationSchema),
    defaultValues: {
      guestId: '',
      roomId: '',
      adults: 1,
      children: 0,
      specialRequests: '',
    },
  });

  const watchGuestId = watch('guestId');
  const watchRoomId = watch('roomId');
  const selectedRoom = rooms.find(r => r.id === watchRoomId);

  const handleCheckInChange = (date: Date | undefined) => {
    setCheckIn(date);
    if (date) {
      setValue('checkIn', date);
      clearErrors('checkIn');
    }
  };

  const handleCheckOutChange = (date: Date | undefined) => {
    setCheckOut(date);
    if (date) {
      setValue('checkOut', date);
      clearErrors('checkOut');
    }
  };

  const onSubmit = async (data: ReservationFormData) => {
    if (!checkIn || !checkOut) {
      if (!checkIn) setError('checkIn', { message: 'Check-in date is required' });
      if (!checkOut) setError('checkOut', { message: 'Check-out date is required' });
      return;
    }

    if (!selectedRoom) return;

    try {
      await createReservation.mutateAsync({
        guestId: data.guestId,
        roomId: data.roomId,
        checkIn,
        checkOut,
        adults: data.adults,
        children: data.children,
        specialRequests: data.specialRequests,
        pricePerNight: selectedRoom.price_per_night,
      });
      handleClose();
    } catch {
      // Error handled by hook
    }
  };

  const handleClose = () => {
    onOpenChange(false);
    reset();
    setCheckIn(undefined);
    setCheckOut(undefined);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>New Reservation</DialogTitle>
          <DialogDescription>Create a new room reservation</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label>Guest *</Label>
            <Select value={watchGuestId} onValueChange={(value) => setValue('guestId', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select a guest" />
              </SelectTrigger>
              <SelectContent>
                {guests.map((guest) => (
                  <SelectItem key={guest.id} value={guest.id}>
                    {guest.first_name} {guest.last_name} - {guest.email}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.guestId && <p className="text-sm text-destructive">{errors.guestId.message}</p>}
          </div>

          <div className="space-y-2">
            <Label>Room *</Label>
            <Select value={watchRoomId} onValueChange={(value) => setValue('roomId', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select an available room" />
              </SelectTrigger>
              <SelectContent>
                {availableRooms.map((room) => (
                  <SelectItem key={room.id} value={room.id}>
                    Room {room.number} - {room.type} (${room.price_per_night}/night)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.roomId && <p className="text-sm text-destructive">{errors.roomId.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Check-in Date *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !checkIn && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {checkIn ? format(checkIn, "PPP") : "Select date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={checkIn}
                    onSelect={handleCheckInChange}
                    disabled={(date) => date < new Date()}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              {errors.checkIn && <p className="text-sm text-destructive">{errors.checkIn.message}</p>}
            </div>
            <div className="space-y-2">
              <Label>Check-out Date *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !checkOut && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {checkOut ? format(checkOut, "PPP") : "Select date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={checkOut}
                    onSelect={handleCheckOutChange}
                    disabled={(date) => date < (checkIn || new Date())}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              {errors.checkOut && <p className="text-sm text-destructive">{errors.checkOut.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="adults">Adults</Label>
              <Input
                id="adults"
                type="number"
                min="1"
                {...register('adults')}
              />
              {errors.adults && <p className="text-sm text-destructive">{errors.adults.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="children">Children</Label>
              <Input
                id="children"
                type="number"
                min="0"
                {...register('children')}
              />
              {errors.children && <p className="text-sm text-destructive">{errors.children.message}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="specialRequests">Special Requests</Label>
            <Textarea
              id="specialRequests"
              placeholder="Any special requests or notes..."
              {...register('specialRequests')}
              rows={2}
            />
            {errors.specialRequests && <p className="text-sm text-destructive">{errors.specialRequests.message}</p>}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>Cancel</Button>
            <Button type="submit" disabled={createReservation.isPending}>
              {createReservation.isPending ? 'Creating...' : 'Create Reservation'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
