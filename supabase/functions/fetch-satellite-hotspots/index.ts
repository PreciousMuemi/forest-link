import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface FIRMSHotspot {
  latitude: number;
  longitude: number;
  brightness: number;
  scan: number;
  track: number;
  acq_date: string;
  acq_time: string;
  satellite: string;
  confidence: number;
  version: string;
  bright_t31: number;
  frp: number;
  daynight: string;
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Fetching satellite fire hotspots from NASA FIRMS...');

    const firmsApiKey = Deno.env.get('NASA_FIRMS_API_KEY');
    if (!firmsApiKey) {
      throw new Error('NASA_FIRMS_API_KEY not configured');
    }

    // Fetch VIIRS (Visible Infrared Imaging Radiometer Suite) fire data for Kenya
    // Area: Kenya bounding box approximately [-5, 33.5, 5, 42]
    // Using VIIRS_SNPP_NRT (Near Real-Time) for last 24 hours
    const area = 'KEN'; // Kenya country code
    const firmsUrl = `https://firms.modaps.eosdis.nasa.gov/api/country/csv/${firmsApiKey}/VIIRS_SNPP_NRT/${area}/1`;
    
    console.log('Fetching from FIRMS:', firmsUrl);

    const response = await fetch(firmsUrl);
    if (!response.ok) {
      throw new Error(`FIRMS API error: ${response.status} ${response.statusText}`);
    }

    const csvData = await response.text();
    console.log('Received CSV data, length:', csvData.length);

    // Parse CSV (skip header row)
    const lines = csvData.trim().split('\n');
    if (lines.length <= 1) {
      console.log('No fire hotspots detected in last 24 hours');
      return new Response(
        JSON.stringify({ success: true, hotspots: 0, message: 'No active fire hotspots' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Initialize Supabase
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    let newHotspots = 0;
    const headers = lines[0].split(',');

    // Process each hotspot (skip header)
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',');
      if (values.length < 5) continue;

      const hotspot: any = {};
      headers.forEach((header, index) => {
        hotspot[header.trim()] = values[index]?.trim();
      });

      const lat = parseFloat(hotspot.latitude);
      const lon = parseFloat(hotspot.longitude);
      const confidence = parseInt(hotspot.confidence) || 0;
      const brightness = parseFloat(hotspot.brightness) || 0;
      const frp = parseFloat(hotspot.frp) || 0; // Fire Radiative Power

      // Only create incidents for high-confidence detections
      if (confidence < 80) continue;

      // Check if we already have a recent incident at this location (within 1km)
      const { data: existingIncidents } = await supabase
        .from('incidents')
        .select('id, lat, lon, timestamp')
        .eq('source', 'satellite')
        .gte('timestamp', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

      // Simple distance check (1km ≈ 0.01 degrees)
      const isDuplicate = existingIncidents?.some(inc => {
        const latDiff = Math.abs(inc.lat - lat);
        const lonDiff = Math.abs(inc.lon - lon);
        return latDiff < 0.01 && lonDiff < 0.01;
      });

      if (isDuplicate) {
        console.log('Skipping duplicate hotspot at', lat, lon);
        continue;
      }

      // Determine severity based on fire radiative power and confidence
      let severity = 'medium';
      if (frp > 100 || confidence > 90) {
        severity = 'high';
      }
      if (frp > 300) {
        severity = 'critical';
      }

      const description = `Satellite-detected fire hotspot. Confidence: ${confidence}%, Brightness: ${brightness}K, Fire Power: ${frp.toFixed(1)}MW. Detection time: ${hotspot.acq_date} ${hotspot.acq_time} UTC`;

      // Create incident
      const { error } = await supabase
        .from('incidents')
        .insert({
          threat_type: 'fire',
          severity,
          lat,
          lon,
          description,
          source: 'satellite',
          verified: false,
          timestamp: new Date(`${hotspot.acq_date}T${hotspot.acq_time.padStart(4, '0').substring(0, 2)}:${hotspot.acq_time.padStart(4, '0').substring(2, 4)}:00Z`).toISOString(),
        });

      if (error) {
        console.error('Error creating satellite incident:', error);
      } else {
        newHotspots++;
        console.log('Created satellite hotspot incident at', lat, lon);
      }
    }

    console.log(`Processed ${lines.length - 1} hotspots, created ${newHotspots} new incidents`);

    return new Response(
      JSON.stringify({
        success: true,
        totalHotspots: lines.length - 1,
        newIncidents: newHotspots,
        message: `Processed ${lines.length - 1} fire hotspots, created ${newHotspots} new incidents`,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error fetching satellite data:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});