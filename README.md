# 🌆 CitySense AI — Smart City Exploration & Intelligence Platform

**Tagline:** *Explore Smart. Travel Safe. Experience More.*  
**Problem Statement:** *City Life: Exploring, Experiencing & Navigating the Chaos We Call Home.*  
**Repository:** [https://github.com/samiksha-jpg/PromptWar](https://github.com/samiksha-jpg/PromptWar)

CitySense AI is a full-stack, modern smart city intelligence platform built for hackathon evaluation and citizen utility. It unifies verified place discovery, atmospheric and air quality telemetry, evidence-based route hazard corridor analysis, transparent place comparisons, and a grounded Google Gemini conversational assistant into a cohesive, responsive web application.

---

## 🌟 Core Modules & Architecture (8 Dedicated Sections)

### 1. 🏠 Home (`HomeView.jsx`)
- **Urban Pulse Overview:** Instant display of real-time weather, AQI, total verified places, and active civic hazard notices.
- **Interactive Map Preview:** Leaflet map with colored SVG pins for heritage, dining, nature, hidden gems, and road hazards.
- **"Take a Quick Tour":** Guided 8-step modal walkthrough designed for online hackathon judges.
- **Clickable Judge Demo Queries:** One-click natural language prompts (*e.g., "I have three hours and ₹500. Suggest interesting places with convenient routes and less crowd."*).
- **"How It Works" & "What Makes Us Different?":** Transparent explanation of evidence-based safety and zero-hallucination engineering principles.

### 2. 🧭 Explore Places (`ExplorePlacesView.jsx`)
- **8 Verified Categories:** Tourist Attractions, Heritage, Dining & Street Food, Stays/Hotels, Parks & Nature, Nightlife, Shopping, and Spiritual Sites.
- **Rich Metadata:** Real operating hours, authentic admission fees, addresses, accessibility ratings, and directions integration.
- **Honest Data:** 30 authentic Pune locations derived from Archaeological Survey of India (ASI) and municipal records—zero invented hotel prices or fake reviews.

### 3. 🛡️ Smart Routes (`SafetyRoutesView.jsx`)
- **OSRM Public Routing Engine:** Generates real road geometry, distance, and duration calculations.
- **Corridor Hazard Detection:** Scans an 180-meter buffer corridor around route coordinates against active citizen hazard reports.
- **Evidence-Based Transparency:** Routes with no reported hazards are labeled *"No Verified Hazards Reported"* rather than making misleading *"Guaranteed Safe"* claims.

### 4. ⚡ City Pulse (`TrafficCityUpdatesView.jsx`)
- **Live Environmental Telemetry:** Real-time temperature, humidity, wind, weather code, and European AQI from **Open-Meteo**.
- **Citizen Hazard Reporting:** Interactive map showing potholes, waterlogging, broken streetlights, and road closures.
- **Honest Telemetry Disclosure:** Clearly discloses municipal sensor requirements for live per-lane speeds while providing authentic citizen corridor notices.

### 5. 🏛️ History & Culture (`HistoryCultureView.jsx`)
- **Heritage Locations:** Curated historical landmarks with source-supported cultural context.
- **Automated 'Create a Heritage Tour' Planner:** Uses greedy TSP sequencing to build custom heritage walking or driving itineraries respecting time budgets and admission costs.

### 6. ⚖️ Compare Places (`ComparePlacesView.jsx`)
- **Side-by-Side Comparison:** Compare 2 to 4 places simultaneously.
- **Explainable City Reality Score:** Transparent formula across 6 weighted factors (safety, budget, transit, crowds, cleanliness, rating) with plain-English rationales explaining why the winner won.

### 7. 🤖 AI City Assistant (`AiAssistantView.jsx`)
- **Grounded Google Gemini AI (RAG):** Powered by `models/gemini-flash-lite-latest` using Retrieval-Augmented Generation strictly anchored in the local SQLite database.
- **Budget & Time Parsing:** Accurately processes natural-language constraints such as *"3 hours and ₹500 budget"*.
- **Zero-Key Fallback:** Built-in deterministic decision engine ensures 100% functionality even if the external API key or network is unavailable.

### 8. 📊 Data & Sources (`DataSourcesView.jsx`)
- **Live Diagnostic Dashboard:** Independently pings Google Gemini, Open-Meteo Weather, Open-Meteo AQI, OSRM Routing, OSM Tiles, and SQLite Database.
- **Zero Secret Leakage:** Displays response latency and operational status while ensuring secret keys remain protected on the backend.

---

## 🛠️ Technology Stack

| Layer | Technologies Used |
|---|---|
| **Frontend** | React 19, Vite, Tailwind CSS, Lucide React, Leaflet 1.9.4, Web Speech API |
| **Backend** | Node.js (v24), Express, CORS, Multer, `dotenv` |
| **Database** | Embedded SQLite via Node `DatabaseSync` (`citysense.db`) |
| **Geospatial & Routing** | Haversine distance calculations, 180m Corridor Buffer, OSRM Public Routing API |
| **Telemetry APIs** | Open-Meteo Weather API, Open-Meteo Air Quality API |
| **Conversational AI** | Google Gemini Generative Language API (`models/gemini-flash-lite-latest`) |

---

## 🚀 Quick Start Guide (Windows)

### Prerequisites
- Node.js (v18+ or v24+ recommended)
- npm (v9+)

### 1. Start the Backend Server (Port 5000)
```powershell
cd backend
npm install
node server.js
```
*Health Check: `http://localhost:5000/api/health`*

### 2. Start the Frontend Application (Port 5173)
```powershell
cd frontend
npm install
npm run dev -- --host
```
*Open your browser and navigate to: `http://localhost:5173`*

### 3. Run the Automated Test Suite (14 Tests)
```powershell
node test_e2e.js
```
*Expected Result: 14/14 tests passed (100%).*

---

## ⚙️ Environment Configuration

Copy `.env.example` to `.env` in the `backend/` directory:

```env
PORT=5000
GEMINI_API_KEY=your_gemini_api_key_here
DEFAULT_CITY=Pune
DEFAULT_LAT=18.5204
DEFAULT_LNG=73.8567
```

> **Security Note:** `.env` files are excluded from Git commits via `.gitignore`. Never commit active secret keys to public repositories.

---

## 📜 Backend API Endpoints

| Endpoint | Method | Description |
|---|---|---|
| `/api/health` | `GET` | System health check and database statistics |
| `/api/integrations/status` | `GET` | Real-time diagnostic checks for all 7 providers |
| `/api/places` | `GET` | List places with category, search, and price filters |
| `/api/places/nearby` | `GET` | Radius search around coordinates using Haversine formula |
| `/api/places/compare` | `POST` | Multi-factor place comparison with Reality Score |
| `/api/routes/compare` | `POST` | Compare alternative routes with 180m hazard corridor buffer |
| `/api/pulse` | `GET` | Real-time weather, AQI, hazard counts, and mobility score |
| `/api/reports` | `GET` / `POST` | Retrieve and submit citizen hazard reports with deduplication |
| `/api/reports/check-duplicate` | `POST` | Pre-submission spatial duplicate detection |
| `/api/reports/:id/corroborate` | `POST` | Community upvoting ("Still there" / "Resolved") |
| `/api/itineraries/heritage-tour`| `POST` | Automated TSP-optimized heritage tour itinerary generator |
| `/api/ai/assistant` | `POST` | Conversational RAG assistant grounded in database |
| `/api/saved` | `GET` / `POST` | Retrieve and toggle user bookmarks |

---

## 🔒 Security & Privacy Guarantees
- **No Secret Key Leakage:** Client JavaScript contains zero API keys; all external AI and provider calls originate server-side.
- **Evidence-Based Transparency:** Missing data is explicitly marked as "Not enough data" rather than inventing synthetic scores or false safety assurances.
- **Zero Fabricated Content:** Hours, entry fees, and coordinates are derived from official municipal and ASI records.
