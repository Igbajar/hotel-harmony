-- Create menu_items table
CREATE TABLE public.menu_items (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL CHECK (category IN ('breakfast', 'lunch', 'dinner', 'snacks', 'beverages', 'desserts')),
    price NUMERIC NOT NULL,
    available BOOLEAN DEFAULT true,
    preparation_time INTEGER DEFAULT 15,
    dietary TEXT[] DEFAULT '{}',
    image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create room_service_orders table
CREATE TABLE public.room_service_orders (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    room_id UUID REFERENCES public.rooms(id) ON DELETE SET NULL,
    guest_id UUID REFERENCES public.guests(id) ON DELETE SET NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'preparing', 'delivering', 'delivered', 'cancelled')),
    total_amount NUMERIC NOT NULL DEFAULT 0,
    delivery_fee NUMERIC DEFAULT 5,
    special_instructions TEXT,
    estimated_delivery TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create room_service_order_items table
CREATE TABLE public.room_service_order_items (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    order_id UUID REFERENCES public.room_service_orders(id) ON DELETE CASCADE NOT NULL,
    menu_item_id UUID REFERENCES public.menu_items(id) ON DELETE SET NULL,
    quantity INTEGER NOT NULL DEFAULT 1,
    special_instructions TEXT,
    subtotal NUMERIC NOT NULL DEFAULT 0
);

-- Create housekeeping_staff table
CREATE TABLE public.housekeeping_staff (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    staff_id UUID REFERENCES public.staff(id) ON DELETE SET NULL,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    shift TEXT NOT NULL CHECK (shift IN ('morning', 'afternoon', 'night')),
    status TEXT NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'busy', 'off-duty')),
    tasks_completed INTEGER DEFAULT 0,
    average_time INTEGER DEFAULT 30,
    rating NUMERIC DEFAULT 4.0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create housekeeping_tasks table  
CREATE TABLE public.housekeeping_tasks (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    room_id UUID REFERENCES public.rooms(id) ON DELETE SET NULL,
    assigned_to UUID REFERENCES public.housekeeping_staff(id) ON DELETE SET NULL,
    type TEXT NOT NULL CHECK (type IN ('daily-cleaning', 'checkout-cleaning', 'deep-cleaning', 'turndown', 'maintenance-request', 'laundry')),
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in-progress', 'completed', 'verified')),
    priority TEXT NOT NULL DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
    notes TEXT,
    estimated_duration INTEGER DEFAULT 30,
    actual_duration INTEGER,
    scheduled_for TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.room_service_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.room_service_order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.housekeeping_staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.housekeeping_tasks ENABLE ROW LEVEL SECURITY;

-- RLS Policies for menu_items (public read, authenticated write)
CREATE POLICY "Anyone can view menu items" 
ON public.menu_items 
FOR SELECT 
USING (true);

CREATE POLICY "Authenticated users can manage menu items" 
ON public.menu_items 
FOR ALL 
USING (true)
WITH CHECK (true);

-- RLS Policies for room_service_orders
CREATE POLICY "Authenticated users can view room service orders" 
ON public.room_service_orders 
FOR SELECT 
USING (true);

CREATE POLICY "Authenticated users can manage room service orders" 
ON public.room_service_orders 
FOR ALL 
USING (true)
WITH CHECK (true);

-- RLS Policies for room_service_order_items
CREATE POLICY "Authenticated users can view order items" 
ON public.room_service_order_items 
FOR SELECT 
USING (true);

CREATE POLICY "Authenticated users can manage order items" 
ON public.room_service_order_items 
FOR ALL 
USING (true)
WITH CHECK (true);

-- RLS Policies for housekeeping_staff
CREATE POLICY "Authenticated users can view housekeeping staff" 
ON public.housekeeping_staff 
FOR SELECT 
USING (true);

CREATE POLICY "Authenticated users can manage housekeeping staff" 
ON public.housekeeping_staff 
FOR ALL 
USING (true)
WITH CHECK (true);

-- RLS Policies for housekeeping_tasks
CREATE POLICY "Authenticated users can view housekeeping tasks" 
ON public.housekeeping_tasks 
FOR SELECT 
USING (true);

CREATE POLICY "Authenticated users can manage housekeeping tasks" 
ON public.housekeeping_tasks 
FOR ALL 
USING (true)
WITH CHECK (true);

-- Create triggers for updated_at
CREATE TRIGGER update_menu_items_updated_at
BEFORE UPDATE ON public.menu_items
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_room_service_orders_updated_at
BEFORE UPDATE ON public.room_service_orders
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_housekeeping_staff_updated_at
BEFORE UPDATE ON public.housekeeping_staff
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_housekeeping_tasks_updated_at
BEFORE UPDATE ON public.housekeeping_tasks
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();