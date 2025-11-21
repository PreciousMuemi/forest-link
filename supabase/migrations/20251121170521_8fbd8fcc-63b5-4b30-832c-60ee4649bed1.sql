-- Add source tracking to incidents table
ALTER TABLE public.incidents 
ADD COLUMN IF NOT EXISTS source TEXT DEFAULT 'pwa' CHECK (source IN ('pwa', 'sms', 'satellite', 'manual')),
ADD COLUMN IF NOT EXISTS sender_phone TEXT;

-- Add comment for clarity
COMMENT ON COLUMN public.incidents.source IS 'Source of the incident report: pwa (mobile app), sms (text message), satellite (NASA FIRMS), manual (admin created)';
COMMENT ON COLUMN public.incidents.sender_phone IS 'Phone number of SMS sender (only for SMS reports)';

-- Create index for source filtering
CREATE INDEX IF NOT EXISTS idx_incidents_source ON public.incidents(source);

-- Update existing incidents to have 'pwa' as source
UPDATE public.incidents SET source = 'pwa' WHERE source IS NULL;