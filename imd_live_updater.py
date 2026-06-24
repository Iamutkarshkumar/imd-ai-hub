"""
imd_live_updater.py
--------------------
Hybrid weather fetcher — IMD official data first, Open-Meteo fills the gaps.

Data sources per field:
  current_wx       -> live temp, humidity, wind, pressure, condition (46 cities)
  aws_data         -> live data fallback for cities with no Synop station (10 cities)
  cityforecastloc  -> high/low + 7-day forecast text (days 1-5)
  districtwarning  -> IMD red/orange alerts, decoded to plain English
  Open-Meteo       -> uv_index, aqi, visibility (not available from IMD anywhere),
                      day 6-7 forecast, and a full fallback whenever IMD data
                      is missing, null, or older than STALE_THRESHOLD_HOURS.

Runs every 30 minutes via the FastAPI lifespan background task in main.py.
"""

import os
import json
import asyncio
import logging
from datetime import datetime, timezone, timedelta

import requests
import httpx
from dotenv import load_dotenv

from database import SessionLocal, WeatherRecord, FetchLog

load_dotenv()

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s  %(levelname)-8s %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
    handlers=[logging.StreamHandler()],
)
log = logging.getLogger(__name__)
logging.getLogger("httpx").setLevel(logging.WARNING)

STALE_THRESHOLD_HOURS = 3


# ═══════════════════════════════════════════════════════════════════════════
# 1. CITY REGISTRY — single source of truth for all 66 cities
# ═══════════════════════════════════════════════════════════════════════════
# synop_station : exact "Station" name in IMD current_wx, or None if the
#                 city has no Synop station and must use aws_data instead.
# aws_district   : exact "DISTRICT" value in IMD aws_data (only needed when
#                  synop_station is None).
# district       : exact "District" value in IMD districtwarning.

