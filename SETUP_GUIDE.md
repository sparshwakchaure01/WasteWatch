# WasteWatch Setup & Integration Guide

## 🚀 Quick Start Instructions

1. **Install Dependencies:**
   ```bash
   npm install
   ```

2. **Start Development Server:**
   ```bash
   npm run dev
   ```
   The dev server will launch on `http://0.0.0.0:3000`.

3. **Build for Production:**
   ```bash
   npm run build
   ```

---

## 🔐 Firebase Configuration Setup

1. Copy `.env.example` to `.env` or configure your secrets in your hosting environment:
   ```env
   GEMINI_API_KEY="YOUR_GEMINI_KEY"
   APP_URL="YOUR_HOSTED_URL"
   ```

2. Firebase config parameters are loaded from `src/firebase.ts` and `firebase-blueprint.json`.
3. To deploy rules to live Firestore, use:
   ```bash
   firebase deploy --only firestore:rules
   ```

---

## 🗺️ OpenStreetMap Integration

OpenStreetMap tile loading requires zero paid API keys! Leaflet tiles load directly via OpenStreetMap HTTPS endpoint with auto geocoding fallback via Nominatim.
