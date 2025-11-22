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
        const { incident } = await req.json();

        if (!incident) {
            throw new Error('No incident data provided');
        }

        const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
        const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
        const supabase = createClient(supabaseUrl, supabaseKey);

        // Determine alert type
        let alertType = 'new_incident';
        if (incident.severity === 'high' || incident.severity === 'critical') {
            alertType = 'high_severity';
        } else if (incident.source === 'sms') {
            alertType = 'sms_report';
        } else if (incident.source === 'app') {
            alertType = 'citizen_report';
        }

        // Create alert for ranger
        const { error } = await supabase.from('ranger_alerts').insert({
            ranger_id: 'ranger', // Demo mode
            incident_id: incident.id,
            alert_type: alertType,
            title: `New ${incident.severity.toUpperCase()} Severity Incident`,
            message: `${incident.threat_type} reported via ${incident.source.toUpperCase()}`,
            read: false,
        });

        if (error) throw error;

        return new Response(JSON.stringify({ success: true }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    } catch (error) {
        console.error('Error creating ranger alert:', error);
        return new Response(JSON.stringify({ error: error.message }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 500,
        });
    }
});
