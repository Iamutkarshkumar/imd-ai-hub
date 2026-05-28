
# # Test these new endpoints in your browser:
# # http://localhost:8000/health
# # http://localhost:8000/map-data
# # http://localhost:8000/search?q=Kerala
# # http://localhost:8000/search?q=Maharashtra
# # http://localhost:8000/currently-raining
# # http://localhost:8000/states

# """
# main.py
# -------
# FastAPI backend — v3
# Fixed: Query name conflict between FastAPI and Pydantic
# Fixed: LangChain Ollama deprecation → langchain_ollama
# """

# from fastapi import FastAPI, HTTPException, Depends
# from fastapi import Query as FastAPIQuery          # ← renamed to avoid clash
# from pydantic import BaseModel
# from sqlalchemy.orm import Session
# from sqlalchemy import or_, func
# from fastapi.middleware.cors import CORSMiddleware
# from difflib import get_close_matches
# from database import get_db, WeatherRecord, FetchLog
# from vector_store import search_bulletins, format_rag_context, collection_stats
# import asyncio
# from functools import partial
# from datetime import datetime, timezone
# import re

# # ── LangChain Ollama (updated import) ─────────────────────────────────────
# try:
#     from langchain_ollama import OllamaLLM  # type: ignore
#     llm = OllamaLLM(model="llama3.1", num_predict=140)
# except (ImportError, ModuleNotFoundError):
#     from langchain_community.llms import Ollama  # type: ignore
#     llm = Ollama(model="llama3.1", num_predict=140)

# app = FastAPI(title="IMD Intelligent Dashboard API v3")

# app.add_middleware(
#     CORSMiddleware,
#     allow_origins=["*"],
#     allow_methods=["*"],
#     allow_headers=["*"],
# )

# SYSTEM_PROMPT = """You are a concise IMD weather assistant for India. Answer in 1-3 sentences ONLY.
# Rules:
# - If asked for the highest, lowest, hottest, or coldest city, check the QUICK STATS section first.
# - Use CONDITION DETAIL field for "is it raining / snowing / thundering" questions.
# - Use WARNING field — always mention active warnings.
# - Never say "Based on the data" or "According to the context". Answer directly.
# - End your answer cleanly. NEVER output phrases like "End Output" or "End."."""


# class ChatQuery(BaseModel):
#     text: str


# # ── City + state matching ──────────────────────────────────────────────────

# def get_city_map(db: Session) -> dict:
#     rows = db.query(WeatherRecord.city).all()
#     return {r.city.lower(): r.city for r in rows}


# def get_state_map(db: Session) -> dict:
#     rows = db.query(WeatherRecord.city, WeatherRecord.state).all()
#     state_map = {}
#     for city, state in rows:
#         if state:
#             state_map.setdefault(state.lower(), []).append(city)
#     return state_map


# def find_cities_in_query(user_text: str, db: Session) -> list[str]:
#     text_lower = user_text.lower()
#     found      = []
#     city_map   = get_city_map(db)
#     state_map  = get_state_map(db)

#     # Exact city match
#     for key, original in city_map.items():
#         if key in text_lower and original not in found:
#             found.append(original)

#     # State match → expand to all cities in that state
#     for state_key, cities in state_map.items():
#         if state_key in text_lower:
#             for c in cities:
#                 if c not in found:
#                     found.append(c)

#     # Fuzzy city match
#     if not found:
#         tokens     = text_lower.split()
#         candidates = list(city_map.keys())
#         for token in tokens:
#             m = get_close_matches(token, candidates, n=1, cutoff=0.82)
#             if m:
#                 original = city_map[m[0]]
#                 if original not in found:
#                     found.append(original)
#         for i in range(len(tokens) - 1):
#             bigram = f"{tokens[i]} {tokens[i+1]}"
#             m = get_close_matches(bigram, candidates, n=1, cutoff=0.82)
#             if m:
#                 original = city_map[m[0]]
#                 if original not in found:
#                     found.append(original)

#     return found

# def get_extended_forecast(user_text: str, records: list) -> str:
#     """Fetches a 7-day AND hourly prediction on the fly if the user asks for future data."""
#     user_lower = user_text.lower()
    