CITIES = [
    # ── North ───────────────────────────────────────────────────────────
    {"city": "New Delhi",   "state": "Delhi",            "lat": 28.6139, "lon": 77.2090,
     "synop_station": "New Delhi-Safdarjung", "aws_district": None, "district": "NEW DELHI"},
    {"city": "Noida",       "state": "Uttar Pradesh",     "lat": 28.5355, "lon": 77.3910,
     "synop_station": None, "aws_district": "GAUTAM_BUDDHA_NAGAR", "district": "GAUTAM BUDDHA NAGAR"},
    {"city": "Lucknow",     "state": "Uttar Pradesh",     "lat": 26.8467, "lon": 80.9462,
     "synop_station": "Lucknow-Airport", "aws_district": None, "district": "LUCKNOW"},
    {"city": "Kanpur",      "state": "Uttar Pradesh",     "lat": 26.4499, "lon": 80.3319,
     "synop_station": None, "aws_district": "KANPUR_NAGAR", "district": "KANPUR NAGAR"},
    {"city": "Varanasi",    "state": "Uttar Pradesh",     "lat": 25.3176, "lon": 82.9739,
     "synop_station": "Varanasi", "aws_district": None, "district": "VARANASI"},
    {"city": "Agra",        "state": "Uttar Pradesh",     "lat": 27.1767, "lon": 78.0081,
     "synop_station": None, "aws_district": "AGRA", "district": "AGRA"},
    {"city": "Jaipur",      "state": "Rajasthan",         "lat": 26.9124, "lon": 75.7873,
     "synop_station": "Jaipur-AMO Jaipur", "aws_district": None, "district": "JAIPUR"},
    {"city": "Jodhpur",     "state": "Rajasthan",         "lat": 26.2389, "lon": 73.0243,
     "synop_station": "Jodhpur", "aws_district": None, "district": "JODHPUR"},
    {"city": "Udaipur",     "state": "Rajasthan",         "lat": 24.5854, "lon": 73.7125,
     "synop_station": "Udaipur ", "aws_district": None, "district": "UDAIPUR"},
    {"city": "Chandigarh",  "state": "Punjab",            "lat": 30.7333, "lon": 76.7794,
     "synop_station": "Chandigarh-City", "aws_district": None, "district": "CHANDIGARH"},
    {"city": "Amritsar",    "state": "Punjab",            "lat": 31.6340, "lon": 74.8723,
     "synop_station": "Amritsar", "aws_district": None, "district": "AMRITSAR"},
    {"city": "Ludhiana",    "state": "Punjab",            "lat": 30.9010, "lon": 75.8573,
     "synop_station": None, "aws_district": "LUDHIANA", "district": "LUDHIANA"},
    {"city": "Shimla",      "state": "Himachal Pradesh",  "lat": 31.1048, "lon": 77.1734,
     "synop_station": "Shimla-Airport", "aws_district": None, "district": "SHIMLA"},
    {"city": "Dharamshala", "state": "Himachal Pradesh",  "lat": 32.2190, "lon": 76.3234,
     "synop_station": None, "aws_district": "KANGRA", "district": "KANGRA"},
    {"city": "Dehradun",    "state": "Uttarakhand",       "lat": 30.3165, "lon": 78.0322,
     "synop_station": "Dehradun", "aws_district": None, "district": "DEHRADUN"},
    {"city": "Haridwar",    "state": "Uttarakhand",       "lat": 29.9457, "lon": 78.1642,
     "synop_station": None, "aws_district": "HARIDWAR", "district": "HARIDWAR"},
    {"city": "Srinagar",    "state": "Jammu & Kashmir",   "lat": 34.0837, "lon": 74.7973,
     "synop_station": "Srinagar-City", "aws_district": None, "district": "SRINAGAR"},
    {"city": "Jammu",       "state": "Jammu & Kashmir",   "lat": 32.7266, "lon": 74.8570,
     "synop_station": "Jammu-City", "aws_district": None, "district": "JAMMU"},
    {"city": "Leh",         "state": "Ladakh",            "lat": 34.1526, "lon": 77.5771,
     "synop_station": "Leh", "aws_district": None, "district": "LEH"},

    # ── West ────────────────────────────────────────────────────────────
    {"city": "Mumbai",      "state": "Maharashtra",       "lat": 19.0760, "lon": 72.8777,
     "synop_station": "Mumbai-Santacruz", "aws_district": None, "district": "MUMBAI"},
    {"city": "Pune",        "state": "Maharashtra",       "lat": 18.5204, "lon": 73.8567,
     "synop_station": "Pune-Shivajinagar", "aws_district": None, "district": "PUNE"},
    {"city": "Nagpur",      "state": "Maharashtra",       "lat": 21.1458, "lon": 79.0882,
     "synop_station": "Nagpur-Sonegaon Airport", "aws_district": None, "district": "NAGPUR"},
    {"city": "Nashik",      "state": "Maharashtra",       "lat": 19.9975, "lon": 73.7898,
     "synop_station": "Nashik", "aws_district": None, "district": "NASHIK"},
    {"city": "Aurangabad",  "state": "Maharashtra",       "lat": 19.8762, "lon": 75.3433,
     "synop_station": "Aurangabad", "aws_district": None, "district": "AURANGABAD"},
    {"city": "Ahmedabad",   "state": "Gujarat",           "lat": 23.0225, "lon": 72.5714,
     "synop_station": "Ahmedabad", "aws_district": None, "district": "AHMEDABAD"},
    {"city": "Surat",       "state": "Gujarat",           "lat": 21.1702, "lon": 72.8311,
     "synop_station": "Surat", "aws_district": None, "district": "SURAT"},
    {"city": "Vadodara",    "state": "Gujarat",           "lat": 22.3072, "lon": 73.1812,
     "synop_station": "Baroda", "aws_district": None, "district": "VADODARA"},
    {"city": "Rajkot",      "state": "Gujarat",           "lat": 22.3039, "lon": 70.8022,
     "synop_station": "Rajkot", "aws_district": None, "district": "RAJKOT"},
    {"city": "Panaji",      "state": "Goa",               "lat": 15.4909, "lon": 73.8278,
     "synop_station": "Panjim", "aws_district": None, "district": "NORTH GOA"},

    # ── South ───────────────────────────────────────────────────────────
    {"city": "Bengaluru",   "state": "Karnataka",         "lat": 12.9716, "lon": 77.5946,
     "synop_station": "Bengaluru-City", "aws_district": None, "district": "BANGALORE URBAN"},
    {"city": "Mysuru",      "state": "Karnataka",         "lat": 12.2958, "lon": 76.6394,
     "synop_station": None, "aws_district": "MYSORE", "district": "MYSURU"},
    {"city": "Mangaluru",   "state": "Karnataka",         "lat": 12.9141, "lon": 74.8560,
     "synop_station": "Mangaluru", "aws_district": None, "district": "DAKSHINA KANNADA"},
    {"city": "Hubballi",    "state": "Karnataka",         "lat": 15.3647, "lon": 75.1240,
     "synop_station": None, "aws_district": "DHARWAD", "district": "DHARWAD"},
    {"city": "Chennai",     "state": "Tamil Nadu",        "lat": 13.0827, "lon": 80.2707,
     "synop_station": "Chennai-Nungambakkam", "aws_district": None, "district": "CHENNAI"},
    {"city": "Coimbatore",  "state": "Tamil Nadu",        "lat": 11.0168, "lon": 76.9558,
     "synop_station": "Coimbatore", "aws_district": None, "district": "COIMBATORE"},
    {"city": "Madurai",     "state": "Tamil Nadu",        "lat":  9.9252, "lon": 78.1198,
     "synop_station": "Madurai ", "aws_district": None, "district": "MADURAI"},
    {"city": "Hyderabad",   "state": "Telangana",         "lat": 17.3850, "lon": 78.4867,
     "synop_station": "Hyderabad", "aws_district": None, "district": "HYDERABAD"},
    {"city": "Warangal",    "state": "Telangana",         "lat": 17.9784, "lon": 79.5941,
     "synop_station": None, "aws_district": "WARANGAL_RURAL", "district": "WARANGAL URBAN"},
    {"city": "Thiruvananthapuram", "state": "Kerala",     "lat":  8.5241, "lon": 76.9366,
     "synop_station": "Thiruvananthapuram-City", "aws_district": None, "district": "THIRUVANANTHAPURAM"},
    {"city": "Kochi",       "state": "Kerala",            "lat":  9.9312, "lon": 76.2673,
     "synop_station": "Kochi", "aws_district": None, "district": "ERNAKULAM"},
    {"city": "Kozhikode",   "state": "Kerala",            "lat": 11.2588, "lon": 75.7804,
     "synop_station": "kozhikode", "aws_district": None, "district": "KOZHIKODE"},
    {"city": "Visakhapatnam", "state": "Andhra Pradesh",  "lat": 17.6868, "lon": 83.2185,
     "synop_station": "Visakhapatnam", "aws_district": None, "district": "VISAKHAPATNAM"},
    {"city": "Vijayawada",  "state": "Andhra Pradesh",    "lat": 16.5062, "lon": 80.6480,
     "synop_station": "Amaravati-Gannavaram", "aws_district": None, "district": "KRISHNA"},
    {"city": "Puducherry",  "state": "Puducherry",        "lat": 11.9416, "lon": 79.8083,
     "synop_station": "Pondicherry", "aws_district": None, "district": "PUDUCHERRY"},

    # ── East ────────────────────────────────────────────────────────────
    {"city": "Kolkata",     "state": "West Bengal",       "lat": 22.5726, "lon": 88.3639,
     "synop_station": "Kolkata-Alipore", "aws_district": None, "district": "KOLKATA"},
    {"city": "Siliguri",    "state": "West Bengal",       "lat": 26.7271, "lon": 88.3953,
     "synop_station": "SILIGURI", "aws_district": None, "district": "DARJEELING"},
    {"city": "Bhubaneswar", "state": "Odisha",            "lat": 20.2961, "lon": 85.8245,
     "synop_station": "Bhubneshwar-Airport", "aws_district": None, "district": "KHURDA"},
    {"city": "Cuttack",     "state": "Odisha",            "lat": 20.4625, "lon": 85.8830,
     "synop_station": "Bhubneshwar-Cuttack", "aws_district": None, "district": "CUTTACK"},
    {"city": "Patna",       "state": "Bihar",             "lat": 25.5941, "lon": 85.1376,
     "synop_station": "Patna-Airport", "aws_district": None, "district": "PATNA"},
    {"city": "Gaya",        "state": "Bihar",             "lat": 24.7955, "lon": 84.9994,
     "synop_station": "Gaya", "aws_district": None, "district": "GAYA"},
    {"city": "Ranchi",      "state": "Jharkhand",         "lat": 23.3441, "lon": 85.3096,
     "synop_station": "Ranchi", "aws_district": None, "district": "RANCHI"},
    {"city": "Jamshedpur",  "state": "Jharkhand",         "lat": 22.8046, "lon": 86.2029,
     "synop_station": "Jamshedpur", "aws_district": None, "district": "EAST SINGHBHUM"},
    {"city": "Raipur",      "state": "Chhattisgarh",      "lat": 21.2514, "lon": 81.6296,
     "synop_station": "Raipur-Mana", "aws_district": None, "district": "RAIPUR"},

    # ── Central ─────────────────────────────────────────────────────────
    {"city": "Bhopal",      "state": "Madhya Pradesh",    "lat": 23.2599, "lon": 77.4126,
     "synop_station": "Bhopal-Arera Hills", "aws_district": None, "district": "BHOPAL"},
    {"city": "Indore",      "state": "Madhya Pradesh",    "lat": 22.7196, "lon": 75.8577,
     "synop_station": "Indore", "aws_district": None, "district": "INDORE"},
    {"city": "Jabalpur",    "state": "Madhya Pradesh",    "lat": 23.1815, "lon": 79.9864,
     "synop_station": "Jabalpur", "aws_district": None, "district": "JABALPUR"},
    {"city": "Gwalior",     "state": "Madhya Pradesh",    "lat": 26.2183, "lon": 78.1828,
     "synop_station": "Gwalior", "aws_district": None, "district": "GWALIOR"},

    # ── Northeast ───────────────────────────────────────────────────────
    {"city": "Guwahati",    "state": "Assam",             "lat": 26.1445, "lon": 91.7362,
     "synop_station": "Guwahati-Airport", "aws_district": None, "district": "KAMRUP METROPOLITAN"},
    {"city": "Dibrugarh",   "state": "Assam",             "lat": 27.4728, "lon": 94.9120,
     "synop_station": "Dibrugarh", "aws_district": None, "district": "DIBRUGARH"},
    {"city": "Shillong",    "state": "Meghalaya",         "lat": 25.5788, "lon": 91.8933,
     "synop_station": "Shillong", "aws_district": None, "district": "EAST KHASI HILLS"},
    {"city": "Imphal",      "state": "Manipur",           "lat": 24.8170, "lon": 93.9368,
     "synop_station": "Imphal", "aws_district": None, "district": "IMPHAL WEST"},
    {"city": "Aizawl",      "state": "Mizoram",           "lat": 23.7307, "lon": 92.7173,
     "synop_station": "Aizawl-Lengpui", "aws_district": None, "district": "AIZAWL"},
    {"city": "Agartala",    "state": "Tripura",           "lat": 23.8315, "lon": 91.2868,
     "synop_station": "Agartala", "aws_district": None, "district": "WEST TRIPURA"},
    {"city": "Itanagar",    "state": "Arunachal Pradesh", "lat": 27.0844, "lon": 93.6053,
     "synop_station": "Itanagar", "aws_district": None, "district": "PAPUM PARE"},
    {"city": "Kohima",      "state": "Nagaland",          "lat": 25.6751, "lon": 94.1086,
     "synop_station": None, "aws_district": "KOHIMA", "district": "KOHIMA"},
    {"city": "Gangtok",     "state": "Sikkim",            "lat": 27.3389, "lon": 88.6065,
     "synop_station": "Tadong", "aws_district": None, "district": "EAST SIKKIM"},
]


