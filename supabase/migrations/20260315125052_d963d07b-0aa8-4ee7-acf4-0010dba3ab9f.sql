
-- Notifications table
CREATE TABLE public.notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL, -- 'reservation', 'check_in', 'check_out', 'housekeeping', 'backup', 'system'
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  read BOOLEAN NOT NULL DEFAULT false,
  entity_type TEXT,
  entity_id UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Policies: authenticated users can read their own or broadcast notifications
CREATE POLICY "Users can view own notifications"
  ON public.notifications FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR user_id IS NULL);

CREATE POLICY "Users can update own notifications"
  ON public.notifications FOR UPDATE TO authenticated
  USING (user_id = auth.uid() OR user_id IS NULL);

CREATE POLICY "System can insert notifications"
  ON public.notifications FOR INSERT TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can delete own notifications"
  ON public.notifications FOR DELETE TO authenticated
  USING (user_id = auth.uid() OR user_id IS NULL);

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;

-- Backup history table
CREATE TABLE public.backup_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  type TEXT NOT NULL DEFAULT 'manual', -- 'manual', 'scheduled'
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'completed', 'failed'
  tables_included TEXT[] NOT NULL DEFAULT '{}',
  record_count INTEGER NOT NULL DEFAULT 0,
  file_size_bytes BIGINT,
  error_message TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE
);

ALTER TABLE public.backup_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view backup history"
  ON public.backup_history FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert backup history"
  ON public.backup_history FOR INSERT TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update backup history"
  ON public.backup_history FOR UPDATE TO authenticated
  USING (true);

-- Function to create notification on reservation changes
CREATE OR REPLACE FUNCTION public.notify_reservation_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  guest_name TEXT;
  room_number TEXT;
  notif_title TEXT;
  notif_message TEXT;
  notif_type TEXT;
BEGIN
  SELECT first_name || ' ' || last_name INTO guest_name FROM public.guests WHERE id = NEW.guest_id;
  SELECT number INTO room_number FROM public.rooms WHERE id = NEW.room_id;

  IF TG_OP = 'INSERT' THEN
    notif_title := 'New Reservation';
    notif_message := COALESCE(guest_name, 'A guest') || ' booked Room ' || COALESCE(room_number, 'N/A');
    notif_type := 'reservation';
  ELSIF TG_OP = 'UPDATE' AND NEW.status = 'checked_in' AND OLD.status != 'checked_in' THEN
    notif_title := 'Guest Checked In';
    notif_message := COALESCE(guest_name, 'A guest') || ' checked into Room ' || COALESCE(room_number, 'N/A');
    notif_type := 'check_in';
  ELSIF TG_OP = 'UPDATE' AND NEW.status = 'checked_out' AND OLD.status != 'checked_out' THEN
    notif_title := 'Guest Checked Out';
    notif_message := COALESCE(guest_name, 'A guest') || ' checked out of Room ' || COALESCE(room_number, 'N/A');
    notif_type := 'check_out';
  ELSE
    RETURN NEW;
  END IF;

  INSERT INTO public.notifications (user_id, type, title, message, entity_type, entity_id)
  VALUES (NULL, notif_type, notif_title, notif_message, 'reservation', NEW.id);

  RETURN NEW;
END;
$$;

CREATE TRIGGER on_reservation_change
  AFTER INSERT OR UPDATE ON public.reservations
  FOR EACH ROW EXECUTE FUNCTION public.notify_reservation_change();

-- Function to create notification on housekeeping task changes
CREATE OR REPLACE FUNCTION public.notify_housekeeping_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  room_number TEXT;
  notif_title TEXT;
  notif_message TEXT;
BEGIN
  SELECT number INTO room_number FROM public.rooms WHERE id = NEW.room_id;

  IF TG_OP = 'INSERT' THEN
    notif_title := 'New Housekeeping Task';
    notif_message := NEW.type || ' task created for Room ' || COALESCE(room_number, 'N/A');
  ELSIF TG_OP = 'UPDATE' AND NEW.status = 'completed' AND OLD.status != 'completed' THEN
    notif_title := 'Housekeeping Complete';
    notif_message := 'Room ' || COALESCE(room_number, 'N/A') || ' cleaning completed';
  ELSE
    RETURN NEW;
  END IF;

  INSERT INTO public.notifications (user_id, type, title, message, entity_type, entity_id)
  VALUES (NULL, 'housekeeping', notif_title, notif_message, 'housekeeping_task', NEW.id);

  RETURN NEW;
END;
$$;

CREATE TRIGGER on_housekeeping_change
  AFTER INSERT OR UPDATE ON public.housekeeping_tasks
  FOR EACH ROW EXECUTE FUNCTION public.notify_housekeeping_change();
