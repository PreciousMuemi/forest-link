-- Create enum for user roles
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');

-- Create user_roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE (user_id, role)
);

-- Enable RLS
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- RLS policies for user_roles
CREATE POLICY "Users can view their own roles"
  ON public.user_roles
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all roles"
  ON public.user_roles
  FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert roles"
  ON public.user_roles
  FOR INSERT
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update roles"
  ON public.user_roles
  FOR UPDATE
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete roles"
  ON public.user_roles
  FOR DELETE
  USING (public.has_role(auth.uid(), 'admin'));

-- Add status tracking to incidents for workflow
ALTER TABLE public.incidents
ADD COLUMN IF NOT EXISTS verified BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS notes TEXT;

-- Create analytics view for admins
CREATE OR REPLACE VIEW public.incident_analytics AS
SELECT 
  DATE_TRUNC('day', created_at) as date,
  threat_type,
  severity,
  COUNT(*) as count,
  COUNT(*) FILTER (WHERE verified = true) as verified_count
FROM public.incidents
GROUP BY DATE_TRUNC('day', created_at), threat_type, severity;

-- RLS for analytics view
ALTER VIEW public.incident_analytics SET (security_invoker = on);

-- Create function to get dashboard stats
CREATE OR REPLACE FUNCTION public.get_dashboard_stats()
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'total_incidents', (SELECT COUNT(*) FROM incidents),
    'verified_incidents', (SELECT COUNT(*) FROM incidents WHERE verified = true),
    'pending_incidents', (SELECT COUNT(*) FROM incidents WHERE verified = false),
    'critical_incidents', (SELECT COUNT(*) FROM incidents WHERE severity = 'critical'),
    'incidents_today', (SELECT COUNT(*) FROM incidents WHERE created_at > CURRENT_DATE),
    'by_threat_type', (
      SELECT json_object_agg(threat_type, count)
      FROM (
        SELECT threat_type, COUNT(*) as count
        FROM incidents
        GROUP BY threat_type
      ) t
    ),
    'by_severity', (
      SELECT json_object_agg(severity, count)
      FROM (
        SELECT severity, COUNT(*) as count
        FROM incidents
        GROUP BY severity
      ) s
    )
  ) INTO result;
  
  RETURN result;
END;
$$;