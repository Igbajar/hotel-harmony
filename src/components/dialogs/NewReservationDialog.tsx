import { useState } from 'react';
import { format } from 'date-fns';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/hooks/use-toast';
import { mockGuests, mockRooms } from '@/data/mockData';
import { CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface NewReservationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function NewReservationDialog({ open, onOpenChange }: NewReservationDialogProps) {
  const [formData, setFormData] = useState({
    guestId: '',
    roomId: '',
    checkIn: undefined as Date | undefined,
    checkOut: undefined as Date | undefined,
    adults: '1',
    children: '0',
    specialRequests: '',
  });

  const availableRooms = mockRooms.filter(room => room.status === 'available');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.guestId || !formData.roomId || !formData.checkIn || !formData.checkOut) {
      toast({ title: "Missing Fields", description: "Please fill in all required fields", variant: "destructive" });
      return;
    }

    if (formData.checkOut <= formData.checkIn) {
      toast({ title: "Invalid Dates", description: "Check-out must be after check-in", variant: "destructive" });
      return;
    }

    const guest = mockGuests.find(g => g.id === formData.guestId);
    const room = mockRooms.find(r => r.id === formData.roomId);
    
    toast({ 
      title: "Reservation Created", 
      description: `Reservation for ${guest?.firstName} ${guest?.lastName} in Room ${room?.number}` 
    });
    
    onOpenChange(false);
    setFormData({
      guestId: '',
      roomId: '',
      checkIn: undefined,
      checkOut: undefined,
      adults: '1',
      children: '0',
      specialRequests: '',
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>New Reservation</DialogTitle>
          <DialogDescription>Create a new room reservation</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Guest *</Label>
            <Select value={formData.guestId} onValueChange={(value) => setFormData(prev => ({ ...prev, guestId: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Select a guest" />
              </SelectTrigger>
              <SelectContent>
                {mockGuests.map((guest) => (
                  <SelectItem key={guest.id} value={guest.id}>
                    {guest.firstName} {guest.lastName} - {guest.email}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Room *</Label>
            <Select value={formData.roomId} onValueChange={(value) => setFormData(prev => ({ ...prev, roomId: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Select an available room" />
              </SelectTrigger>
              <SelectContent>
                {availableRooms.map((room) => (
                  <SelectItem key={room.id} value={room.id}>
                    Room {room.number} - {room.type} (${room.pricePerNight}/night)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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
                      !formData.checkIn && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.checkIn ? format(formData.checkIn, "PPP") : "Select date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={formData.checkIn}
                    onSelect={(date) => setFormData(prev => ({ ...prev, checkIn: date }))}
                    disabled={(date) => date < new Date()}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div className="space-y-2">
              <Label>Check-out Date *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !formData.checkOut && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.checkOut ? format(formData.checkOut, "PPP") : "Select date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={formData.checkOut}
                    onSelect={(date) => setFormData(prev => ({ ...prev, checkOut: date }))}
                    disabled={(date) => date < (formData.checkIn || new Date())}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="adults">Adults</Label>
              <Input
                id="adults"
                type="number"
                min="1"
                value={formData.adults}
                onChange={(e) => setFormData(prev => ({ ...prev, adults: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="children">Children</Label>
              <Input
                id="children"
                type="number"
                min="0"
                value={formData.children}
                onChange={(e) => setFormData(prev => ({ ...prev, children: e.target.value }))}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="requests">Special Requests</Label>
            <Textarea
              id="requests"
              placeholder="Any special requests or notes..."
              value={formData.specialRequests}
              onChange={(e) => setFormData(prev => ({ ...prev, specialRequests: e.target.value }))}
              rows={2}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit">Create Reservation</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
