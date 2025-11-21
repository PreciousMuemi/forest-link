# Broadcast Alerts & Community Feedback System

## 🎯 Overview

The Broadcast Alert system allows KFS admins to send mass SMS notifications to communities near forest threats and receive real-time status updates.

---

## 🔄 Complete Alert Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    INCIDENT DETECTED                         │
│  (Via App, SMS, or Satellite)                               │
└─────────────────┬───────────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────────┐
│            ADMIN REVIEWS INCIDENT                            │
│  • Views on dashboard                                        │
│  • Clicks "Send Alert" button (📡)                          │
│  • Sets radius (1-50km)                                     │
│  • Optional custom message                                  │
└─────────────────┬───────────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────────┐
│          SYSTEM FINDS NEARBY COMMUNITIES                     │
│  • Queries profiles with location data                      │
│  • Calculates distance using Haversine formula             │
│  • Filters users within specified radius                    │
└─────────────────┬───────────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────────┐
│            SMS ALERTS SENT VIA TWILIO                        │
│  "⚠️ FOREST ALERT: FIRE detected 3km from your location.   │
│   HIGH severity. Rangers responding.                        │
│   Reply: SAFE, NEED_HELP, or EVACUATING. ID: #ABC12345"   │
└─────────────────┬───────────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────────┐
│         COMMUNITIES RECEIVE & RESPOND                        │
│  Reply Options:                                             │
│  • SAFE          → "I'm safe, no threat"                   │
│  • NEED_HELP     → "Emergency assistance needed!"          │
│  • EVACUATING    → "Currently evacuating area"             │
└─────────────────┬───────────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────────┐
│      RESPONSES LOGGED & AUTO-CONFIRMED                       │
│  • Stored in community_responses table                      │
│  • Auto-reply confirmation sent                             │
│  • Real-time dashboard update                               │
└─────────────────┬───────────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────────┐
│           ADMIN VIEWS RESPONSE SUMMARY                       │
│  • Total responses                                          │
│  • Safe: XX                                                 │
│  • Need Help: XX (PRIORITY!)                               │
│  • Evacuating: XX                                           │
│  • Individual response timeline                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 📊 Database Schema

### alert_logs
Tracks all broadcast alerts sent by admins.

```sql
CREATE TABLE alert_logs (
  id UUID PRIMARY KEY,
  incident_id UUID REFERENCES incidents(id),
  sent_to TEXT[],           -- Array of phone numbers
  message TEXT,              -- SMS message content
  radius_km NUMERIC,         -- Alert radius
  sent_at TIMESTAMPTZ,       -- When alert was sent
  created_by UUID            -- Admin who sent it
);
```

### community_responses
Stores community member status updates.

```sql
CREATE TABLE community_responses (
  id UUID PRIMARY KEY,
  incident_id UUID REFERENCES incidents(id),
  phone_number TEXT,
  response TEXT CHECK (response IN ('SAFE', 'NEED_HELP', 'EVACUATING', 'OTHER')),
  message TEXT,              -- Additional details
  responded_at TIMESTAMPTZ
);
```

### profiles (Updated)
User profiles now include location for proximity alerts.

```sql
ALTER TABLE profiles ADD COLUMN lat NUMERIC;
ALTER TABLE profiles ADD COLUMN lon NUMERIC;
```

---

## 🔧 Technical Implementation

### Edge Function: send-broadcast-alert

**Endpoint**: `https://rivkrzxrsnsrubnfvdvy.supabase.co/functions/v1/send-broadcast-alert`

**Authentication**: Requires JWT (admin only)

**Request Body**:
```json
{
  "incident_id": "uuid",
  "radius_km": 5,
  "custom_message": "Optional custom message" 
}
```

**Process**:
1. Fetch incident details (lat, lon, threat_type, severity)
2. Query profiles within radius (Haversine distance)
3. Send SMS to each user via Twilio
4. Log alert in `alert_logs` table
5. Return success with recipient count

