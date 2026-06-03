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

![Groq](https://img.shields.io/badge/Groq-Llama_3.1-F55036?style=flat-square)

![Gemini](https://img.shields.io/badge/Google-Gemini_2.5_Flash-4285F4?style=flat-square&logo=google&logoColor=white)

![Vercel](https://img.shields.io/badge/Frontend-Vercel-000000?style=flat-square&logo=vercel)

![Render](https://img.shields.io/badge/Backend-Render-46E3B7?style=flat-square&logo=render)



<br/>



**66 Cities · 31 States · Live Data Every 30 Minutes · Dual-LLM AI Chat · Voice Input · Always Online**



</div>



---



## 📸 Screenshots



| | |

|---|---|

| ![Dashboard Day](screenshots/dashboard_day.png) | ![Dashboard Night](screenshots/dashboard_night.png) |

| **Day Mode** — Dynamic theme based on actual sunrise time | **Night Mode** — Auto-switches after sunset |

| ![Overview](screenshots/overview.png) | ![Analysis](screenshots/analysis.png) |

| **Overview** — Live stat cards + temperature + humidity charts| **Analysis** — Top 10 Hottest and Coldest cities |

| ![Hourly](screenshots/hourly.png) | ![Weekly](screenshots/weekly.png) |

| **Hourly** — Real 24hr forecast from Open-Meteo | **Weekly** — 7-day forecast with temp range bars |

| ![AI Chat](screenshots/chat.png) | ![Voice Input](screenshots/voice.png) |

| **AI Meteorologist** — Dual-LLM RAG-grounded responses | **Voice Input** — Indian English speech recognition |

| ![By State](screenshots/state_view.png) | ![Alert Ticker](screenshots/alerts.png) |

| **By State** — Collapsible state grouping | **Live Alert Ticker** — Active IMD warnings |



---



## ✨ Features



### 🌦 Live Weather — 66 Indian Cities

- Data refreshed every **30 minutes automatically** via cloud cron (no manual intervention)

- Covers **31 states** from Leh (Ladakh) to Thiruvananthapuram (Kerala)

- Fields per city: temperature, feels like, high/low, humidity, wind speed/direction/gusts, UV index, AQI, precipitation, cloud cover, pressure, visibility, sunrise/sunset

- **Day/Night themes** — background and colours change based on each city's actual sunrise/sunset times

- **Condition atmosphere** — animated rain drops, drifting clouds, or floating particles depending on weather



### 🤖 AI Meteorologist — Dual-LLM Router

The AI backend uses a **two-stage intelligent routing system** to balance speed, cost, and answer quality:

- **Stage 1 — Groq / Llama 3.1 8B (primary):** Handles all dashboard-specific queries — city temperatures, rainfall, AQI, warnings, lunar phase, forecasts — in under 2 seconds using live data injected directly into the prompt.

- **Stage 2 — Gemini 2.5 Flash (fallback):** If Llama determines a question falls outside the live dashboard scope (general meteorology, astronomy, geography, historical weather science), it emits a routing signal and Gemini answers with its broader knowledge base.

- **Keyword RAG** — responses grounded in real IMD advisory bulletins (heatwave, cyclone, AQI, UV, cold wave, monsoon)

- **Voice input** — browser Speech Recognition with `en-IN` locale for Indian English and city names

- Quick-question chips for one-tap queries



**How routing works in practice:**

| Question | Handled by |
|---|---|
| *"Is it raining in Kolkata?"* | Groq / Llama (live dashboard data) |
| *"Which city has the worst AQI?"* | Groq / Llama (QUICK STATS block) |
| *"When is the next full moon?"* | Groq / Llama (LUNAR DATA block) |
| *"What causes the Indian monsoon?"* | → routed to → Gemini 2.5 Flash |
| *"History of cyclone forecasting?"* | → routed to → Gemini 2.5 Flash |



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

- Auto-generated alerts: Heatwave, Thunderstorm Warning, Hazardous AQI, Heat Advisory

- Red badge on city cards with active warnings



### 📅 Real Forecast Data

- **24-hour hourly** pulled live from Open-Meteo per city on demand

- **7-day weekly** with precipitation probability chart

- Both update automatically when you switch cities



---



## 🏗 Architecture



```

┌─────────────────────────────────────────────────────────────┐

│                    BROWSER (Client)                         │

│  Next.js 15 · React 18 · Recharts · Web Speech API          │

│  Deployed on: Vercel (imd-ai-hub.vercel.app)                │

└─────────────────────────┬───────────────────────────────────┘

                          │ HTTPS (permanent URL)

┌─────────────────────────▼───────────────────────────────────┐

│              FastAPI Backend                                │

│       Deployed on: Render.com (always on via UptimeRobot)   │

│       imd-backend2.onrender.com                             │

│                                                             │

│  /weather-stats  /chat  /search  /alerts  /states  /health  │

│                                                             │

│  ┌─────────────┐  ┌──────────────────────────────────────┐  │

│  │  SQLAlchemy │  │     Dual-LLM Router (/chat)          │  │

│  │  ORM Layer  │  │                                      │  │

│  └──────┬──────┘  │  1. Groq API — Llama 3.1 8B          │  │

│         │         │     Fast dashboard lookups (~2s)     │  │

│         │         │            │                         │  │

│         │         │     ROUTE_TO_GEMINI flag?            │  │

│         │         │            │                         │  │

│         │         │  2. Gemini 2.5 Flash (fallback)      │  │

│         │         │     General knowledge queries        │  │

│         │         └──────────────────────────────────────┘  │

│         │                                                   │

│         │         ┌──────────────┐  ┌───────────────────┐   │

│         │         │  Lunar Phase │  │  Keyword RAG      │   │

│         │         │  Engine      │  │  IMD Bulletins    │   │

│         │         └──────────────┘  └───────────────────┘   │

│         │                                                   │

│  ┌──────▼──────────────────────────────────────────────┐    │

│  │  Background Task (asyncio lifespan)                 │    │

│  │  update_weather() runs every 30 min inside FastAPI  │    │

│  └──────┬──────────────────────────────────────────────┘    │

└─────────┼───────────────────────────────────────────────────┘

          │

┌─────────▼──────────────┐     ┌──────────────────────────────┐

│   Neon PostgreSQL      │     │   Open-Meteo API             │

│   (Serverless, free)   │     │   Open-Meteo Air Quality     │

│   weather_records      │◄─── │   Free · No auth needed      │

│   fetch_logs           │     │   66 cities · every 30 min   │

└────────────────────────┘     └──────────────────────────────┘



┌─────────────────────────────────────────────────────────────┐

│   UptimeRobot — pings backend every 5 min                   │

│   Prevents Render free tier from spinning down              │

└─────────────────────────────────────────────────────────────┘

```



---



## 🗂 Project Structure



```

imd-ai-hub/

│

├── 🐍 main.py                  # FastAPI — all endpoints + dual-LLM router + background updater

├── 🐍 database.py              # SQLAlchemy models (WeatherRecord, FetchLog)

├── 🐍 setup_db.py              # One-time DB migration + CSV seeding

├── 🐍 imd_live_updater.py      # Weather fetch logic (called by main.py lifespan)

├── 🐍 vector_store.py          # Keyword-based RAG with IMD bulletin matching

├── 🐍 ingest_bulletins.py      # Bulletin ingestion (local dev only)

├── 🐍 data_chat.py             # CLI chat interface for local testing

│

├── 📁 data/

│   └── weather_report.csv      # Initial seed data (6 cities)

│

├── 📁 frontend/                # Next.js 15 app

│   ├── 📁 app/

│   │   └── page.js             # Full dashboard — single file component

│   ├── package.json

│   └── next.config.js

│

├── 📄 requirements.txt         # Pinned Python deps

├── 📄 .gitignore               # Blocks .env, venv, chroma_db, logs

└── 📄 README.md

```



---



## 📊 Tech Stack



### Backend (Render.com)

| Technology | Purpose |

|---|---|

| **FastAPI 0.115** | Async REST API, 11 endpoints |

| **SQLAlchemy 2.0** | ORM for Neon PostgreSQL |

| **Groq API + Llama 3.1 8B** | Primary AI — fast dashboard & weather queries (~2s response) |

| **Google Gemini 2.5 Flash** | Fallback AI — general meteorology & knowledge questions |

| **Dual-LLM Router** | Llama handles live-data questions; auto-routes to Gemini for general queries |

| **Keyword RAG** | Lightweight IMD bulletin matching, zero RAM overhead |

| **APScheduler / asyncio** | Weather updater runs inside FastAPI lifespan every 30 min |

| **psycopg2-binary** | PostgreSQL driver |



### Database (Neon.tech)

| Table | Contents |

|---|---|

| `weather_records` | 66 cities — all weather fields, updated every 30 min |

| `fetch_logs` | Every API fetch recorded with timestamp, source, success/error |



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

| **Groq API** | Llama 3.1 inference (primary AI) | Free |

| **Google Gemini API** | Gemini 2.5 Flash inference (fallback AI) | Free tier |

| **Open-Meteo** | Live weather data | Free |

| **UptimeRobot** | Keep Render awake | Free |



**Total infrastructure cost: ₹0/month**



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

| `GET` | `/` | Health ping (used by UptimeRobot) |

| `GET` | `/health` | Full status — DB, city count, RAG, lunar phase |

| `GET` | `/weather-stats` | All 66 cities current weather |

| `GET` | `/search?q=Kerala` | Search by city or state name |

| `GET` | `/alerts` | Cities with active warnings only |

| `GET` | `/currently-raining` | Cities actively raining right now |

| `GET` | `/states` | All states with city count + avg temp |

| `GET` | `/city/{name}` | Single city full record |

| `GET` | `/lunar` | Current lunar phase, illumination, moonrise/set |

| `POST` | `/chat` | Dual-LLM AI chat — `{"text": "your question"}` |

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



| Ask the AI | Answered by |

|---|---|

| *"Is it raining in Kolkata right now?"* | Groq / Llama — `is_raining` + `precipitation` fields |

| *"Which city has the worst AQI today?"* | Groq / Llama — sorts all 66 cities by `aqi` |

| *"Should I go out in Delhi today?"* | Groq / Llama — temp + UV + AQI + warnings |

| *"Is there a heatwave anywhere?"* | Groq / Llama — filters `warning` field across all cities |

| *"When is the next full moon?"* | Groq / Llama — LUNAR DATA block in prompt |

| *"What causes the Bay of Bengal cyclones?"* | Gemini 2.5 Flash — general meteorology knowledge |

| *"How dangerous is Delhi's air quality?"* | Groq / Llama — AQI value + RAG from IMD AQI bulletin |

| *"Explain how monsoon depressions form"* | Gemini 2.5 Flash — atmospheric science |



---



## ☁️ Cloud Deployment Notes



### Why a Dual-LLM Router?

A single model creates a hard trade-off: fast models like Llama 3.1 8B excel at structured data lookups but may hallucinate on general knowledge questions outside their fine-tuning scope. Gemini 2.5 Flash has broad world knowledge but is slower for simple data queries. The router gives you the best of both — Llama answers 90% of dashboard questions in ~2 seconds, and Gemini handles the remaining 10% that require broader knowledge. The routing decision is made by Llama itself using a `ROUTE_TO_GEMINI` signal, keeping latency low for most queries.



### Why Groq instead of Ollama

Ollama requires 4GB+ RAM for Llama 3.1. Render free tier has 512MB. Groq runs the same `llama-3.1-8b-instant` model on their hardware and responds in ~2 seconds — faster than local Ollama on a laptop CPU.



### Why keyword RAG instead of ChromaDB

`sentence-transformers` + `chromadb` require C++ compilation and 400MB+ RAM — they cause silent OOM crashes on Render free tier. The keyword RAG replacement has identical output quality for weather advisory questions with zero RAM overhead.



### Why the background updater runs inside FastAPI

Running `imd_live_updater.py` as a separate Render service costs an extra instance (even on free tier, only 1 free web service). Running it as an `asyncio` background task inside the FastAPI lifespan uses the same container — zero additional cost.



### UptimeRobot

Render free tier spins down after 15 minutes of inactivity. UptimeRobot pings `https://imd-backend2.onrender.com/` every 5 minutes, keeping it awake. The root endpoint supports both `GET` and `HEAD` requests — UptimeRobot sends `HEAD` by default.



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

- Chose **Groq API** over local Ollama to enable cloud deployment within free tier RAM limits

- Chose **Gemini 2.5 Flash** as a fallback LLM for general knowledge questions outside the dashboard scope

- Designed a **dual-LLM router** where Llama self-selects when to escalate to Gemini via a routing token — keeping latency low for the majority of queries

- Chose **Neon serverless PostgreSQL** for zero-maintenance cloud database

- Chose **keyword RAG** over ChromaDB to stay within 512MB RAM constraint on Render

- Chose **Open-Meteo** as live data source while IMD API IP whitelisting is pending

- Chose **asyncio background task** over separate cron service to stay within free tier limits

- Designed for **zero ongoing cost** — entire stack runs free indefinitely



---



## 🙏 Acknowledgements



- **India Meteorological Department (IMD)** — for the internship opportunity and API access approval

- **[Anshul Chauhan](https://www.linkedin.com/in/anshul-chauhan-7a44a775)**, Scientist D, IMD — for mentorship, project guidance, and technical direction

- **Open-Meteo** — free open-source weather API, no rate limits

- **Groq** — free Llama 3.1 inference API

- **Google** — Gemini 2.5 Flash API for general knowledge fallback

- **Neon** — serverless PostgreSQL, free tier

- **Render** — free cloud hosting for FastAPI backend

- **Vercel** — free frontend hosting

- **Meta AI** — Llama 3.1 open-source language model



---



## 📄 License



MIT License — free to use, modify, and distribute with attribution.



---



<div align="center">



**Built by Utkarsh Kumar**  

Solo Internship Project · India Meteorological Department · 2026



*If this project helped you, please ⭐ the repo*



[![Live Demo](https://img.shields.io/badge/Try%20it%20live-imd--ai--hub.vercel.app-000?style=for-the-badge&logo=vercel)](https://imd-ai-hub.vercel.app)



</div>