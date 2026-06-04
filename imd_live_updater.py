"""
imd_live_updater.py
-------------------
Fetches live weather for 40+ Indian cities from Open-Meteo.
Updates PostgreSQL every 30 minutes.
Populates real-time condition fields: precipitation, is_raining,
is_thunderstorm, is_snowfall, is_foggy, condition_detail.
"""

import os
import requests
import logging
import time
from datetime import datetime, timezone
from dotenv import load_dotenv
from apscheduler.schedulers.blocking import BlockingScheduler
from database import SessionLocal, WeatherRecord, FetchLog

load_dotenv()

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s  %(levelname)-8s %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
    handlers=[
        logging.StreamHandler(),
    ]
)
log = logging.getLogger(__name__)


# ── 40+ cities across all major Indian states ─────────────────────────────
CITIES = [
    # North India
    {"city": "New Delhi",   "state": "Delhi",             "lat": 28.6139, "lon": 77.2090},
    {"city": "Noida",       "state": "Uttar Pradesh",     "lat": 28.5355, "lon": 77.3910},
    {"city": "Lucknow",     "state": "Uttar Pradesh",     "lat": 26.8467, "lon": 80.9462},
    {"city": "Kanpur",      "state": "Uttar Pradesh",     "lat": 26.4499, "lon": 80.3319},
    {"city": "Varanasi",    "state": "Uttar Pradesh",     "lat": 25.3176, "lon": 82.9739},
    {"city": "Agra",        "state": "Uttar Pradesh",     "lat": 27.1767, "lon": 78.0081},
    {"city": "Jaipur",      "state": "Rajasthan",         "lat": 26.9124, "lon": 75.7873},
    {"city": "Jodhpur",     "state": "Rajasthan",         "lat": 26.2389, "lon": 73.0243},
    {"city": "Udaipur",     "state": "Rajasthan",         "lat": 24.5854, "lon": 73.7125},
    {"city": "Chandigarh",  "state": "Punjab",            "lat": 30.7333, "lon": 76.7794},
    {"city": "Amritsar",    "state": "Punjab",            "lat": 31.6340, "lon": 74.8723},
    {"city": "Ludhiana",    "state": "Punjab",            "lat": 30.9010, "lon": 75.8573},
    {"city": "Shimla",      "state": "Himachal Pradesh",  "lat": 31.1048, "lon": 77.1734},
    {"city": "Dharamshala", "state": "Himachal Pradesh",  "lat": 32.2190, "lon": 76.3234},
    {"city": "Dehradun",    "state": "Uttarakhand",       "lat": 30.3165, "lon": 78.0322},
    {"city": "Haridwar",    "state": "Uttarakhand",       "lat": 29.9457, "lon": 78.1642},
    {"city": "Srinagar",    "state": "Jammu & Kashmir",   "lat": 34.0837, "lon": 74.7973},
    {"city": "Jammu",       "state": "Jammu & Kashmir",   "lat": 32.7266, "lon": 74.8570},
    {"city": "Leh",         "state": "Ladakh",            "lat": 34.1526, "lon": 77.5771},

    # West India
    {"city": "Mumbai",      "state": "Maharashtra",       "lat": 19.0760, "lon": 72.8777},
    {"city": "Pune",        "state": "Maharashtra",       "lat": 18.5204, "lon": 73.8567},
    {"city": "Nagpur",      "state": "Maharashtra",       "lat": 21.1458, "lon": 79.0882},
    {"city": "Nashik",      "state": "Maharashtra",       "lat": 19.9975, "lon": 73.7898},
    {"city": "Aurangabad",  "state": "Maharashtra",       "lat": 19.8762, "lon": 75.3433},
    {"city": "Ahmedabad",   "state": "Gujarat",           "lat": 23.0225, "lon": 72.5714},
    {"city": "Surat",       "state": "Gujarat",           "lat": 21.1702, "lon": 72.8311},
    {"city": "Vadodara",    "state": "Gujarat",           "lat": 22.3072, "lon": 73.1812},
    {"city": "Rajkot",      "state": "Gujarat",           "lat": 22.3039, "lon": 70.8022},
    {"city": "Panaji",      "state": "Goa",               "lat": 15.4909, "lon": 73.8278},

    # South India
    {"city": "Bengaluru",   "state": "Karnataka",         "lat": 12.9716, "lon": 77.5946},
    {"city": "Mysuru",      "state": "Karnataka",         "lat": 12.2958, "lon": 76.6394},
    {"city": "Mangaluru",   "state": "Karnataka",         "lat": 12.9141, "lon": 74.8560},
    {"city": "Hubballi",    "state": "Karnataka",         "lat": 15.3647, "lon": 75.1240},
    {"city": "Chennai",     "state": "Tamil Nadu",        "lat": 13.0827, "lon": 80.2707},
    {"city": "Coimbatore",  "state": "Tamil Nadu",        "lat": 11.0168, "lon": 76.9558},
    {"city": "Madurai",     "state": "Tamil Nadu",        "lat":  9.9252, "lon": 78.1198},
    {"city": "Hyderabad",   "state": "Telangana",         "lat": 17.3850, "lon": 78.4867},
    {"city": "Warangal",    "state": "Telangana",         "lat": 17.9784, "lon": 79.5941},
    {"city": "Thiruvananthapuram","state":"Kerala",       "lat":  8.5241, "lon": 76.9366},
    {"city": "Kochi",       "state": "Kerala",            "lat":  9.9312, "lon": 76.2673},
    {"city": "Kozhikode",   "state": "Kerala",            "lat": 11.2588, "lon": 75.7804},
    {"city": "Visakhapatnam","state":"Andhra Pradesh",    "lat": 17.6868, "lon": 83.2185},
    {"city": "Vijayawada",  "state": "Andhra Pradesh",    "lat": 16.5062, "lon": 80.6480},
    {"city": "Puducherry",  "state": "Puducherry",        "lat": 11.9416, "lon": 79.8083},

    # East India
    {"city": "Kolkata",     "state": "West Bengal",       "lat": 22.5726, "lon": 88.3639},
    {"city": "Siliguri",    "state": "West Bengal",       "lat": 26.7271, "lon": 88.3953},
    {"city": "Bhubaneswar", "state": "Odisha",            "lat": 20.2961, "lon": 85.8245},
    {"city": "Cuttack",     "state": "Odisha",            "lat": 20.4625, "lon": 85.8830},
    {"city": "Patna",       "state": "Bihar",             "lat": 25.5941, "lon": 85.1376},
    {"city": "Gaya",        "state": "Bihar",             "lat": 24.7955, "lon": 84.9994},
    {"city": "Ranchi",      "state": "Jharkhand",         "lat": 23.3441, "lon": 85.3096},
    {"city": "Jamshedpur",  "state": "Jharkhand",         "lat": 22.8046, "lon": 86.2029},
    {"city": "Raipur",      "state": "Chhattisgarh",      "lat": 21.2514, "lon": 81.6296},

    # Central India
    {"city": "Bhopal",      "state": "Madhya Pradesh",    "lat": 23.2599, "lon": 77.4126},
    {"city": "Indore",      "state": "Madhya Pradesh",    "lat": 22.7196, "lon": 75.8577},
    {"city": "Jabalpur",    "state": "Madhya Pradesh",    "lat": 23.1815, "lon": 79.9864},
    {"city": "Gwalior",     "state": "Madhya Pradesh",    "lat": 26.2183, "lon": 78.1828},

    # Northeast India
    {"city": "Guwahati",    "state": "Assam",             "lat": 26.1445, "lon": 91.7362},
    {"city": "Dibrugarh",   "state": "Assam",             "lat": 27.4728, "lon": 94.9120},
    {"city": "Shillong",    "state": "Meghalaya",         "lat": 25.5788, "lon": 91.8933},
    {"city": "Imphal",      "state": "Manipur",           "lat": 24.8170, "lon": 93.9368},
    {"city": "Aizawl",      "state": "Mizoram",           "lat": 23.7307, "lon": 92.7173},
    {"city": "Agartala",    "state": "Tripura",           "lat": 23.8315, "lon": 91.2868},
    {"city": "Itanagar",    "state": "Arunachal Pradesh", "lat": 27.0844, "lon": 93.6053},
    {"city": "Kohima",      "state": "Nagaland",          "lat": 25.6751, "lon": 94.1086},
    {"city": "Gangtok",     "state": "Sikkim",            "lat": 27.3389, "lon": 88.6065},
]


