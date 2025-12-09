export type RoomStatus = 'available' | 'occupied' | 'reserved' | 'maintenance' | 'cleaning';
export type RoomType = 'single' | 'double' | 'suite' | 'deluxe' | 'presidential';
export type PaymentMethod = 'cash' | 'card' | 'transfer' | 'mobile';
export type ReservationStatus = 'pending' | 'confirmed' | 'checked-in' | 'checked-out' | 'cancelled';
export type RoomServiceOrderStatus = 'pending' | 'preparing' | 'delivering' | 'delivered' | 'cancelled';
export type MenuCategory = 'breakfast' | 'lunch' | 'dinner' | 'snacks' | 'beverages' | 'desserts';

export interface Room {
  id: string;
  number: string;
  floor: number;
  type: RoomType;
  status: RoomStatus;
  pricePerNight: number;
  maxOccupancy: number;
  amenities: string[];
  lastCleaned?: Date;
}

export interface Guest {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  idNumber?: string;
  nationality?: string;
  address?: string;
  vip: boolean;
  loyaltyPoints: number;
  preferences?: string[];
  createdAt: Date;
  totalStays: number;
}

export interface Reservation {
  id: string;
  guestId: string;
  guest?: Guest;
  roomId: string;
  room?: Room;
  checkIn: Date;
  checkOut: Date;
  status: ReservationStatus;
  adults: number;
  children: number;
  totalAmount: number;
  paidAmount: number;
  specialRequests?: string;
  createdAt: Date;
}

export interface DashboardStats {
  totalRooms: number;
  occupiedRooms: number;
  availableRooms: number;
  todayCheckIns: number;
  todayCheckOuts: number;
  revenue: number;
  occupancyRate: number;
  pendingReservations: number;
}

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  category: MenuCategory;
  price: number;
  image?: string;
  available: boolean;
  preparationTime: number; // in minutes
  dietary?: ('vegetarian' | 'vegan' | 'gluten-free' | 'halal')[];
}

export interface RoomServiceOrderItem {
  menuItemId: string;
  menuItem?: MenuItem;
  quantity: number;
  specialInstructions?: string;
  subtotal: number;
}

export interface RoomServiceOrder {
  id: string;
  roomId: string;
  room?: Room;
  guestId: string;
  guest?: Guest;
  items: RoomServiceOrderItem[];
  status: RoomServiceOrderStatus;
  totalAmount: number;
  deliveryFee: number;
  specialInstructions?: string;
  estimatedDelivery?: Date;
  createdAt: Date;
  updatedAt: Date;
}