#     # Added "tonight", "pm", "am", "at", "hour" so the bot triggers hourly searches
#     time_words = [
#         "tomorrow", "upcoming", "forecast", "predict", "next", 
#         "monday", "tuesday", "wednesday", "thursday", "friday", 
#         "saturday", "sunday", "weekend", "tonight", "today", 
#         "pm", "am", "evening", "morning", "at", "hour", "time"
#     ]
    
#     if not any(w in user_lower for w in time_words):
#         return ""  
        
#     import requests
#     from datetime import datetime, timedelta, timezone
#     forecast_text = "\n\n=== EXTENDED & HOURLY FORECAST ===\n"
    
#     # Limit to top 2 detected cities to keep the prompt small
#     for r in records[:2]:
#         if not r.lat or not r.lon:
#             continue
#         try:
#             resp = requests.get(
#                 "https://api.open-meteo.com/v1/forecast",
#                 params={
#                     "latitude": r.lat,
#                     "longitude": r.lon,
#                     "daily": ["temperature_2m_max", "temperature_2m_min", "precipitation_probability_max"],
#                     "hourly": ["temperature_2m", "precipitation_probability"],
#                     "timezone": "Asia/Kolkata",
#                     "forecast_days": 7
#                 },
#                 timeout=4
#             ).json()
            
#             daily = resp.get("daily", {})
#             hourly = resp.get("hourly", {})
            
#             # --- 1. Map the next few days ---
#             forecast_text += f"\n{r.city} Daily Forecast:\n"
#             times_d = daily.get("time", [])
#             highs = daily.get("temperature_2m_max", [])
#             lows = daily.get("temperature_2m_min", [])
#             pops_d = daily.get("precipitation_probability_max", [])
            
#             for i in range(1, min(5, len(times_d))): 
#                 date_obj = datetime.strptime(times_d[i], "%Y-%m-%d")
#                 day_name = date_obj.strftime("%A") 
#                 forecast_text += f"- {day_name}: High {highs[i]}°C, Low {lows[i]}°C, Rain {pops_d[i]}%\n"
            
#             # --- 2. Map the next 12 hours ---
#             forecast_text += f"\n{r.city} Hourly Forecast:\n"
#             times_h = hourly.get("time", [])
#             temps_h = hourly.get("temperature_2m", [])
#             pops_h = hourly.get("precipitation_probability", [])
            
#             # Find the starting point in the array based on current IST time
#             ist_now = datetime.now(timezone.utc) + timedelta(hours=5, minutes=30)
#             current_hour_str = ist_now.strftime("%Y-%m-%dT%H:00")
            
#             start_idx = 0
#             for idx, t in enumerate(times_h):
#                 if t >= current_hour_str:
#                     start_idx = idx
#                     break
            
#             # Format densely so Llama reads it easily without context bloat
#             hourly_snippets = []
#             for i in range(start_idx, min(start_idx + 12, len(times_h))):
#                 t_obj = datetime.strptime(times_h[i], "%Y-%m-%dT%H:%M")
#                 friendly_time = t_obj.strftime("%I%p").lstrip('0') # Outputs "10PM"
#                 hourly_snippets.append(f"{friendly_time}: {temps_h[i]}°C (Rain {pops_h[i]}%)")
                
#             forecast_text += " | ".join(hourly_snippets) + "\n"
                
#         except Exception:
#             continue
            
#     return forecast_text


# def records_to_context(records: list) -> str:
#     if not records:
#         return "No data available."
        
#     lines = []
    
#     # ── NEW: Pre-calculate analytics for the LLM ───────────────────────
#     if len(records) > 5:
#         hottest = max(records, key=lambda r: r.temperature)
#         coldest = min(records, key=lambda r: r.temperature)
#         worst_aqi = max((r for r in records if r.aqi is not None), key=lambda r: r.aqi, default=None)
        
#         lines.append("=== QUICK STATS (Use this for highest/lowest questions) ===")
#         lines.append(f"Hottest City right now: {hottest.city} at {hottest.temperature}°C")
#         lines.append(f"Coldest City right now: {coldest.city} at {coldest.temperature}°C")
#         if worst_aqi:
#             lines.append(f"Worst Air Quality: {worst_aqi.city} with AQI {worst_aqi.aqi}")
#         lines.append("=========================================================\n")

