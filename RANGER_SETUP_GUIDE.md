# 🚨 Ranger System - Quick Setup Guide

## ✅ Installation Complete!

The Ranger Response System has been fully implemented. Follow these steps to get started.

---

## 📋 Step 1: Run Database Migration

**Open Supabase SQL Editor** and run this file:
```
supabase/migrations/20250122_add_ranger_fields.sql
```

This will:
- ✅ Add ranger fields to incidents table
- ✅ Create ranger_alerts table  
- ✅ Set up indexes and RLS policies
- ✅ Update existing incidents

---

## 🔐 Step 2: Create Ranger Demo Account

1. Navigate to: `http://localhost:8080/auth`
2. Click **Sign Up** tab
3. Enter:
   - **Email:** `ranger-demo@example.com`
   - **Password:** (your choice - remember it!)
   - **Name:** Ranger Demo
4. Click **Create Account**
5. ✅ You'll be auto-redirected to `/ranger`

---

## 🎯 Step 3: Access the Ranger Portal

### Ranger Login:
- **URL:** `http://localhost:8080/auth`
- **Email:** `ranger-demo@example.com`
- **Password:** (what you set in Step 2)
- **Redirects to:** `/ranger` ✅

### Admin Login:
- **Email:** Any other email
- **Redirects to:** `/admin` ✅

---

## 🗺️ Ranger Portal Pages

Once logged in as ranger, you'll have access to:

### 1. **Dashboard** (`/ranger`)
- View all assigned incidents
- Filter: Active / All / Resolved
- Stats: Active, High Priority, Resolved counts
- Quick actions: Navigate, View Details

### 2. **Map View** (`/ranger/map`)
- Mapbox satellite view
- Color-coded incident markers
- Toggle: Show Active Only
- Click markers for details

### 3. **Notifications** (`/ranger/notifications`)
- Real-time alerts
- Mark as read/unread
- Click to view incidents
- Delete notifications

### 4. **Incident Detail** (`/ranger/incidents/:id`)
- Full incident information
- Status timeline
- Quick actions:
  - Navigate to location
  - Mark as Verified
  - Mark as In Progress
  - Mark as Resolved
  - Upload follow-up photos
  - Add field notes

---

## 🧪 Testing the System

### Test Scenario 1: View Incidents
1. Log in as `ranger-demo@example.com`
2. Dashboard shows all incidents where:
   - `assigned_ranger = 'ranger'` OR
   - `region = 'demo'`
3. Click any incident to view details

### Test Scenario 2: Update Status
1. Open an incident detail page
2. Click **Mark as Verified**
3. Status updates to "Verified"
4. Timeline shows verification timestamp
5. Click **Mark as In Progress**
6. Click **Mark as Resolved**
7. Incident moves to "Resolved" filter

### Test Scenario 3: Upload Follow-Up Photo
1. Open an incident detail page
2. Click **Add Photo** button
3. Select an image from your device
4. Photo uploads to Supabase Storage
5. Appears in "Evidence Photos" section
6. Labeled as "Follow-up 1", "Follow-up 2", etc.

### Test Scenario 4: Add Field Notes
1. Open an incident detail page
2. Click **Add Note** button
3. Enter your observations
4. Click **Save Note**
5. Note appears with timestamp and author
6. Shows in "Field Notes" section

### Test Scenario 5: Navigate to Location
1. Open any incident
2. Click **Navigate** button
3. Google Maps opens in new tab
4. Shows exact GPS coordinates

### Test Scenario 6: Map View
1. Go to `/ranger/map`
2. See all incidents as colored markers:
   - 🔴 Red = High severity
   - 🟡 Yellow = Unverified
   - 🟢 Green = Resolved
3. Click a marker → Popup appears
4. Click **Navigate** or **Details**

### Test Scenario 7: Notifications
1. Create a new incident (via FieldReporter)
2. Ranger receives notification
3. Badge shows unread count
4. Click notification → Opens incident
5. Mark as read

---

## 🎨 UI Features

### Mobile-First Design
- ✅ Large touch targets
- ✅ High contrast colors
- ✅ Responsive layout
- ✅ Works on phones/tablets

