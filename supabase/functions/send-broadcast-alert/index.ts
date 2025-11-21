import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface BroadcastRequest {
  incident_id: string;
  radius_km: number;
  custom_message?: string;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { incident_id, radius_km, custom_message }: BroadcastRequest = await req.json();

    console.log('Broadcasting alert for incident:', incident_id, 'radius:', radius_km);

    // Initialize Supabase
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get incident details
    const { data: incident, error: incidentError } = await supabase
      .from('incidents')
      .select('*')
      .eq('id', incident_id)
      .single();

    if (incidentError || !incident) {
      throw new Error('Incident not found');
    }

    // Find users within radius using Haversine formula
    // Simple approximation: 1 degree ≈ 111km
    const latRange = radius_km / 111;
    const lonRange = radius_km / (111 * Math.cos(incident.lat * Math.PI / 180));

    const { data: nearbyUsers, error: usersError } = await supabase
      .from('profiles')
      .select('phone_number, lat, lon')
      .not('phone_number', 'is', null)
      .not('lat', 'is', null)
      .not('lon', 'is', null)
      .gte('lat', incident.lat - latRange)
      .lte('lat', incident.lat + latRange)
      .gte('lon', incident.lon - lonRange)
      .lte('lon', incident.lon + lonRange);

    if (usersError) {
      console.error('Error finding nearby users:', usersError);
      throw usersError;
    }

    // Filter users by exact distance (Haversine formula)
    const validUsers = (nearbyUsers || []).filter(user => {
      const R = 6371; // Earth's radius in km
      const dLat = (user.lat - incident.lat) * Math.PI / 180;
      const dLon = (user.lon - incident.lon) * Math.PI / 180;
      const a = 
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(incident.lat * Math.PI / 180) * Math.cos(user.lat * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      const distance = R * c;
      return distance <= radius_km;
    });

    console.log(`Found ${validUsers.length} users within ${radius_km}km`);

    if (validUsers.length === 0) {
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'No users found within radius',
          sent_count: 0 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Prepare alert message
    const defaultMessage = `⚠️ FOREST ALERT: ${incident.threat_type.toUpperCase()} detected ${radius_km}km from your location. ${incident.severity.toUpperCase()} severity. Rangers responding. Reply: SAFE, NEED_HELP, or EVACUATING. ID: #${incident.id.substring(0, 8).toUpperCase()}`;
    const message = custom_message || defaultMessage;

    // Send SMS to each user via Twilio
    const twilioAccountSid = Deno.env.get('TWILIO_ACCOUNT_SID');
    const twilioAuthToken = Deno.env.get('TWILIO_AUTH_TOKEN');
    const twilioPhoneNumber = Deno.env.get('TWILIO_PHONE_NUMBER');

    if (!twilioAccountSid || !twilioAuthToken || !twilioPhoneNumber) {
      throw new Error('Twilio credentials not configured');
    }

    const twilioAuth = btoa(`${twilioAccountSid}:${twilioAuthToken}`);
    const phoneNumbers: string[] = [];
    let sentCount = 0;

    for (const user of validUsers) {
      try {
        const response = await fetch(
          `https://api.twilio.com/2010-04-01/Accounts/${twilioAccountSid}/Messages.json`,
          {
            method: 'POST',
            headers: {
              'Authorization': `Basic ${twilioAuth}`,
              'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
              To: user.phone_number,
              From: twilioPhoneNumber,
              Body: message,
            }),
          }
        );

        if (response.ok) {
          phoneNumbers.push(user.phone_number);
          sentCount++;
          console.log('Alert sent to:', user.phone_number);
        } else {
          const error = await response.text();
          console.error('Failed to send to', user.phone_number, ':', error);
        }
      } catch (error) {
        console.error('Error sending SMS to', user.phone_number, ':', error);
      }
    }

    // Log the alert
    const { error: logError } = await supabase
      .from('alert_logs')
      .insert({
        incident_id,
        sent_to: phoneNumbers,
        message,
        radius_km,
      });

    if (logError) {
      console.error('Error logging alert:', logError);
    }

    console.log(`Successfully sent ${sentCount} alerts`);

    return new Response(
      JSON.stringify({
        success: true,
        message: `Alert sent to ${sentCount} community members`,
        sent_count: sentCount,
        recipients: phoneNumbers.length,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error sending broadcast alert:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});