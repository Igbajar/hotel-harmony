-- Drop the restrictive policies
DROP POLICY IF EXISTS "Authenticated users can manage guests" ON public.guests;

-- Create policies that allow anyone to manage guests (for online booking)
CREATE POLICY "Anyone can insert guests"
ON public.guests
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Anyone can update guests"
ON public.guests
FOR UPDATE
USING (true);

CREATE POLICY "Anyone can delete guests"
ON public.guests
FOR DELETE
USING (true);