### Fire-Warning Color Palette
- **Red (#DC2626):** High severity, danger
- **Orange (#F97316):** Medium severity, warning
- **Yellow (#EAB308):** Unverified, caution
- **Green (#22C55E):** Resolved, success

### Real-Time Updates
- ✅ New incidents appear instantly
- ✅ Status changes update live
- ✅ Notifications arrive in real-time
- ✅ Map markers update automatically

---

## 📊 Database Schema

### New Fields in `incidents`:
```sql
verified_by            TEXT          -- Email of verifying ranger
verified_at            TIMESTAMPTZ   -- Verification timestamp
resolved_by            TEXT          -- Email of resolving ranger
resolved_at            TIMESTAMPTZ   -- Resolution timestamp
ranger_followup_photos TEXT[]        -- Array of photo URLs
ranger_notes           JSONB[]       -- Array of note objects
assigned_ranger        TEXT          -- Ranger ID (demo: 'ranger')
region                 TEXT          -- Region (demo: 'demo')
```

### New Table: `ranger_alerts`:
```sql
id          UUID PRIMARY KEY
ranger_id   TEXT NOT NULL
incident_id UUID REFERENCES incidents(id)
alert_type  TEXT NOT NULL
title       TEXT NOT NULL
message     TEXT
read        BOOLEAN DEFAULT FALSE
created_at  TIMESTAMPTZ DEFAULT NOW()
```

---

## 🔔 How Notifications Work

### Alert Types:
1. **high_severity** - Critical/High severity incidents
2. **new_incident** - New incidents created
3. **citizen_report** - Reports from mobile app
4. **sms_report** - Reports via SMS

### Auto-Creation:
Alerts are automatically created when:
- New incident is reported
- High severity incident detected
- SMS/USSD report received
- Citizen submits via app

### Manual Creation:
You can also create alerts via Supabase:
```sql
INSERT INTO ranger_alerts (ranger_id, incident_id, alert_type, title, message)
VALUES ('ranger', 'incident-uuid', 'high_severity', 'Fire Alert', 'Urgent response needed');
```

---

## 🚀 Next Steps

### 1. Populate Test Data
Run the rangers population script:
```bash
scripts/populate-rangers.sql
```

### 2. Create Test Incidents
- Use FieldReporter on homepage
- Upload a photo
- System creates incident
- Ranger receives notification

### 3. Test Full Workflow
1. Report incident (as citizen)
2. Receive notification (as ranger)
3. View on map
4. Navigate to location
5. Verify incident
6. Upload follow-up photo
7. Add field notes
8. Mark as in progress
9. Resolve incident

---

## 🎯 Demo Mode Details

### Authentication Logic:
```typescript
if (email === 'ranger-demo@example.com') {
  redirect('/ranger');
} else {
  redirect('/admin');
}
```

### Incident Filtering:
```sql
SELECT * FROM incidents 
WHERE assigned_ranger = 'ranger' 
   OR region = 'demo'
```

### No Complex Auth:
- ✅ No role tables
- ✅ No permission checks
- ✅ Simple email-based routing
- ✅ Perfect for demo/testing

---

## 📱 Mobile Experience

The Ranger Portal is optimized for field use:

### Large Buttons:
- Easy to tap with gloves
- High contrast for outdoor visibility
- Icon + text labels

### Offline-Ready:
- Map tiles cache locally
- Photos queue for upload
- Status updates sync when online

### Quick Actions:
- One-tap navigation
- Swipe gestures
- Minimal typing required

---

## 🐛 Troubleshooting

### Issue: Can't see incidents
**Solution:** 
- Check database migration ran successfully
- Verify incidents have `assigned_ranger = 'ranger'` or `region = 'demo'`
- Check browser console for errors

### Issue: Map not loading
**Solution:**
- Verify Mapbox token is valid
- Check internet connection
- Clear browser cache

### Issue: Photos not uploading
**Solution:**
- Check Supabase Storage bucket exists
- Verify RLS policies allow uploads
- Check file size (max 10MB)

### Issue: Notifications not appearing
**Solution:**
- Check `ranger_alerts` table exists
- Verify real-time subscriptions are active
- Check browser console for WebSocket errors

---

## ✅ Success Checklist

- [ ] Database migration completed
- [ ] Ranger demo account created
- [ ] Can log in and see dashboard
- [ ] Incidents appear in list
- [ ] Can view incident details
- [ ] Can update incident status
- [ ] Can upload follow-up photos
- [ ] Can add field notes
- [ ] Map view shows markers
- [ ] Notifications appear
- [ ] Navigate button opens Google Maps

---

## 🎉 You're All Set!

The Ranger Response System is now fully operational. Field rangers can:
- ✅ Respond to threats in real-time
- ✅ Navigate to exact locations
- ✅ Document evidence with photos
- ✅ Track incidents from report to resolution
- ✅ Receive instant notifications

**Happy Forest Guarding! 🌳🇰🇪**