# ═══════════════════════════════════════════════════════════════════════════
# 2. JWT AUTH — auto-refreshes the bearer token before it expires
# ═══════════════════════════════════════════════════════════════════════════

class IMDAuth:
    """Holds the current JWT and refreshes it ~5 minutes before expiry."""

    TOKEN_URL = "https://api.imd.gov.in/api/oauth/token.php"

    def __init__(self):
        self.token = None
        self.expires_at = None
        self.api_key = os.getenv("IMD_API_KEY", "")
        self.email = os.getenv("IMD_EMAIL", "")
        self.password = os.getenv("IMD_PASSWORD", "")
        self.proxies = self._build_proxies()

    def _build_proxies(self):
        proxy_url = os.getenv("PROXY_URL", "").strip()
        if not proxy_url:
            return None
        return {"http": proxy_url, "https": proxy_url}

    def _needs_refresh(self) -> bool:
        if not self.token or not self.expires_at:
            return True
        return datetime.now(timezone.utc) >= self.expires_at - timedelta(minutes=5)

    def _refresh(self):
        log.info("🔑 Refreshing IMD JWT token...")
        resp = requests.post(
            self.TOKEN_URL,
            json={"email": self.email, "password": self.password},
            proxies=self.proxies,
            timeout=15,
        )
        resp.raise_for_status()
        data = resp.json()
        self.token = data["access_token"]
        expires_in = int(data.get("expires_in", 3600))
        self.expires_at = datetime.now(timezone.utc) + timedelta(seconds=expires_in)
        log.info(f"✅ JWT refreshed, valid for {expires_in}s")

    def headers(self) -> dict:
        if self._needs_refresh():
            self._refresh()
        return {
            "X-API-KEY": self.api_key,
            "Authorization": f"Bearer {self.token}",
        }


