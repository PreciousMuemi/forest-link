-- Create storage bucket for field photos
INSERT INTO storage.buckets (id, name, public)
VALUES ('incident-photos', 'incident-photos', true);

-- RLS policies for incident photos bucket
CREATE POLICY "Anyone can view incident photos"
ON storage.objects FOR SELECT
USING (bucket_id = 'incident-photos');

CREATE POLICY "Anyone can upload incident photos"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'incident-photos');

CREATE POLICY "Anyone can update their incident photos"
ON storage.objects FOR UPDATE
USING (bucket_id = 'incident-photos');

CREATE POLICY "Anyone can delete their incident photos"
ON storage.objects FOR DELETE
USING (bucket_id = 'incident-photos');