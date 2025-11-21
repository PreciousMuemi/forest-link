import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { threatType } = await req.json();
    
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    // Map threat types to detailed prompts for realistic images
    const promptMap: Record<string, string> = {
      'Fire': 'Ultra high resolution aerial photograph of a severe forest fire, massive flames and smoke billowing through dense green forest canopy, dramatic orange and red fire consuming trees, realistic wildfire disaster photography, intense heat waves visible, professional documentary style, 16:9 aspect ratio',
      'Deforestation': 'Ultra high resolution aerial photograph of deforestation, cleared forest land with fallen trees and stumps, heavy machinery visible, contrast between lush green forest and barren cleared area, environmental destruction, documentary photography style, dramatic lighting, 16:9 aspect ratio',
      'Illegal Logging': 'Ultra high resolution photograph of illegal logging operation, freshly cut tree trunks stacked, chainsaw marks visible, forest clearing with logging equipment, environmental crime scene, photojournalism style, natural lighting, detailed textures, 16:9 aspect ratio',
      'Wildlife Poaching': 'Ultra high resolution photograph of wildlife protection patrol, rangers monitoring forest area with tracking equipment, conservation efforts, endangered species habitat protection, environmental documentary style, golden hour lighting, 16:9 aspect ratio',
    };

    const prompt = promptMap[threatType] || promptMap['Fire'];

    console.log('Generating image for threat type:', threatType);

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash-image',
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        modalities: ['image', 'text']
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI Gateway error:', response.status, errorText);
      throw new Error(`AI Gateway error: ${response.status}`);
    }

    const data = await response.json();
    console.log('Image generation response received');

    // Extract the base64 image
    const imageUrl = data.choices?.[0]?.message?.images?.[0]?.image_url?.url;
    
    if (!imageUrl) {
      throw new Error('No image generated');
    }

    return new Response(
      JSON.stringify({ imageUrl }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error generating threat image:', error);
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