_auth = IMDAuth()


def fetch_imd_endpoint(endpoint: str):
    """Fetches one IMD bulk endpoint, returns the parsed JSON list or None."""
    url = f"https://api.imd.gov.in/api/v1/{endpoint}"
    try:
        resp = requests.get(
            url,
            headers=_auth.headers(),
            proxies=_auth.proxies,
            timeout=20,
        )
        resp.raise_for_status()
        return resp.json()
    except Exception as e:
        log.error(f"❌ IMD endpoint '{endpoint}' failed: {e}")
        return None


# ═══════════════════════════════════════════════════════════════════════════
# 3. WEATHER CODE TABLES (shared by both IMD and Open-Meteo paths)
# ═══════════════════════════════════════════════════════════════════════════

WMO_CODES = {
    0: "Clear Sky", 1: "Mainly Clear", 2: "Partly Cloudy", 3: "Cloudy",
    45: "Foggy", 48: "Foggy",
    51: "Light Drizzle", 53: "Drizzle", 55: "Heavy Drizzle",
    61: "Light Rain", 63: "Rain", 65: "Heavy Rain",
    71: "Light Snow", 73: "Snow", 75: "Heavy Snow", 77: "Snow Grains",
    80: "Rain Showers", 81: "Heavy Showers", 82: "Violent Rain",
    85: "Snow Showers", 86: "Heavy Snow Showers",
    95: "Thunderstorm", 96: "Thunderstorm with Hail", 99: "Heavy Thunderstorm with Hail",
}

RAIN_CODES          = {51, 53, 55, 61, 63, 65, 80, 81, 82, 60, 62}
THUNDERSTORM_CODES  = {95, 96, 99, 17, 13, 29}
SNOW_CODES          = {71, 73, 75, 77, 85, 86, 22, 23, 24, 25, 26, 27}
FOG_CODES           = {45, 48, 10, 12, 40, 41, 42, 43, 44}

WARNING_PHENOMENA = {
    "1": "Heavy Rain", "2": "Thunderstorm & Lightning", "4": "Strong Winds",
    "8": "Hailstorm", "16": "Lightning", "32": "Dense Fog",
    "64": "Heat Wave", "128": "Cold Wave",
}


def deg_to_dir(deg) -> str:
    dirs = ["N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE",
            "S", "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW"]
    try:
        return dirs[round(float(deg) / 22.5) % 16]
    except (TypeError, ValueError):
        return "N"


def safe_float(val, default=None):
    try:
        if val is None or val in ("NA", "NULL", "", "NIL", "--"):
            return default
        return float(val)
    except (TypeError, ValueError):
        return default


def safe_temp(val):
    """IMD sends 99.99 / -99.99 as sentinels for unavailable forecast days."""
    f = safe_float(val)
    if f is None or f >= 99.0 or f <= -99.0:
        return None
    return round(f, 1)


def is_data_stale(date_str: str, time_str: str) -> bool:
    """True if the IMD observation is older than STALE_THRESHOLD_HOURS."""
    try:
        hour = int(float(time_str))
        obs_dt = datetime.strptime(date_str, "%Y-%m-%d").replace(
            hour=hour % 24, tzinfo=timezone.utc
        )
        age = datetime.now(timezone.utc) - obs_dt
        return age > timedelta(hours=STALE_THRESHOLD_HOURS)
    except Exception:
        return True   # if we can't parse it, treat it as stale to be safe


def build_condition_detail(is_rain, is_storm, is_snow, is_fog,
                            precip, temp, aqi, warning) -> str:
    parts = []
    if is_storm:
        parts.append("thunderstorm currently active")
    elif is_rain:
        intensity = "light" if precip < 2 else "moderate" if precip < 7 else "heavy"
        parts.append(f"{intensity} rain currently")
    elif is_snow:
        parts.append("snowfall currently active")
    elif is_fog:
        parts.append("dense fog currently")
    else:
        parts.append("clear conditions")

    if precip and precip > 0:
        parts.append(f"{precip}mm precipitation recently recorded")
    if temp is not None:
        if temp >= 42:
            parts.append("extreme heat conditions")
        elif temp >= 38:
            parts.append("heat advisory in effect")
    if aqi and aqi > 300:
        parts.append(f"hazardous air quality (AQI {aqi})")
    elif aqi and aqi > 200:
        parts.append(f"very poor air quality (AQI {aqi})")
    if warning and warning != "None":
        parts.append(f"active IMD alert: {warning}")

    return ". ".join(p.capitalize() for p in parts) + "."


def decode_warning(day1_codes: str, day1_color: str) -> str:
    """Turns IMD's '2,4' + color '2' into 'Orange Alert: Thunderstorm..., Strong Winds'."""
    if day1_color not in ("1", "2") or not day1_codes:
        return "None"
    label = "Red Alert" if day1_color == "1" else "Orange Alert"
    phenomena = [
        WARNING_PHENOMENA[c.strip()]
        for c in day1_codes.split(",")
        if c.strip() in WARNING_PHENOMENA
    ]
    if not phenomena:
        return "None"
    return f"{label}: {', '.join(phenomena)}"


