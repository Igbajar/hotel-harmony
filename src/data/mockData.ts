import { Room, Guest, Reservation, DashboardStats } from '@/types/hotel';

export const mockRooms: Room[] = [
  { id: '1', number: '101', floor: 1, type: 'single', status: 'available', pricePerNight: 150, maxOccupancy: 1, amenities: ['WiFi', 'TV', 'AC'] },
  { id: '2', number: '102', floor: 1, type: 'double', status: 'occupied', pricePerNight: 220, maxOccupancy: 2, amenities: ['WiFi', 'TV', 'AC', 'Mini Bar'] },
  { id: '3', number: '103', floor: 1, type: 'double', status: 'reserved', pricePerNight: 220, maxOccupancy: 2, amenities: ['WiFi', 'TV', 'AC', 'Mini Bar'] },
  { id: '4', number: '104', floor: 1, type: 'single', status: 'cleaning', pricePerNight: 150, maxOccupancy: 1, amenities: ['WiFi', 'TV', 'AC'] },
  { id: '5', number: '201', floor: 2, type: 'suite', status: 'occupied', pricePerNight: 450, maxOccupancy: 4, amenities: ['WiFi', 'TV', 'AC', 'Mini Bar', 'Jacuzzi', 'Balcony'] },
  { id: '6', number: '202', floor: 2, type: 'deluxe', status: 'available', pricePerNight: 350, maxOccupancy: 3, amenities: ['WiFi', 'TV', 'AC', 'Mini Bar', 'Balcony'] },
  { id: '7', number: '203', floor: 2, type: 'double', status: 'maintenance', pricePerNight: 220, maxOccupancy: 2, amenities: ['WiFi', 'TV', 'AC', 'Mini Bar'] },
  { id: '8', number: '204', floor: 2, type: 'deluxe', status: 'reserved', pricePerNight: 350, maxOccupancy: 3, amenities: ['WiFi', 'TV', 'AC', 'Mini Bar', 'Balcony'] },
  { id: '9', number: '301', floor: 3, type: 'presidential', status: 'available', pricePerNight: 800, maxOccupancy: 6, amenities: ['WiFi', 'TV', 'AC', 'Mini Bar', 'Jacuzzi', 'Balcony', 'Butler Service', 'Private Dining'] },
  { id: '10', number: '302', floor: 3, type: 'suite', status: 'occupied', pricePerNight: 450, maxOccupancy: 4, amenities: ['WiFi', 'TV', 'AC', 'Mini Bar', 'Jacuzzi', 'Balcony'] },
  { id: '11', number: '303', floor: 3, type: 'deluxe', status: 'available', pricePerNight: 350, maxOccupancy: 3, amenities: ['WiFi', 'TV', 'AC', 'Mini Bar', 'Balcony'] },
  { id: '12', number: '304', floor: 3, type: 'double', status: 'occupied', pricePerNight: 220, maxOccupancy: 2, amenities: ['WiFi', 'TV', 'AC', 'Mini Bar'] },
];

export const mockGuests: Guest[] = [
  { id: '1', firstName: 'John', lastName: 'Smith', email: 'john.smith@email.com', phone: '+1 555-0101', idNumber: 'AB123456', nationality: 'USA', vip: true, loyaltyPoints: 15000, createdAt: new Date('2023-01-15'), totalStays: 12 },
  { id: '2', firstName: 'Emma', lastName: 'Johnson', email: 'emma.j@email.com', phone: '+1 555-0102', idNumber: 'CD789012', nationality: 'UK', vip: false, loyaltyPoints: 3500, createdAt: new Date('2023-06-20'), totalStays: 4 },
  { id: '3', firstName: 'Michael', lastName: 'Brown', email: 'm.brown@company.com', phone: '+1 555-0103', idNumber: 'EF345678', nationality: 'Canada', vip: true, loyaltyPoints: 22000, createdAt: new Date('2022-11-10'), totalStays: 18 },
  { id: '4', firstName: 'Sarah', lastName: 'Davis', email: 'sarah.d@email.com', phone: '+1 555-0104', nationality: 'Australia', vip: false, loyaltyPoints: 1200, createdAt: new Date('2024-02-01'), totalStays: 2 },
  { id: '5', firstName: 'David', lastName: 'Wilson', email: 'd.wilson@corp.com', phone: '+1 555-0105', idNumber: 'GH901234', nationality: 'Germany', vip: false, loyaltyPoints: 5600, createdAt: new Date('2023-09-05'), totalStays: 6 },
  { id: '6', firstName: 'Lisa', lastName: 'Anderson', email: 'lisa.a@email.com', phone: '+1 555-0106', nationality: 'France', vip: true, loyaltyPoints: 18500, createdAt: new Date('2022-07-22'), totalStays: 15 },
];

export const mockReservations: Reservation[] = [
  { id: '1', guestId: '1', roomId: '2', checkIn: new Date(), checkOut: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), status: 'checked-in', adults: 2, children: 0, totalAmount: 660, paidAmount: 660, createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
  { id: '2', guestId: '2', roomId: '3', checkIn: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), checkOut: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000), status: 'confirmed', adults: 2, children: 1, totalAmount: 660, paidAmount: 330, createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000) },
  { id: '3', guestId: '3', roomId: '5', checkIn: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), checkOut: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), status: 'checked-in', adults: 2, children: 2, totalAmount: 1800, paidAmount: 1800, createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000) },
  { id: '4', guestId: '4', roomId: '8', checkIn: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), checkOut: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), status: 'pending', adults: 1, children: 0, totalAmount: 1050, paidAmount: 0, createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) },
  { id: '5', guestId: '5', roomId: '10', checkIn: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), checkOut: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), status: 'checked-in', adults: 2, children: 0, totalAmount: 900, paidAmount: 900, createdAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000) },
  { id: '6', guestId: '6', roomId: '12', checkIn: new Date(), checkOut: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), status: 'checked-in', adults: 2, children: 0, totalAmount: 440, paidAmount: 440, createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) },
];

export const mockDashboardStats: DashboardStats = {
  totalRooms: 12,
  occupiedRooms: 5,
  availableRooms: 4,
  todayCheckIns: 3,
  todayCheckOuts: 2,
  revenue: 24850,
  occupancyRate: 41.7,
  pendingReservations: 4,
};