#     # Limit raw data to 15 to prevent Llama 3.1 context overflow
#     for r in records[:15]:
#         # Clean the ISO strings (e.g., "2026-05-21T06:15" -> "06:15") so the AI speaks naturally
#         sr_clean = r.sunrise.split('T')[-1][:5] if r.sunrise and 'T' in r.sunrise else (r.sunrise or "N/A")
#         ss_clean = r.sunset.split('T')[-1][:5] if r.sunset and 'T' in r.sunset else (r.sunset or "N/A")

#         lines.append(
#             f"- {r.city} ({r.state}): "
#             f"Temp={r.temperature}°C, FeelsLike={r.feels_like}°C, "
#             f"High={r.high}°C, Low={r.low}°C, Humidity={r.humidity}%, "
#             f"Condition={r.condition}, "
#             f"CONDITION DETAIL='{r.condition_detail}', "
#             f"Precipitation={r.precipitation}mm, "
#             f"IsRaining={r.is_raining}, IsThunderstorm={r.is_thunderstorm}, "
#             f"IsSnow={r.is_snowfall}, IsFoggy={r.is_foggy}, "
#             f"Wind={r.wind_speed}km/h {r.wind_dir}, "
#             f"Pressure={r.pressure}hPa, Visibility={r.visibility}km, "
#             f"UV={r.uv_index}, AQI={r.aqi}, Warning={r.warning}, "
#             f"Sunrise={sr_clean}, Sunset={ss_clean}"  # <--- WE ADDED THIS LINE
#         )
#     return "\n".join(lines)


# def build_prompt(user_text: str, weather_context: str, rag_context: str) -> str:
#     # Give Llama the current date so it knows what "tomorrow" or "Wednesday" means
#     current_time = datetime.now(timezone.utc).strftime('%A, %B %d, %Y')
    
#     prompt = f"{SYSTEM_PROMPT}\nCURRENT DATE: {current_time}\n\n"
#     prompt += f"LIVE DATA:\n{weather_context}\n\n"
#     if rag_context:
#         prompt += f"IMD SAFETY CONTEXT (use only if relevant):\n{rag_context}\n\n"
#     prompt += f"QUESTION: {user_text}\nANSWER (1-3 sentences):"
#     return prompt


# async def ask_llm_async(prompt: str) -> str:
#     loop = asyncio.get_event_loop()
#     return await loop.run_in_executor(None, partial(llm.invoke, prompt))


# def clean_response(text: str) -> str:
#     text  = text.strip()
#     lower = text.lower()
#     for f in [
#         "based on the data provided,", "based on the provided data,",
#         "according to the context,",   "according to the live data,",
#         "based on the live data,",     "based on the condition detail,",
#     ]:
#         if lower.startswith(f):
#             text = text[len(f):].strip()
#             text = text[0].upper() + text[1:] if text else text
#             break
#     sentences = re.split(r'(?<=[.!?])\s+', text)
#     text = " ".join(sentences[:3]).strip()
#     # ── NEW: Broader Regex to catch all ending artifacts ─────────────
#     text = re.sub(r'(?i)\s*(End Output|End of Output|End\.|End)\s*$', '', text).strip()
#     return text


# # ── Endpoints ──────────────────────────────────────────────────────────────

# @app.get("/weather-stats")
# async def get_stats(db: Session = Depends(get_db)):
#     records = db.query(WeatherRecord).order_by(
#         WeatherRecord.state, WeatherRecord.city
#     ).all()
#     if not records:
#         raise HTTPException(status_code=404, detail="No weather data found.")
#     return [r.to_dict() for r in records]


# @app.get("/map-data")
# async def get_map_data(db: Session = Depends(get_db)):
#     """Lightweight — only fields needed for map markers."""
#     records = db.query(WeatherRecord).all()
#     return [
#         {
#             "city":             r.city,
#             "state":            r.state,
#             "lat":              r.lat,
#             "lon":              r.lon,
#             "temperature":      r.temperature,
#             "condition":        r.condition,
#             "condition_detail": r.condition_detail,
#             "weather_code":     r.weather_code,
#             "is_raining":       r.is_raining,
#             "is_thunderstorm":  r.is_thunderstorm,
#             "is_snowfall":      r.is_snowfall,
#             "is_foggy":         r.is_foggy,
#             "precipitation":    r.precipitation,
#             "warning":          r.warning,
#             "aqi":              r.aqi,
#             "humidity":         r.humidity,
#         }
#         for r in records
#         if r.lat and r.lon
#     ]