# ═══════════════════════════════════════════════════════════════════════════
# 4. PARSE IMD BULK RESPONSES INTO LOOKUP DICTS
# ═══════════════════════════════════════════════════════════════════════════

def index_current_wx(raw):
    """Station name (stripped) -> record."""
    if not raw:
        return {}
    return {row["Station"].strip(): row for row in raw if row.get("Station")}


def index_aws_data(raw):
    """District -> best record in that district (prefers non-null CURR_TEMP)."""
    if not raw:
        return {}
    by_district = {}
    for row in raw:
        district = row.get("DISTRICT")
        if not district:
            continue
        existing = by_district.get(district)
        if existing is None:
            by_district[district] = row
        elif existing.get("CURR_TEMP") is None and row.get("CURR_TEMP") is not None:
            by_district[district] = row
    return by_district


def index_cityforecastloc(raw):
    """Keeps the raw list — we match by nearest lat/lon at lookup time."""
    return raw or []


def index_districtwarning(raw):
    """District -> today's warning row."""
    if not raw:
        return {}
    today = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    out = {}
    for row in raw:
        d = row.get("District")
        if d and (row.get("Date") == today or d not in out):
            out[d] = row
    return out


def nearest_forecast_station(lat: float, lon: float, forecast_list: list):
    """Finds the cityforecastloc entry closest to (lat, lon)."""
    if not forecast_list:
        return None
    best, best_dist = None, float("inf")
    for row in forecast_list:
        try:
            r_lat = float(row["Latitude"])
            r_lon = float(row["Longitude"])
        except (KeyError, TypeError, ValueError):
            continue
        dist = (r_lat - lat) ** 2 + (r_lon - lon) ** 2
        if dist < best_dist:
            best, best_dist = row, dist
    return best


# ═══════════════════════════════════════════════════════════════════════════
# 5. OPEN-METEO — fallback + fields IMD never provides
# ═══════════════════════════════════════════════════════════════════════════

async def fetch_open_meteo_one(client: httpx.AsyncClient, city: dict) -> dict:
    """One city's worth of Open-Meteo data: current + 7-day + AQI."""
    weather_url = "https://api.open-meteo.com/v1/forecast"
    aqi_url = "https://air-quality-api.open-meteo.com/v1/air-quality"

    result = {
        "uv_index": None, "aqi": None, "visibility": None,
        "om_current": None, "om_daily": None,
    }

    try:
        w_resp = await client.get(weather_url, params={
            "latitude": city["lat"], "longitude": city["lon"],
            "current": ["temperature_2m", "relative_humidity_2m", "apparent_temperature",
                        "weather_code", "cloud_cover", "wind_speed_10m",
                        "wind_direction_10m", "surface_pressure", "visibility", "precipitation"],
            "daily": ["temperature_2m_max", "temperature_2m_min", "uv_index_max",
                      "weather_code", "sunrise", "sunset"],
            "timezone": "Asia/Kolkata", "forecast_days": 7, "wind_speed_unit": "kmh",
        }, timeout=10)
        w_resp.raise_for_status()
        wd = w_resp.json()
        result["om_current"] = wd.get("current")
        result["om_daily"] = wd.get("daily")
        result["uv_index"] = int(wd["daily"]["uv_index_max"][0]) if wd.get("daily") else None
        result["visibility"] = round((wd["current"].get("visibility") or 10000) / 1000, 1) \
            if wd.get("current") else None
    except Exception as e:
        log.warning(f"  Open-Meteo weather failed for {city['city']}: {e}")

    try:
        a_resp = await client.get(aqi_url, params={
            "latitude": city["lat"], "longitude": city["lon"],
            "current": ["us_aqi"], "timezone": "Asia/Kolkata",
        }, timeout=10)
        a_resp.raise_for_status()
        result["aqi"] = a_resp.json()["current"].get("us_aqi")
    except Exception as e:
        log.warning(f"  Open-Meteo AQI failed for {city['city']}: {e}")

    return result


async def fetch_all_open_meteo(cities: list):
    """Fetches Open-Meteo for all cities in parallel, limited to 5 at a time."""
    # This prevents the 429 Too Many Requests error
    sem = asyncio.Semaphore(5) 
    
    async def fetch_with_sem(client, city):
        async with sem:
            # A tiny delay to pace the requests
            await asyncio.sleep(0.1) 
            return await fetch_open_meteo_one(client, city)

    async with httpx.AsyncClient() as client:
        tasks = [fetch_with_sem(client, c) for c in cities]
        results = await asyncio.gather(*tasks, return_exceptions=False)
        
    return {c["city"]: r for c, r in zip(cities, results)}


def build_open_meteo_record(city: dict, om: dict) -> dict:
    """Builds a full current-conditions record purely from Open-Meteo (full fallback)."""
    cur = om.get("om_current") or {}
    daily = om.get("om_daily") or {}
    code = int(cur.get("weather_code", 0) or 0)
    precip = round(cur.get("precipitation", 0) or 0, 2)
    temp = cur.get("temperature_2m")

    return {
        "temperature": round(temp, 1) if temp is not None else None,
        "feels_like": round(cur.get("apparent_temperature", temp or 0), 1),
        "humidity": int(cur.get("relative_humidity_2m", 0) or 0),
        "wind_speed": round(cur.get("wind_speed_10m", 0) or 0, 1),
        "wind_deg": int(cur.get("wind_direction_10m", 0) or 0),
        "pressure": round(cur.get("surface_pressure", 1013) or 1013, 1),
        "cloud_cover": int(cur.get("cloud_cover", 0) or 0),
        "condition": WMO_CODES.get(code, "Unknown"),
        "weather_code": code,
        "precipitation": precip,
        "high": safe_temp(daily.get("temperature_2m_max", [None])[0]) if daily else None,
        "low": safe_temp(daily.get("temperature_2m_min", [None])[0]) if daily else None,
        "sunrise": (daily.get("sunrise") or [None])[0] if daily else None,
        "sunset": (daily.get("sunset") or [None])[0] if daily else None,
        "data_source": "open_meteo",
    }


