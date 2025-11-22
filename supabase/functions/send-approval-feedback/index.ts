import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface FeedbackRequest {
    phoneNumber: string;
    threatType: string;
    incidentId: string;
}

Deno.serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response(null, { headers: corsHeaders });
    }

    try {
        const { phoneNumber, threatType, incidentId }: FeedbackRequest = await req.json();

        console.log('Sending approval feedback SMS:', { phoneNumber, threatType, incidentId });

        const accountSid = Deno.env.get('TWILIO_ACCOUNT_SID');
        const authToken = Deno.env.get('TWILIO_AUTH_TOKEN');
        const fromNumber = Deno.env.get('TWILIO_PHONE_NUMBER');

        if (!accountSid || !authToken || !fromNumber) {
            console.log('Twilio configuration not set - skipping feedback SMS');
            return new Response(
                JSON.stringify({ success: true, demo: true, message: 'SMS system not configured' }),
                { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
        }

        // Format phone number for SMS (remove whatsapp: prefix if present)
        const toNumber = phoneNumber.replace('whatsapp:', '');

        // Create thank you message
        const message = `🌳 Thank you for keeping Kenya safe! 🇰🇪\n\n` +
            `Your ${threatType} report has been VERIFIED by our team.\n\n` +
            `Your vigilance helps protect our precious forests and wildlife. ` +
            `Together, we're making a difference!\n\n` +
            `Reference: ${incidentId.slice(0, 8)}\n\n` +
            `- ForestGuard Kenya 🌲`;

        // Send SMS via Twilio
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

        console.log('Successfully sent approval feedback SMS');

        return new Response(
            JSON.stringify({ success: true, messageSid: twilioResult.sid }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    } catch (error) {
        console.error('Error in send-approval-feedback:', error);
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
