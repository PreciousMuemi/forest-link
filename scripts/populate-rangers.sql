-- Populate Rangers Table with Sample Data for Kenya Forest Regions
-- Run this in Supabase SQL Editor

-- Insert 10 sample rangers across different forest regions in Kenya
INSERT INTO rangers (name, phone_number, lat, lon, status) VALUES
  -- Nairobi Region
  ('John Kamau', '+254712345678', -1.2921, 36.8219, 'available'),
  
  -- Mount Kenya Region
  ('Mary Wanjiku', '+254723456789', -0.0917, 37.0906, 'available'),
  
  -- Aberdare Forest
  ('Peter Omondi', '+254734567890', -0.4833, 36.6500, 'available'),
  
  -- Tsavo Region
  ('Grace Akinyi', '+254745678901', -4.0435, 38.5597, 'available'),
  
  -- Mau Forest
  ('David Kipchoge', '+254756789012', 0.5143, 35.2698, 'available'),
  
  -- Ngong Forest
  ('Sarah Njeri', '+254767890123', -1.4833, 36.6500, 'available'),
  
  -- Amboseli Region
  ('James Mwangi', '+254778901234', -3.3869, 37.2561, 'available'),
  
  -- Kakamega Forest
  ('Lucy Chebet', '+254789012345', 0.3556, 34.7519, 'available'),
  
  -- Mount Elgon
  ('Michael Otieno', '+254790123456', -0.0236, 34.5590, 'available'),
  
  -- Karura Forest (Nairobi)
  ('Anne Wambui', '+254701234567', -1.1027, 36.8333, 'available');

-- Verify the insert
SELECT 
  id,
  name,
  phone_number,
  lat,
  lon,
  status,
  created_at
FROM rangers
ORDER BY created_at DESC;
