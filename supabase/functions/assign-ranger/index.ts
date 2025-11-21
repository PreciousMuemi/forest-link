import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface AssignRangerRequest {
  incident_id: string;
  auto_assign?: boolean;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { incident_id, auto_assign = true }: AssignRangerRequest = await req.json();

    console.log('Assigning ranger to incident:', incident_id);

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

    // Check if already assigned
    if (incident.assigned_ranger_id) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Incident already has a ranger assigned',
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    let assignedRanger = null;

    if (auto_assign) {
      // Find all available rangers
      const { data: availableRangers, error: rangersError } = await supabase
        .from('rangers')
        .select('*')
        .eq('status', 'available');

      if (rangersError) throw rangersError;

      if (!availableRangers || availableRangers.length === 0) {
        return new Response(
          JSON.stringify({
            success: false,
            error: 'No available rangers found',
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 404 }
        );
      }

      // Calculate distances using Haversine formula and find nearest
      const rangersWithDistance = availableRangers.map(ranger => {
        const R = 6371; // Earth's radius in km
        const dLat = (ranger.lat - incident.lat) * Math.PI / 180;
        const dLon = (ranger.lon - incident.lon) * Math.PI / 180;
        const a = 
          Math.sin(dLat / 2) * Math.sin(dLat / 2) +
          Math.cos(incident.lat * Math.PI / 180) * Math.cos(ranger.lat * Math.PI / 180) *
          Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const distance = R * c;

        return {
          ...ranger,
          distance_km: distance,
        };
      });

      // Sort by distance and pick the nearest
      rangersWithDistance.sort((a, b) => a.distance_km - b.distance_km);
      assignedRanger = rangersWithDistance[0];

      // Calculate ETA (assuming average speed of 40 km/h in forest terrain)
      const avgSpeedKmh = 40;
      const etaMinutes = Math.ceil((assignedRanger.distance_km / avgSpeedKmh) * 60);

      console.log(`Nearest ranger: ${assignedRanger.name}, Distance: ${assignedRanger.distance_km.toFixed(2)}km, ETA: ${etaMinutes} minutes`);

      // Assign ranger to incident
      const { error: updateError } = await supabase
        .from('incidents')
        .update({
          assigned_ranger_id: assignedRanger.id,
          incident_status: 'assigned',
          assigned_at: new Date().toISOString(),
          eta_minutes: etaMinutes,
        })
        .eq('id', incident_id);

      if (updateError) throw updateError;

      // Send SMS notification to ranger
      const twilioAccountSid = Deno.env.get('TWILIO_ACCOUNT_SID');
      const twilioAuthToken = Deno.env.get('TWILIO_AUTH_TOKEN');
      const twilioPhoneNumber = Deno.env.get('TWILIO_PHONE_NUMBER');

      if (twilioAccountSid && twilioAuthToken && twilioPhoneNumber) {
        try {
          const twilioAuth = btoa(`${twilioAccountSid}:${twilioAuthToken}`);
          const message = `🚨 RANGER DISPATCH: ${incident.threat_type.toUpperCase()} incident assigned to you. Severity: ${incident.severity.toUpperCase()}. Location: ${incident.lat.toFixed(4)}, ${incident.lon.toFixed(4)}. Distance: ${assignedRanger.distance_km.toFixed(1)}km. ETA: ${etaMinutes} min. ID: #${incident_id.substring(0, 8).toUpperCase()}`;

          await fetch(
            `https://api.twilio.com/2010-04-01/Accounts/${twilioAccountSid}/Messages.json`,
            {
              method: 'POST',
              headers: {
                'Authorization': `Basic ${twilioAuth}`,
                'Content-Type': 'application/x-www-form-urlencoded',
              },
              body: new URLSearchParams({
                To: assignedRanger.phone_number,
                From: twilioPhoneNumber,
                Body: message,
              }),
            }
          );

          console.log('SMS notification sent to ranger');
        } catch (smsError) {
          console.error('Failed to send SMS notification:', smsError);
          // Don't fail the whole operation if SMS fails
        }
      }

      return new Response(
        JSON.stringify({
          success: true,
          message: `Ranger ${assignedRanger.name} assigned successfully`,
          ranger: {
            id: assignedRanger.id,
            name: assignedRanger.name,
            distance_km: assignedRanger.distance_km.toFixed(2),
            eta_minutes: etaMinutes,
          },
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({
        success: false,
        error: 'Manual assignment not yet implemented',
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    );

  } catch (error) {
    console.error('Error assigning ranger:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});