# @app.get("/states")
# async def get_states(db: Session = Depends(get_db)):
#     """All states with city count and avg temp — for the filter panel."""
#     rows = db.query(
#         WeatherRecord.state,
#         func.count(WeatherRecord.id).label("city_count"),
#         func.avg(WeatherRecord.temperature).label("avg_temp"),
#     ).group_by(WeatherRecord.state).order_by(WeatherRecord.state).all()
#     return [
#         {
#             "state":      row.state,
#             "city_count": row.city_count,
#             "avg_temp":   round(row.avg_temp, 1) if row.avg_temp else None,
#         }
#         for row in rows
#     ]


# @app.get("/search")
# async def search_cities(
#     q: str = FastAPIQuery(..., min_length=1),   # ← FastAPIQuery, not Query
#     db: Session = Depends(get_db)
# ):
#     """Search cities or states by name fragment."""
#     pattern = f"%{q}%"
#     records = db.query(WeatherRecord).filter(
#         or_(
#             WeatherRecord.city.ilike(pattern),
#             WeatherRecord.state.ilike(pattern),
#         )
#     ).order_by(WeatherRecord.state, WeatherRecord.city).all()
#     return [r.to_dict() for r in records]


# @app.get("/city/{city_name}")
# async def get_city(city_name: str, db: Session = Depends(get_db)):
#     record = db.query(WeatherRecord).filter(
#         WeatherRecord.city.ilike(f"%{city_name}%")
#     ).first()
#     if not record:
#         raise HTTPException(status_code=404, detail=f"City '{city_name}' not found.")
#     return record.to_dict()


# @app.get("/alerts")
# async def get_alerts(db: Session = Depends(get_db)):
#     records = db.query(WeatherRecord).filter(
#         WeatherRecord.warning != "None",
#         WeatherRecord.warning.isnot(None),
#     ).order_by(WeatherRecord.warning).all()
#     return [r.to_dict() for r in records]


# @app.get("/currently-raining")
# async def currently_raining(db: Session = Depends(get_db)):
#     """Cities where it is actively raining or thundering right now."""
#     records = db.query(WeatherRecord).filter(
#         or_(
#             WeatherRecord.is_raining == True,
#             WeatherRecord.is_thunderstorm == True,
#         )
#     ).all()
#     return [
#         {
#             "city":             r.city,
#             "state":            r.state,
#             "condition_detail": r.condition_detail,
#             "precipitation":    r.precipitation,
#             "is_thunderstorm":  r.is_thunderstorm,
#         }
#         for r in records
#     ]


# @app.get("/fetch-logs")
# async def get_fetch_logs(limit: int = 20, db: Session = Depends(get_db)):
#     logs = db.query(FetchLog).order_by(
#         FetchLog.fetched_at.desc()
#     ).limit(limit).all()
#     return [l.to_dict() for l in logs]


# @app.get("/rag-stats")
# async def get_rag_stats():
#     return collection_stats()


# @app.post("/chat")
# async def chat_with_weather(query: ChatQuery, db: Session = Depends(get_db)):
#     user_text = query.text.strip()
#     if not user_text:
#         raise HTTPException(status_code=400, detail="Query text cannot be empty.")

#     cities = find_cities_in_query(user_text, db)

#     if cities:
#         records = db.query(WeatherRecord).filter(
#             WeatherRecord.city.in_(cities[:8])
#         ).all()
#     else:
#         records = db.query(WeatherRecord).all()

#     weather_context = records_to_context(records)
    
#     # ADD THIS LINE: Inject future predictions if the user asks for them!
#     weather_context += get_extended_forecast(user_text, records)

#     rag_hits        = search_bulletins(user_text, n_results=2)
#     rag_context     = format_rag_context(rag_hits, max_chars=500)
#     prompt          = build_prompt(user_text, weather_context, rag_context)
#     raw             = await ask_llm_async(prompt)
#     response        = clean_response(raw)

