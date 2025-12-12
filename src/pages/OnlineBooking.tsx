import { useState, useMemo } from 'react';
import { format, differenceInDays, addDays, isBefore, isAfter, isSameDay } from 'date-fns';
import { Calendar as CalendarIcon, Users, CreditCard, Check, ChevronRight, ChevronLeft, Bed, Wifi, Tv, Wind, Wine, Bath, UtensilsCrossed, Star, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { mockRooms, mockReservations } from '@/data/mockData';
import { useCurrency } from '@/contexts/CurrencyContext';
import { toast } from '@/hooks/use-toast';
import type { RoomType } from '@/types/hotel';
import { DateRange } from 'react-day-picker';

const amenityIcons: Record<string, React.ReactNode> = {
  'WiFi': <Wifi className="h-4 w-4" />,
  'TV': <Tv className="h-4 w-4" />,
  'AC': <Wind className="h-4 w-4" />,
  'Mini Bar': <Wine className="h-4 w-4" />,
  'Jacuzzi': <Bath className="h-4 w-4" />,
  'Butler Service': <UtensilsCrossed className="h-4 w-4" />,
};

const roomTypeLabels: Record<RoomType, string> = {
  single: 'Single Room',
  double: 'Double Room',
  suite: 'Suite',
  deluxe: 'Deluxe Room',
  presidential: 'Presidential Suite',
};

const steps = [
  { id: 1, name: 'Dates & Guests', icon: CalendarIcon },
  { id: 2, name: 'Select Room', icon: Bed },
  { id: 3, name: 'Guest Details', icon: Users },
  { id: 4, name: 'Payment', icon: CreditCard },
  { id: 5, name: 'Confirmation', icon: Check },
];

interface BookingFormData {
  dateRange: DateRange | undefined;
  adults: number;
  children: number;
  roomId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  specialRequests: string;
  cardNumber: string;
  expiryDate: string;
  cvv: string;
  cardName: string;
  agreeTerms: boolean;
}

export default function OnlineBooking() {
  const { formatPrice } = useCurrency();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<BookingFormData>({
    dateRange: undefined,
    adults: 2,
    children: 0,
    roomId: '',
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    specialRequests: '',
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardName: '',
    agreeTerms: false,
  });
  const [bookingConfirmed, setBookingConfirmed] = useState(false);
  const [confirmationNumber, setConfirmationNumber] = useState('');

  // Get available rooms based on dates
  const availableRooms = useMemo(() => {
    if (!formData.dateRange?.from || !formData.dateRange?.to) return [];
    
    const checkIn = formData.dateRange.from;
    const checkOut = formData.dateRange.to;
    
    return mockRooms.filter(room => {
      // Only show rooms that are not under maintenance
      if (room.status === 'maintenance') return false;
      
      // Check if room can accommodate guests
      if (room.maxOccupancy < formData.adults + formData.children) return false;
      
      // Check for overlapping reservations
      const hasConflict = mockReservations.some(res => {
        if (res.roomId !== room.id) return false;
        if (res.status === 'cancelled' || res.status === 'checked-out') return false;
        
        const resCheckIn = new Date(res.checkIn);
        const resCheckOut = new Date(res.checkOut);
        
        return !(isAfter(checkIn, resCheckOut) || isBefore(checkOut, resCheckIn) || isSameDay(checkIn, resCheckOut));
      });
      
      return !hasConflict;
    });
  }, [formData.dateRange, formData.adults, formData.children]);

  const selectedRoom = mockRooms.find(r => r.id === formData.roomId);
  const nights = formData.dateRange?.from && formData.dateRange?.to 
    ? differenceInDays(formData.dateRange.to, formData.dateRange.from) 
    : 0;
  const subtotal = selectedRoom ? selectedRoom.pricePerNight * nights : 0;
  const taxes = subtotal * 0.12;
  const total = subtotal + taxes;

  const updateFormData = (updates: Partial<BookingFormData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return formData.dateRange?.from && formData.dateRange?.to && formData.adults > 0;
      case 2:
        return formData.roomId !== '';
      case 3:
        return formData.firstName && formData.lastName && formData.email && formData.phone;
      case 4:
        return formData.cardNumber && formData.expiryDate && formData.cvv && formData.cardName && formData.agreeTerms;
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (currentStep < 5) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleConfirmBooking = () => {
    const confNumber = `BK${Date.now().toString().slice(-8)}`;
    setConfirmationNumber(confNumber);
    setBookingConfirmed(true);
    setCurrentStep(5);
    toast({
      title: "Booking Confirmed!",
      description: `Your reservation ${confNumber} has been successfully created.`,
    });
  };

  // Disable dates that are in the past
  const disabledDays = { before: new Date() };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30">
      {/* Hero Section */}
      <div className="relative bg-primary/5 border-b">
        <div className="container mx-auto px-4 py-12">
          <div className="text-center max-w-2xl mx-auto">
            <Badge variant="secondary" className="mb-4">
              <Star className="h-3 w-3 mr-1 fill-current" />
              5-Star Luxury Experience
            </Badge>
            <h1 className="text-4xl font-bold tracking-tight mb-3">Book Your Stay</h1>
            <p className="text-muted-foreground">
              Experience unparalleled luxury and comfort at our award-winning hotel
            </p>
            <div className="flex items-center justify-center gap-2 mt-4 text-sm text-muted-foreground">
              <MapPin className="h-4 w-4" />
              <span>123 Luxury Avenue, Downtown</span>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-center">
            {steps.map((step, index) => {
              const StepIcon = step.icon;
              const isCompleted = currentStep > step.id;
              const isCurrent = currentStep === step.id;
              
              return (
                <div key={step.id} className="flex items-center">
                  <div className="flex flex-col items-center">
                    <div className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all",
                      isCompleted && "bg-primary border-primary text-primary-foreground",
                      isCurrent && "border-primary text-primary",
                      !isCompleted && !isCurrent && "border-muted-foreground/30 text-muted-foreground/50"
                    )}>
                      {isCompleted ? <Check className="h-5 w-5" /> : <StepIcon className="h-5 w-5" />}
                    </div>
                    <span className={cn(
                      "text-xs mt-2 font-medium hidden sm:block",
                      isCurrent && "text-primary",
                      !isCurrent && "text-muted-foreground"
                    )}>
                      {step.name}
                    </span>
                  </div>
                  {index < steps.length - 1 && (
                    <div className={cn(
                      "w-12 sm:w-24 h-0.5 mx-2",
                      isCompleted ? "bg-primary" : "bg-muted-foreground/20"
                    )} />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Step 1: Dates & Guests */}
            {currentStep === 1 && (
              <Card>
                <CardHeader>
                  <CardTitle>Select Your Dates & Guests</CardTitle>
                  <CardDescription>Choose your check-in and check-out dates</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label>Stay Dates</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal h-12",
                            !formData.dateRange && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {formData.dateRange?.from ? (
                            formData.dateRange.to ? (
                              <>
                                {format(formData.dateRange.from, "MMM dd, yyyy")} - {format(formData.dateRange.to, "MMM dd, yyyy")}
                                <Badge variant="secondary" className="ml-auto">
                                  {differenceInDays(formData.dateRange.to, formData.dateRange.from)} nights
                                </Badge>
                              </>
                            ) : (
                              format(formData.dateRange.from, "MMM dd, yyyy")
                            )
                          ) : (
                            <span>Select check-in and check-out dates</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          initialFocus
                          mode="range"
                          defaultMonth={formData.dateRange?.from}
                          selected={formData.dateRange}
                          onSelect={(range) => updateFormData({ dateRange: range })}
                          numberOfMonths={2}
                          disabled={disabledDays}
                          className="pointer-events-auto"
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Adults</Label>
                      <Select
                        value={formData.adults.toString()}
                        onValueChange={(v) => updateFormData({ adults: parseInt(v) })}
                      >
                        <SelectTrigger className="h-12">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {[1, 2, 3, 4, 5, 6].map(n => (
                            <SelectItem key={n} value={n.toString()}>{n} Adult{n > 1 ? 's' : ''}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Children</Label>
                      <Select
                        value={formData.children.toString()}
                        onValueChange={(v) => updateFormData({ children: parseInt(v) })}
                      >
                        <SelectTrigger className="h-12">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {[0, 1, 2, 3, 4].map(n => (
                            <SelectItem key={n} value={n.toString()}>{n} Child{n !== 1 ? 'ren' : ''}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Step 2: Select Room */}
            {currentStep === 2 && (
              <Card>
                <CardHeader>
                  <CardTitle>Select Your Room</CardTitle>
                  <CardDescription>
                    {availableRooms.length} rooms available for your dates
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {availableRooms.length === 0 ? (
                    <div className="text-center py-12">
                      <Bed className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                      <h3 className="font-semibold mb-2">No Rooms Available</h3>
                      <p className="text-muted-foreground text-sm">
                        Unfortunately, no rooms are available for your selected dates and guest count.
                        Please try different dates.
                      </p>
                      <Button variant="outline" className="mt-4" onClick={handleBack}>
                        Change Dates
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {availableRooms.map(room => (
                        <div
                          key={room.id}
                          onClick={() => updateFormData({ roomId: room.id })}
                          className={cn(
                            "border rounded-lg p-4 cursor-pointer transition-all hover:border-primary/50",
                            formData.roomId === room.id && "border-primary bg-primary/5 ring-1 ring-primary"
                          )}
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <h3 className="font-semibold">{roomTypeLabels[room.type]}</h3>
                                <Badge variant="outline">Room {room.number}</Badge>
                              </div>
                              <p className="text-sm text-muted-foreground mb-3">
                                Floor {room.floor} • Up to {room.maxOccupancy} guests
                              </p>
                              <div className="flex flex-wrap gap-2">
                                {room.amenities.map(amenity => (
                                  <Badge key={amenity} variant="secondary" className="text-xs">
                                    {amenityIcons[amenity] || null}
                                    <span className="ml-1">{amenity}</span>
                                  </Badge>
                                ))}
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-2xl font-bold">{formatPrice(room.pricePerNight)}</div>
                              <div className="text-xs text-muted-foreground">per night</div>
                              {nights > 0 && (
                                <div className="text-sm text-muted-foreground mt-1">
                                  {formatPrice(room.pricePerNight * nights)} total
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Step 3: Guest Details */}
            {currentStep === 3 && (
              <Card>
                <CardHeader>
                  <CardTitle>Guest Details</CardTitle>
                  <CardDescription>Please provide the primary guest information</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">First Name *</Label>
                      <Input
                        id="firstName"
                        value={formData.firstName}
                        onChange={(e) => updateFormData({ firstName: e.target.value })}
                        placeholder="John"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last Name *</Label>
                      <Input
                        id="lastName"
                        value={formData.lastName}
                        onChange={(e) => updateFormData({ lastName: e.target.value })}
                        placeholder="Smith"
                      />
                    </div>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => updateFormData({ email: e.target.value })}
                        placeholder="john@example.com"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone *</Label>
                      <Input
                        id="phone"
                        value={formData.phone}
                        onChange={(e) => updateFormData({ phone: e.target.value })}
                        placeholder="+1 555-0100"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="specialRequests">Special Requests (Optional)</Label>
                    <Textarea
                      id="specialRequests"
                      value={formData.specialRequests}
                      onChange={(e) => updateFormData({ specialRequests: e.target.value })}
                      placeholder="Early check-in, room preferences, dietary requirements..."
                      rows={3}
                    />
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Step 4: Payment */}
            {currentStep === 4 && (
              <Card>
                <CardHeader>
                  <CardTitle>Payment Details</CardTitle>
                  <CardDescription>Your payment information is secure and encrypted</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="cardName">Name on Card *</Label>
                    <Input
                      id="cardName"
                      value={formData.cardName}
                      onChange={(e) => updateFormData({ cardName: e.target.value })}
                      placeholder="John Smith"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cardNumber">Card Number *</Label>
                    <Input
                      id="cardNumber"
                      value={formData.cardNumber}
                      onChange={(e) => updateFormData({ cardNumber: e.target.value.replace(/\D/g, '').slice(0, 16) })}
                      placeholder="1234 5678 9012 3456"
                    />
                  </div>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="expiryDate">Expiry Date *</Label>
                      <Input
                        id="expiryDate"
                        value={formData.expiryDate}
                        onChange={(e) => {
                          let value = e.target.value.replace(/\D/g, '');
                          if (value.length >= 2) value = value.slice(0, 2) + '/' + value.slice(2, 4);
                          updateFormData({ expiryDate: value });
                        }}
                        placeholder="MM/YY"
                        maxLength={5}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="cvv">CVV *</Label>
                      <Input
                        id="cvv"
                        value={formData.cvv}
                        onChange={(e) => updateFormData({ cvv: e.target.value.replace(/\D/g, '').slice(0, 4) })}
                        placeholder="123"
                        maxLength={4}
                      />
                    </div>
                  </div>
                  <Separator className="my-4" />
                  <div className="flex items-start space-x-3">
                    <Checkbox
                      id="terms"
                      checked={formData.agreeTerms}
                      onCheckedChange={(checked) => updateFormData({ agreeTerms: checked as boolean })}
                    />
                    <label htmlFor="terms" className="text-sm text-muted-foreground leading-relaxed cursor-pointer">
                      I agree to the hotel's terms and conditions, cancellation policy, and privacy policy. 
                      I understand that my card will be charged upon confirmation.
                    </label>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Step 5: Confirmation */}
            {currentStep === 5 && bookingConfirmed && (
              <Card className="border-primary/20">
                <CardContent className="pt-8 text-center">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Check className="h-8 w-8 text-primary" />
                  </div>
                  <h2 className="text-2xl font-bold mb-2">Booking Confirmed!</h2>
                  <p className="text-muted-foreground mb-6">
                    Your reservation has been successfully created
                  </p>
                  <div className="bg-muted/50 rounded-lg p-4 inline-block mb-6">
                    <div className="text-sm text-muted-foreground">Confirmation Number</div>
                    <div className="text-2xl font-mono font-bold">{confirmationNumber}</div>
                  </div>
                  <div className="text-left max-w-sm mx-auto space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Guest</span>
                      <span className="font-medium">{formData.firstName} {formData.lastName}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Room</span>
                      <span className="font-medium">{selectedRoom && roomTypeLabels[selectedRoom.type]} ({selectedRoom?.number})</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Check-in</span>
                      <span className="font-medium">{formData.dateRange?.from && format(formData.dateRange.from, 'MMM dd, yyyy')}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Check-out</span>
                      <span className="font-medium">{formData.dateRange?.to && format(formData.dateRange.to, 'MMM dd, yyyy')}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between font-semibold">
                      <span>Total Paid</span>
                      <span>{formatPrice(total)}</span>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mt-6">
                    A confirmation email has been sent to {formData.email}
                  </p>
                  <Button className="mt-6" onClick={() => window.location.reload()}>
                    Make Another Reservation
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Navigation Buttons */}
            {currentStep < 5 && (
              <div className="flex justify-between mt-6">
                <Button
                  variant="outline"
                  onClick={handleBack}
                  disabled={currentStep === 1}
                >
                  <ChevronLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
                {currentStep === 4 ? (
                  <Button onClick={handleConfirmBooking} disabled={!canProceed()}>
                    Confirm Booking
                    <Check className="h-4 w-4 ml-2" />
                  </Button>
                ) : (
                  <Button onClick={handleNext} disabled={!canProceed()}>
                    Continue
                    <ChevronRight className="h-4 w-4 ml-2" />
                  </Button>
                )}
              </div>
            )}
          </div>

          {/* Booking Summary Sidebar */}
          {currentStep < 5 && (
            <div className="lg:col-span-1">
              <Card className="sticky top-4">
                <CardHeader>
                  <CardTitle className="text-lg">Booking Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {formData.dateRange?.from && formData.dateRange?.to ? (
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Check-in</span>
                        <span className="font-medium">{format(formData.dateRange.from, 'MMM dd, yyyy')}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Check-out</span>
                        <span className="font-medium">{format(formData.dateRange.to, 'MMM dd, yyyy')}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Duration</span>
                        <span className="font-medium">{nights} night{nights !== 1 ? 's' : ''}</span>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">Select your dates to see pricing</p>
                  )}

                  <Separator />

                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Guests</span>
                    <span className="font-medium">
                      {formData.adults} adult{formData.adults !== 1 ? 's' : ''}
                      {formData.children > 0 && `, ${formData.children} child${formData.children !== 1 ? 'ren' : ''}`}
                    </span>
                  </div>

                  {selectedRoom && (
                    <>
                      <Separator />
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-muted-foreground">Room</span>
                          <span className="font-medium">{roomTypeLabels[selectedRoom.type]}</span>
                        </div>
                        <div className="text-xs text-muted-foreground text-right">
                          Room {selectedRoom.number} • Floor {selectedRoom.floor}
                        </div>
                      </div>
                      
                      <Separator />
                      
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">
                            {formatPrice(selectedRoom.pricePerNight)} × {nights} nights
                          </span>
                          <span>{formatPrice(subtotal)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Taxes & Fees (12%)</span>
                          <span>{formatPrice(taxes)}</span>
                        </div>
                        <Separator />
                        <div className="flex justify-between font-semibold text-lg">
                          <span>Total</span>
                          <span>{formatPrice(total)}</span>
                        </div>
                      </div>
                    </>
                  )}

                  {!selectedRoom && nights > 0 && (
                    <p className="text-sm text-muted-foreground">Select a room to see total price</p>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
