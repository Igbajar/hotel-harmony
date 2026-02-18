
-- Bar drink categories
CREATE TABLE public.bar_categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Bar drinks (menu items)
CREATE TABLE public.bar_drinks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  category_id UUID NOT NULL REFERENCES public.bar_categories(id) ON DELETE CASCADE,
  description TEXT,
  image_url TEXT,
  available BOOLEAN NOT NULL DEFAULT true,
  reorder_point INTEGER NOT NULL DEFAULT 5,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Custom measures per drink (tot, double, bottle, pint, glass, etc.)
CREATE TABLE public.bar_drink_measures (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  drink_id UUID NOT NULL REFERENCES public.bar_drinks(id) ON DELETE CASCADE,
  measure_name TEXT NOT NULL, -- e.g. 'Tot', 'Double', 'Bottle', 'Pint'
  measure_ml INTEGER, -- optional ml value
  price NUMERIC NOT NULL,
  stock_deduction NUMERIC NOT NULL DEFAULT 1, -- how many units to deduct from inventory
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Bar orders (POS sales)
CREATE TABLE public.bar_orders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_number TEXT NOT NULL,
  bartender_id UUID,
  guest_id UUID REFERENCES public.guests(id),
  room_id UUID REFERENCES public.rooms(id),
  total_amount NUMERIC NOT NULL DEFAULT 0,
  payment_method TEXT DEFAULT 'cash',
  status TEXT NOT NULL DEFAULT 'open', -- open, completed, cancelled
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Bar order items
CREATE TABLE public.bar_order_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID NOT NULL REFERENCES public.bar_orders(id) ON DELETE CASCADE,
  drink_id UUID NOT NULL REFERENCES public.bar_drinks(id),
  measure_id UUID NOT NULL REFERENCES public.bar_drink_measures(id),
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price NUMERIC NOT NULL,
  subtotal NUMERIC NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Inventory - current stock per drink
CREATE TABLE public.bar_inventory (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  drink_id UUID NOT NULL UNIQUE REFERENCES public.bar_drinks(id) ON DELETE CASCADE,
  current_stock NUMERIC NOT NULL DEFAULT 0,
  unit TEXT NOT NULL DEFAULT 'bottles', -- bottles, cans, kegs, etc.
  last_restock_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Inventory transactions (purchases, sales deductions, wastage, adjustments, stock-take)
CREATE TABLE public.bar_inventory_transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  drink_id UUID NOT NULL REFERENCES public.bar_drinks(id) ON DELETE CASCADE,
  type TEXT NOT NULL, -- 'purchase', 'sale', 'wastage', 'adjustment', 'stocktake'
  quantity NUMERIC NOT NULL, -- positive for additions, negative for deductions
  notes TEXT,
  reference_id UUID, -- link to order or PO
  user_id UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Vendors
CREATE TABLE public.vendors (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  contact_person TEXT,
  email TEXT,
  phone TEXT,
  address TEXT,
  payment_terms TEXT DEFAULT 'Net 30',
  products_supplied TEXT[], -- categories/products they supply
  status TEXT NOT NULL DEFAULT 'active', -- active, inactive
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Purchase orders
CREATE TABLE public.purchase_orders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  po_number TEXT NOT NULL,
  vendor_id UUID NOT NULL REFERENCES public.vendors(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'draft', -- draft, sent, partially_received, received, cancelled
  total_amount NUMERIC NOT NULL DEFAULT 0,
  expected_delivery DATE,
  actual_delivery DATE,
  notes TEXT,
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Purchase order items
CREATE TABLE public.purchase_order_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  po_id UUID NOT NULL REFERENCES public.purchase_orders(id) ON DELETE CASCADE,
  drink_id UUID NOT NULL REFERENCES public.bar_drinks(id),
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price NUMERIC NOT NULL,
  received_quantity INTEGER NOT NULL DEFAULT 0,
  subtotal NUMERIC NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Vendor payments
CREATE TABLE public.vendor_payments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  vendor_id UUID NOT NULL REFERENCES public.vendors(id) ON DELETE CASCADE,
  po_id UUID REFERENCES public.purchase_orders(id),
  amount NUMERIC NOT NULL,
  payment_method TEXT NOT NULL DEFAULT 'bank_transfer',
  payment_date DATE NOT NULL DEFAULT CURRENT_DATE,
  reference TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.bar_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bar_drinks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bar_drink_measures ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bar_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bar_order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bar_inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bar_inventory_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchase_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchase_order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vendor_payments ENABLE ROW LEVEL SECURITY;

-- RLS Policies: bar_categories - public read, auth write
CREATE POLICY "Anyone can view bar categories" ON public.bar_categories FOR SELECT USING (true);
CREATE POLICY "Authenticated users can manage bar categories" ON public.bar_categories FOR ALL USING (true) WITH CHECK (true);

-- bar_drinks - public read, auth write
CREATE POLICY "Anyone can view bar drinks" ON public.bar_drinks FOR SELECT USING (true);
CREATE POLICY "Authenticated users can manage bar drinks" ON public.bar_drinks FOR ALL USING (true) WITH CHECK (true);

-- bar_drink_measures - public read, auth write
CREATE POLICY "Anyone can view drink measures" ON public.bar_drink_measures FOR SELECT USING (true);
CREATE POLICY "Authenticated users can manage drink measures" ON public.bar_drink_measures FOR ALL USING (true) WITH CHECK (true);

-- bar_orders - auth only
CREATE POLICY "Authenticated users can view bar orders" ON public.bar_orders FOR SELECT USING (true);
CREATE POLICY "Authenticated users can manage bar orders" ON public.bar_orders FOR ALL USING (true) WITH CHECK (true);

-- bar_order_items
CREATE POLICY "Authenticated users can view bar order items" ON public.bar_order_items FOR SELECT USING (true);
CREATE POLICY "Authenticated users can manage bar order items" ON public.bar_order_items FOR ALL USING (true) WITH CHECK (true);

-- bar_inventory
CREATE POLICY "Authenticated users can view bar inventory" ON public.bar_inventory FOR SELECT USING (true);
CREATE POLICY "Authenticated users can manage bar inventory" ON public.bar_inventory FOR ALL USING (true) WITH CHECK (true);

-- bar_inventory_transactions
CREATE POLICY "Authenticated users can view inventory transactions" ON public.bar_inventory_transactions FOR SELECT USING (true);
CREATE POLICY "Authenticated users can manage inventory transactions" ON public.bar_inventory_transactions FOR ALL USING (true) WITH CHECK (true);

-- vendors
CREATE POLICY "Authenticated users can view vendors" ON public.vendors FOR SELECT USING (true);
CREATE POLICY "Authenticated users can manage vendors" ON public.vendors FOR ALL USING (true) WITH CHECK (true);

-- purchase_orders
CREATE POLICY "Authenticated users can view purchase orders" ON public.purchase_orders FOR SELECT USING (true);
CREATE POLICY "Authenticated users can manage purchase orders" ON public.purchase_orders FOR ALL USING (true) WITH CHECK (true);

-- purchase_order_items
CREATE POLICY "Authenticated users can view PO items" ON public.purchase_order_items FOR SELECT USING (true);
CREATE POLICY "Authenticated users can manage PO items" ON public.purchase_order_items FOR ALL USING (true) WITH CHECK (true);

-- vendor_payments
CREATE POLICY "Authenticated users can view vendor payments" ON public.vendor_payments FOR SELECT USING (true);
CREATE POLICY "Authenticated users can manage vendor payments" ON public.vendor_payments FOR ALL USING (true) WITH CHECK (true);

-- Generate order numbers for bar orders
CREATE OR REPLACE FUNCTION public.generate_bar_order_number()
RETURNS TRIGGER AS $$
BEGIN
    NEW.order_number = 'BAR-' || TO_CHAR(now(), 'YYYYMMDD') || '-' || UPPER(SUBSTRING(MD5(NEW.id::TEXT) FROM 1 FOR 4));
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER generate_bar_order_number_trigger
BEFORE INSERT ON public.bar_orders
FOR EACH ROW EXECUTE FUNCTION public.generate_bar_order_number();

-- Generate PO numbers
CREATE OR REPLACE FUNCTION public.generate_po_number()
RETURNS TRIGGER AS $$
BEGIN
    NEW.po_number = 'PO-' || TO_CHAR(now(), 'YYYYMMDD') || '-' || UPPER(SUBSTRING(MD5(NEW.id::TEXT) FROM 1 FOR 4));
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER generate_po_number_trigger
BEFORE INSERT ON public.purchase_orders
FOR EACH ROW EXECUTE FUNCTION public.generate_po_number();

-- Seed default bar categories
INSERT INTO public.bar_categories (name, sort_order) VALUES
  ('Spirits', 1),
  ('Beer', 2),
  ('Wine', 3),
  ('Cocktails', 4),
  ('Soft Drinks', 5),
  ('Mixers', 6);