def build_day67_from_open_meteo(om: dict) -> list:
    """Days 6-7 of the 7-day forecast, always from Open-Meteo (no IMD source exists)."""
    daily = om.get("om_daily") or {}
    times = daily.get("time", [])
    highs = daily.get("temperature_2m_max", [])
    lows = daily.get("temperature_2m_min", [])
    codes = daily.get("weather_code", [])
    out = []
    for i in (5, 6):  # index 5 = Day 6, index 6 = Day 7
        if i >= len(times):
            continue
        try:
            day_name = datetime.strptime(times[i], "%Y-%m-%d").strftime("%a")
        except Exception:
            day_name = f"Day{i + 1}"
        out.append({
            "day":  day_name,
            "high": safe_temp(highs[i]) if i < len(highs) else None,
            "low":  safe_temp(lows[i])  if i < len(lows)  else None,
            "text": WMO_CODES.get(int(codes[i]), None) if i < len(codes) else None,
        })
    return out


# ═══════════════════════════════════════════════════════════════════════════
# 6. PER-CITY MERGE LOGIC — the heart of the hybrid system
# ═══════════════════════════════════════════════════════════════════════════

def get_current_from_synop(row: dict):
    """Maps a current_wx row to our internal field names. None if stale."""
    if is_data_stale(row.get("Date of Observation", ""), row.get("Time", "0")):
        return None

    code = int(safe_float(row.get("Weather Code"), 0))
    precip = safe_float(row.get("Last 24 hrs Rainfall"), 0.0)
    temp = safe_float(row.get("Temperature"))
    if temp is None:
        return None

    return {
        "temperature": round(temp, 1),
        "feels_like": round(safe_float(row.get("Feel Like"), temp), 1),
        "humidity": int(safe_float(row.get("Humidity"), 0)),
        "wind_speed": round(safe_float(row.get("Wind Speed KMPH"), 0), 1),
        "wind_deg": int(safe_float(row.get("Wind Direction"), 0)),
        "pressure": round(safe_float(row.get("Mean Sea Level Pressure"), 1013), 1),
        "cloud_cover": min(100, int(safe_float(row.get("Nebulosity"), 0) * 12.5)),
        "condition": row.get("WEATHER_MESSAGE", "Unknown"),
        "weather_code": code,
        "precipitation": precip,
        "sunrise": row.get("Sunrise"),
        "sunset": row.get("Sunset"),
        "moonrise": row.get("Moonrise"),
        "moonset": row.get("Moonset"),
        "data_source": "imd_synop",
    }


def get_current_from_aws(row: dict):
    """Maps an aws_data row to our internal field names. None if stale/null."""
    if is_data_stale(row.get("DATE", ""), row.get("TIME", "0:00:00").split(":")[0]):
        return None

    temp = safe_float(row.get("CURR_TEMP"))
    if temp is None:
        return None

    code = int(safe_float(row.get("WEATHER_CODE"), 0))
    precip = safe_float(row.get("RAINFALL"), 0.0)

    return {
        "temperature": round(temp, 1),
        "feels_like": round(safe_float(row.get("Feel Like"), temp), 1),
        "humidity": int(safe_float(row.get("RH"), 0)),
        "wind_speed": round(safe_float(row.get("WIND_SPEED"), 0), 1),
        "wind_deg": int(safe_float(row.get("WIND_DIRECTION"), 0)),
        "pressure": round(safe_float(row.get("MSLP"), 1013), 1),
        "cloud_cover": min(100, int(safe_float(row.get("NEBULOSITY"), 0) * 12.5)),
        "condition": row.get("WEATHER_MESSAGE", "Unknown"),
        "weather_code": code,
        "precipitation": precip,
        "high": safe_temp(row.get("MAX_TEMP")),
        "low": safe_temp(row.get("MIN_TEMP")),
        "data_source": "imd_aws",
    }


def get_forecast_from_imd(row):
    """Maps a cityforecastloc row to high/low + 5-day forecast list. None if stale."""
    if not row:
        return None
    if row.get("Date") != datetime.now(timezone.utc).strftime("%Y-%m-%d"):
        return None

    # ── Use Forecast temps as primary, observed temps as secondary ──────
    # IMD publishes Today_Max_temp only after the day ends.
    # Todays_Forecast_Max_Temp is always available from the morning.
    high = (
        safe_temp(row.get("Todays_Forecast_Max_Temp"))
        or safe_temp(row.get("Today_Max_temp"))
        or safe_temp(row.get("Previous_Day_Max_temp"))
    )
    low = (
        safe_temp(row.get("Todays_Forecast_Min_temp"))
        or safe_temp(row.get("Today_Min_temp"))
    )

    today_date = datetime.now(timezone.utc).date()
    day_labels = ["Today"] + [
        (today_date + timedelta(days=i)).strftime("%a")
        for i in range(1, 7)
    ]

    days = []
    for i in range(7):
        if i == 0:
            h    = safe_temp(row.get("Todays_Forecast_Max_Temp"))
            l    = safe_temp(row.get("Todays_Forecast_Min_temp"))
            text = row.get("Todays_Forecast")
        else:
            n    = i + 1
            h    = safe_temp(row.get(f"Day_{n}_Max_Temp"))
            l    = safe_temp(row.get(f"Day_{n}_Min_temp"))
            text = row.get(f"Day_{n}_Forecast")
        days.append({"day": day_labels[i], "high": h, "low": l, "text": text})

    return {
        "high": high, "low": low,
        "sunrise":  row.get("Sunrise_time"),
        "sunset":   row.get("Sunset_time"),
        "moonrise": row.get("Moonrise_time"),
        "moonset":  row.get("Moonset_time"),
        "forecast_days_1_5": days,
    }