# ── WMO weather code → condition string ───────────────────────────────────
WMO_CODES = {
    0: "Clear Sky",      1: "Mainly Clear",   2: "Partly Cloudy",
    3: "Cloudy",         45: "Foggy",         48: "Foggy",
    51: "Light Drizzle", 53: "Drizzle",       55: "Heavy Drizzle",
    61: "Light Rain",    63: "Rain",          65: "Heavy Rain",
    71: "Light Snow",    73: "Snow",          75: "Heavy Snow",
    77: "Snow Grains",   80: "Rain Showers",  81: "Heavy Showers",
    82: "Violent Rain",  85: "Snow Showers",  86: "Heavy Snow Showers",
    95: "Thunderstorm",  96: "Thunderstorm with Hail",
    99: "Heavy Thunderstorm with Hail",
}

RAIN_CODES        = {51,53,55,61,63,65,80,81,82}
THUNDERSTORM_CODES= {95,96,99}
SNOW_CODES        = {71,73,75,77,85,86}
FOG_CODES         = {45,48}


def deg_to_dir(deg):
    dirs = ["N","NNE","NE","ENE","E","ESE","SE","SSE",
            "S","SSW","SW","WSW","W","WNW","NW","NNW"]
    return dirs[round(deg / 22.5) % 16]


