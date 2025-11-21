# ForestGuard AI - Complete Demo Guide

## 🎯 Demo Overview
This guide shows how to demonstrate all working components of the ForestGuard AI system end-to-end.

---

## 📱 Demo Flow (15-20 minutes)

### **Part 1: Landing Page & Features Overview (2 min)**

**URL:** `/`

1. **Show the hero section** - ForestGuard AI branding
2. **Scroll through feature cards:**
   - Active Threats monitoring
   - Blockchain Verification
   - Instant Alerts
   - Global Coverage
3. **Point out the live threat gallery** - Shows recent incidents with images
4. **Show the satellite map** - Real-time hotspot visualization
5. **Show the threat map** - Interactive incident markers

---

### **Part 2: Community Reporting - PWA Field Reporter (3 min)**

**URL:** `/` (scroll to Field Reporter section)

1. **Click "Take Photo" or upload an image**
2. **GPS coordinates auto-populate** (or enter manually: `-1.2921, 36.8219`)
3. **Select threat type:** Fire
4. **Select severity:** Critical
5. **Add description:** "Large wildfire spotted in Karura Forest"
6. **Click "Submit Report"**
7. **Watch the toast notification:** "Report submitted successfully!"
8. **Explain:** Photo uploaded to storage, AI analyzes it, blockchain records it

---

### **Part 3: SMS Reporting System (2 min)**

**What to show:**
1. **Explain the SMS workflow:**
   - Community members text: `FIRE Karura Forest -1.2921 36.8219`
   - System receives via Twilio webhook
   - Creates incident automatically
   - Sends confirmation SMS back

2. **Show SMS instructions component on landing page**
3. **Mention:** This works for areas with limited internet

---

### **Part 4: USSD Reporting System (3 min)**

**What to show:**
1. **Explain USSD (works on all phones, no internet needed):**
   - Dial: `*384*33248#`
   - Interactive menu system
   
2. **Demo flow:**
   ```
   Welcome to KFEAN Forest Alert System
   1. Report Fire 🔥
   2. Report Logging 🪓
   3. Report Poaching 🦏
   4. Check Last Report
   ```

3. **Walk through reporting:**
   - Select "1" (Fire)
   - Enter location: "Karura"
   - System geocodes and creates incident
   - Sends confirmation

4. **Show the USSD callback URL:**
   ```
   https://rivkrzxrsnsrubnfvdvy.supabase.co/functions/v1/ussd-webhook
   ```

---

### **Part 5: Admin Dashboard (5 min)**

**URL:** `/admin` (requires admin login)

#### **Login credentials:**
- Use the auth system to sign up/login
- Admin role required (assigned in database)

#### **Dashboard Overview:**
1. **Stats cards** - Total incidents, verified, pending, critical
2. **Threat charts** - By type and severity
3. **Response time analytics** - Average response times
4. **Community leaderboard** - Most active reporters
5. **Risk heat map** - Geographic threat distribution

#### **Incident Management:**
1. **View incidents table** with filters:
   - Source filter (PWA, SMS, USSD, Satellite, ML)
   - Severity filter
2. **Click "View Details"** on an incident:
   - Shows image, location, description
   - Community responses (if any)
   - Real-time coordination chat
3. **Verify an incident** - Click the verify button
4. **Auto-assign ranger** - Click "Auto Assign Ranger"
   - System finds nearest available ranger
   - Calculates ETA
   - Sends SMS notification

#### **Broadcast Alert:**
1. **Click "Send Community Alert"** on critical incident
2. **Set radius** (e.g., 5km)
3. **Customize message**
4. **Send to all community members in radius**

#### **Satellite Data:**
1. **Click "Fetch Satellite Data"** button
2. **Shows NASA FIRMS hotspots** loaded in last 24 hours
3. **Auto-creates incidents** from satellite detections

---

### **Part 6: Ranger Mobile Interface (3 min)**

**URL:** `/ranger` (requires ranger account)

#### **Login as ranger:**
- Rangers are created by admins in the database
- Each ranger has user account linked

#### **Ranger Dashboard shows:**
1. **Current status** (Available, On Duty, En Route, On Scene)
2. **Quick status update buttons**
3. **Current assignment details:**
   - Threat type and severity
   - Location coordinates
   - ETA
   - "Navigate" button (opens Google Maps)
   - "Call Dispatch" button
4. **Real-time updates** when assigned to incident

---

### **Part 7: AI & Blockchain Integration (2 min)**

**Explain the backend systems:**

#### **AI Threat Detection:**
1. **Hugging Face model** (Google ViT) analyzes uploaded images
2. **Detects:** Fire, deforestation, illegal logging, wildlife threats
3. **Confidence scoring** and classification
4. **Show edge function:** `process-detection`

