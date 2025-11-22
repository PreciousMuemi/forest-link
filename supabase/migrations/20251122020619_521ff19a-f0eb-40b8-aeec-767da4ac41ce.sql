-- Add Ranger System Fields to Incidents Table

-- Add new columns for ranger workflow
ALTER TABLE incidents
ADD COLUMN IF NOT EXISTS verified_by TEXT,
ADD COLUMN IF NOT EXISTS verified_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS resolved_by TEXT,
ADD COLUMN IF NOT EXISTS resolved_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS ranger_followup_photos TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS ranger_notes JSONB[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS assigned_ranger TEXT,
ADD COLUMN IF NOT EXISTS region TEXT DEFAULT 'demo';

-- Create index for faster ranger queries
CREATE INDEX IF NOT EXISTS idx_incidents_assigned_ranger ON incidents(assigned_ranger);
CREATE INDEX IF NOT EXISTS idx_incidents_region ON incidents(region);
CREATE INDEX IF NOT EXISTS idx_incidents_status ON incidents(incident_status);

-- Create alerts table for ranger notifications
CREATE TABLE IF NOT EXISTS ranger_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ranger_id TEXT NOT NULL,
  incident_id UUID REFERENCES incidents(id) ON DELETE CASCADE,
  alert_type TEXT NOT NULL, -- 'new_incident', 'high_severity', 'citizen_report', 'sms_report'
  title TEXT NOT NULL,
  message TEXT,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for alerts
CREATE INDEX IF NOT EXISTS idx_alerts_ranger_id ON ranger_alerts(ranger_id);
CREATE INDEX IF NOT EXISTS idx_alerts_read ON ranger_alerts(read);
CREATE INDEX IF NOT EXISTS idx_alerts_created_at ON ranger_alerts(created_at DESC);

-- Enable RLS on alerts table
ALTER TABLE ranger_alerts ENABLE ROW LEVEL SECURITY;

-- Create policy for alerts (demo mode - anyone can read)
CREATE POLICY "Anyone can read alerts" ON ranger_alerts
  FOR SELECT USING (true);

CREATE POLICY "Anyone can insert alerts" ON ranger_alerts
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can update alerts" ON ranger_alerts
  FOR UPDATE USING (true);

-- Update existing incidents to have demo region
UPDATE incidents 
SET region = 'demo', assigned_ranger = 'ranger'
WHERE region IS NULL;

-- Add comments
COMMENT ON COLUMN incidents.ranger_notes IS 'Array of JSONB objects with {note: string, timestamp: timestamptz, author: string}';
COMMENT ON TABLE ranger_alerts IS 'Notification system for rangers';