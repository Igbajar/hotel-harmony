import { Room, Guest, Reservation, DashboardStats, MenuItem, RoomServiceOrder } from '@/types/hotel';

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

export const mockMenuItems: MenuItem[] = [
  // Breakfast
  { id: 'm1', name: 'Continental Breakfast', description: 'Fresh croissants, pastries, fruits, yogurt, and artisanal cheeses', category: 'breakfast', price: 28, available: true, preparationTime: 15, dietary: ['vegetarian'] },
  { id: 'm2', name: 'Full English Breakfast', description: 'Eggs, bacon, sausages, beans, mushrooms, tomatoes, and toast', category: 'breakfast', price: 32, available: true, preparationTime: 20 },
  { id: 'm3', name: 'Avocado Toast', description: 'Smashed avocado on sourdough with poached eggs and microgreens', category: 'breakfast', price: 22, available: true, preparationTime: 12, dietary: ['vegetarian'] },
  { id: 'm4', name: 'Pancake Stack', description: 'Fluffy buttermilk pancakes with maple syrup and fresh berries', category: 'breakfast', price: 18, available: true, preparationTime: 15, dietary: ['vegetarian'] },
  
  // Lunch
  { id: 'm5', name: 'Caesar Salad', description: 'Crisp romaine, parmesan, croutons with grilled chicken', category: 'lunch', price: 24, available: true, preparationTime: 12 },
  { id: 'm6', name: 'Club Sandwich', description: 'Triple-decker with turkey, bacon, lettuce, tomato, and mayo', category: 'lunch', price: 26, available: true, preparationTime: 15 },
  { id: 'm7', name: 'Beef Burger', description: 'Premium Angus patty with cheddar, caramelized onions, and truffle fries', category: 'lunch', price: 34, available: true, preparationTime: 20 },
  { id: 'm8', name: 'Mediterranean Bowl', description: 'Quinoa, falafel, hummus, tabbouleh, and tahini dressing', category: 'lunch', price: 26, available: true, preparationTime: 15, dietary: ['vegetarian', 'vegan'] },
  
  // Dinner
  { id: 'm9', name: 'Grilled Salmon', description: 'Atlantic salmon with asparagus, lemon butter sauce, and roasted potatoes', category: 'dinner', price: 48, available: true, preparationTime: 25 },
  { id: 'm10', name: 'Ribeye Steak', description: '12oz prime ribeye with garlic mashed potatoes and seasonal vegetables', category: 'dinner', price: 62, available: true, preparationTime: 30 },
  { id: 'm11', name: 'Lobster Thermidor', description: 'Classic preparation with creamy mustard sauce and gratin topping', category: 'dinner', price: 78, available: true, preparationTime: 35 },
  { id: 'm12', name: 'Vegetable Risotto', description: 'Arborio rice with seasonal vegetables, truffle oil, and parmesan', category: 'dinner', price: 36, available: true, preparationTime: 25, dietary: ['vegetarian', 'gluten-free'] },
  
  // Snacks
  { id: 'm13', name: 'Cheese Platter', description: 'Selection of artisanal cheeses with crackers and grapes', category: 'snacks', price: 28, available: true, preparationTime: 10, dietary: ['vegetarian', 'gluten-free'] },
  { id: 'm14', name: 'Chicken Wings', description: 'Crispy wings with buffalo sauce and blue cheese dip', category: 'snacks', price: 18, available: true, preparationTime: 15 },
  { id: 'm15', name: 'Nachos Supreme', description: 'Loaded with cheese, jalapeños, salsa, guacamole, and sour cream', category: 'snacks', price: 22, available: true, preparationTime: 12, dietary: ['vegetarian'] },
  { id: 'm16', name: 'Bruschetta', description: 'Toasted ciabatta with tomato, basil, and balsamic glaze', category: 'snacks', price: 16, available: true, preparationTime: 10, dietary: ['vegetarian', 'vegan'] },
  
  // Beverages
  { id: 'm17', name: 'Fresh Orange Juice', description: 'Freshly squeezed Valencia oranges', category: 'beverages', price: 8, available: true, preparationTime: 5, dietary: ['vegan', 'gluten-free'] },
  { id: 'm18', name: 'Premium Coffee', description: 'Espresso, Americano, Cappuccino, or Latte', category: 'beverages', price: 6, available: true, preparationTime: 5, dietary: ['vegetarian'] },
  { id: 'm19', name: 'Craft Cocktail', description: 'Signature hotel cocktail with premium spirits', category: 'beverages', price: 18, available: true, preparationTime: 8 },
  { id: 'm20', name: 'Wine by the Glass', description: 'Selection of red, white, or rosé wines', category: 'beverages', price: 14, available: true, preparationTime: 3 },
  
  // Desserts
  { id: 'm21', name: 'Chocolate Lava Cake', description: 'Warm chocolate cake with molten center and vanilla ice cream', category: 'desserts', price: 16, available: true, preparationTime: 15, dietary: ['vegetarian'] },
  { id: 'm22', name: 'Tiramisu', description: 'Classic Italian dessert with mascarpone and espresso', category: 'desserts', price: 14, available: true, preparationTime: 5, dietary: ['vegetarian'] },
  { id: 'm23', name: 'Fresh Fruit Platter', description: 'Seasonal tropical fruits with honey yogurt dip', category: 'desserts', price: 18, available: true, preparationTime: 10, dietary: ['vegetarian', 'vegan', 'gluten-free'] },
  { id: 'm24', name: 'Crème Brûlée', description: 'Classic vanilla custard with caramelized sugar top', category: 'desserts', price: 14, available: true, preparationTime: 5, dietary: ['vegetarian', 'gluten-free'] },
];