#     return {
#         "cities_detected": cities[:8],
#         "ai_response":     response,
#     }


# @app.get("/health")
# async def health(db: Session = Depends(get_db)):
#     city_count  = db.query(WeatherRecord).count()
#     state_count = db.query(WeatherRecord.state).distinct().count()
#     rag         = collection_stats()
#     return {
#         "status":       "ok",
#         "db_connected": True,
#         "city_count":   city_count,
#         "state_count":  state_count,
#         "rag_chunks":   rag["total_chunks"],
#         "timestamp":    datetime.now(timezone.utc).isoformat(),
#     }


# if __name__ == "__main__":
#     import uvicorn
#     uvicorn.run(app, host="0.0.0.0", port=8000)

















"""
main.py
-------
FastAPI backend — v4 (Cloud Ready)
Upgraded: Replaced local Ollama with blazing fast Groq cloud API.
"""

import os
import re
import asyncio
from datetime import datetime, timedelta, timezone
from difflib import get_close_matches

from fastapi import FastAPI, HTTPException, Depends
from fastapi import Query as FastAPIQuery
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sqlalchemy.orm import Session
from sqlalchemy import or_, func
from dotenv import load_dotenv
from contextlib import asynccontextmanager 
import asyncio
from contextlib import asynccontextmanager
import asyncio
from database import get_db, WeatherRecord, FetchLog
try:
    from vector_store import search_bulletins, format_rag_context, collection_stats
    RAG_AVAILABLE = True
except Exception as e:
    print(f"⚠️ RAG unavailable (likely OOM): {e}")
    RAG_AVAILABLE = False
    def search_bulletins(*a, **kw): return []
    def format_rag_context(*a, **kw): return ""
    def collection_stats(): return {"total_chunks": 0}

# ── NEW: Groq Cloud API Setup ─────────────────────────────────────────────
from groq import AsyncGroq

load_dotenv()

# Initialize the async Groq client
# It automatically picks up GROQ_API_KEY from your .env file
groq_client = AsyncGroq(api_key=os.environ.get("GROQ_API_KEY"))

async def run_live_updater():
    """Runs the weather updater every 30 min inside FastAPI."""
    while True:
        try:
            print("🔄 Running weather update...")
            from imd_live_updater import run_once   # only import when needed
            await asyncio.get_event_loop().run_in_executor(None, run_once)
            print("✅ Weather update complete. Next in 30 min.")
        except Exception as e:
            print(f"⚠️ Updater error (non-fatal): {e}")
        await asyncio.sleep(1800)  # 30 minutes

@asynccontextmanager
async def lifespan(app: FastAPI):
    task = asyncio.create_task(run_live_updater())
    yield
    task.cancel()

async def updater_loop():
    await asyncio.sleep(10)  # wait for app to fully start first
    while True:
        try:
            from imd_live_updater import update_weather
            loop = asyncio.get_event_loop()
            await loop.run_in_executor(None, update_weather)
            print("✅ Weather update complete")
        except Exception as e:
            print(f"⚠️ Updater error: {e}")
        await asyncio.sleep(1800)

@asynccontextmanager
async def lifespan(app: FastAPI):
    asyncio.create_task(updater_loop())
    yield