def build_condition_detail(code: int, precip: float, temp: float,
                           aqi: int | None, warning: str) -> str:
    """
    Builds a human-readable current condition sentence.
    Used directly by the chatbot for 'is it raining?' type questions.
    """
    parts = []

    if code in THUNDERSTORM_CODES:
        parts.append(f"thunderstorm currently active")
    elif code in RAIN_CODES:
        intensity = "light" if precip < 2 else "moderate" if precip < 7 else "heavy"
        parts.append(f"{intensity} rain currently")
    elif code in SNOW_CODES:
        parts.append("snowfall currently active")
    elif code in FOG_CODES:
        parts.append("dense fog currently")
    else:
        parts.append(WMO_CODES.get(code, "clear conditions"))

    if precip > 0:
        parts.append(f"{precip}mm precipitation in the last hour")

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


def aqi_to_warning(aqi, temp, code):
    if code in THUNDERSTORM_CODES:
        return "Thunderstorm Warning"
    if aqi and aqi > 300:
        return "Hazardous AQI Alert"
    if temp >= 42:
        return "Heatwave Alert"
    if temp >= 38:
        return "Heat Advisory"
    if code in {65, 82}:
        return "Heavy Rain Alert"
    if code in SNOW_CODES and temp < 5:
        return "Cold Wave & Snowfall Alert"
    return "None"


# ── Open-Meteo fetch ───────────────────────────────────────────────────────
OPEN_METEO_URL = "https://api.open-meteo.com/v1/forecast"
AQI_URL        = "https://air-quality-api.open-meteo.com/v1/air-quality"

def fetch_open_meteo(city: dict) -> dict | None:
    try:
        wr = requests.get(OPEN_METEO_URL, params={
            "latitude":        city["lat"],
            "longitude":       city["lon"],
            "current":         [
                "temperature_2m", "relative_humidity_2m", "apparent_temperature",
                "weather_code", "cloud_cover", "wind_speed_10m",
                "wind_direction_10m", "surface_pressure", "visibility",
                "precipitation",           # ← mm in last hour
            ],
            # ADDED: "sunrise" and "sunset" to the daily tracking array
            "daily":           ["temperature_2m_max", "temperature_2m_min", "uv_index_max", "sunrise", "sunset"],
            "timezone":        "Asia/Kolkata",
            "forecast_days":   1,
            "wind_speed_unit": "kmh",
        }, timeout=12)
        wr.raise_for_status()
        wd  = wr.json()
        cur = wd["current"]
        dly = wd["daily"]

        temp      = round(cur["temperature_2m"], 1)
        precip    = round(cur.get("precipitation", 0) or 0, 2)
        code      = int(cur["weather_code"])
        condition = WMO_CODES.get(code, "Unknown")

        # EXTRACTED: Sunrise and Sunset ISO string sequences from index [0] (today)
        sunrise_val = dly.get("sunrise", [None])[0]
        sunset_val  = dly.get("sunset", [None])[0]

        # AQI
        aqi_val = None
        try:
            ar = requests.get(AQI_URL, params={
                "latitude":  city["lat"],
                "longitude": city["lon"],
                "current":   ["us_aqi"],
                "timezone":  "Asia/Kolkata",
            }, timeout=8)
            ar.raise_for_status()
            aqi_val = ar.json()["current"].get("us_aqi")
        except Exception as e:
            log.warning(f"  AQI fetch failed for {city['city']}: {e}")

        warning = aqi_to_warning(aqi_val, temp, code)

        condition_detail = build_condition_detail(
            code, precip, temp, aqi_val, warning
        )

        return {
            "city":             city["city"],
            "state":            city["state"],
            "lat":              city["lat"],
            "lon":              city["lon"],
            "date":             datetime.now(timezone.utc).strftime("%Y-%m-%d"),
            "temperature":      temp,
            "feels_like":       round(cur["apparent_temperature"], 1),
            "high":             round(dly["temperature_2m_max"][0], 1),
            "low":              round(dly["temperature_2m_min"][0], 1),
            "humidity":         int(cur["relative_humidity_2m"]),
            "condition":        condition,
            "warning":          warning,
            "wind_speed":       round(cur["wind_speed_10m"], 1),
            "wind_dir":         deg_to_dir(int(cur["wind_direction_10m"])),
            "wind_deg":         int(cur["wind_direction_10m"]),
            "pressure":         round(cur["surface_pressure"], 1),
            "visibility":       round((cur.get("visibility") or 10000) / 1000, 1),
            "uv_index":         int(dly["uv_index_max"][0]),
            "aqi":              int(aqi_val) if aqi_val else None,
            "cloud_cover":      int(cur["cloud_cover"]),
            # Real-time condition fields
            "weather_code":     code,
            "precipitation":    precip,
            "is_raining":       code in RAIN_CODES or (code in THUNDERSTORM_CODES and precip > 0),
            "is_thunderstorm":  code in THUNDERSTORM_CODES,
            "is_snowfall":      code in SNOW_CODES,
            "is_foggy":         code in FOG_CODES,
            "condition_detail": condition_detail,
            # ADDED MAPPING:
            "sunrise":          sunrise_val,
            "sunset":           sunset_val,
        }

    except Exception as e:
        log.error(f"  Open-Meteo fetch failed for {city['city']}: {e}")
        return None

