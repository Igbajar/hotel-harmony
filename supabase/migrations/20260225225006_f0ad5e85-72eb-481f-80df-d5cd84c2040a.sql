
-- Site settings table for CMS content (key-value with JSONB)
CREATE TABLE public.site_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  key TEXT NOT NULL UNIQUE,
  value JSONB NOT NULL DEFAULT '{}',
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_by UUID REFERENCES auth.users(id)
);

-- Enable RLS
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

-- Anyone can read site settings (needed for footer, site name, etc.)
CREATE POLICY "Anyone can read site settings"
ON public.site_settings
FOR SELECT
USING (true);

-- Only authenticated users can update (we'll check admin role in app)
CREATE POLICY "Authenticated users can update site settings"
ON public.site_settings
FOR UPDATE
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can insert site settings"
ON public.site_settings
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Trigger for updated_at
CREATE TRIGGER update_site_settings_updated_at
BEFORE UPDATE ON public.site_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Seed default settings
INSERT INTO public.site_settings (key, value) VALUES
('site_name', '"HotelPro"'),
('site_slogan', '"Complete Hotel Management System"'),
('site_logo_url', '""'),
('site_favicon_url', '""'),
('footer_text', '"Developed by Igbajar Abraham; Rajabgi Services Limited"'),
('footer_link_url', '"https://www.rajabgi.com"'),
('footer_link_label', '"Rajabgi Services Limited"'),
('footer_whatsapp', '"+2348032864085"'),
('footer_extra_links', '[]'),
('footer_extra_images', '[]');

-- Chat messages table for AI chatbot
CREATE TABLE public.chat_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

-- Anyone can read/write chat messages (public chatbot)
CREATE POLICY "Anyone can read chat messages"
ON public.chat_messages FOR SELECT USING (true);

CREATE POLICY "Anyone can insert chat messages"
ON public.chat_messages FOR INSERT WITH CHECK (true);
