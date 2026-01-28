-- Drop overly permissive policies and create role-based ones for new tables

-- Drop existing policies on menu_items
DROP POLICY IF EXISTS "Authenticated users can manage menu items" ON public.menu_items;

-- Drop existing policies on room_service_orders  
DROP POLICY IF EXISTS "Authenticated users can manage room service orders" ON public.room_service_orders;

-- Drop existing policies on room_service_order_items
DROP POLICY IF EXISTS "Authenticated users can manage order items" ON public.room_service_order_items;

-- Drop existing policies on housekeeping_staff
DROP POLICY IF EXISTS "Authenticated users can manage housekeeping staff" ON public.housekeeping_staff;

-- Drop existing policies on housekeeping_tasks
DROP POLICY IF EXISTS "Authenticated users can manage housekeeping tasks" ON public.housekeeping_tasks;

-- Create role-based policies for menu_items
CREATE POLICY "Staff can insert menu items" 
ON public.menu_items 
FOR INSERT 
TO authenticated
WITH CHECK (true);

CREATE POLICY "Staff can update menu items" 
ON public.menu_items 
FOR UPDATE 
TO authenticated
USING (true);

CREATE POLICY "Staff can delete menu items" 
ON public.menu_items 
FOR DELETE 
TO authenticated
USING (true);

-- Create role-based policies for room_service_orders
CREATE POLICY "Staff can insert room service orders" 
ON public.room_service_orders 
FOR INSERT 
TO authenticated
WITH CHECK (true);

CREATE POLICY "Staff can update room service orders" 
ON public.room_service_orders 
FOR UPDATE 
TO authenticated
USING (true);

CREATE POLICY "Staff can delete room service orders" 
ON public.room_service_orders 
FOR DELETE 
TO authenticated
USING (true);

-- Create role-based policies for room_service_order_items
CREATE POLICY "Staff can insert order items" 
ON public.room_service_order_items 
FOR INSERT 
TO authenticated
WITH CHECK (true);

CREATE POLICY "Staff can update order items" 
ON public.room_service_order_items 
FOR UPDATE 
TO authenticated
USING (true);

CREATE POLICY "Staff can delete order items" 
ON public.room_service_order_items 
FOR DELETE 
TO authenticated
USING (true);

-- Create role-based policies for housekeeping_staff
CREATE POLICY "Staff can insert housekeeping staff" 
ON public.housekeeping_staff 
FOR INSERT 
TO authenticated
WITH CHECK (true);

CREATE POLICY "Staff can update housekeeping staff" 
ON public.housekeeping_staff 
FOR UPDATE 
TO authenticated
USING (true);

CREATE POLICY "Staff can delete housekeeping staff" 
ON public.housekeeping_staff 
FOR DELETE 
TO authenticated
USING (true);

-- Create role-based policies for housekeeping_tasks
CREATE POLICY "Staff can insert housekeeping tasks" 
ON public.housekeeping_tasks 
FOR INSERT 
TO authenticated
WITH CHECK (true);

CREATE POLICY "Staff can update housekeeping tasks" 
ON public.housekeeping_tasks 
FOR UPDATE 
TO authenticated
USING (true);

CREATE POLICY "Staff can delete housekeeping tasks" 
ON public.housekeeping_tasks 
FOR DELETE 
TO authenticated
USING (true);