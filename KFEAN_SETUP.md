# Kenya Forest Emergency Alert Network (KFEAN) - Setup Guide

## Day 1 MVP Implementation Complete ✅

This guide covers the setup and testing of the multi-channel forest threat reporting system.

---

## 🎯 Features Implemented

### 1. **SMS Webhook System** 
- Basic phone users can send SMS reports
- Format: `FIRE [location]` or `LOGGING [location]` or `CHARCOAL [location]`
- Automatic geocoding for known Kenyan locations
- SMS confirmation with incident ID

### 2. **Source Tracking**
- Database now tracks report source: `pwa`, `sms`, `satellite`, `manual`
- Visual indicators in admin dashboard
- Filter incidents by source

### 3. **NASA FIRMS Satellite Integration**
- Automatic fire hotspot detection
- Updates available from NASA's VIIRS satellite data
- Admin can manually trigger satellite data fetch
- Auto-creates incidents for high-confidence detections (>80%)

### 4. **Enhanced Admin Dashboard**
- Filter by source (App/SMS/Satellite)
- Filter by severity (Critical/High/Medium/Low)
- Real-time refresh
- Manual satellite data fetch button
- Export incidents to CSV

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

### Phase 2: Broadcast Alerts
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