def merge_city_record(city: dict, synop_idx: dict, aws_idx: dict,
                       forecast_list: list, warning_idx: dict,
                       om: dict) -> dict:
    """Builds the final record for one city, walking the fallback tree."""

    current = None

    # 1. Try Synop station if this city has one
    if city["synop_station"]:
        row = synop_idx.get(city["synop_station"].strip())
        if row:
            current = get_current_from_synop(row)

    # 2. Try AWS district if no synop station or synop was stale
    if current is None and city["aws_district"]:
        row = aws_idx.get(city["aws_district"])
        if row:
            current = get_current_from_aws(row)

    # 3. Full Open-Meteo fallback if IMD gave us nothing usable
    if current is None:
        current = build_open_meteo_record(city, om)

    # ── Forecast (high/low + 7 day) ────────────────────────────────────
    nearest = nearest_forecast_station(city["lat"], city["lon"], forecast_list)
    imd_forecast = get_forecast_from_imd(nearest)

    if imd_forecast:
        high = imd_forecast["high"] if imd_forecast["high"] is not None else current.get("high")
        low = imd_forecast["low"] if imd_forecast["low"] is not None else current.get("low")
        forecast_days = imd_forecast["forecast_days_1_5"]
        sunrise = current.get("sunrise") or imd_forecast.get("sunrise")
        sunset = current.get("sunset") or imd_forecast.get("sunset")
        moonrise = current.get("moonrise") or imd_forecast.get("moonrise")
        moonset = current.get("moonset") or imd_forecast.get("moonset")
    else:
        high = current.get("high")
        low = current.get("low")
        forecast_days = []
        sunrise = current.get("sunrise")
        sunset = current.get("sunset")
        moonrise = current.get("moonrise")
        moonset = current.get("moonset")

    # Fill any missing high/low/forecast from Open-Meteo, always append days 6-7
    om_daily = om.get("om_daily") or {}
    if high is None:
        high = safe_temp((om_daily.get("temperature_2m_max") or [None])[0])
    if low is None:
        low = safe_temp((om_daily.get("temperature_2m_min") or [None])[0])
    if not forecast_days:
        times = om_daily.get("time", [])
        highs = om_daily.get("temperature_2m_max", [])
        lows = om_daily.get("temperature_2m_min", [])
        codes = om_daily.get("weather_code", [])
        today_date = datetime.now(timezone.utc).date()
        labels = ["Today"] + [
            (today_date + timedelta(days=i)).strftime("%a")
            for i in range(1, 7)
        ]
        for i, label in enumerate(labels):
            if i >= len(times):
                break
            forecast_days.append({
                "day": label,
                "high": safe_temp(highs[i]) if i < len(highs) else None,
                "low": safe_temp(lows[i]) if i < len(lows) else None,
                "text": WMO_CODES.get(int(codes[i]), None) if i < len(codes) else None,
            })
    else:
        # was: forecast_days = forecast_days + build_day67_from_open_meteo(om)
        forecast_days = forecast_days  # IMD now covers all 7 days

    if not sunrise:
        sunrise = (om_daily.get("sunrise") or [None])[0]
    if not sunset:
        sunset = (om_daily.get("sunset") or [None])[0]

    # ── Warning ─────────────────────────────────────────────────────────
    warn_row = warning_idx.get(city["district"])
    warning = "None"
    if warn_row:
        warning = decode_warning(warn_row.get("Day_1", ""), warn_row.get("Day1_Color", "4"))

    # ── Derived booleans ────────────────────────────────────────────────
    code = current.get("weather_code", 0)
    precip = current.get("precipitation", 0) or 0
    is_rain = code in RAIN_CODES or (code in THUNDERSTORM_CODES and precip > 0)
    is_storm = code in THUNDERSTORM_CODES
    is_snow = code in SNOW_CODES
    is_fog = code in FOG_CODES

    aqi = om.get("aqi")
    condition_detail = build_condition_detail(
        is_rain, is_storm, is_snow, is_fog, precip,
        current.get("temperature"), aqi, warning,
    )

    wind_speed = current.get("wind_speed", 0) or 0

    return {
        "city": city["city"], "state": city["state"],
        "lat": city["lat"], "lon": city["lon"],
        "date": datetime.now(timezone.utc).strftime("%Y-%m-%d"),

        "temperature": current.get("temperature"),
        "feels_like": current.get("feels_like"),
        "high": high, "low": low,
        "humidity": current.get("humidity"),
        "condition": current.get("condition"),
        "warning": warning,
        "cloud_cover": current.get("cloud_cover"),
        "pressure": current.get("pressure"),
        "visibility": om.get("visibility"),

        "wind_speed": wind_speed,
        "wind_dir": deg_to_dir(current.get("wind_deg", 0)),
        "wind_deg": current.get("wind_deg", 0),
        "wind_gust": round(wind_speed * 1.4, 1),

        "uv_index": om.get("uv_index"),
        "aqi": aqi,

        "weather_code": code,
        "precipitation": precip,
        "is_raining": is_rain,
        "is_thunderstorm": is_storm,
        "is_snowfall": is_snow,
        "is_foggy": is_fog,
        "condition_detail": condition_detail,

        "sunrise": sunrise, "sunset": sunset,
        "moonrise": moonrise, "moonset": moonset,
        "forecast_json": json.dumps(forecast_days),
        "data_source": current.get("data_source", "open_meteo"),
    }


