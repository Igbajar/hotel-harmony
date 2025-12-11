export type RoomStatus = 'available' | 'occupied' | 'reserved' | 'maintenance' | 'cleaning';
export type RoomType = 'single' | 'double' | 'suite' | 'deluxe' | 'presidential';
export type PaymentMethod = 'cash' | 'card' | 'transfer' | 'mobile';
export type ReservationStatus = 'pending' | 'confirmed' | 'checked-in' | 'checked-out' | 'cancelled';
export type RoomServiceOrderStatus = 'pending' | 'preparing' | 'delivering' | 'delivered' | 'cancelled';
export type MenuCategory = 'breakfast' | 'lunch' | 'dinner' | 'snacks' | 'beverages' | 'desserts';
export type HousekeepingTaskStatus = 'pending' | 'in-progress' | 'completed' | 'verified';
export type HousekeepingTaskPriority = 'low' | 'normal' | 'high' | 'urgent';
export type HousekeepingTaskType = 'daily-cleaning' | 'checkout-cleaning' | 'deep-cleaning' | 'turndown' | 'maintenance-request' | 'laundry';

// Staff Management Types
export type StaffRole = 'manager' | 'front-desk' | 'housekeeping' | 'maintenance' | 'restaurant' | 'security' | 'concierge' | 'admin';
export type StaffStatus = 'active' | 'on-leave' | 'terminated';
export type ShiftType = 'morning' | 'afternoon' | 'night';
export type AttendanceStatus = 'present' | 'absent' | 'late' | 'half-day' | 'on-leave';

export interface Staff {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  avatar?: string;
  role: StaffRole;
  department: string;
  status: StaffStatus;
  shift: ShiftType;
  hireDate: Date;
  salary: number;
  emergencyContact?: string;
  address?: string;
  performanceScore: number;
  tasksCompleted: number;
  hoursWorked: number;
}

export interface StaffSchedule {
  id: string;
  staffId: string;
  staff?: Staff;
  date: Date;
  shiftStart: string;
  shiftEnd: string;
  break?: string;
  notes?: string;
}

export interface AttendanceRecord {
  id: string;
  staffId: string;
  staff?: Staff;
  date: Date;
  status: AttendanceStatus;
  checkIn?: Date;
  checkOut?: Date;
  hoursWorked?: number;
  notes?: string;
}

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

export interface HousekeepingStaff {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  avatar?: string;
  shift: 'morning' | 'afternoon' | 'night';
  status: 'available' | 'busy' | 'off-duty';
  tasksCompleted: number;
  averageTime: number; // in minutes
  rating: number; // 1-5
}

export interface HousekeepingTask {
  id: string;
  roomId: string;
  room?: Room;
  assignedTo?: string;
  staff?: HousekeepingStaff;
  type: HousekeepingTaskType;
  status: HousekeepingTaskStatus;
  priority: HousekeepingTaskPriority;
  notes?: string;
  estimatedDuration: number; // in minutes
  actualDuration?: number;
  scheduledFor: Date;
  startedAt?: Date;
  completedAt?: Date;
  createdAt: Date;
}
