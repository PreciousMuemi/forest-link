# ForestGuard AI - Wangari Maathai Hackathon 2025

**AI-Powered Forest Monitoring & Community Reporting System**

## 🌍 Overview

ForestGuard AI combines satellite imagery, ML, blockchain, and community reporting to combat deforestation and forest fires.

### Core Features
- 🛰️ Real-time Satellite Monitoring (Mapbox)
- 📸 Field Photo Reporting with GPS
- 🤖 AI Threat Detection (Hugging Face)
- ⛓️ Blockchain Verification (Scroll)
- 📊 Admin Dashboard with Analytics
- 📱 PWA - Installable, works offline
- 🔔 SMS Alerts (Twilio)

## 🏗️ Tech Stack

**Frontend:** React 18, TypeScript, Vite, Tailwind CSS, Shadcn UI, Mapbox GL
**Backend:** Supabase (PostgreSQL, Auth, Storage, Edge Functions, Realtime)
**AI/ML:** Hugging Face (Google ViT model)
**Blockchain:** Scroll Sepolia testnet, Ethers.js
**Services:** Twilio SMS, Mapbox Maps

## 🚀 Quick Start

```bash
git clone <repo>
npm install
npm run dev
```

## 📋 Database Schema

- **profiles** - User data (name, phone, organization)
- **incidents** - Threat reports (location, type, severity, verified, tx_hash)
- **user_roles** - Role-based access (admin, moderator, user)

## 🎯 Hackathon Criteria

✅ **Innovation (20%)** - ML + Blockchain + Satellite
✅ **Feasibility (25%)** - Functional MVP, offline-first
✅ **Impact (25%)** - Community empowerment, transparency
✅ **Scalability (20%)** - Serverless, CDN, RLS
✅ **Presentation (10%)** - Documentation, demo, architecture

## 📱 PWA Installation

1. Open app in mobile browser
2. "Add to Home Screen"
3. Works offline with photo queue

## 🔐 Security

- Row Level Security on all tables
- Role-based access control with security definer functions
- Blockchain immutability
- Secrets in Supabase only

Built with 💚 for Kenya's forests