export const mockRoomServiceOrders: RoomServiceOrder[] = [
  {
    id: 'rs1',
    roomId: '2',
    guestId: '1',
    items: [
      { menuItemId: 'm2', quantity: 2, subtotal: 64 },
      { menuItemId: 'm18', quantity: 2, subtotal: 12 },
    ],
    status: 'delivering',
    totalAmount: 81,
    deliveryFee: 5,
    estimatedDelivery: new Date(Date.now() + 10 * 60 * 1000),
    createdAt: new Date(Date.now() - 25 * 60 * 1000),
    updatedAt: new Date(Date.now() - 5 * 60 * 1000),
  },
  {
    id: 'rs2',
    roomId: '5',
    guestId: '3',
    items: [
      { menuItemId: 'm10', quantity: 1, subtotal: 62 },
      { menuItemId: 'm9', quantity: 1, subtotal: 48 },
      { menuItemId: 'm20', quantity: 2, subtotal: 28 },
      { menuItemId: 'm21', quantity: 2, subtotal: 32 },
    ],
    status: 'preparing',
    totalAmount: 175,
    deliveryFee: 5,
    specialInstructions: 'Steak medium-rare, allergic to nuts',
    estimatedDelivery: new Date(Date.now() + 25 * 60 * 1000),
    createdAt: new Date(Date.now() - 10 * 60 * 1000),
    updatedAt: new Date(Date.now() - 8 * 60 * 1000),
  },
  {
    id: 'rs3',
    roomId: '10',
    guestId: '5',
    items: [
      { menuItemId: 'm13', quantity: 1, subtotal: 28 },
      { menuItemId: 'm19', quantity: 2, subtotal: 36 },
    ],
    status: 'pending',
    totalAmount: 69,
    deliveryFee: 5,
    createdAt: new Date(Date.now() - 2 * 60 * 1000),
    updatedAt: new Date(Date.now() - 2 * 60 * 1000),
  },
  {
    id: 'rs4',
    roomId: '12',
    guestId: '6',
    items: [
      { menuItemId: 'm1', quantity: 2, subtotal: 56 },
      { menuItemId: 'm17', quantity: 2, subtotal: 16 },
    ],
    status: 'delivered',
    totalAmount: 77,
    deliveryFee: 5,
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 90 * 60 * 1000),
  },
];
