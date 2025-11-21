import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface AnalysisRequest {
  imageUrl: string;
  lat: number;
  lon: number;
  threatType?: string;
  description?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { imageUrl, lat, lon, threatType: userThreatType, description } = await req.json() as AnalysisRequest;
    
    console.log('Analyzing satellite image:', { imageUrl, lat, lon, threatType: userThreatType });

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('Lovable API key not configured');
    }

    // Use Lovable AI (Gemini) for image analysis
    const analysisPrompt = `Analyze this environmental image and determine if there are any threats present.

Look for signs of:
- Deforestation (cleared land, cut trees, logging activity)
- Forest fires (smoke, flames, burned areas)
- Illegal logging (cut timber, logging equipment)
- Wildlife poaching (traps, snares, suspicious activity)
- Land encroachment (unauthorized construction, settlements)

Respond with a JSON object in this exact format:
{
  "threatDetected": true or false,
  "threatType": "Fire" | "Deforestation" | "Illegal Logging" | "Wildlife Poaching" | "Land Encroachment" | "None",
  "severity": "low" | "medium" | "high" | "critical",
  "confidence": 0.0 to 1.0,
  "description": "Brief description of what you see",
  "reasoning": "Why you classified it this way"
}`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'user',
            content: [
              { type: 'text', text: analysisPrompt },
              { type: 'image_url', image_url: { url: imageUrl } }
            ]
          }
        ],
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Lovable AI API error:', errorText);
      throw new Error(`Lovable AI API error: ${response.status}`);
    }

    const aiResponse = await response.json();
    console.log('AI Analysis response:', aiResponse);

    // Parse the AI response
    const content = aiResponse.choices[0]?.message?.content || '{}';
    let analysis;
    try {
      // Try to extract JSON from markdown code blocks if present
      const jsonMatch = content.match(/```json\n([\s\S]*?)\n```/) || content.match(/\{[\s\S]*\}/);
      const jsonStr = jsonMatch ? (jsonMatch[1] || jsonMatch[0]) : content;
      analysis = JSON.parse(jsonStr);
    } catch (e) {
      console.error('Failed to parse AI response:', content);
      // Fallback: assume no threat if parsing fails
      analysis = {
        threatDetected: false,
        threatType: 'None',
        severity: 'low',
        confidence: 0,
        description: 'Unable to analyze image',
        reasoning: 'AI response parsing failed'
      };
    }

    console.log('Parsed analysis:', analysis);

    const threatDetected = analysis.threatDetected || false;
    const threatType = analysis.threatType || userThreatType || 'Unknown';
    const severity = analysis.severity || 'medium';
    const confidence = analysis.confidence || 0;

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
          analysis,
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({
        threatDetected: false,
        analysis,
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
