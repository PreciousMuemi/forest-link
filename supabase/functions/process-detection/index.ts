import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface DetectionRequest {
  lat: number;
  lon: number;
  threat_type: string;
  severity: string;
  description?: string;
  image_url?: string;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const detection: DetectionRequest = await req.json();

    console.log('Processing ML detection:', detection);

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Insert incident into database
    const { data: incident, error: insertError } = await supabase
      .from('incidents')
      .insert({
        lat: detection.lat,
        lon: detection.lon,
        threat_type: detection.threat_type,
        severity: detection.severity,
        description: detection.description,
        image_url: detection.image_url,
        alert_status: 'pending',
      })
      .select()
      .single();

    if (insertError) {
      console.error('Error inserting incident:', insertError);
      throw insertError;
    }

    console.log('Incident created:', incident.id);

    // Trigger blockchain logging (background task - non-blocking)
    supabase.functions.invoke('log-blockchain', {
      body: {
        incidentId: incident.id,
        threatType: incident.threat_type,
        severity: incident.severity,
        lat: incident.lat,
        lon: incident.lon,
      },
    }).then(({ data, error }) => {
      if (error) console.error('Blockchain logging failed:', error);
      else console.log('Blockchain logged successfully:', data);
    });

    // Trigger WhatsApp alert (background task - non-blocking)
    supabase.functions.invoke('send-alert', {
      body: {
        incidentId: incident.id,
        threatType: incident.threat_type,
        severity: incident.severity,
        lat: incident.lat,
        lon: incident.lon,
        description: incident.description,
      },
    }).then(({ data, error }) => {
      if (error) console.error('Alert sending failed:', error);
      else console.log('Alert sent successfully:', data);
    });

    console.log('Successfully processed detection');

    return new Response(
      JSON.stringify({ 
        success: true, 
        incident: {
          id: incident.id,
          lat: incident.lat,
          lon: incident.lon,
          threat_type: incident.threat_type,
          severity: incident.severity,
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in process-detection:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
