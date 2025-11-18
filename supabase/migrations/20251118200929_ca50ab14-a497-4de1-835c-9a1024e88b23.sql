-- Create incidents table for forest threat detection
CREATE TABLE public.incidents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lat DECIMAL(10, 7) NOT NULL,
  lon DECIMAL(10, 7) NOT NULL,
  threat_type TEXT NOT NULL CHECK (threat_type IN ('Fire', 'Deforestation', 'Normal', 'Illegal Logging', 'Wildlife Poaching')),
  severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  tx_hash TEXT,
  alert_status TEXT NOT NULL DEFAULT 'pending' CHECK (alert_status IN ('pending', 'sent', 'failed')),
  image_url TEXT,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.incidents ENABLE ROW LEVEL SECURITY;

-- Create policy for public read access (for map visualization)
CREATE POLICY "Anyone can view incidents"
  ON public.incidents
  FOR SELECT
  USING (true);

-- Create policy for system/admin to insert incidents (ML system, manual reports)
CREATE POLICY "System can insert incidents"
  ON public.incidents
  FOR INSERT
  WITH CHECK (true);

-- Enable realtime for incidents table
ALTER PUBLICATION supabase_realtime ADD TABLE public.incidents;

-- Create index for faster geospatial queries
CREATE INDEX incidents_location_idx ON public.incidents (lat, lon);
CREATE INDEX incidents_timestamp_idx ON public.incidents (timestamp DESC);
CREATE INDEX incidents_severity_idx ON public.incidents (severity);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_incidents_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_incidents_updated_at
  BEFORE UPDATE ON public.incidents
  FOR EACH ROW
  EXECUTE FUNCTION public.update_incidents_updated_at();