**Response**:
```json
{
  "success": true,
  "message": "Alert sent to 47 community members",
  "sent_count": 47,
  "recipients": 47
}
```

### Edge Function: sms-response

**Endpoint**: `https://rivkrzxrsnsrubnfvdvy.supabase.co/functions/v1/sms-response`

**Authentication**: Public (Twilio webhook)

**Twilio Payload** (Form Data):
- `From`: Sender phone number
- `Body`: SMS message content

**Process**:
1. Parse response type (SAFE, NEED_HELP, EVACUATING, OTHER)
2. Find related incident (from recent alert or message ID)
3. Store response in `community_responses` table
4. Send auto-confirmation via TwiML response

**TwiML Response Examples**:
```xml
<!-- SAFE Response -->
<Response>
  <Message>✅ Thank you! We have recorded that you are safe. Stay vigilant and report any changes.</Message>
</Response>

<!-- NEED_HELP Response -->
<Response>
  <Message>🚨 HELP REQUEST RECEIVED! Rangers have been alerted to your location. Stay in a safe place. We are coming to assist you.</Message>
</Response>

<!-- EVACUATING Response -->
<Response>
  <Message>⚠️ Evacuation status recorded. Move to a safe location away from the threat. Follow ranger instructions.</Message>
</Response>
```

---

## 🎨 Frontend Components

### BroadcastAlertDialog
Modal dialog for sending broadcast alerts.

**Features**:
- Radius input (1-50km)
- Custom message textarea
- Default message preview
- Character counter (160 char SMS limit)
- Send button with loading state

**Location**: `src/components/BroadcastAlertDialog.tsx`

### CommunityResponses
Real-time display of community status updates.

**Features**:
- Response summary (total, safe, need help, evacuating)
- Individual response cards
- Real-time Supabase subscription
- Phone number privacy (partial masking)
- Timestamp display

**Location**: `src/components/CommunityResponses.tsx`

### IncidentTable (Updated)
Added broadcast alert button (📡) to each incident row.

**New Actions**:
- 📡 Send Alert → Opens BroadcastAlertDialog
- 👁️ View Details → Includes CommunityResponses section

---

## 🧪 Testing Guide

### Test 1: Send Broadcast Alert

**Prerequisites**:
- At least one profile with phone_number, lat, lon populated
- Active incident in the system

**Steps**:
1. Log in as admin
2. Go to Admin Dashboard
3. Find any incident
4. Click the 📡 (Radio) icon
5. Set radius: 5
6. Click "Send Alert"

**Expected Result**:
- Toast: "Sending broadcast alert..."
- Toast: "Alert sent to X community members"
- SMS received on registered phone numbers

### Test 2: Community Response Flow

**Steps**:
1. Receive broadcast alert SMS
2. Reply with: `SAFE`
3. Check phone for confirmation SMS
4. Go to Admin Dashboard → View incident details
5. Scroll to "Community Responses" section

**Expected Result**:
- Confirmation SMS received
- Response appears in dashboard immediately
- Summary statistics updated

### Test 3: Need Help Priority

**Steps**:
1. Reply to alert with: `NEED_HELP`
2. Check admin dashboard

**Expected Result**:
- 🚨 Need Help badge (red) appears
- Urgent confirmation message sent
- Response marked as priority in dashboard

### Test 4: Proximity Filtering

**Setup**:
Create profiles at different distances:
```sql
-- User 1km away (should receive alert)
INSERT INTO profiles (user_id, phone_number, lat, lon)
VALUES ('uuid1', '+254711111111', -1.2921, 36.8219);

-- User 10km away (should NOT receive alert with 5km radius)
INSERT INTO profiles (user_id, phone_number, lat, lon)
VALUES ('uuid2', '+254722222222', -1.3500, 36.9000);
```

**Steps**:
1. Create incident at lat: -1.2921, lon: 36.8219
2. Send alert with 5km radius

**Expected Result**:
- User 1 receives SMS
- User 2 does NOT receive SMS

---

