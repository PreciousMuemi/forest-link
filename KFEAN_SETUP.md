# Kenya Forest Emergency Alert Network (KFEAN) - Setup Guide

## Day 1 MVP Implementation Complete ✅

This guide covers the setup and testing of the multi-channel forest threat reporting system.

---

## 🎯 Features Implemented

### 1. **SMS Webhook System** ✅
- Basic phone users can send SMS reports
- Format: `FIRE [location]` or `LOGGING [location]` or `CHARCOAL [location]`
- Automatic geocoding for known Kenyan locations
- SMS confirmation with incident ID

### 2. **Source Tracking** ✅
- Database now tracks report source: `pwa`, `sms`, `satellite`, `manual`
- Visual indicators in admin dashboard
- Filter incidents by source

### 3. **NASA FIRMS Satellite Integration** ✅
- Automatic fire hotspot detection
- Updates available from NASA's VIIRS satellite data
- Admin can manually trigger satellite data fetch
- Auto-creates incidents for high-confidence detections (>80%)

### 4. **Enhanced Admin Dashboard** ✅
- Filter by source (App/SMS/Satellite)
- Filter by severity (Critical/High/Medium/Low)
- Real-time refresh
- Manual satellite data fetch button
- Export incidents to CSV

### 5. **Broadcast Alert System** ✅ NEW!
- Send SMS alerts to communities within configurable radius
- Community feedback loop with real-time status tracking
- Response summary dashboard
- Auto-confirmation SMS for community responses

---

## 🔧 Setup Instructions

### **1. Configure Twilio SMS Webhook**

#### A. Get Your Edge Function URL
Your SMS webhook endpoint is:
```
https://rivkrzxrsnsrubnfvdvy.supabase.co/functions/v1/sms-webhook
```

