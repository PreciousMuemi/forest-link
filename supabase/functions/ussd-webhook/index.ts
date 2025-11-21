import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface USSDRequest {
  sessionId: string;
  serviceCode: string;
  phoneNumber: string;
  text: string;
}

// In-memory session storage (in production, use Redis or Supabase)
const sessions = new Map<string, any>();

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Parse Africa's Talking USSD request (form data)
    const formData = await req.formData();
    const sessionId = formData.get('sessionId') as string;
    const serviceCode = formData.get('serviceCode') as string;
    const phoneNumber = formData.get('phoneNumber') as string;
    const text = formData.get('text') as string;

    console.log('USSD Request received:', { sessionId, serviceCode, phoneNumber, text });

    // Initialize Supabase
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get or create session data
    let session = sessions.get(sessionId) || { step: 'main' };
    
    // Parse user input (text contains the full input path: "1*2" means menu 1, then option 2)
    // Empty string means first request (main menu)
    const inputs = text && text.trim() !== '' ? text.split('*') : [];
    const lastInput = inputs[inputs.length - 1] || '';

    console.log('Parsed inputs:', { inputs, lastInput, inputsLength: inputs.length });

    let response = '';
    let endSession = false;

    // Main menu - show when no input or empty text
    if (inputs.length === 0 || text === '') {
      response = `CON Welcome to KFEAN Forest Alert System
1. Report Fire 🔥
2. Report Logging 🪓
3. Report Charcoal Production
4. Check My Last Report
5. Emergency Contact`;
    }
    // User selected an option from main menu
    else if (inputs.length === 1) {
      const option = inputs[0];
      
      if (option === '1') {
        session.threatType = 'fire';
        session.step = 'location';
        response = `CON Report Fire Alert
Enter location name (e.g., Kinale, Mt Kenya, Karura):`;
      } else if (option === '2') {
        session.threatType = 'deforestation';
        session.step = 'location';
        response = `CON Report Illegal Logging
Enter location name (e.g., Mau Forest, Aberdare):`;
      } else if (option === '3') {
        session.threatType = 'charcoal production';
        session.step = 'location';
        response = `CON Report Charcoal Production
Enter location name:`;
      } else if (option === '4') {
        // Check last report
        const { data: lastReport } = await supabase
          .from('incidents')
          .select('id, threat_type, created_at, incident_status')
          .eq('sender_phone', phoneNumber)
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        if (lastReport) {
          const incidentId = lastReport.id.substring(0, 8).toUpperCase();
          const status = lastReport.incident_status || 'reported';
          const date = new Date(lastReport.created_at).toLocaleDateString();
          response = `END Your Last Report
ID: #${incidentId}
Type: ${lastReport.threat_type}
Status: ${status}
Date: ${date}

Thank you for protecting our forests!`;
        } else {
          response = `END No reports found from your number. Press OK to exit.`;
        }
        endSession = true;
      } else if (option === '5') {
        response = `END Emergency Hotline: +254 700 000 000

Kenya Forest Service
Email: alerts@kfs.go.ke

For life-threatening emergencies, call 999.`;
        endSession = true;
      } else {
        response = `END Invalid option. Please dial ${serviceCode} again.`;
        endSession = true;
      }
    }
    // User entered location
    else if (inputs.length === 2 && session.step === 'location') {
      const location = lastInput.trim();
      
      if (location.length < 2) {
        response = `END Location too short. Please dial ${serviceCode} again.`;
        endSession = true;
      } else {
        session.location = location;
        session.step = 'confirm';
        response = `CON Confirm Report:
Type: ${session.threatType}
Location: ${location}

1. Confirm & Send
2. Cancel`;
      }
    }
    // User confirmed or cancelled
    else if (inputs.length === 3 && session.step === 'confirm') {
      const confirm = lastInput;
      
      if (confirm === '1') {
        // Create incident report
        const location = session.location.toLowerCase();
        
        // Simple geocoding for Kenya
        const knownLocations: Record<string, [number, number]> = {
          'nairobi': [-1.2921, 36.8219],
          'mombasa': [-4.0435, 39.6682],
          'kisumu': [-0.0917, 34.7680],
          'nakuru': [-0.3031, 36.0800],
          'eldoret': [0.5143, 35.2698],
          'mau': [-0.4500, 35.5000],
          'aberdare': [-0.3667, 36.7167],
          'karura': [-1.2500, 36.8667],
          'kinale': [-1.0667, 36.6333],
          'mt kenya': [-0.1521, 37.3084],
          'tsavo': [-2.3825, 38.4531],
          'kakamega': [0.2827, 34.7519],
        };

        let lat = -0.0236; // Default: Nairobi
        let lon = 37.9062;

        // Try to match known locations
        for (const [name, coords] of Object.entries(knownLocations)) {
          if (location.includes(name)) {
            lat = coords[0];
            lon = coords[1];
            break;
          }
        }

        // Determine severity
        const severity = session.threatType === 'fire' ? 'high' : 'medium';

        // Create incident
        const { data: incident, error } = await supabase
          .from('incidents')
          .insert({
            threat_type: session.threatType,
            severity,
            lat,
            lon,
            description: `USSD Report: ${session.threatType} at ${session.location}`,
            source: 'ussd',
            sender_phone: phoneNumber,
            verified: false,
          })
          .select()
          .single();

        if (error) {
          console.error('Error creating incident:', error);
          response = `END Error submitting report. Please try again or call our hotline.`;
        } else {
          const incidentId = incident.id.substring(0, 8).toUpperCase();
          
          // Send SMS confirmation via Twilio
          try {
            const twilioSid = Deno.env.get('TWILIO_ACCOUNT_SID');
            const twilioToken = Deno.env.get('TWILIO_AUTH_TOKEN');
            const twilioPhone = Deno.env.get('TWILIO_PHONE_NUMBER');

            if (twilioSid && twilioToken && twilioPhone) {
              const smsBody = `✅ KFEAN Report Received!\n\nID: #${incidentId}\nType: ${session.threatType}\nLocation: ${session.location}\n\nRangers alerted. Thank you for protecting our forests!`;
              
              const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${twilioSid}/Messages.json`;
              const twilioAuth = btoa(`${twilioSid}:${twilioToken}`);
              
              await fetch(twilioUrl, {
                method: 'POST',
                headers: {
                  'Authorization': `Basic ${twilioAuth}`,
                  'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: new URLSearchParams({
                  From: twilioPhone,
                  To: phoneNumber,
                  Body: smsBody,
                }),
              });
            }
          } catch (smsError) {
            console.error('SMS send error:', smsError);
            // Don't fail the whole request if SMS fails
          }

          response = `END ✅ Report Submitted!

ID: #${incidentId}
Type: ${session.threatType}
Location: ${session.location}

Rangers have been alerted.
You will receive SMS updates.

Thank you for protecting our forests! 🌳`;
        }
        
        endSession = true;
        sessions.delete(sessionId); // Clean up session
      } else if (confirm === '2') {
        response = `END Report cancelled. Dial ${serviceCode} to try again.`;
        endSession = true;
        sessions.delete(sessionId);
      } else {
        response = `END Invalid option. Please dial ${serviceCode} again.`;
        endSession = true;
        sessions.delete(sessionId);
      }
    }
    // Invalid flow
    else {
      response = `END Invalid input. Please dial ${serviceCode} again.`;
      endSession = true;
      sessions.delete(sessionId);
    }

    // Save session state if not ending
    if (!endSession) {
      sessions.set(sessionId, session);
    }

    return new Response(response, {
      headers: { ...corsHeaders, 'Content-Type': 'text/plain' },
    });

  } catch (error) {
    console.error('USSD Error:', error);
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    return new Response('END Service temporarily unavailable. Please try again.', {
      headers: { ...corsHeaders, 'Content-Type': 'text/plain' },
      status: 200, // Always return 200 for USSD
    });
  }
});