#### **Blockchain Verification:**
1. **Every verified incident** gets blockchain hash
2. **Scroll Sepolia testnet** provides immutability
3. **Transaction hash stored** in database
4. **Show in incident details:** `tx_hash` field
5. **Explain:** Cannot be tampered with, permanent record

---

### **Part 8: Community Response System (2 min)**

**Show the full loop:**

1. **Incident reported** → System detects it
2. **Admin sends broadcast alert** → SMS to community
3. **Community members respond via SMS:**
   - Text: `RESPOND [incident-id] I can help`
   - System logs response
4. **Admin views responses** in incident detail dialog
5. **Coordination chat** allows real-time communication

---

## 🔧 Technical Architecture Highlight

### **Tech Stack:**
- **Frontend:** React + TypeScript + Vite + Tailwind + Shadcn UI
- **Backend:** Supabase (PostgreSQL, Auth, Storage, Edge Functions, Realtime)
- **Maps:** Mapbox GL JS
- **AI:** Hugging Face (Google ViT)
- **Blockchain:** Scroll Sepolia + Ethers.js
- **SMS/USSD:** Twilio + Africa's Talking
- **PWA:** Offline-first with service worker

### **Key Features:**
- ✅ Real-time updates (Supabase Realtime)
- ✅ Offline-first PWA
- ✅ Role-based access control (RLS policies)
- ✅ Auto-scaling edge functions
- ✅ Secure secrets management
- ✅ Blockchain immutability
- ✅ Multi-channel reporting (PWA, SMS, USSD)
- ✅ Automated ranger dispatch
- ✅ Geographic radius alerts

---

## 🎬 Demo Tips

### **Before the demo:**
1. **Create test data:**
   - Add 3-5 incidents in different locations
   - Create 2-3 ranger accounts
   - Have admin account ready
2. **Test all logins** work
3. **Have phone ready** for SMS/USSD demo (or explain with screenshots)
4. **Open multiple browser tabs:**
   - Tab 1: Landing page (/)
   - Tab 2: Admin dashboard (/admin)
   - Tab 3: Ranger mobile (/ranger)

### **During the demo:**
1. **Start with the problem** - Forest fires, illegal logging, lack of coordination
2. **Show the solution flow** - Detection → Verification → Alert → Dispatch → Response
3. **Emphasize innovation:**
   - AI + Blockchain + Satellite
   - Works offline, no smartphone needed
   - Real-time coordination
   - Transparent and immutable
4. **Show mobile responsiveness** - Resize browser or use phone

### **Key talking points:**
- 🌍 **Accessibility:** SMS/USSD works on any phone, no internet needed
- 🤖 **Intelligence:** AI classifies threats automatically
- ⛓️ **Trust:** Blockchain provides tamper-proof records
- 📡 **Scale:** Satellite integration covers vast forest areas
- ⚡ **Speed:** Automated ranger dispatch reduces response time
- 🧑‍🤝‍🧑 **Community:** Empowers locals to protect their forests

---

## 📊 Metrics to Highlight

**For hackathon judges:**
1. **Response time:** Auto-assignment reduces from hours → minutes
2. **Coverage:** SMS + USSD reaches 100% of population (not just smartphone users)
3. **Trust:** Blockchain verification prevents corruption/tampering
4. **Scalability:** Edge functions auto-scale, no server management
5. **Impact:** Early detection saves forests, wildlife, and communities

---

## 🎯 Call to Action

**End the demo with:**
1. **Try the live app:** Show the deployment URL
2. **Explore the code:** GitHub repository
3. **Test reporting:** Invite judges to submit a test incident
4. **Q&A:** Answer technical questions

---

## 📞 Support & Resources

- **USSD Callback URL:** `https://rivkrzxrsnsrubnfvdvy.supabase.co/functions/v1/ussd-webhook`
- **SMS Webhook URL:** `https://rivkrzxrsnsrubnfvdvy.supabase.co/functions/v1/sms-webhook`
- **USSD Service Code:** `*384*33248#`
- **Twilio Phone:** (configured in edge functions)

---

## 🏆 Hackathon Criteria Alignment

### **Innovation (20%)**
- AI + Blockchain + Satellite fusion
- Multi-channel reporting (PWA/SMS/USSD)
- Automated ranger dispatch with ETA

### **Feasibility (25%)**
- Fully functional MVP
- Deployed and live
- Real integrations (Twilio, Africa's Talking, NASA FIRMS)

### **Impact (25%)**
- Solves real problem (Kenya loses 5,000 hectares/year)
- Empowers communities
- Saves lives and forests

### **Scalability (20%)**
- Serverless architecture
- Edge functions auto-scale
- RLS security
- Supabase handles millions of users

### **Presentation (10%)**
- Clear documentation
- Live demo
- Technical depth

---

**Built with 💚 for Kenya's Forests**
