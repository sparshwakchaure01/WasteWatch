# WasteWatch - Illegal Dumping Reporting System

> **Subtitle:** Municipal Waste Monitoring & Community Engagement System  
> **Tagline:** Together for a Cleaner Community  
> **Institution:** Amrutvahini College of Engineering, Sangamner (Department of Computer Engineering)  
> **Developers:** Sparsh Wakchaure & Anushree Navale  
> **Target Users:** Municipal Authorities, Local Body Inspectors, & Registered Citizens

---

## 📌 Project Overview

**WasteWatch** is an enterprise-grade, secure, and production-ready Web application developed for municipal bodies and community reporters to capture, monitor, cluster, and resolve illegal waste dumping complaints.

The application adheres strictly to modern government dashboard aesthetic standards with clean rounded cards, high-contrast typography, and intuitive geospatial mapping.

---

## 🌟 Key Features

1. **User Role Management (Exactly 3 Roles):**
   - **Reporter (Citizen):** Log in via Phone OTP, upload geotagged waste photo evidence, select waste category, drop GPS marker on OpenStreetMap, track resolution status.
   - **Local Body (Municipal Inspector):** Monitor pending dumping reports, update complaint statuses (`Pending` → `In Progress` → `Resolved`), assign dispatches, inspect Frequent Dumping Zones.
   - **System Administrator:** System-wide metrics dashboard, municipal officer user directory management, export official PDF audit reports.

2. **Automated Frequent Dumping Zone Detection (Hotspots):**
   - Pure, deterministic spatial comparison using the **Haversine Formula**.
   - Automatically detects clusters where **≥ 3 complaints exist within approximately 100 metres**.
   - Displays circular 100m GIS boundary radii on Leaflet / OpenStreetMap.

3. **Official Municipal PDF Report Generator:**
   - Client-side PDF generation via `jspdf` and `jspdf-autotable`.
   - Compiles Daily, Weekly, Monthly, and All-Time municipal audit reports complete with complaint IDs, categories, spatial centroids, and signature blocks.

4. **Security & Data Integrity:**
   - Firestore Attribute-Based Access Control (ABAC) rules in `firestore.rules`.
   - Immutable audit logs, PII isolation, and role restriction.

---

## 🛠️ Tech Stack

- **Frontend:** React 19, TypeScript, Tailwind CSS, Motion
- **Maps:** Leaflet & OpenStreetMap (Interactive GIS map widget)
- **PDF Export:** `jspdf` & `jspdf-autotable`
- **Backend & Database:** Firebase Authentication, Cloud Firestore, Firebase Storage
- **Design System:** Palette `#22223B`, `#4A4E69`, `#9A8C98`, `#C9ADA7`, `#F2E9E4`