#### B. Configure Twilio
1. Log in to [Twilio Console](https://console.twilio.com/)
2. Go to **Phone Numbers** → **Manage** → **Active Numbers**
3. Click on your phone number
4. Scroll to **Messaging Configuration**
5. Under "A MESSAGE COMES IN", configure:
   - **Webhook URL**: `https://rivkrzxrsnsrubnfvdvy.supabase.co/functions/v1/sms-webhook`
   - **HTTP Method**: `POST`
6. Click **Save**

#### C. Test SMS Reporting
Send a text message to your Twilio number:
```
FIRE Kinale Forest
```

You should receive:
```
✅ Report received! ID: #ABC12345. Rangers alerted. Thank you for protecting our forests!
```

### **2. Get NASA FIRMS API Key**

#### A. Register for Free API Key
1. Visit [NASA FIRMS](https://firms.modaps.eosdis.nasa.gov/api/area/)
2. Click "Request MAP_KEY" 
3. Fill in the form (instant approval)
4. Copy your API key

#### B. Add to Secrets
The API key has already been added to your Lovable Cloud secrets as `NASA_FIRMS_API_KEY`.

### **3. Test Satellite Data Fetch**

#### Option A: Via Admin Dashboard
1. Log in to the app
2. Go to Admin Dashboard
3. Click **"Fetch Satellite Data"** button
4. Wait for confirmation toast
5. Check the incidents table for new satellite-sourced incidents

#### Option B: Via Direct API Call
```bash
curl -X POST \
  https://rivkrzxrsnsrubnfvdvy.supabase.co/functions/v1/fetch-satellite-hotspots \
  -H "Content-Type: application/json"
```

---

## 📊 SMS Report Format

### Supported Keywords
- `FIRE` / `BURN` / `SMOKE` / `MOTO` → Fire incidents
- `LOGGING` / `CUT` / `TREE` → Deforestation
- `CHARCOAL` → Charcoal production

### Supported Locations (Auto-Geocoded)
- Nairobi
- Mombasa
- Kisumu
- Nakuru
- Eldoret
- Mau Forest
- Aberdare Range
- Karura Forest
- Kinale Forest
- Mt Kenya

**Note**: If location not recognized, defaults to Nairobi coordinates. Can be expanded easily.

### Example SMS Messages
```
FIRE Kinale
LOGGING Mau Forest
CHARCOAL Mt Kenya
BURN Aberdare
CUT Karura
```

---

## 🎨 Visual Indicators

### Source Colors in Map
- 🔴 **Red** = App Reports (PWA)
- 🟢 **Green** = SMS Reports
- 🔵 **Blue** = Satellite Detections

### Source Badges in Admin
- 📱 **App** = PWA reports
- 💬 **SMS** = Text message reports
- 🛰️ **Satellite** = NASA FIRMS hotspots

---

## 🧪 Testing the Complete System

### Test 1: SMS Report Flow
1. Send SMS: `FIRE Kinale` to Twilio number
2. Check Admin Dashboard → Filter by "SMS"
3. Verify incident created with source = `sms`
4. Check sender phone number in incident details

### Test 2: App Report Flow
1. Use Field Reporter form on homepage
2. Upload photo, select location
3. Submit report
4. Check Admin Dashboard → Filter by "App"
5. Verify incident created with source = `pwa`

### Test 3: Satellite Detection Flow
1. Go to Admin Dashboard
2. Click "Fetch Satellite Data"
3. Wait for processing (can take 10-30 seconds)
4. Filter by "Satellite"
5. Verify new hotspots appear with source = `satellite`

### Test 4: Filtering
1. Go to Admin Dashboard
2. Test source filter: All / App / SMS / Satellite
3. Test severity filter: All / Critical / High / Medium / Low
4. Verify incidents update correctly

---

## 🚀 Hackathon Demo Script

### Opening (30 seconds)
"Kenya has no unified forest emergency system. Reports are scattered across WhatsApp and phone calls. We built KFEAN - the first system that unifies ALL reporting channels."

### Demo Flow (3 minutes)

#### 1. Show SMS Report (30 seconds)
- Send live SMS: `FIRE Mau Forest`
- Show instant confirmation
- Show incident appear on map in real-time

#### 2. Show App Report (45 seconds)
- Use Field Reporter
- Take photo, auto-detect GPS
- Submit and show on map

#### 3. Show Satellite Detection (45 seconds)
- Click "Fetch Satellite Data"
- Show NASA FIRMS hotspots loading
- Show satellite-sourced incidents

#### 4. Show Admin Dashboard (60 seconds)
- Filter by source (App/SMS/Satellite)
- Show response time analytics
- Export data to CSV

### Closing (30 seconds)
"KFEAN works on ANY phone - from $10 Nokia to iPhone. Every Kenyan becomes a forest guardian. Response time: Hours → Minutes. Coverage: 100%."

---

## 📈 Next Steps (Day 2+)

### Phase 2: Broadcast Alerts ✅ COMPLETE

#### Features Implemented
- **Send SMS alerts** to communities within configurable radius (1-50km)
- **Community feedback loop** with status responses:
  - `SAFE` - Community member confirms they are safe
  - `NEED_HELP` - Emergency assistance needed
  - `EVACUATING` - Community member is evacuating
- **Real-time response tracking** in admin dashboard
- **Response summary** showing total responses and breakdown by status
- **Auto-confirmation SMS** sent back to community members

#### Setup Instructions

##### 1. Configure SMS Response Webhook
Add a second webhook to handle community responses:

1. Log in to [Twilio Console](https://console.twilio.com/)
2. Go to **Phone Numbers** → **Manage** → **Active Numbers**
3. Click on your phone number
4. Under "Messaging Configuration", find "A MESSAGE COMES IN"
5. You should already have the primary webhook. Now add the response handler:
   - **Primary Handler URL**: `https://rivkrzxrsnsrubnfvdvy.supabase.co/functions/v1/sms-webhook`
   - **Fallback URL** (for responses): `https://rivkrzxrsnsrubnfvdvy.supabase.co/functions/v1/sms-response`
6. Click **Save**

**Alternative Setup**: Use TwiML bins to route new reports vs. responses based on keywords, or use a single webhook that handles both.

##### 2. Add User Locations (For Testing)
To test proximity alerts, users need location data:

```sql
-- Add your test phone number with location
INSERT INTO profiles (user_id, phone_number, lat, lon)
VALUES (
  auth.uid(), -- or specific user_id
  '+254712345678', -- Your test number
  -1.2921, -- Latitude (e.g., Nairobi)
  36.8219  -- Longitude
);
```

##### 3. Test Broadcast Alert Flow

**Step 1: Create an incident** (via App or SMS)
```
SMS: FIRE Kinale
```

**Step 2: Send broadcast alert**
1. Go to Admin Dashboard
2. Find the incident
3. Click the 📡 (Radio) icon
4. Set radius (e.g., 5km)
5. Click "Send Alert"

**Step 3: Receive alert**
Users within 5km will receive:
```
⚠️ FOREST ALERT: FIRE detected near your location. 
HIGH severity. Rangers responding. 
Reply: SAFE, NEED_HELP, or EVACUATING. ID: #ABC12345
```

**Step 4: Community responds**
User replies with one of:
```
SAFE
NEED_HELP
EVACUATING
```

**Step 5: View responses**
1. Go to Admin Dashboard
2. Click "View Details" (👁️) on incident
3. Scroll to "Community Responses" section
4. See real-time status summary and individual responses

#### Response Confirmation Messages
- **SAFE**: "✅ Thank you! We have recorded that you are safe. Stay vigilant and report any changes."
- **NEED_HELP**: "🚨 HELP REQUEST RECEIVED! Rangers have been alerted to your location. Stay in a safe place. We are coming to assist you."
- **EVACUATING**: "⚠️ Evacuation status recorded. Move to a safe location away from the threat. Follow ranger instructions."

### Phase 3: Ranger Dispatch
- Send SMS alerts to communities near threats
- Community feedback loop ("SAFE" / "NEED HELP")

### Phase 3: Ranger Dispatch
- Auto-assign nearest ranger
- Live status updates
- Coordination chat

### Phase 4: Analytics
- Response time metrics
- Community leaderboard
- Predictive risk map

---

## 🔒 Security Notes

### Secrets Management
All API keys are stored securely in Lovable Cloud:
- `TWILIO_ACCOUNT_SID`
- `TWILIO_AUTH_TOKEN`
- `TWILIO_PHONE_NUMBER`
- `NASA_FIRMS_API_KEY`

### Webhook Security
- SMS webhook is public (verify_jwt = false)
- Only accepts valid Twilio requests
- Input validation on all SMS content

### Database Security
- RLS policies enabled
- Source tracking prevents tampering
- Blockchain logs for verification

---

## 📞 Support & Documentation

- **Twilio Docs**: https://www.twilio.com/docs/usage/webhooks
- **NASA FIRMS**: https://firms.modaps.eosdis.nasa.gov/
- **Lovable Cloud**: https://docs.lovable.dev/features/cloud

---

## 🏆 Competitive Edge

### vs. Msitu App
- ✅ SMS shortcode support
- ✅ Satellite integration
- ✅ Blockchain verification
- ✅ Multi-channel unified dashboard

### vs. Generic SMS Systems
- ✅ PWA with offline support
- ✅ AI-powered analysis
- ✅ Real-time satellite data
- ✅ Forest-specific features

---

**Built for Kenya Forest Service**  
*Turning every Kenyan into a forest guardian* 🌳