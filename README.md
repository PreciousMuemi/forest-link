# ForestLink – Multi-Channel Ranger Command Platform

Unified threat intelligence, ranger assignment, and community reporting for Wangari Maathai Hackathon 2025.

## Quick Links

- **Live Prototype:** https://forest-guardian-henna.vercel.app/
- **Pitch Deck (Gamma):** https://gamma.app/docs/ForestLink-y1x82k8lfq812si
- **Demo Video (2–3 min):** _Add link here before submission_

## Team & Track

- **Team:** _Add official team name_
- **Members & Roles:** _Name – Lead Engineer_, _Name – Product/UX_, _Name – ML/AI_, ...
- **Track:** _Forest Intelligence & Ranger Response (adjust if needed)_
- **Contact:** _Team lead email / phone_

> Update the placeholders above so Devfolio reviewers have a single source of truth.

## Problem & WMF/GBM Context

- Forest agencies (WMF, GBM partners, county rangers, NGO patrols) operate separate SMS, radio, satellite, and web reporting channels.
- No shared dashboard results in slow triage, duplicated dispatches, and weak accountability.
- Communities providing ground truth rarely see feedback loops, undercutting Wangari Maathai’s vision of empowered stewards.

## Solution Snapshot

ForestLink ingests multi-channel signals, verifies them with AI plus human review, and routes actionable incidents to the right ranger teams—with audit trails anchored on Scroll blockchain.

### Core Workflows
- **Detect:** NASA FIRMS, IoT pings, and SMS/USSD/web submissions land in a unified queue.
- **Verify:** ML model plus operator triage assigns severity and confidence.
- **Dispatch:** Assignment console suggests the nearest ranger squad, tracks acceptance, ETA, and on-site updates.
- **Broadcast:** Communities receive SMS alerts and status updates; admins review alert history.

## Feature Highlights

- Live threat map with Mapbox layers and FIRMS overlays.
- Field Reporter (web/PWA plus SMS/USSD) for scouts and communities.
- Ranger dashboard with severity filters, SLA timers, and a “Go to Rangers Dashboard” CTA for demos.
- Assignment flow covering accept/decline, backup requests, on-route/on-site markers, and field intel uploads.
- Admin and analytics tools with broadcast history and role-aware controls; simulation button optional for demos.
- Blockchain logging via Scroll Sepolia for tamper-evident incident hashes.

## Architecture & Tech Stack

| Layer | Components |
| --- | --- |
| Frontend | React 18, TypeScript, Vite, Tailwind, Shadcn UI, Mapbox GL |
| Backend | Supabase (PostgreSQL, Auth, Storage, Realtime, Edge Functions) |
| AI/ML | Hugging Face ViT for image validation, heuristic scoring for SMS inputs |
| Messaging | Twilio SMS/USSD, email alerts |
| Maps & Data | NASA FIRMS, Mapbox terrain, custom geojson forest layers |
| Trust Layer | Scroll Sepolia with Ethers.js incident anchoring |

### Ranger Assignment Flow (MVP)
1. **Queue:** Incident enters `/incidents` table with source metadata.
2. **Scoring:** Edge function enriches severity + recommended radius.
3. **Dispatch:** Admin selects ranger (profiles table) → Supabase RPC writes assignment + notifies via SMS.
4. **Field Updates:** Ranger mobile view (see `src/pages/ranger`) changes status, shares notes/photos.
5. **Audit:** Assignment + status deltas hashed to Scroll; alert history visible in UI.

> Diagram coming to `/docs/architecture.png` (export from deck and link here).

## Data, APIs & Integrations

- **NASA FIRMS API** – fire hotspots, daily refresh.
- **Mapbox** – base maps + tilesets for forest boundaries.
- **Supabase** – auth, storage, Postgres, RLS policies for multitenancy.
- **Twilio** – SMS alerts + simulated USSD workflow.
- **Hugging Face** – ViT image model for verifying field photos.
- **Scroll** – immutable ledger of verified incidents.

Document any custom datasets or shapefiles used in `/docs/data-sources.md` (placeholder).

## Deployment & Ops

- **Hosting:** Vercel (frontend) + Supabase managed backend.
- **Environments:** `.env.local` for dev; Supabase secrets handle keys.
- **Costs:** Free/low-tier friendly; Twilio + Mapbox usage monitored via environment caps.
- **Testing:** Manual for now; add Playwright/Cypress smoke tests post-hackathon.

## Impact, Feasibility & Scale

- **Impact:** Faster ranger mobilization, transparent incident history, empowered community scouts.
- **WMF/GBM Fit:** Mirrors existing community forest associations workflows and supports county command centers.
- **Scalability:** Role-based access + RLS allow multiple orgs; API-driven ingest makes it easy to plug in drones, sensors, or partner systems.
- **Sustainability:** Offline-ready PWA, modular Supabase functions, ops docs to hand off to conservation partners.

## Submission Checklist

- [x] README (this file) with problem, solution, architecture, deliverables.
- [x] Live prototype URL.
- [ ] Demo video link (add before 24 Nov 2025 deadline).
- [x] Pitch deck PDF/Link inside repo (`/docs/ForestGuardAI_Track_WMH2025.pdf` – add export from Gamma).
- [x] Dataset/API references.
- [x] User & backend workflows documented.
- [ ] Appendix (optional, 1 page max) – add community findings if ready.

## Quick Start (Dev)

```bash
git clone <repo>
cd forest-guardian
npm install
npm run dev
```

Create `.env.local` with Mapbox, Supabase, Twilio, Hugging Face, and Scroll keys.

## Database Cheat Sheet

- `profiles` – users/rangers (name, phone, org, role).
- `incidents` – threat reports (location, type, severity, verification, tx_hash).
- `assignments` – ranger dispatch states.
- `alert_logs` – community broadcast history.
- `user_roles` – role-based access control.

## PWA Tips

1. Open the live app on mobile.
2. Use “Add to Home Screen.”
3. Offline photo queue syncs when connectivity returns.

## Security Notes

- Supabase Row Level Security on every table.
- RPC-based admin actions with security definer functions.
- Blockchain hashes for tamper detection.
- Secrets stored in Supabase/Vercel env vars only.

## Roadmap After Demo Day

1. Integrate drone imagery + high-res satellite feeds.
2. Predictive fire spread modeling + resource needs estimation.
3. Mutual-aid sharing between counties/NGOs.
4. Multilingual ranger UX (Kiswahili, Maa, Sheng).
5. Automated community feedback loops via WhatsApp bots.

Built for forest guardians everywhere.