# ═══════════════════════════════════════════════════════════════════════════
# 7. MAIN UPDATE JOB
# ═══════════════════════════════════════════════════════════════════════════

def update_weather():
    log.info("=" * 60)
    log.info(f"🔄 Hybrid weather update — {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    log.info(f"   Cities to update: {len(CITIES)}")
    log.info("=" * 60)

    # ── Step 1: bulk IMD fetches (4 calls total) ──────────────────────
    log.info("📡 Fetching IMD current_wx (all stations)...")
    synop_idx = index_current_wx(fetch_imd_endpoint("current_wx"))
    log.info(f"   {len(synop_idx)} Synop stations received")

    log.info("📡 Fetching IMD aws_data (all AWS stations)...")
    aws_idx = index_aws_data(fetch_imd_endpoint("aws_data"))
    log.info(f"   {len(aws_idx)} AWS districts received")

    log.info("📡 Fetching IMD cityforecastloc (7-day forecasts)...")
    forecast_list = index_cityforecastloc(fetch_imd_endpoint("cityforecastloc"))
    log.info(f"   {len(forecast_list)} forecast stations received")

    log.info("📡 Fetching IMD districtwarning (alerts)...")
    warning_idx = index_districtwarning(fetch_imd_endpoint("districtwarning"))
    log.info(f"   {len(warning_idx)} district warnings received")

    # ── Step 2: Open-Meteo for ALL cities, in parallel ────────────────
    log.info("🌐 Fetching Open-Meteo (uv/aqi/visibility + fallback) for all 66 cities...")
    om_results = asyncio.run(fetch_all_open_meteo(CITIES))
    log.info("   Open-Meteo fetch complete")

    # ── Step 3: merge + upsert ─────────────────────────────────────────
    db = SessionLocal()
    total_updated, total_failed = 0, 0
    source_counts = {"imd_synop": 0, "imd_aws": 0, "open_meteo": 0}

    try:
        for city in CITIES:
            try:
                om = om_results.get(city["city"], {})
                data = merge_city_record(city, synop_idx, aws_idx, forecast_list, warning_idx, om)

                if data.get("temperature") is None:
                    raise ValueError("No temperature data from any source")

                source_counts[data["data_source"]] = source_counts.get(data["data_source"], 0) + 1

                record = db.query(WeatherRecord).filter_by(city=data["city"]).first()
                if record:
                    for key, val in data.items():
                        setattr(record, key, val)
                    record.updated_at = datetime.now(timezone.utc)
                else:
                    record = WeatherRecord(**data)
                    db.add(record)

                db.commit()
                total_updated += 1

                flags = []
                if data["is_raining"]: flags.append("🌧")
                if data["is_thunderstorm"]: flags.append("⛈")
                if data["is_snowfall"]: flags.append("❄")
                if data["is_foggy"]: flags.append("🌫")
                src_tag = {"imd_synop": "IMD", "imd_aws": "AWS", "open_meteo": "OM"}[data["data_source"]]
                flag_str = " ".join(flags) if flags else "✅"

                log.info(
                    f"  [{src_tag}] {flag_str} {city['city']:<20} "
                    f"{data['temperature']}°C  warn={data['warning']}"
                )

                db.add(FetchLog(source=data["data_source"], city=data["city"],
                                 success=True, records_updated=1))
                db.commit()

            except Exception as city_err:
                log.error(f"  ❌ {city['city']} failed: {city_err}")
                total_failed += 1
                db.add(FetchLog(source="hybrid", city=city["city"],
                                 success=False, records_updated=0,
                                 error_message=str(city_err)))
                db.commit()

    except Exception as e:
        db.rollback()
        log.critical(f"💥 Update job crashed: {e}")
        db.add(FetchLog(source="hybrid", city="ALL", success=False, error_message=str(e)))
        db.commit()
    finally:
        db.close()

    log.info(f"\n✅ Done — Updated: {total_updated}  Failed: {total_failed}")
    log.info(f"   Sources -> IMD Synop: {source_counts.get('imd_synop', 0)}  "
              f"IMD AWS: {source_counts.get('imd_aws', 0)}  "
              f"Open-Meteo fallback: {source_counts.get('open_meteo', 0)}")
    log.info("Next run in 30 minutes.\n")


# ═══════════════════════════════════════════════════════════════════════════
# 8. STANDALONE RUN (local testing)
# ═══════════════════════════════════════════════════════════════════════════

if __name__ == "__main__":
    from apscheduler.schedulers.blocking import BlockingScheduler

    log.info("🚀 IMD Hybrid Live Updater — All India Coverage")
    log.info(f"   Total cities : {len(CITIES)}")
    log.info(f"   Synop cities : {sum(1 for c in CITIES if c['synop_station'])}")
    log.info(f"   AWS fallback : {sum(1 for c in CITIES if not c['synop_station'])}")

    log.info("\n▶ Running first fetch now...\n")
    update_weather()

    scheduler = BlockingScheduler(timezone="Asia/Kolkata")
    scheduler.add_job(update_weather, "interval", minutes=30)

    log.info("⏰ Scheduler running. Press Ctrl+C to stop.\n")
    try:
        scheduler.start()
    except KeyboardInterrupt:
        log.info("🛑 Updater stopped.")