app = FastAPI(title="IMD Intelligent Dashboard API v4", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

SYSTEM_PROMPT = """You are a concise IMD weather assistant for India. Answer in 1-3 sentences ONLY.
Rules:
- If asked for the highest, lowest, hottest, or coldest city, check the QUICK STATS section first.
- Use CONDITION DETAIL field for "is it raining / snowing / thundering" questions.
- Use WARNING field — always mention active warnings.
- Never say "Based on the data" or "According to the context". Answer directly.
- End your answer cleanly. NEVER output phrases like "End Output" or "End."."""

class ChatQuery(BaseModel):
    text: str

# ── City + state matching ──────────────────────────────────────────────────

def get_city_map(db: Session) -> dict:
    rows = db.query(WeatherRecord.city).all()
    return {r.city.lower(): r.city for r in rows}

def get_state_map(db: Session) -> dict:
    rows = db.query(WeatherRecord.city, WeatherRecord.state).all()
    state_map = {}
    for city, state in rows:
        if state:
            state_map.setdefault(state.lower(), []).append(city)
    return state_map

def find_cities_in_query(user_text: str, db: Session) -> list[str]:
    text_lower = user_text.lower()
    found      = []
    city_map   = get_city_map(db)
    state_map  = get_state_map(db)

    for key, original in city_map.items():
        if key in text_lower and original not in found:
            found.append(original)

    for state_key, cities in state_map.items():
        if state_key in text_lower:
            for c in cities:
                if c not in found:
                    found.append(c)

    if not found:
        tokens     = text_lower.split()
        candidates = list(city_map.keys())
        for token in tokens:
            m = get_close_matches(token, candidates, n=1, cutoff=0.82)
            if m:
                original = city_map[m[0]]
                if original not in found:
                    found.append(original)
        for i in range(len(tokens) - 1):
            bigram = f"{tokens[i]} {tokens[i+1]}"
            m = get_close_matches(bigram, candidates, n=1, cutoff=0.82)
            if m:
                original = city_map[m[0]]
                if original not in found:
                    found.append(original)

    return found

def get_extended_forecast(user_text: str, records: list) -> str:
    user_lower = user_text.lower()
    time_words = [
        "tomorrow", "upcoming", "forecast", "predict", "next", 
        "monday", "tuesday", "wednesday", "thursday", "friday", 
        "saturday", "sunday", "weekend", "tonight", "today", 
        "pm", "am", "evening", "morning", "at", "hour", "time"
    ]
    
    if not any(w in user_lower for w in time_words):
        return ""  
        
    import requests
    forecast_text = "\n\n=== EXTENDED & HOURLY FORECAST ===\n"
    
    for r in records[:2]:
        if not r.lat or not r.lon:
            continue
        try:
            resp = requests.get(
                "https://api.open-meteo.com/v1/forecast",
                params={
                    "latitude": r.lat,
                    "longitude": r.lon,
                    "daily": ["temperature_2m_max", "temperature_2m_min", "precipitation_probability_max"],
                    "hourly": ["temperature_2m", "precipitation_probability"],
                    "timezone": "Asia/Kolkata",
                    "forecast_days": 7
                },
                timeout=4
            ).json()
            
            daily = resp.get("daily", {})
            hourly = resp.get("hourly", {})
            
            forecast_text += f"\n{r.city} Daily Forecast:\n"
            times_d = daily.get("time", [])
            highs = daily.get("temperature_2m_max", [])
            lows = daily.get("temperature_2m_min", [])
            pops_d = daily.get("precipitation_probability_max", [])
            
            for i in range(1, min(5, len(times_d))): 
                date_obj = datetime.strptime(times_d[i], "%Y-%m-%d")
                day_name = date_obj.strftime("%A") 
                forecast_text += f"- {day_name}: High {highs[i]}°C, Low {lows[i]}°C, Rain {pops_d[i]}%\n"
            
            forecast_text += f"\n{r.city} Hourly Forecast:\n"
            times_h = hourly.get("time", [])
            temps_h = hourly.get("temperature_2m", [])
            pops_h = hourly.get("precipitation_probability", [])
            
            ist_now = datetime.now(timezone.utc) + timedelta(hours=5, minutes=30)
            current_hour_str = ist_now.strftime("%Y-%m-%dT%H:00")
            
            start_idx = 0
            for idx, t in enumerate(times_h):
                if t >= current_hour_str:
                    start_idx = idx
                    break
            
            hourly_snippets = []
            for i in range(start_idx, min(start_idx + 12, len(times_h))):
                t_obj = datetime.strptime(times_h[i], "%Y-%m-%dT%H:%M")
                friendly_time = t_obj.strftime("%I%p").lstrip('0')
                hourly_snippets.append(f"{friendly_time}: {temps_h[i]}°C (Rain {pops_h[i]}%)")
                
            forecast_text += " | ".join(hourly_snippets) + "\n"
                
        except Exception:
            continue
            
    return forecast_text

def records_to_context(records: list) -> str:
    if not records:
        return "No data available."
        
    lines = []
    
    if len(records) > 5:
        hottest = max(records, key=lambda r: r.temperature)
        coldest = min(records, key=lambda r: r.temperature)
        worst_aqi = max((r for r in records if r.aqi is not None), key=lambda r: r.aqi, default=None)
        
        lines.append("=== QUICK STATS (Use this for highest/lowest questions) ===")
        lines.append(f"Hottest City right now: {hottest.city} at {hottest.temperature}°C")
        lines.append(f"Coldest City right now: {coldest.city} at {coldest.temperature}°C")
        if worst_aqi:
            lines.append(f"Worst Air Quality: {worst_aqi.city} with AQI {worst_aqi.aqi}")
        lines.append("=========================================================\n")

    for r in records[:15]:
        sr_clean = r.sunrise.split('T')[-1][:5] if r.sunrise and 'T' in r.sunrise else (r.sunrise or "N/A")
        ss_clean = r.sunset.split('T')[-1][:5] if r.sunset and 'T' in r.sunset else (r.sunset or "N/A")

        lines.append(
            f"- {r.city} ({r.state}): "
            f"Temp={r.temperature}°C, FeelsLike={r.feels_like}°C, "
            f"High={r.high}°C, Low={r.low}°C, Humidity={r.humidity}%, "
            f"Condition={r.condition}, "
            f"CONDITION DETAIL='{r.condition_detail}', "
            f"Precipitation={r.precipitation}mm, "
            f"IsRaining={r.is_raining}, IsThunderstorm={r.is_thunderstorm}, "
            f"IsSnow={r.is_snowfall}, IsFoggy={r.is_foggy}, "
            f"Wind={r.wind_speed}km/h {r.wind_dir}, "
            f"Pressure={r.pressure}hPa, Visibility={r.visibility}km, "
            f"UV={r.uv_index}, AQI={r.aqi}, Warning={r.warning}, "
            f"Sunrise={sr_clean}, Sunset={ss_clean}"
        )
    return "\n".join(lines)

def build_prompt(user_text: str, weather_context: str, rag_context: str) -> str:
    current_time = datetime.now(timezone.utc).strftime('%A, %B %d, %Y')
    prompt = f"{SYSTEM_PROMPT}\nCURRENT DATE: {current_time}\n\n"
    prompt += f"LIVE DATA:\n{weather_context}\n\n"
    if rag_context:
        prompt += f"IMD SAFETY CONTEXT (use only if relevant):\n{rag_context}\n\n"
    prompt += f"QUESTION: {user_text}\nANSWER (1-3 sentences):"
    return prompt

# ── NEW: Groq API Call ────────────────────────────────────────────────────
async def ask_llm_async(prompt: str) -> str:
    # Leverages Groq's high-speed inference for Llama 3.1
    response = await groq_client.chat.completions.create(
        model="llama-3.1-8b-instant",
        messages=[{"role": "user", "content": prompt}],
        max_tokens=150,
    )
    return response.choices[0].message.content

def clean_response(text: str) -> str:
    text  = text.strip()
    lower = text.lower()
    for f in [
        "based on the data provided,", "based on the provided data,",
        "according to the context,",   "according to the live data,",
        "based on the live data,",     "based on the condition detail,",
    ]:
        if lower.startswith(f):
            text = text[len(f):].strip()
            text = text[0].upper() + text[1:] if text else text
            break
    sentences = re.split(r'(?<=[.!?])\s+', text)
    text = " ".join(sentences[:3]).strip()
    text = re.sub(r'(?i)\s*(End Output|End of Output|End\.|End)\s*$', '', text).strip()
    return text

# ── Endpoints ──────────────────────────────────────────────────────────────
@app.get("/")
async def root():
    return {"status": "Imd API is running!"}
@app.get("/weather-stats")
async def get_stats(db: Session = Depends(get_db)):
    records = db.query(WeatherRecord).order_by(WeatherRecord.state, WeatherRecord.city).all()
    if not records:
        raise HTTPException(status_code=404, detail="No weather data found.")
    return [r.to_dict() for r in records]

@app.get("/map-data")
async def get_map_data(db: Session = Depends(get_db)):
    records = db.query(WeatherRecord).all()
    return [{
        "city": r.city, "state": r.state, "lat": r.lat, "lon": r.lon,
        "temperature": r.temperature, "condition": r.condition,
        "condition_detail": r.condition_detail, "weather_code": r.weather_code,
        "is_raining": r.is_raining, "is_thunderstorm": r.is_thunderstorm,
        "is_snowfall": r.is_snowfall, "is_foggy": r.is_foggy,
        "precipitation": r.precipitation, "warning": r.warning,
        "aqi": r.aqi, "humidity": r.humidity,
    } for r in records if r.lat and r.lon]

@app.get("/states")
async def get_states(db: Session = Depends(get_db)):
    rows = db.query(
        WeatherRecord.state,
        func.count(WeatherRecord.id).label("city_count"),
        func.avg(WeatherRecord.temperature).label("avg_temp"),
    ).group_by(WeatherRecord.state).order_by(WeatherRecord.state).all()
    return [{"state": row.state, "city_count": row.city_count, "avg_temp": round(row.avg_temp, 1) if row.avg_temp else None} for row in rows]

@app.get("/search")
async def search_cities(q: str = FastAPIQuery(..., min_length=1), db: Session = Depends(get_db)):
    pattern = f"%{q}%"
    records = db.query(WeatherRecord).filter(or_(WeatherRecord.city.ilike(pattern), WeatherRecord.state.ilike(pattern))).order_by(WeatherRecord.state, WeatherRecord.city).all()
    return [r.to_dict() for r in records]

@app.get("/city/{city_name}")
async def get_city(city_name: str, db: Session = Depends(get_db)):
    record = db.query(WeatherRecord).filter(WeatherRecord.city.ilike(f"%{city_name}%")).first()
    if not record:
        raise HTTPException(status_code=404, detail=f"City '{city_name}' not found.")
    return record.to_dict()

@app.get("/alerts")
async def get_alerts(db: Session = Depends(get_db)):
    records = db.query(WeatherRecord).filter(WeatherRecord.warning != "None", WeatherRecord.warning.isnot(None)).order_by(WeatherRecord.warning).all()
    return [r.to_dict() for r in records]

@app.get("/currently-raining")
async def currently_raining(db: Session = Depends(get_db)):
    records = db.query(WeatherRecord).filter(or_(WeatherRecord.is_raining == True, WeatherRecord.is_thunderstorm == True)).all()
    return [{"city": r.city, "state": r.state, "condition_detail": r.condition_detail, "precipitation": r.precipitation, "is_thunderstorm": r.is_thunderstorm} for r in records]

@app.get("/fetch-logs")
async def get_fetch_logs(limit: int = 20, db: Session = Depends(get_db)):
    logs = db.query(FetchLog).order_by(FetchLog.fetched_at.desc()).limit(limit).all()
    return [l.to_dict() for l in logs]

@app.get("/rag-stats")
async def get_rag_stats():
    return collection_stats()

@app.post("/chat")
async def chat_with_weather(query: ChatQuery, db: Session = Depends(get_db)):
    user_text = query.text.strip()
    if not user_text:
        raise HTTPException(status_code=400, detail="Query text cannot be empty.")

    cities = find_cities_in_query(user_text, db)
    records = db.query(WeatherRecord).filter(WeatherRecord.city.in_(cities[:8])).all() if cities else db.query(WeatherRecord).all()

    weather_context = records_to_context(records)
    weather_context += get_extended_forecast(user_text, records)

    rag_hits = search_bulletins(user_text, n_results=2)
    rag_context = format_rag_context(rag_hits, max_chars=500)
    
    prompt = build_prompt(user_text, weather_context, rag_context)
    raw = await ask_llm_async(prompt)
    response = clean_response(raw)

    return {"cities_detected": cities[:8], "ai_response": response}

@app.get("/health")
async def health(db: Session = Depends(get_db)):
    city_count = db.query(WeatherRecord).count()
    state_count = db.query(WeatherRecord.state).distinct().count()
    rag = collection_stats()
    return {"status": "ok", "db_connected": True, "city_count": city_count, "state_count": state_count, "rag_chunks": rag["total_chunks"], "timestamp": datetime.now(timezone.utc).isoformat()}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)