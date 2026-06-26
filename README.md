<div align="center">

<img src="screenshots/imd_logo.png" alt="IMD Logo" width="80"/>

# 🌐 IMD AI Intelligence Hub

### *Real-time AI-powered Weather Dashboard for India*

> **Solo Internship Project** at the **India Meteorological Department**
> Ministry of Earth Sciences, Government of India
> Under the guidance of **[Anshul Chauhan](https://www.linkedin.com/in/anshul-chauhan-7a44a775)**, Scientist D — IMD

<br/>

[![Live Demo](https://img.shields.io/badge/🚀%20Live%20Demo-imd--ai--hub.vercel.app-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://imd-ai-hub.vercel.app)
[![API Status](https://img.shields.io/badge/⚡%20API-imd--backend2.onrender.com-46E3B7?style=for-the-badge&logo=render&logoColor=white)](https://imd-backend2.onrender.com/health)
[![GitHub Stars](https://img.shields.io/github/stars/Iamutkarshkumar/imd-ai-hub?style=for-the-badge&logo=github&color=yellow)](https://github.com/Iamutkarshkumar/imd-ai-hub/stargazers)
[![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)](LICENSE)

<br/>

![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=flat-square&logo=fastapi&logoColor=white)
![Next.js](https://img.shields.io/badge/Next.js_15-000000?style=flat-square&logo=next.js&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Neon-00E599?style=flat-square&logo=postgresql&logoColor=white)
![Python](https://img.shields.io/badge/Python_3.12-3776AB?style=flat-square&logo=python&logoColor=white)
![Groq](https://img.shields.io/badge/Groq-Qwen%20%7C%20GPT--OSS-F55036?style=flat-square)
![Gemini](https://img.shields.io/badge/Google-Gemini_2.5_Flash-4285F4?style=flat-square&logo=google&logoColor=white)
![IMD](https://img.shields.io/badge/IMD-Official_API-FF6B35?style=flat-square)
![Vercel](https://img.shields.io/badge/Frontend-Vercel-000000?style=flat-square&logo=vercel)
![Render](https://img.shields.io/badge/Backend-Render-46E3B7?style=flat-square&logo=render)
![Pulsetic](https://img.shields.io/badge/Monitoring-Pulsetic-blue?style=flat-square)

<br/>

**66 Cities · 31 States · Hybrid IMD + Open-Meteo Live Data Every 30 Minutes · Multi-Tier AI Chat · Voice Input · Always Online**

</div>

---

## 📸 Screenshots

| | |
|---|---|
| ![Dashboard Day](screenshots/dashboard_day.png) | ![Dashboard Night](screenshots/dashboard_night.png) |
| **Day Mode** — Dynamic theme based on actual sunrise time | **Night Mode** — Auto-switches after sunset |
| ![Overview](screenshots/overview.png) | ![Analysis](screenshots/analysis.png) |
| **Overview** — Live stat cards + temperature + humidity charts | **Analysis** — Top 10 Hottest and Coldest cities |
| ![Hourly](screenshots/hourly.png) | ![Weekly](screenshots/weekly.png) |
| **Hourly** — Real 24hr forecast from Open-Meteo | **Weekly** — 7-day forecast with temp range bars |
| ![AI Chat](screenshots/chat.png) | ![Voice Input](screenshots/voice.png) |
| **AI Meteorologist** — Multi-tier LLM RAG-grounded responses | **Voice Input** — Indian English speech recognition |
| ![By State](screenshots/state_view.png) | ![Alert Ticker](screenshots/alerts.png) |
| **By State** — Collapsible state grouping | **Live Alert Ticker** — Active IMD warnings |

---

## ✨ Features

### 🌦 Live Weather — 66 Indian Cities (Hybrid IMD + Open-Meteo)
- **Official IMD data is now the primary source** — current conditions for 46 cities come straight from IMD's `current_wx` Synop network, with the remaining 10 cities (no Synop station) served by IMD's `aws_data` AWS network.
- **Open-Meteo fills every gap** IMD doesn't cover: UV index, AQI, and visibility — plus it acts as a silent, automatic fallback whenever IMD data for a city is missing, null, or older than 3 hours.
- Data refreshed every **30 minutes automatically** via an `asyncio` background task — only **4 bulk HTTP calls** to IMD per cycle (`current_wx`, `aws_data`, `cityforecastloc`, `districtwarning`) cover all 66 cities, plus a parallelized Open-Meteo sweep (rate-limited to 5 concurrent requests).
- Auto-refreshing JWT authentication against IMD's OAuth endpoint — token is renewed automatically ~5 minutes before expiry.
- Covers **31 states** from Leh (Ladakh) to Thiruvananthapuram (Kerala)
- Fields per city: temperature, feels like, high/low, humidity, wind speed/direction/gusts, UV index, AQI, precipitation, cloud cover, pressure, visibility, sunrise/sunset, moonrise/moonset
- **Official IMD red/orange district alerts**, decoded from raw warning codes into plain-English text (e.g. *"Orange Alert: Thunderstorm & Lightning, Strong Winds"*)
- Per-city **data provenance tracking** (`data_source`: `imd_synop` / `imd_aws` / `open_meteo`) logged on every fetch for transparency and debugging
- **Day/Night themes** — background and colours change based on each city's actual sunrise/sunset times
- **Condition atmosphere** — animated rain drops, drifting clouds, or floating particles depending on weather

### 🤖 AI Meteorologist — Multi-Tier LLM Router

The AI backend uses a **three-tier intelligent routing system** to balance speed, cost, and answer quality:

- **Tier 1 — Groq / qwen/qwen3-27b (primary):** Handles all dashboard-specific queries — city temperatures, rainfall, AQI, warnings, lunar phase, forecasts — in under 2 seconds using live data injected directly into the prompt. 200K TPD, excellent instruction following.
- **Tier 2 — Groq / openai/gpt-oss-120b (smart fallback):** If Tier 1 is rate-limited or the question is detected as complex, the router escalates to the 120B MoE model for a more thorough answer — still grounded in live dashboard data.
- **Tier 3 — Gemini 2.5 Flash (general knowledge):** If both Groq tiers determine a question falls outside the live dashboard scope (general meteorology, astronomy, geography, historical weather science), they emit a `ROUTE_TO_GENERAL` signal and Gemini answers with its broader knowledge base.
- **Adaptive response length** — a complexity classifier automatically determines whether a question warrants a short answer (1–2 sentences for simple lookups, yes/no, single-city facts) or a long answer (3–5 sentences for comparisons, explanations, forecasts, and advisories). Token budgets are adjusted accordingly to prevent cut-offs.
- **Keyword RAG** — responses grounded in real IMD advisory bulletins (heatwave, cyclone, AQI, UV, cold wave, monsoon)
- **Voice input** — browser Speech Recognition with `en-IN` locale for Indian English and city names
- Quick-question chips for one-tap queries

**How routing works in practice:**

| Question | Handled by |
|---|---|
| *"Is it raining in Kolkata?"* | ⚡ Tier 1 — qwen/qwen3-27b, live dashboard data |
| *"Which city has the worst AQI?"* | ⚡ Tier 1 — qwen/qwen3-27b, QUICK STATS block |
| *"When is the next full moon?"* | ⚡ Tier 1 — qwen/qwen3-27b, LUNAR DATA block |
| *"Compare Delhi and Mumbai weather this week"* | ⚡ Tier 1 or 2 — complex query, long response mode |
| *"What causes the Indian monsoon?"* | 🔀 Routed to Gemini 2.5 Flash |
| *"History of cyclone forecasting?"* | 🔀 Routed to Gemini 2.5 Flash |

### 📊 Analytics
- **Top 10 Hottest / Coldest** horizontal bar charts — temperature colour-coded
- **All-city comparison** — temperature line + humidity bars
- **Atmospheric Radar** — 6-axis profile per city
- **Wind Rose** — directional compass with gust data
- **Sun Arc** — live sunrise/sunset progress tracker

### 🔍 City & State Browser
- Search by city name, state name, or weather condition
- **All Cities** flat list with temperature + condition
- **By State** grouped view — collapsible, shows city count + average temperature per state
- Active city highlighted with accent colour from its weather theme

### ⚠️ Alert System
- Scrolling ticker for all active warnings across 66 cities
- **Official IMD district warnings** (Red/Orange alerts) decoded into plain English, alongside auto-generated alerts: Heatwave, Thunderstorm Warning, Hazardous AQI, Heat Advisory
- Red badge on city cards with active warnings

### 📅 Real Forecast Data
- **7-day weekly forecast** — all 7 days sourced directly from IMD's `cityforecastloc` (forecast text + high/low temps)
- **24-hour hourly** pulled live from Open-Meteo per city on demand
- Both update automatically when you switch cities

---

## 🏗 Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                      BROWSER (Client)                        │
│     Next.js 15 · React 18 · Recharts · Web Speech API        │
│            Vercel — imd-ai-hub.vercel.app                    │
└─────────────────────────┬────────────────────────────────────┘
                          │ HTTPS
┌─────────────────────────▼────────────────────────────────────┐
│                    FastAPI Backend                           │
│          Render.com — imd-backend2.onrender.com              │
│    /weather-stats · /chat · /search · /alerts · /health      │
│                                                              │
│  ┌───────────────────┐   ┌──────────────────────────────┐    │
│  │   SQLAlchemy ORM  │   │   Multi-Tier LLM Router      │    │
│  └────────┬──────────┘   │                              │    │
│           │              │  ① Groq · qwen/qwen3-27b     │    │
│           │              │    Dashboard & live queries  │    │
│           │              │           ↓                  │    │
│           │              │    Rate-limit / escalate?    │    │
│           │              │           ↓                  │    │
│           │              │  ② Groq · gpt-oss-120b       │    │
│           │              │    Complex / smart queries   │    │
│           │              │           ↓                  │    │
│           │              │    ROUTE_TO_GENERAL?         │    │
│           │              │           ↓                  │    │
│           │              │  ③ Gemini 2.5 Flash          │    │
│           │              │    General knowledge         │    │
│           │              └──────────────────────────────┘    │
│           │                                                  │
│           │    ┌─────────────────┐  ┌──────────────────┐     │
│           │    │  Lunar Phase    │  │  Keyword RAG     │     │
│           │    │  Engine         │  │  IMD Bulletins   │     │
│           │    └─────────────────┘  └──────────────────┘     │
│           │                                                  │
│  ┌────────▼─────────────────────────────────────────────┐    │
│  │   Background Task (asyncio lifespan)                 │    │
│  │   update_weather() — runs every 30 min               │    │
│  │   Hybrid fetch: IMD primary → Open-Meteo fallback    │    │
│  └────────┬─────────────────────────────────────────────┘    │
└───────────┼──────────────────────────────────────────────────┘
            │
┌───────────▼───────────────┐   ┌──────────────────────────────┐
│  IMD Official API         │   │      Open-Meteo API          │
│  (JWT auth, 4 bulk calls) │   │  Weather + Air Quality       │
│  current_wx · aws_data    │   │  uv_index · aqi · visibility │
│  cityforecastloc (7-day)  │   │  automatic fallback only     │
│  districtwarning          │   │  Free · 66 cities · 30 min   │
└───────────┬───────────────┘   └──────────────────┬───────────┘
            │         merge per-city, IMD first    │
            └───────────────────┬──────────────────┘
                                │
                    ┌───────────▼────────────┐
                    │   Neon PostgreSQL      │
                    │  weather_records       │
                    │  fetch_logs            │
                    └────────────────────────┘

┌──────────────────────────────────────────────────────────────┐
│  Pulsetic — pings /health every 5 min · keeps Render awake   │
└──────────────────────────────────────────────────────────────┘
```

---

## 🗂 Project Structure

```
imd-ai-hub/
│
├── 🐍 main.py                  # FastAPI — endpoints + multi-tier LLM router + background updater
├── 🐍 database.py              # SQLAlchemy models (WeatherRecord, FetchLog) — v3 hybrid schema
├── 🐍 setup_db.py              # One-time DB migration + CSV seeding
├── 🐍 imd_live_updater.py      # Hybrid IMD + Open-Meteo fetch logic (called by main.py lifespan)
├── 🐍 vector_store.py          # Keyword-based RAG with IMD bulletin matching
├── 🐍 ingest_bulletins.py      # Bulletin ingestion (local dev only)
├── 🐍 data_chat.py             # CLI chat interface for local testing
│
├── 📁 data/
│   └── weather_report.csv      # Initial seed data (6 cities)
│
├── 📁 frontend/                # Next.js 15 app
│   ├── 📁 app/
│   │   └── page.js             # Full dashboard — single-file component
│   ├── package.json
│   └── next.config.js
│
├── 📄 requirements.txt
├── 📄 .gitignore
└── 📄 README.md
```

---

## 📊 Tech Stack

### Backend (Render.com)

| Technology | Purpose |
|---|---|
| **FastAPI 0.115** | Async REST API, 11 endpoints |
| **SQLAlchemy 2.0** | ORM for Neon PostgreSQL |
| **IMD Official API** | Primary live data — Synop stations, AWS stations, forecasts, district alerts (JWT auth) |
| **Open-Meteo** | UV index, AQI, visibility, and automatic fallback when IMD data is stale/missing |
| **Groq API + qwen/qwen3-27b** | Tier 1 AI — fast dashboard queries (~2s), 200K TPD |
| **Groq API + openai/gpt-oss-120b** | Tier 2 AI — smarter MoE model for complex or escalated queries |
| **Google Gemini 2.5 Flash** | Tier 3 AI — true general-knowledge fallback (meteorology, geography, history) |
| **Multi-Tier LLM Router** | 3-stage cascade with adaptive response length classifier (short/long) |
| **Keyword RAG** | Lightweight IMD bulletin matching, zero RAM overhead |
| **asyncio lifespan** | Hybrid weather updater runs inside FastAPI every 30 min |
| **httpx (async)** | Parallel Open-Meteo fetches for all 66 cities, semaphore-limited |
| **psycopg2-binary** | PostgreSQL driver |

### Database (Neon.tech)

| Table | Contents |
|---|---|
| `weather_records` | 66 cities — all weather fields, `data_source` provenance, `forecast_json`, moonrise/moonset — updated every 30 min |
| `fetch_logs` | Every fetch recorded with timestamp, source (`imd_synop` / `imd_aws` / `open_meteo` / `hybrid`), success/error |

### Frontend (Vercel)

| Technology | Purpose |
|---|---|
| **Next.js 15** | React framework, App Router |
| **Recharts** | ComposedChart, AreaChart, BarChart, RadarChart |
| **Web Speech API** | Voice input, `en-IN` language model |
| **Syne + DM Sans + JetBrains Mono** | Typography system |

### Infrastructure

| Service | What it hosts | Cost |
|---|---|---|
| **Vercel** | Next.js frontend | Free |
| **Render.com** | FastAPI backend | Free |
| **Neon.tech** | PostgreSQL database | Free |
| **IMD API** | Official live weather/forecast/alert data | Government-provided |
| **Groq API** | qwen/qwen3-27b + openai/gpt-oss-120b inference (Tier 1 & 2 AI) | Free |
| **Google Gemini API** | Gemini 2.5 Flash (Tier 3 fallback AI) | Free tier |
| **Open-Meteo** | Live weather data — fills IMD gaps + fallback | Free |
| **Pulsetic** | Uptime monitoring & keep Render awake | Free |

> **Total infrastructure cost: ₹0 / month**

---

## 🌍 Cities Covered

66 cities across 31 states:

| Region | States | Sample Cities |
|---|---|---|
| **North** | Delhi, UP, Rajasthan, Punjab, HP, J&K, Ladakh, Uttarakhand | New Delhi, Lucknow, Jaipur, Chandigarh, Shimla, Srinagar, Leh, Dehradun |
| **West** | Maharashtra, Gujarat, Goa | Mumbai, Pune, Nagpur, Ahmedabad, Surat, Panaji |
| **South** | Karnataka, Tamil Nadu, Telangana, Kerala, Andhra Pradesh | Bengaluru, Chennai, Hyderabad, Kochi, Visakhapatnam |
| **East** | West Bengal, Odisha, Bihar, Jharkhand, CG, MP | Kolkata, Bhubaneswar, Patna, Ranchi, Bhopal, Indore |
| **Northeast** | Assam, Meghalaya, Manipur, Tripura, Mizoram | Guwahati, Shillong, Imphal, Agartala, Aizawl |

Of these 66 cities, **46 have a direct IMD Synop station** (`current_wx`) and **10 are served via IMD's AWS network** (`aws_data`) for current conditions; all 66 receive IMD forecast and district-alert coverage, with Open-Meteo filling UV/AQI/visibility and acting as fallback throughout.

---

## 🚀 Local Development Setup

### Prerequisites
```
Python 3.12+  ·  Node.js 18+  ·  PostgreSQL (local) or Neon account
```

### 1 — Clone
```bash
git clone https://github.com/YOUR_USERNAME/imd-ai-hub.git
cd imd-ai-hub
```

### 2 — Python environment
```bash
python -m venv venv

# Windows
.\venv\Scripts\Activate.ps1

# Mac/Linux
source venv/bin/activate

pip install -r requirements.txt
```

### 3 — Environment variables

Create a `.env` file in the project root:
```env
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/imd_weather
GROQ_API_KEY=your_groq_api_key_from_console.groq.com
GEMINI_API_KEY=your_gemini_api_key_from_aistudio.google.com
IMD_API_KEY=your_imd_api_key
IMD_EMAIL=your_imd_registered_email
IMD_PASSWORD=your_imd_password
PROXY_URL=optional_proxy_if_required
```

### 4 — Install AI dependencies
```bash
pip install groq google-genai
```

### 5 — Database setup
```bash
psql -U postgres -c "CREATE DATABASE imd_weather;"
python setup_db.py
```

### 6 — Start backend
```bash
uvicorn main:app --reload --port 8000
```

### 7 — Start frontend
```bash
cd frontend
npm install
npm run dev
```

Open **http://localhost:3000**

---

## 🔌 API Reference

Base URL (production): `https://imd-backend2.onrender.com`

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/` | Health ping (used by Pulsetic) |
| `GET` | `/health` | Full status — DB, city count, RAG, lunar phase, active model tiers |
| `GET` | `/weather-stats` | All 66 cities current weather |
| `GET` | `/search?q=Kerala` | Search by city or state name |
| `GET` | `/alerts` | Cities with active warnings only |
| `GET` | `/currently-raining` | Cities actively raining right now |
| `GET` | `/states` | All states with city count + avg temp |
| `GET` | `/city/{name}` | Single city full record |
| `GET` | `/lunar` | Current lunar phase, illumination, moonrise/set |
| `POST` | `/chat` | Multi-tier AI chat — `{"text": "your question"}` |
| `GET` | `/fetch-logs` | Recent data fetch history |

**Try it live:**
```bash
curl https://imd-backend2.onrender.com/health

curl https://imd-backend2.onrender.com/currently-raining

curl https://imd-backend2.onrender.com/lunar

curl -X POST https://imd-backend2.onrender.com/chat \
  -H "Content-Type: application/json" \
  -d '{"text": "Is it raining in Mumbai right now?"}'
```

---

## 🤖 AI Chat Examples

| Question | Answered by |
|---|---|
| *"Is it raining in Kolkata right now?"* | ⚡ Tier 1 — qwen/qwen3-27b, `is_raining` + `precipitation` fields |
| *"Which city has the worst AQI today?"* | ⚡ Tier 1 — qwen/qwen3-27b, sorts all 66 cities by `aqi` |
| *"Should I go out in Delhi today?"* | ⚡ Tier 1 — qwen/qwen3-27b, temp + UV + AQI + warnings |
| *"Is there a heatwave anywhere?"* | ⚡ Tier 1 — qwen/qwen3-27b, filters `warning` field across all cities |
| *"When is the next full moon?"* | ⚡ Tier 1 — qwen/qwen3-27b, LUNAR DATA block in prompt |
| *"Compare weather in Delhi and Mumbai this week"* | ⚡ Tier 1 or 2 — complex query, long response mode (3–5 sentences) |
| *"How dangerous is Delhi's air quality?"* | ⚡ Tier 1 — qwen/qwen3-27b, AQI value + RAG from IMD bulletin |
| *"What causes Bay of Bengal cyclones?"* | 🔀 Tier 3 — Gemini 2.5 Flash, general meteorology knowledge |
| *"Explain how monsoon depressions form"* | 🔀 Tier 3 — Gemini 2.5 Flash, atmospheric science |

---

## ☁️ Cloud Deployment Notes

### Why a hybrid IMD + Open-Meteo fetcher?
IMD's official API is the authoritative source for India-specific data — Synop and AWS station readings, government-issued district alerts, and IMD's own 5-day forecast text. But it doesn't expose UV index, AQI, or visibility, and individual stations can occasionally go stale or miss an observation window. Rather than choosing one provider, every field has a defined primary source and an automatic fallback: IMD `current_wx` → IMD `aws_data` → Open-Meteo for current conditions; IMD `cityforecastloc` → Open-Meteo for the 7-day outlook. Each city's record also tracks which source actually supplied it (`data_source`), so failures are visible in `fetch_logs` rather than silently producing wrong data.

### Why a 3-hour staleness threshold?
IMD Synop stations report on a fixed synoptic schedule (00, 03, 06, 09, 12, 15, 18, 21 UTC). If a city's latest observation is older than 3 hours, the next expected report was missed — at that point Open-Meteo's live data is more trustworthy than stale IMD data, so the fetcher switches sources automatically for that city on that run.

### Why a single JWT auth class?
IMD's token endpoint issues short-lived JWTs. Instead of refreshing per-request, `IMDAuth` caches the token and proactively refreshes it ~5 minutes before expiry, so none of the 4 bulk calls in a cycle ever fail due to an expired token.

### Why only 4 IMD HTTP calls per cycle?
IMD's bulk endpoints (`current_wx`, `aws_data`, `cityforecastloc`, `districtwarning`) each return *every* station/district in one response. Fetching once and indexing locally by station name, district, or nearest lat/lon covers all 66 cities — versus 66 separate per-city calls, which would be far slower and more likely to hit rate limits.

### Why a Multi-Tier LLM Router?
A single model forces a hard trade-off: a fast lightweight model is cheap and low-latency for structured data lookups but may struggle on complex or open-ended questions. A large model has broader knowledge but adds latency for simple queries. The three-tier cascade gives you the best of all worlds — qwen/qwen3-27b answers ~85% of dashboard questions in ~2 seconds, openai/gpt-oss-120b handles escalated or complex queries that need more reasoning, and Gemini 2.5 Flash covers the remainder that falls outside live dashboard scope. Each tier self-selects when to escalate using a `ROUTE_TO_GENERAL` signal, so the fallback only fires when it's actually needed.

### Why an adaptive response length classifier?
Simple single-city lookups ("Is it raining in Pune?") need one sentence. Comparisons, weekly forecasts, and meteorological explanations need three to five. Sending the same token budget for both wastes tokens on short answers and cuts off long ones. The complexity classifier inspects keywords in the question before the LLM call and adjusts `max_tokens` accordingly — preventing truncated responses while keeping simple answers snappy.

### Why Groq instead of Ollama?
Ollama requires 4GB+ RAM for large models. Render free tier has 512MB. Groq runs the same models on their hardware and responds in ~2 seconds — faster than local Ollama on a laptop CPU.

### Why keyword RAG instead of ChromaDB?
`sentence-transformers` + `chromadb` require C++ compilation and 400MB+ RAM — they cause silent OOM crashes on Render free tier. The keyword RAG replacement has identical output quality for weather advisory questions with zero RAM overhead.

### Why the background updater runs inside FastAPI?
Running `imd_live_updater.py` as a separate Render service costs an extra instance. Running it as an `asyncio` background task inside the FastAPI lifespan uses the same container — zero additional cost.

### Pulsetic
Render free tier spins down after periods of inactivity. Pulsetic continuously monitors the backend and sends periodic health checks to `/health`, helping keep the service responsive while also providing uptime statistics and outage notifications.

---

## 📝 Internship Context

This project was developed as a **solo internship project** at the **India Meteorological Department (IMD)**, Ministry of Earth Sciences, Government of India.

**Mentor:** [Anshul Chauhan](https://www.linkedin.com/in/anshul-chauhan-7a44a775), Scientist D — India Meteorological Department

**Objectives assigned during internship:**
- Build a real-time weather intelligence dashboard consuming IMD data
- Integrate an AI model for natural language weather queries
- Implement RAG to ground AI responses in official IMD bulletins
- Cover pan-India geographic scope with city and state-level granularity
- Deploy as a permanently accessible public web application

**Key technical decisions made:**
- Switched to **IMD's official API as the primary live data source**, with Open-Meteo retained as a field-level gap-filler (UV, AQI, visibility) and automatic fallback for stale/missing IMD data
- Designed a **4-call bulk fetch strategy** (`current_wx`, `aws_data`, `cityforecastloc`, `districtwarning`) to cover all 66 cities per cycle instead of per-city requests
- Built a **self-refreshing JWT auth layer** for IMD's OAuth token endpoint
- Defined a **3-hour staleness threshold** matching IMD's synoptic observation schedule to decide when to fall back to Open-Meteo
- Added **per-city data provenance tracking** (`data_source` field) for transparency and debugging
- Chose **Groq API + qwen/qwen3-27b** as the Tier 1 model for fast, cheap dashboard queries within free tier RAM limits
- Added **Groq API + openai/gpt-oss-120b** as Tier 2 for smarter handling of complex or escalated questions
- Chose **Gemini 2.5 Flash** as Tier 3 fallback for general knowledge questions outside dashboard scope
- Designed a **multi-tier LLM router** where each model self-selects when to escalate — keeping latency low for the majority of queries
- Built an **adaptive response length classifier** that adjusts token budgets per query to prevent cut-offs without wasting tokens
- Chose **Neon serverless PostgreSQL** for zero-maintenance cloud database
- Chose **keyword RAG** over ChromaDB to stay within 512MB RAM on Render
- Chose **asyncio background task** over a separate cron service to stay within free tier limits
- Designed for **zero ongoing cost** — entire stack runs free indefinitely

---

## 🙏 Acknowledgements

- **India Meteorological Department (IMD)** — for the internship opportunity and official API access approval
- **[Anshul Chauhan](https://www.linkedin.com/in/anshul-chauhan-7a44a775)**, Scientist D, IMD — for mentorship, project guidance, and technical direction
- **Open-Meteo** — free open-source weather API, no rate limits
- **Groq** — free inference API for qwen/qwen3-27b and openai/gpt-oss-120b
- **Qwen / Alibaba Cloud** — Qwen3-27B open-source language model (Tier 1)
- **OpenAI** — GPT OSS 120B open-source language model (Tier 2)
- **Google** — Gemini 2.5 Flash API for general knowledge fallback (Tier 3)
- **Neon** — serverless PostgreSQL, free tier
- **Render** — free cloud hosting for FastAPI backend
- **Vercel** — free frontend hosting

---

## 📄 License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

---

<div align="center">

**Built by Utkarsh Kumar**
Solo Internship Project · India Meteorological Department · 2026

*If this project helped you, please ⭐ the repo*

[![Live Demo](https://img.shields.io/badge/Try%20it%20live-imd--ai--hub.vercel.app-000?style=for-the-badge&logo=vercel)](https://imd-ai-hub.vercel.app)

</div>