## 🚨 Troubleshooting

### No users receiving alerts

**Check**:
1. Do profiles have phone_number populated?
   ```sql
   SELECT COUNT(*) FROM profiles WHERE phone_number IS NOT NULL;
   ```
2. Do profiles have location data?
   ```sql
   SELECT COUNT(*) FROM profiles WHERE lat IS NOT NULL AND lon IS NOT NULL;
   ```
3. Is radius large enough?
   ```sql
   -- Calculate distance to nearest user
   SELECT phone_number, 
          6371 * acos(cos(radians(-1.2921)) * cos(radians(lat)) * 
          cos(radians(lon) - radians(36.8219)) + 
          sin(radians(-1.2921)) * sin(radians(lat))) AS distance_km
   FROM profiles
   WHERE lat IS NOT NULL AND lon IS NOT NULL
   ORDER BY distance_km;
   ```

### Responses not showing in dashboard

**Check**:
1. Is real-time subscription active? (Check browser console)
2. Are responses being stored?
   ```sql
   SELECT * FROM community_responses ORDER BY responded_at DESC;
   ```
3. Is the incident ID matching?

### Twilio errors

**Common Issues**:
- Invalid phone number format (must include country code: +254...)
- Twilio account out of credits
- Phone number not verified (trial accounts)
- Webhook URL misconfigured

**Debug**:
Check Twilio console: https://console.twilio.com/us1/monitor/logs/messages

---

## 📱 SMS Examples

### Alert Messages

**Default (Fire)**:
```
⚠️ FOREST ALERT: FIRE detected near your location. 
HIGH severity. Rangers responding. 
Reply: SAFE, NEED_HELP, or EVACUATING. ID: #ABC12345
```

**Default (Deforestation)**:
```
⚠️ FOREST ALERT: DEFORESTATION detected near your location. 
MEDIUM severity. Rangers responding. 
Reply: SAFE, NEED_HELP, or EVACUATING. ID: #DEF67890
```

**Custom Message**:
```
URGENT: Wildfire spreading rapidly in Mau Forest Block 7. 
Evacuate immediately to Narok Town. Rangers en route.
Reply with your status.
```

### Community Responses

**Valid Formats**:
- `SAFE`
- `NEED_HELP`
- `NEED HELP`
- `HELP`
- `EVACUATING`
- `EVACUATION`
- `#ABC12345 SAFE` (with incident reference)

---

## 🎯 Impact Metrics

### Response Time Improvement
- **Before**: Community status unknown until rangers arrive (hours)
- **After**: Real-time status updates (seconds)

### Coverage
- **Before**: Only smartphone users with app
- **After**: ANY phone user can respond (including basic phones)

### Coordination
- **Before**: No way to prioritize rescue efforts
- **After**: "NEED_HELP" responses visible immediately, prioritized

### Community Engagement
- **Before**: Passive threat detection
- **After**: Active community participation, 2-way communication

---

## 🔐 Security Considerations

### Privacy
- Phone numbers are partially masked in UI (••••1234)
- Only admins can view full incident details
- RLS policies enforce access control

### Rate Limiting
- Consider implementing SMS rate limits per incident
- Prevent alert spam to same users
- Track alert frequency per admin

### Data Retention
- Community responses stored indefinitely for analytics
- Consider archiving old alerts (>90 days)
- GDPR compliance for phone number storage

---

## 💡 Future Enhancements

### Phase 2.1: Enhanced Responses
- Add photo uploads from community (MMS)
- Voice response option
- Multi-language support (Swahili, Kikuyu, etc.)

### Phase 2.2: Alert Templates
- Pre-configured message templates by threat type
- Quick actions: "Evacuate", "Stay Home", "Gather at..."
- Custom evacuation routes

### Phase 2.3: Integration
- WhatsApp Business API for richer messaging
- Integration with M-Pesa for community rewards
- SMS-based donation appeals

---

**Built for Kenya Forest Service**  
*Turning every Kenyan into a forest guardian* 🌳