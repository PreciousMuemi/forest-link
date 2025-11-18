import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface AlertRequest {
  incidentId: string;
  threatType: string;
  severity: string;
  lat: number;
  lon: number;
  description?: string;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { incidentId, threatType, severity, lat, lon, description }: AlertRequest = await req.json();

    console.log('Sending WhatsApp alert:', { incidentId, threatType, severity, lat, lon });

    const accountSid = Deno.env.get('TWILIO_ACCOUNT_SID');
    const authToken = Deno.env.get('TWILIO_AUTH_TOKEN');
    const fromNumber = Deno.env.get('TWILIO_PHONE_NUMBER');
    const toNumber = 'whatsapp:+254714296157'; // Your WhatsApp number

    if (!accountSid || !authToken || !fromNumber) {
      throw new Error('Missing Twilio configuration');
    }

    // Create alert message
    const message = `🚨 *Forest Threat Alert* 🚨\n\n` +
      `Type: ${threatType}\n` +
      `Severity: ${severity.toUpperCase()}\n` +
      `Location: ${lat.toFixed(4)}, ${lon.toFixed(4)}\n` +
      `${description ? `Details: ${description}\n` : ''}` +
      `Incident ID: ${incidentId.slice(0, 8)}\n\n` +
      `Immediate action required!`;

    // Send WhatsApp message via Twilio
    const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;
    const auth = btoa(`${accountSid}:${authToken}`);

    const formData = new URLSearchParams();
    formData.append('From', fromNumber);
    formData.append('To', toNumber);
    formData.append('Body', message);

    const twilioResponse = await fetch(twilioUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData.toString(),
    });

    const twilioResult = await twilioResponse.json();
    console.log('Twilio response:', twilioResult);

    if (!twilioResponse.ok) {
      throw new Error(`Twilio error: ${JSON.stringify(twilioResult)}`);
    }

    // Update incident alert status
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { error: updateError } = await supabase
      .from('incidents')
      .update({ alert_status: 'sent' })
      .eq('id', incidentId);

    if (updateError) {
      console.error('Error updating incident:', updateError);
      throw updateError;
    }

    console.log('Successfully sent WhatsApp alert');

    return new Response(
      JSON.stringify({ success: true, messageSid: twilioResult.sid }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in send-alert:', error);
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
