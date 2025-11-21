import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface TwilioSMS {
  From: string;
  Body: string;
  FromCity?: string;
  FromState?: string;
  FromCountry?: string;
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Parse Twilio's form data
    const formData = await req.formData();
    const from = formData.get('From') as string;
    const body = formData.get('Body') as string;
    const city = formData.get('FromCity') as string || '';
    const country = formData.get('FromCountry') as string || '';

    console.log('Received SMS from:', from, 'Body:', body);

    if (!body) {
      return new Response(
        '<?xml version="1.0" encoding="UTF-8"?><Response><Message>Please send: FIRE [location] or LOGGING [location] or CHARCOAL [location]</Message></Response>',
        { headers: { ...corsHeaders, 'Content-Type': 'text/xml' } }
      );
    }

    // Parse SMS: "FIRE Kinale" or "LOGGING Mt Kenya"
    const parts = body.trim().split(/\s+/);
    if (parts.length < 2) {
      return new Response(
        '<?xml version="1.0" encoding="UTF-8"?><Response><Message>Format: FIRE [location] or LOGGING [location]</Message></Response>',
        { headers: { ...corsHeaders, 'Content-Type': 'text/xml' } }
      );
    }

    const threatKeyword = parts[0].toUpperCase();
    const location = parts.slice(1).join(' ');

    // Map keywords to threat types
    const threatMap: Record<string, string> = {
      'FIRE': 'fire',
      'LOGGING': 'deforestation',
      'CHARCOAL': 'charcoal production',
      'CUT': 'deforestation',
      'BURN': 'fire',
      'SMOKE': 'fire',
      'MOTO': 'fire', // Swahili for fire
      'TREE': 'deforestation'
    };

    const threatType = threatMap[threatKeyword];
    if (!threatType) {
      return new Response(
        '<?xml version="1.0" encoding="UTF-8"?><Response><Message>Use: FIRE, LOGGING, CHARCOAL, or BURN followed by location</Message></Response>',
        { headers: { ...corsHeaders, 'Content-Type': 'text/xml' } }
      );
    }

    // Initialize Supabase
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Try to geocode location (simple Kenya-based defaults)
    // In production, use Mapbox Geocoding API or Google Maps Geocoding
    let lat = -0.0236; // Default: Nairobi
    let lon = 37.9062;
    let description = `SMS Report: ${threatType} near ${location}`;

    // Simple location matching for Kenya (expand this in production)
    const knownLocations: Record<string, [number, number]> = {
      'nairobi': [-1.2921, 36.8219],
      'mombasa': [-4.0435, 39.6682],
      'kisumu': [-0.0917, 34.7680],
      'nakuru': [-0.3031, 36.0800],
      'eldoret': [0.5143, 35.2698],
      'mau': [-0.4500, 35.5000],
      'aberdare': [-0.3667, 36.7167],
      'karura': [-1.2500, 36.8667],
      'kinale': [-1.0667, 36.6333],
      'mt kenya': [-0.1521, 37.3084],
    };

    const locationLower = location.toLowerCase();
    for (const [name, coords] of Object.entries(knownLocations)) {
      if (locationLower.includes(name)) {
        lat = coords[0];
        lon = coords[1];
        break;
      }
    }

    // Determine severity based on threat type
    const severity = threatType === 'fire' ? 'high' : 'medium';

    // Create incident
    const { data: incident, error } = await supabase
      .from('incidents')
      .insert({
        threat_type: threatType,
        severity,
        lat,
        lon,
        description,
        source: 'sms',
        sender_phone: from,
        verified: false,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating incident:', error);
      throw error;
    }

    console.log('Created SMS incident:', incident.id);

    // Send confirmation SMS
    const incidentId = incident.id.substring(0, 8).toUpperCase();
    return new Response(
      `<?xml version="1.0" encoding="UTF-8"?><Response><Message>✅ Report received! ID: #${incidentId}. Rangers alerted. Thank you for protecting our forests!</Message></Response>`,
      { headers: { ...corsHeaders, 'Content-Type': 'text/xml' } }
    );

  } catch (error) {
    console.error('Error processing SMS:', error);
    return new Response(
      '<?xml version="1.0" encoding="UTF-8"?><Response><Message>Error processing report. Please try again.</Message></Response>',
      { headers: { ...corsHeaders, 'Content-Type': 'text/xml' }, status: 500 }
    );
  }
});