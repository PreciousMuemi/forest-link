-- Create rangers table
CREATE TABLE IF NOT EXISTS public.rangers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  phone_number TEXT NOT NULL,
  lat NUMERIC NOT NULL,
  lon NUMERIC NOT NULL,
  status TEXT NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'on_duty', 'en_route', 'on_scene', 'off_duty')),
  current_incident_id UUID REFERENCES public.incidents(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS on rangers
ALTER TABLE public.rangers ENABLE ROW LEVEL SECURITY;

-- Admins can manage rangers
CREATE POLICY "Admins can view all rangers"
ON public.rangers
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can create rangers"
ON public.rangers
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update rangers"
ON public.rangers
FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Add ranger assignment fields to incidents
ALTER TABLE public.incidents 
ADD COLUMN IF NOT EXISTS assigned_ranger_id UUID REFERENCES public.rangers(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS incident_status TEXT DEFAULT 'reported' CHECK (incident_status IN ('reported', 'assigned', 'en_route', 'on_scene', 'resolved', 'false_alarm')),
ADD COLUMN IF NOT EXISTS assigned_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS responded_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS resolved_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS eta_minutes NUMERIC;

COMMENT ON COLUMN public.incidents.incident_status IS 'Status: reported, assigned, en_route, on_scene, resolved, false_alarm';
COMMENT ON COLUMN public.incidents.eta_minutes IS 'Estimated time of arrival in minutes';

-- Create incident_messages table for coordination chat
CREATE TABLE IF NOT EXISTS public.incident_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  incident_id UUID NOT NULL REFERENCES public.incidents(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  user_name TEXT NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS on incident_messages
ALTER TABLE public.incident_messages ENABLE ROW LEVEL SECURITY;

-- Anyone authenticated can view messages for incidents they're involved in
CREATE POLICY "Anyone can view incident messages"
ON public.incident_messages
FOR SELECT
USING (true);

-- Authenticated users can send messages
CREATE POLICY "Authenticated users can send messages"
ON public.incident_messages
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_rangers_status ON public.rangers(status);
CREATE INDEX IF NOT EXISTS idx_rangers_location ON public.rangers(lat, lon);
CREATE INDEX IF NOT EXISTS idx_rangers_current_incident ON public.rangers(current_incident_id) WHERE current_incident_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_incidents_assigned_ranger ON public.incidents(assigned_ranger_id) WHERE assigned_ranger_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_incidents_status ON public.incidents(incident_status);
CREATE INDEX IF NOT EXISTS idx_incident_messages_incident ON public.incident_messages(incident_id);

-- Function to automatically update ranger status based on incident status
CREATE OR REPLACE FUNCTION update_ranger_status_from_incident()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.incident_status = 'assigned' AND OLD.incident_status = 'reported' THEN
    -- Ranger was just assigned
    UPDATE rangers 
    SET status = 'on_duty', current_incident_id = NEW.id
    WHERE id = NEW.assigned_ranger_id;
  ELSIF NEW.incident_status = 'en_route' THEN
    UPDATE rangers 
    SET status = 'en_route'
    WHERE id = NEW.assigned_ranger_id;
  ELSIF NEW.incident_status = 'on_scene' THEN
    UPDATE rangers 
    SET status = 'on_scene'
    WHERE id = NEW.assigned_ranger_id;
  ELSIF NEW.incident_status IN ('resolved', 'false_alarm') THEN
    -- Incident is done, free up the ranger
    UPDATE rangers 
    SET status = 'available', current_incident_id = NULL
    WHERE id = NEW.assigned_ranger_id;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Trigger to update ranger status when incident status changes
CREATE TRIGGER sync_ranger_status_on_incident_update
AFTER UPDATE OF incident_status ON public.incidents
FOR EACH ROW
WHEN (NEW.assigned_ranger_id IS NOT NULL)
EXECUTE FUNCTION update_ranger_status_from_incident();