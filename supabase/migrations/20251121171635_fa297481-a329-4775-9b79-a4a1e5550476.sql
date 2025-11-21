-- Add location to profiles for proximity alerts
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS lat NUMERIC,
ADD COLUMN IF NOT EXISTS lon NUMERIC;

COMMENT ON COLUMN public.profiles.lat IS 'User latitude for proximity-based alerts';
COMMENT ON COLUMN public.profiles.lon IS 'User longitude for proximity-based alerts';

-- Create alert_logs table to track broadcast alerts
CREATE TABLE IF NOT EXISTS public.alert_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  incident_id UUID NOT NULL REFERENCES public.incidents(id) ON DELETE CASCADE,
  sent_to TEXT[] NOT NULL,
  message TEXT NOT NULL,
  radius_km NUMERIC NOT NULL,
  sent_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id)
);

-- Enable RLS on alert_logs
ALTER TABLE public.alert_logs ENABLE ROW LEVEL SECURITY;

-- Admins can view all alerts
CREATE POLICY "Admins can view all alerts"
ON public.alert_logs
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- Admins can create alerts
CREATE POLICY "Admins can create alerts"
ON public.alert_logs
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Create community_responses table for feedback loop
CREATE TABLE IF NOT EXISTS public.community_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  incident_id UUID NOT NULL REFERENCES public.incidents(id) ON DELETE CASCADE,
  phone_number TEXT NOT NULL,
  response TEXT NOT NULL CHECK (response IN ('SAFE', 'NEED_HELP', 'EVACUATING', 'OTHER')),
  message TEXT,
  responded_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS on community_responses
ALTER TABLE public.community_responses ENABLE ROW LEVEL SECURITY;

-- Anyone can view responses
CREATE POLICY "Anyone can view responses"
ON public.community_responses
FOR SELECT
USING (true);

-- System can insert responses
CREATE POLICY "System can insert responses"
ON public.community_responses
FOR INSERT
WITH CHECK (true);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_alert_logs_incident ON public.alert_logs(incident_id);
CREATE INDEX IF NOT EXISTS idx_alert_logs_sent_at ON public.alert_logs(sent_at);
CREATE INDEX IF NOT EXISTS idx_community_responses_incident ON public.community_responses(incident_id);
CREATE INDEX IF NOT EXISTS idx_community_responses_phone ON public.community_responses(phone_number);
CREATE INDEX IF NOT EXISTS idx_profiles_location ON public.profiles(lat, lon) WHERE lat IS NOT NULL AND lon IS NOT NULL;