# ── IMD API (activates when whitelisted) ───────────────────────────────────
def fetch_imd(city: dict) -> dict | None:
    api_key = os.getenv("IMD_API_KEY", "")
    if not api_key or api_key == "your_imd_key_here":
        return None
    # IMD fetch logic here once endpoint is confirmed
    return None


# ── Core update job ────────────────────────────────────────────────────────
def update_weather():
    log.info("=" * 60)
    log.info(f"🔄 Weather update — {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    log.info(f"   Cities to update: {len(CITIES)}")
    log.info("=" * 60)

    db = SessionLocal()
    total_updated = 0
    total_failed  = 0

    try:
        for city in CITIES:
            log.info(f"📡 {city['city']}, {city['state']}")

            imd_data = fetch_imd(city)
            data     = imd_data or fetch_open_meteo(city)
            source   = "imd_api" if imd_data else "open_meteo"

            if not data:
                log.error(f"  ❌ All sources failed")
                total_failed += 1
                db.add(FetchLog(source=source, city=city["city"],
                                success=False, records_updated=0,
                                error_message="All sources failed"))
                db.commit()
                time.sleep(1.0)
                continue

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

            # Compact log line
            flags = []
            if data["is_raining"]:       flags.append("🌧")
            if data["is_thunderstorm"]:  flags.append("⛈")
            if data["is_snowfall"]:      flags.append("❄")
            if data["is_foggy"]:         flags.append("🌫")
            flag_str = " ".join(flags) if flags else "✅"

            log.info(
                f"  {flag_str} {data['temperature']}°C  "
                f"{data['condition']:<20} "
                f"precip={data['precipitation']}mm  "
                f"AQI={data['aqi']}  "
                f"warn={data['warning']}"
            )

            db.add(FetchLog(source=source, city=data["city"],
                            success=True, records_updated=1))
            db.commit()
            time.sleep(1.0)

    except Exception as e:
        db.rollback()
        log.critical(f"💥 Update job crashed: {e}")
        db.add(FetchLog(source="open_meteo", city="ALL",
                        success=False, error_message=str(e)))
        db.commit()
    finally:
        db.close()

    log.info(f"\n✅ Done — Updated: {total_updated}  Failed: {total_failed}")
    log.info(f"Next run in 30 minutes.\n")


# ── Scheduler ─────────────────────────────────────────────────────────────
if __name__ == "__main__":
    log.info("🚀 IMD Live Updater v2 — All India Coverage")
    log.info(f"   Total cities : {len(CITIES)}")
    log.info(f"   States covered: {len(set(c['state'] for c in CITIES))}")
    log.info(f"   Schedule     : every 30 minutes")

    log.info("\n▶ Running first fetch now...\n")
    update_weather()

    scheduler = BlockingScheduler(timezone="Asia/Kolkata")
    scheduler.add_job(update_weather, "interval", minutes=30)

    log.info("⏰ Scheduler running. Press Ctrl+C to stop.\n")
    try:
        scheduler.start()
    except KeyboardInterrupt:
        log.info("🛑 Updater stopped.")