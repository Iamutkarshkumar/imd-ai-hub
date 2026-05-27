<div align="center">

<img src="https://img.shields.io/badge/IMD-India%20Meteorological%20Department-blue?style=for-the-badge&logoColor=white" alt="IMD"/>

# 🌐 IMD AI Intelligence Hub

### *Real-time AI-powered Weather Dashboard for India*

> **Solo Internship Project** at the **India Meteorological Department, Ministry of Earth Sciences, Government of India**  
> Under the guidance of **[Anshul Chauhan](https://www.linkedin.com/in/anshul-chauhan-7a44a775)**, Scientist D — IMD

<br/>

[![Live Demo](https://img.shields.io/badge/🚀%20Live%20Demo-Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://your-app.vercel.app)
[![GitHub Stars](https://img.shields.io/github/stars/YOUR_USERNAME/imd-ai-hub?style=for-the-badge&logo=github)](https://github.com/YOUR_USERNAME/imd-ai-hub/stargazers)
[![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)](LICENSE)

<br/>

![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=flat-square&logo=fastapi&logoColor=white)
![Next.js](https://img.shields.io/badge/Next.js_15-000000?style=flat-square&logo=next.js&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL_18-336791?style=flat-square&logo=postgresql&logoColor=white)
![Python](https://img.shields.io/badge/Python_3.11-3776AB?style=flat-square&logo=python&logoColor=white)
![React](https://img.shields.io/badge/React_18-61DAFB?style=flat-square&logo=react&logoColor=black)
![Ollama](https://img.shields.io/badge/Ollama-Llama_3.1-purple?style=flat-square)
![ChromaDB](https://img.shields.io/badge/ChromaDB-RAG-orange?style=flat-square)

<br/>

**66 Indian Cities · Live Data Every 30 Minutes · AI Chat with Voice Input · Day/Night Themes**

</div>

---

## 📸 Screenshots

> **Add your screenshots here.** Take them with `Windows + Shift + S` and save to a `screenshots/` folder in your repo.

| | |
|---|---|
| ![Dashboard Day Mode](screenshots/dashboard_day.png) | ![Dashboard Night Mode](screenshots/dashboard_night.png) |
| **Day Mode** — Sunny Delhi with heatwave alert | **Night Mode** — Automatic theme after sunset |
| ![Overview Tab](screenshots/overview.png) | ![Analysis Tab](screenshots/analysis.png) |
| **Overview** — 6 stat cards + charts | **Analysis** — Radar + Wind Rose + City Comparison |
| ![Hourly Forecast](screenshots/hourly.png) | ![Weekly Forecast](screenshots/weekly.png) |
| **Hourly** — Real 24hr forecast from Open-Meteo | **Weekly** — 7-day forecast with temp range bars |
| ![AI Chat](screenshots/chat.png) | ![Voice Input](screenshots/voice.png) |
| **AI Meteorologist** — RAG-powered responses | **Voice Input** — Indian English speech recognition |
| ![State View](screenshots/state_view.png) | ![Alert Ticker](screenshots/alerts.png) |
| **By State** — grouped city browser | **Live Alert Ticker** — scrolling IMD warnings |

---

## 🎬 Demo Video

> Record a short screen recording showing the key features and embed it here.

**How to add a video to GitHub README:**
1. Record your screen with `Xbox Game Bar` (Win + G) or OBS
2. Go to your GitHub repo → click on `README.md` → Edit
3. Drag and drop the `.mp4` file directly into the editor
4. GitHub will upload it and insert the link automatically

```
<!-- Replace this comment with your video embed after uploading -->
https://github.com/YOUR_USERNAME/imd-ai-hub/assets/YOUR_ID/your-video.mp4
```

**Suggested recording flow (2-3 minutes):**
1. Open dashboard → show day/night theme switching
2. Search for a city → click it → walk through Overview, Hourly, Weekly, Analysis tabs
3. Switch to By State view → expand Maharashtra → select Mumbai
4. Ask the AI chat: *"Is it raining in Kolkata right now?"*
5. Tap 🎤 mic button → speak a question → show voice-to-text working
6. Show the alert ticker with active warnings

---

## ✨ Feature Highlights

### 🌦 Live Weather Intelligence
- **66 Indian cities** across all 22 states, updated every 30 minutes via APScheduler
- Real-time data from **Open-Meteo** — temperature, humidity, wind speed/direction/gusts, UV index, AQI, precipitation, cloud cover, pressure, visibility
- **Day/Night themes** — dashboard background and colours change automatically based on the city's actual sunrise/sunset times
- **Condition-aware atmosphere** — animated rain drops during rain, drifting clouds during overcast, floating particles on clear days

### 🤖 AI Meteorologist (RAG-Enhanced)
- **Llama 3.1 8B** running fully locally — zero cloud AI costs, complete privacy
- **RAG (Retrieval-Augmented Generation)** — answers grounded in real IMD bulletins stored in ChromaDB vector database
- **Voice input** — speak questions using browser's Speech Recognition API, optimised for Indian English (`en-IN`)
- Understands natural language: *"Is it raining in Kolkata right now?"*, *"Which city has the worst AQI today?"*, *"Should I travel to Mumbai this week?"*
- Concise 1-3 sentence answers — no rambling, always mentions active warnings

### 📊 Smart Analytics
- **Top 10 Hottest / Coldest** cities — horizontal bar charts, temperature colour-coded (red → cool blue)
- **All-city comparison** — temperature line + humidity bar on the same chart
- **Atmospheric Profile Radar** — humidity, UV, wind, visibility, pressure, cloud cover per city
- **Wind Rose** — directional compass with gust data
- **Sun Arc** — live sunrise/sunset tracker showing time remaining until next transition

### 🔍 City & State Browser
- Search by **city name**, **state name**, or **weather condition** in real-time
- **All Cities** flat list with temperature, condition, and alert badge
- **By State** grouped view — collapsible state headers showing city count + average temp, with left-border accent on active city

### ⚠️ IMD Alert System
- Live scrolling ticker for all active warnings across 66 cities
- Warnings generated intelligently: Heatwave Alert, Thunderstorm Warning, Hazardous AQI, Heat Advisory
- Alert badge on city cards in the left panel

### 📅 Real Forecast Data
- **24-hour hourly** forecast pulled live from Open-Meteo per city (not synthetic)
- **7-day weekly** forecast with high/low temperature range bars
- **Precipitation probability** chart for hourly view
- Forecast updates automatically when switching cities

---

## 🏗 System Architecture

```
╔══════════════════════════════════════════════════════════════════════╗
║                         BROWSER (Client)                             ║
║   Next.js 15 · React 18 · Recharts · Web Speech API                 ║
║   Day/Night Themes · Voice Input · Live Clock · Sun Arc              ║
╚══════════════════════════════╦═══════════════════════════════════════╝
                               │ HTTPS via Cloudflare Tunnel
╔══════════════════════════════▼═══════════════════════════════════════╗
║                    FastAPI Backend  (port 8000)                       ║
║                                                                       ║
║  GET /weather-stats   GET /map-data    GET /search?q=                ║
║  GET /alerts          GET /states      POST /chat                    ║
║  GET /currently-raining               GET /health                    ║
║                                                                       ║
║  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────────┐   ║
║  │  SQLAlchemy  │  │  Llama 3.1   │  │  ChromaDB  (RAG)         │   ║
║  │  ORM Layer   │  │  via Ollama  │  │  IMD Bulletin Vectors    │   ║
║  └──────┬───────┘  └──────┬───────┘  └──────────────────────────┘   ║
╚═════════╪════════════════╪══════════════════════════════════════════╝
          │                │ Local inference — no API cost
╔═════════▼═══════╗   ╔════▼═════════════════════════╗
║  PostgreSQL 18  ║   ║   Ollama  (port 11434)        ║
║  weather_records║   ║   Llama 3.1 8B model          ║
║  fetch_logs     ║   ╚══════════════════════════════╝
╚═════════▲═══════╝
          │
╔═════════╧════════════════════════════════════════════╗
║           imd_live_updater.py  (APScheduler)         ║
║           Runs every 30 minutes                      ║
║                    ↕                                 ║
║   Open-Meteo Weather API  (free, no auth)            ║
║   Open-Meteo Air Quality API                         ║
║   IMD API  (pending IP whitelist)                    ║
╚══════════════════════════════════════════════════════╝
```

---

## 🗂 Project Structure

```
imd-ai-hub/
│
├── 🐍 main.py                  # FastAPI app — all 11 API endpoints
├── 🐍 database.py              # SQLAlchemy models (WeatherRecord, FetchLog)
├── 🐍 setup_db.py              # One-time DB migration + CSV seeding
├── 🐍 imd_live_updater.py      # APScheduler — fetches Open-Meteo every 30min
├── 🐍 vector_store.py          # ChromaDB init + semantic search
├── 🐍 ingest_bulletins.py      # Ingests IMD bulletins into ChromaDB
├── 🐍 data_chat.py             # CLI chat interface (standalone testing)
│
├── 📁 data/
│   └── weather_report.csv      # Initial seed data
│
├── 📁 frontend/                # Next.js 15 application
│   ├── 📁 app/
│   │   └── page.js             # Entire dashboard — ~900 lines, single file
│   ├── package.json
│   └── next.config.js
│
├── 📄 requirements.txt         # Pinned Python dependencies
├── 📄 .env.example             # Environment variable template
├── 📄 .gitignore               # Blocks .env, venv, chroma_db, logs
└── 📄 README.md
```

---

## 📊 Tech Stack

### Backend
| Technology | Version | Purpose |
|---|---|---|
| **FastAPI** | 0.115 | Async REST API framework |
| **SQLAlchemy** | 2.0 | ORM for PostgreSQL |
| **PostgreSQL** | 18 | Primary data store |
| **APScheduler** | 3.11 | Scheduled weather fetching every 30 min |
| **ChromaDB** | 0.5 | Vector database for RAG |
| **sentence-transformers** | 3.1 | `all-MiniLM-L6-v2` embeddings — runs locally |
| **LangChain + Ollama** | 0.3 | Local LLM orchestration |
| **Llama 3.1 8B** | — | AI model — runs on your hardware, no API cost |

### Frontend
| Technology | Version | Purpose |
|---|---|---|
| **Next.js** | 15 | React framework, App Router |
| **React** | 18 | UI library |
| **Recharts** | — | Charts (composed, area, bar, radar) |
| **Web Speech API** | Browser | Voice input, `en-IN` language model |
| **Syne + DM Sans + JetBrains Mono** | — | Typography system |

### Data Sources
| Source | Data | Cost |
|---|---|---|
| **Open-Meteo** | Temperature, wind, pressure, precipitation, UV, cloud cover, hourly + daily forecast | Free, no auth |
| **Open-Meteo Air Quality** | US AQI index | Free, no auth |
| **IMD Official API** | Official warnings and bulletins | Free (approved access) |

---

## 🌍 Cities Covered — 66 across 22 States

| Region | States | Cities |
|---|---|---|
| **North** | Delhi, UP, Rajasthan, Punjab, HP, J&K, Uttarakhand | New Delhi, Noida, Lucknow, Kanpur, Varanasi, Agra, Jaipur, Jodhpur, Udaipur, Chandigarh, Amritsar, Ludhiana, Shimla, Manali, Srinagar, Jammu, Leh, Dehradun |
| **West** | Maharashtra, Gujarat, Goa | Mumbai, Pune, Nagpur, Nashik, Aurangabad, Ahmedabad, Surat, Vadodara, Rajkot, Panaji |
| **South** | Karnataka, Tamil Nadu, Telangana, Kerala, AP | Bengaluru, Mysuru, Mangaluru, Hubballi, Chennai, Coimbatore, Madurai, Hyderabad, Warangal, Thiruvananthapuram, Kochi, Kozhikode, Visakhapatnam, Vijayawada |
| **East** | West Bengal, Odisha, Bihar, Jharkhand, CG, MP | Kolkata, Siliguri, Bhubaneswar, Cuttack, Patna, Gaya, Ranchi, Jamshedpur, Raipur, Bhopal, Indore |
| **Northeast** | Assam, Meghalaya, Manipur, Tripura, Mizoram | Guwahati, Shillong, Imphal, Agartala, Aizawl |

---

## 🚀 Quick Start

### Prerequisites

```bash
# Check versions
python --version   # needs 3.11+
node --version     # needs 18+
ollama --version   # needs latest
psql --version     # needs 15+
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

```bash
cp .env.example .env
# Edit .env — set DATABASE_URL and IMD_API_KEY
```

### 4 — Database setup

```bash
psql -U postgres -c "CREATE DATABASE imd_weather;"
python setup_db.py
python ingest_bulletins.py
```

### 5 — Pull AI model

```bash
ollama pull llama3.1
```

### 6 — Start everything

```bash
# Terminal 1 — Live data updater
python imd_live_updater.py

# Terminal 2 — API backend
uvicorn main:app --reload --port 8000

# Terminal 3 — Frontend
cd frontend && npm install && npm run dev
```

Open **http://localhost:3000** 🎉

### 7 — Verify everything is working

```bash
# Should return {"status":"ok","city_count":66,...}
curl http://localhost:8000/health
```

---

## 🔌 API Reference

| Method | Endpoint | Description | Example |
|---|---|---|---|
| `GET` | `/health` | System status — DB, city count, RAG chunks | `/health` |
| `GET` | `/weather-stats` | All 66 cities current weather | `/weather-stats` |
| `GET` | `/search` | Search by city or state name | `/search?q=Kerala` |
| `GET` | `/alerts` | Cities with active warnings | `/alerts` |
| `GET` | `/currently-raining` | Cities actively raining right now | `/currently-raining` |
| `GET` | `/states` | All states with city count + avg temp | `/states` |
| `GET` | `/city/{name}` | Single city full record | `/city/Mumbai` |
| `POST` | `/chat` | AI chat with RAG | `{"text": "Is it raining in Delhi?"}` |
| `GET` | `/fetch-logs` | Recent data fetch history | `/fetch-logs?limit=10` |
| `GET` | `/rag-stats` | ChromaDB vector store stats | `/rag-stats` |

---

## 🤖 AI Chat Examples

The AI Meteorologist uses **live PostgreSQL data + IMD bulletin RAG** to answer questions:

| Question | What powers the answer |
|---|---|
| *"Is it raining in Kolkata right now?"* | `is_raining` boolean + `precipitation` mm + `condition_detail` field |
| *"Which city has the worst air quality today?"* | Sorts all 66 cities by `aqi` field |
| *"Should I go out in Delhi today?"* | Temperature + UV index + AQI + active warnings |
| *"Is there a heatwave anywhere?"* | Filters `warning` field across all cities |
| *"What's the weather in Maharashtra?"* | State-level query → returns all Maharashtra cities |
| *"Is it safe to travel to Mumbai?"* | Live data + RAG retrieval from IMD safety bulletins |

---

## 📝 Internship Context

This project was developed as a **solo internship project** at the **India Meteorological Department (IMD)**, Ministry of Earth Sciences, Government of India.

**Mentor:** [Anshul Chauhan](https://www.linkedin.com/in/anshul-chauhan-7a44a775), Scientist B — India Meteorological Department

**Objectives assigned:**
- Build a real-time weather intelligence dashboard consuming IMD data
- Integrate a local AI model for natural language weather queries
- Implement RAG to ground AI responses in official IMD bulletins
- Cover pan-India geographic scope with city and state-level granularity
- Deploy as a public-facing web application

**Technical decisions made during internship:**
- Chose **PostgreSQL over CSV** for reliability, querying, and future scalability
- Chose **Llama 3.1 via Ollama** to avoid recurring cloud AI costs and keep data private
- Chose **Open-Meteo as interim data source** while IMD API IP whitelisting is pending
- Chose **ChromaDB for RAG** to enable grounded, bulletin-backed AI responses
- Designed **APScheduler-based updater** so the database stays fresh without manual intervention

---

## 🙏 Acknowledgements

- **India Meteorological Department (IMD)** — for internship opportunity, API access approval, and official weather bulletin data
- **[Anshul Chauhan](https://www.linkedin.com/in/anshul-chauhan-7a44a775)**, Scientist D, IMD — for mentorship and project guidance
- **Open-Meteo** — free, open-source weather API used as interim data source
- **Meta AI** — Llama 3.1 open-source language model
- **Ollama** — local LLM inference engine
- **ChromaDB** — open-source vector database

---

## 📄 License

MIT License — free to use, modify, and distribute with attribution.

---

<div align="center">

**Built by Utkarsh Kumar**  
Solo Internship Project · India Meteorological Department · 2026  

*If this project helped you, please consider giving it a ⭐*

[![GitHub](https://img.shields.io/badge/GitHub-YOUR__USERNAME-black?style=flat-square&logo=github)](https://github.com/YOUR_USERNAME)

</div>
