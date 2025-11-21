import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { imageUrl, lat, lon } = await req.json();
    
    console.log('Analyzing satellite image:', { imageUrl, lat, lon });

    const HF_TOKEN = Deno.env.get('HUGGING_FACE_ACCESS_TOKEN');
    if (!HF_TOKEN) {
      throw new Error('Hugging Face token not configured');
    }

    // Use Hugging Face image classification model for deforestation detection
    const response = await fetch(
      'https://router.huggingface.co/models/google/vit-base-patch16-224',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${HF_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          inputs: imageUrl,
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('HF API error:', errorText);
      throw new Error(`Hugging Face API error: ${response.status}`);
    }

    const results = await response.json();
    console.log('ML Analysis results:', results);

    // Analyze results to detect threats
    let threatDetected = false;
    let threatType = 'unknown';
    let severity = 'low';
    let confidence = 0;

    if (Array.isArray(results) && results.length > 0) {
      const topResult = results[0];
      confidence = topResult.score || 0;

      // Keywords indicating environmental threats
      const deforestationKeywords = ['desert', 'bare', 'dead', 'dry', 'burned'];
      const forestFireKeywords = ['fire', 'smoke', 'flame', 'burning'];

      const label = topResult.label?.toLowerCase() || '';

      if (deforestationKeywords.some(kw => label.includes(kw))) {
        threatDetected = true;
        threatType = 'Deforestation';
        severity = confidence > 0.7 ? 'high' : 'medium';
      } else if (forestFireKeywords.some(kw => label.includes(kw))) {
        threatDetected = true;
        threatType = 'Fire';
        severity = confidence > 0.8 ? 'critical' : 'high';
      }
    }

    // If threat detected, create incident
    if (threatDetected) {
      const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
      const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
      const supabase = createClient(supabaseUrl, supabaseKey);

      const { data: incident, error } = await supabase
        .from('incidents')
        .insert({
          lat,
          lon,
          threat_type: threatType,
          severity,
          description: `ML-detected ${threatType} (confidence: ${(confidence * 100).toFixed(1)}%)`,
          image_url: imageUrl,
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating incident:', error);
        throw error;
      }

      console.log('Threat detected and incident created:', incident);

      // Trigger alerts
      await fetch(`${supabaseUrl}/functions/v1/send-alert`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${supabaseKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ incidentId: incident.id }),
      }).catch(err => console.error('Alert error:', err));

      return new Response(
        JSON.stringify({
          threatDetected: true,
          incident,
          analysis: results,
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({
        threatDetected: false,
        analysis: results,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in analyze-satellite:', error);
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
