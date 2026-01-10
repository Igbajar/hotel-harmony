import { z } from 'zod';

// Room validation schema
export const roomSchema = z.object({
  number: z.string().min(1, 'Room number is required').max(10, 'Room number must be less than 10 characters'),
  floor: z.coerce.number().min(1, 'Floor must be at least 1').max(100, 'Floor must be less than 100'),
  type: z.enum(['single', 'double', 'suite', 'deluxe', 'presidential']),
  status: z.enum(['available', 'occupied', 'maintenance', 'cleaning']),
  pricePerNight: z.coerce.number().min(1, 'Price must be at least $1').max(100000, 'Price must be less than $100,000'),
  maxOccupancy: z.coerce.number().min(1, 'Max occupancy must be at least 1').max(20, 'Max occupancy must be less than 20'),
  amenities: z.array(z.string()),
  description: z.string().max(500, 'Description must be less than 500 characters').optional(),
});

export type RoomFormData = z.infer<typeof roomSchema>;

// Guest validation schema
export const guestSchema = z.object({
  firstName: z.string().min(1, 'First name is required').max(50, 'First name must be less than 50 characters').trim(),
  lastName: z.string().min(1, 'Last name is required').max(50, 'Last name must be less than 50 characters').trim(),
  email: z.string().min(1, 'Email is required').email('Invalid email address').max(100, 'Email must be less than 100 characters').trim(),
  phone: z.string().min(1, 'Phone is required').max(20, 'Phone must be less than 20 characters').trim(),
  idType: z.string().max(50, 'ID type must be less than 50 characters').optional(),
  idNumber: z.string().max(50, 'ID number must be less than 50 characters').optional(),
  nationality: z.string().max(50, 'Nationality must be less than 50 characters').optional(),
  address: z.string().max(200, 'Address must be less than 200 characters').optional(),
  vip: z.boolean().default(false),
  notes: z.string().max(500, 'Notes must be less than 500 characters').optional(),
});

export type GuestFormData = z.infer<typeof guestSchema>;

// Reservation validation schema
export const reservationSchema = z.object({
  guestId: z.string().min(1, 'Guest is required'),
  roomId: z.string().min(1, 'Room is required'),
  checkIn: z.date({ required_error: 'Check-in date is required' }),
  checkOut: z.date({ required_error: 'Check-out date is required' }),
  adults: z.coerce.number().min(1, 'At least 1 adult is required').max(10, 'Maximum 10 adults'),
  children: z.coerce.number().min(0, 'Children cannot be negative').max(10, 'Maximum 10 children'),
  specialRequests: z.string().max(500, 'Special requests must be less than 500 characters').optional(),
}).refine((data) => data.checkOut > data.checkIn, {
  message: 'Check-out date must be after check-in date',
  path: ['checkOut'],
});

export type ReservationFormData = z.infer<typeof reservationSchema>;

// Invoice item validation schema
export const invoiceItemSchema = z.object({
  description: z.string().min(1, 'Description is required').max(100, 'Description must be less than 100 characters'),
  quantity: z.coerce.number().min(1, 'Quantity must be at least 1'),
  unitPrice: z.coerce.number().min(0.01, 'Unit price must be at least $0.01'),
});

// Invoice validation schema
export const invoiceSchema = z.object({
  guestId: z.string().min(1, 'Guest is required'),
  reservationId: z.string().optional(),
  taxRate: z.coerce.number().min(0, 'Tax rate cannot be negative').max(100, 'Tax rate cannot exceed 100%'),
  discount: z.coerce.number().min(0, 'Discount cannot be negative'),
  notes: z.string().max(500, 'Notes must be less than 500 characters').optional(),
  items: z.array(invoiceItemSchema).min(1, 'At least one item is required'),
});

export type InvoiceFormData = z.infer<typeof invoiceSchema>;

// Campaign validation schema
export const campaignSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name must be less than 100 characters'),
  description: z.string().max(500, 'Description must be less than 500 characters').optional(),
  type: z.string().min(1, 'Type is required'),
  status: z.enum(['draft', 'active', 'paused', 'completed', 'cancelled']),
  startDate: z.date().optional(),
  endDate: z.date().optional(),
  budget: z.coerce.number().min(0, 'Budget cannot be negative').optional(),
  targetAudience: z.string().max(200, 'Target audience must be less than 200 characters').optional(),
});

export type CampaignFormData = z.infer<typeof campaignSchema>;

// Promotion validation schema
export const promotionSchema = z.object({
  code: z.string().min(1, 'Promo code is required').max(20, 'Code must be less than 20 characters').toUpperCase(),
  name: z.string().min(1, 'Name is required').max(100, 'Name must be less than 100 characters'),
  description: z.string().max(500, 'Description must be less than 500 characters').optional(),
  discountType: z.enum(['percentage', 'fixed']),
  discountValue: z.coerce.number().min(0.01, 'Discount value must be greater than 0'),
  minStay: z.coerce.number().min(1, 'Minimum stay must be at least 1 night').optional(),
  maxUses: z.coerce.number().min(1, 'Maximum uses must be at least 1').optional(),
  startDate: z.date({ required_error: 'Start date is required' }),
  endDate: z.date({ required_error: 'End date is required' }),
  active: z.boolean().default(true),
  roomTypes: z.array(z.enum(['single', 'double', 'suite', 'deluxe', 'presidential'])).optional(),
}).refine((data) => data.endDate > data.startDate, {
  message: 'End date must be after start date',
  path: ['endDate'],
}).refine((data) => {
  if (data.discountType === 'percentage') {
    return data.discountValue <= 100;
  }
  return true;
}, {
  message: 'Percentage discount cannot exceed 100%',
  path: ['discountValue'],
});

export type PromotionFormData = z.infer<typeof promotionSchema>;

// Mobile app settings validation schema
export const mobileAppSettingsSchema = z.object({
  pushNotifications: z.boolean(),
  emailNotifications: z.boolean(),
  smsNotifications: z.boolean(),
  darkMode: z.boolean(),
  language: z.string(),
  autoSync: z.boolean(),
  offlineMode: z.boolean(),
  biometricAuth: z.boolean(),
});

export type MobileAppSettingsFormData = z.infer<typeof mobileAppSettingsSchema>;

// Online booking validation schema
export const onlineBookingGuestSchema = z.object({
  firstName: z.string().min(1, 'First name is required').max(50).trim(),
  lastName: z.string().min(1, 'Last name is required').max(50).trim(),
  email: z.string().min(1, 'Email is required').email('Invalid email').max(100).trim(),
  phone: z.string().min(1, 'Phone is required').max(20).trim(),
  specialRequests: z.string().max(500).optional(),
});

export const onlineBookingPaymentSchema = z.object({
  cardNumber: z.string().min(13, 'Invalid card number').max(19, 'Invalid card number'),
  expiryDate: z.string().regex(/^(0[1-9]|1[0-2])\/([0-9]{2})$/, 'Invalid expiry date (MM/YY)'),
  cvv: z.string().min(3, 'Invalid CVV').max(4, 'Invalid CVV'),
  cardName: z.string().min(1, 'Cardholder name is required').max(100),
  agreeTerms: z.literal(true, { errorMap: () => ({ message: 'You must agree to the terms' }) }),
});

export type OnlineBookingGuestData = z.infer<typeof onlineBookingGuestSchema>;
export type OnlineBookingPaymentData = z.infer<typeof onlineBookingPaymentSchema>;
