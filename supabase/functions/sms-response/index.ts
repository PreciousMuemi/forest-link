import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const formData = await req.formData();
    const from = formData.get('From') as string;
    const body = formData.get('Body') as string;

    console.log('Received response from:', from, 'Body:', body);

    if (!body) {
      return new Response(
        '<?xml version="1.0" encoding="UTF-8"?><Response><Message>Thank you for your response!</Message></Response>',
        { headers: { ...corsHeaders, 'Content-Type': 'text/xml' } }
      );
    }

    const bodyUpper = body.trim().toUpperCase();

    // Parse response type
    let responseType: string;
    let additionalMessage: string = '';

    if (bodyUpper === 'SAFE') {
      responseType = 'SAFE';
    } else if (bodyUpper === 'NEED HELP' || bodyUpper === 'NEED_HELP' || bodyUpper === 'HELP') {
      responseType = 'NEED_HELP';
    } else if (bodyUpper === 'EVACUATING' || bodyUpper === 'EVACUATION') {
      responseType = 'EVACUATING';
    } else if (bodyUpper.startsWith('#')) {
      // Specific incident reference with status
      const parts = body.trim().split(/\s+/);
      const incidentRef = parts[0];
      const status = parts[1]?.toUpperCase();
      
      if (status && ['SAFE', 'HELP', 'EVACUATING'].includes(status)) {
        responseType = status === 'HELP' ? 'NEED_HELP' : status;
        additionalMessage = `Incident ${incidentRef}`;
      } else {
        responseType = 'OTHER';
        additionalMessage = body;
      }
    } else {
      responseType = 'OTHER';
      additionalMessage = body;
    }

    // Initialize Supabase
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Find the most recent incident that was alerted to this phone number
    const { data: recentAlert } = await supabase
      .from('alert_logs')
      .select('incident_id, sent_at')
      .contains('sent_to', [from])
      .order('sent_at', { ascending: false })
      .limit(1)
      .single();

    let incidentId = recentAlert?.incident_id;

    // If no recent alert, try to extract incident ID from message
    if (!incidentId && bodyUpper.includes('#')) {
      const match = body.match(/#([A-Z0-9]+)/);
      if (match) {
        const shortId = match[1];
        // Try to find incident by partial ID match
        const { data: incidents } = await supabase
          .from('incidents')
          .select('id')
          .ilike('id', `${shortId}%`)
          .limit(1);
        
        if (incidents && incidents.length > 0) {
          incidentId = incidents[0].id;
        }
      }
    }

    // If still no incident found, use the most recent incident
    if (!incidentId) {
      const { data: recentIncident } = await supabase
        .from('incidents')
        .select('id')
        .order('timestamp', { ascending: false })
        .limit(1)
        .single();
      
      incidentId = recentIncident?.id;
    }

    if (incidentId) {
      // Store community response
      const { error: responseError } = await supabase
        .from('community_responses')
        .insert({
          incident_id: incidentId,
          phone_number: from,
          response: responseType,
          message: additionalMessage || null,
        });

      if (responseError) {
        console.error('Error storing response:', responseError);
      } else {
        console.log('Response stored successfully:', responseType);
      }
    }

    // Send appropriate confirmation based on response type
    let confirmationMessage: string;
    switch (responseType) {
      case 'SAFE':
        confirmationMessage = '✅ Thank you! We have recorded that you are safe. Stay vigilant and report any changes.';
        break;
      case 'NEED_HELP':
        confirmationMessage = '🚨 HELP REQUEST RECEIVED! Rangers have been alerted to your location. Stay in a safe place. We are coming to assist you.';
        break;
      case 'EVACUATING':
        confirmationMessage = '⚠️ Evacuation status recorded. Move to a safe location away from the threat. Follow ranger instructions.';
        break;
      default:
        confirmationMessage = '✅ Your response has been received and logged. Thank you for keeping us updated!';
    }

    return new Response(
      `<?xml version="1.0" encoding="UTF-8"?><Response><Message>${confirmationMessage}</Message></Response>`,
      { headers: { ...corsHeaders, 'Content-Type': 'text/xml' } }
    );

  } catch (error) {
    console.error('Error processing SMS response:', error);
    return new Response(
      '<?xml version="1.0" encoding="UTF-8"?><Response><Message>Thank you for your response. It has been recorded.</Message></Response>',
      { headers: { ...corsHeaders, 'Content-Type': 'text/xml' }, status: 200 }
    );
  }
});