export type RoomStatus = 'available' | 'occupied' | 'reserved' | 'maintenance' | 'cleaning';
export type RoomType = 'single' | 'double' | 'suite' | 'deluxe' | 'presidential';
export type PaymentMethod = 'cash' | 'card' | 'transfer' | 'mobile';
export type ReservationStatus = 'pending' | 'confirmed' | 'checked-in' | 'checked-out' | 'cancelled';

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
