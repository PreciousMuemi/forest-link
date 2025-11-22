import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SMSRequest {
  to: string[];
  message: string;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { to, message }: SMSRequest = await req.json();

    const username = Deno.env.get('AFRICAS_TALKING_USERNAME');
    const apiKey = Deno.env.get('AFRICAS_TALKING_API_KEY');

    if (!username || !apiKey) {
      throw new Error('Africa\'s Talking credentials not configured');
    }

    // Format phone numbers for Kenya (ensure +254 prefix)
    const formattedNumbers = to.map(phone => {
      // Remove any whitespace
      let cleaned = phone.replace(/\s/g, '');
      
      // If starts with 07, replace with +254
      if (cleaned.startsWith('07')) {
        cleaned = '+254' + cleaned.substring(1);
      }
      // If starts with 7, add +254
      else if (cleaned.startsWith('7')) {
        cleaned = '+254' + cleaned;
      }
      // If starts with 254, add +
      else if (cleaned.startsWith('254')) {
        cleaned = '+' + cleaned;
      }
      // If doesn't start with +, add it
      else if (!cleaned.startsWith('+')) {
        cleaned = '+' + cleaned;
      }
      
      return cleaned;
    });

    // Africa's Talking SMS API
    const atApiUrl = 'https://api.sandbox.africastalking.com/version1/messaging';
    
    const response = await fetch(atApiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'apiKey': apiKey,
        'Accept': 'application/json',
      },
      body: new URLSearchParams({
        username: username,
        to: formattedNumbers.join(','),
        message: message,
      }),
    });

    const result = await response.json();

    console.log('Africa\'s Talking SMS Response:', result);

    if (!response.ok) {
      throw new Error(`SMS API error: ${JSON.stringify(result)}`);
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'SMS sent successfully',
        details: result,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error sending SMS via Africa\'s Talking:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    return new Response(
      JSON.stringify({
        success: false,
        error: errorMessage,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
