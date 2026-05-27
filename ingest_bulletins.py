"""
ingest_bulletins.py
-------------------
Creates realistic IMD-style weather bulletins and ingests them
into ChromaDB as vector embeddings.

Run ONCE to populate the vector store:
    python ingest_bulletins.py

To add real PDFs later:
    Place them in the /bulletins folder and re-run this script.
    It will skip chunks already in the DB (no duplicates).
"""

import os
import logging
from vector_store import get_collection

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s  %(levelname)-8s %(message)s",
)
log = logging.getLogger(__name__)

# ── Sample IMD-style bulletins ─────────────────────────────────────────────
# Written to match real IMD bulletin language and structure.
# Replace or supplement with real PDFs once available.

SAMPLE_BULLETINS = [
    {
        "source":   "IMD Heatwave Advisory — May 2026",
        "category": "heatwave",
        "text": """HEAT WAVE WARNING — INDIA METEOROLOGICAL DEPARTMENT
Issued by: National Weather Forecasting Centre, New Delhi
Date: May 2026

SEVERE HEAT WAVE CONDITIONS are very likely over the plains of Northwest India
during the next 5 days. Maximum temperatures are expected to remain 4-6°C above
normal over Delhi, Rajasthan, Haryana, Punjab and Uttar Pradesh.

DELHI-NCR SPECIFIC GUIDANCE:
Temperatures in New Delhi are expected to touch 44-46°C between 1200-1700 IST.
Heat Index (Feels Like) may reach 48-50°C due to low humidity and strong dry winds
from the northwest at 20-30 km/h.

HEALTH ADVISORY:
- Avoid outdoor exposure between 11 AM and 4 PM.
- Drink adequate water even without feeling thirsty.
- Wear light, loose, light-coloured cotton clothes.
- Use ORS (Oral Rehydration Salts) if excessive sweating occurs.
- Never leave children or pets in parked vehicles.
- Seek medical attention immediately if symptoms of heat stroke appear:
  high body temperature, confusion, loss of consciousness.

COLOUR CODE: RED (Highest Alert)
DISTRICTS ON ALERT: Delhi, Gurgaon, Noida, Faridabad, Ghaziabad"""
    },
    {
        "source":   "IMD Heavy Rainfall Warning — Mumbai",
        "category": "heavy_rain",
        "text": """HEAVY TO VERY HEAVY RAINFALL WARNING
Issued by: Regional Meteorological Centre, Mumbai
Valid: Next 24-48 hours

A well-marked low pressure area over the northeastern Arabian Sea is likely to
intensify into a Depression. Associated with this system, HEAVY TO VERY HEAVY
RAINFALL (115.6mm to 204.4mm) is expected over Coastal Maharashtra and Mumbai
Metropolitan Region.

MUMBAI SPECIFIC:
- Isolated EXTREMELY HEAVY RAINFALL (>204.4mm) possible over isolated locations.
- Strong surface winds gusting 50-60 km/h expected near the coastline.
- Rough to very rough sea conditions. Fishermen are advised NOT TO venture
  into the sea along and off the Maharashtra coast.
- High tide timings: 0842 IST (4.6m) and 2112 IST (4.4m).
  Combined effect of heavy rain and high tide may cause coastal flooding.

IMPACT ASSESSMENT:
- Waterlogging likely in low-lying areas of Kurla, Dharavi, Sion, Matunga.
- Traffic disruptions expected on Western Express Highway and Eastern Freeway.
- Local train services may be affected. BEST bus services may be diverted.
- Visibility may drop below 200m during intense spells.

COLOUR CODE: ORANGE (Be Prepared)"""
    },
    {
        "source":   "IMD Thunderstorm Warning — South India",
        "category": "thunderstorm",
        "text": """THUNDERSTORM WITH LIGHTNING WARNING
Issued by: Area Cyclone Warning Centre, Chennai
Valid: Next 24 hours

THUNDERSTORM accompanied with LIGHTNING and GUSTY WINDS (40-50 km/h) are
very likely over Tamil Nadu, Puducherry, Coastal Andhra Pradesh, Telangana,
and Karnataka during next 24 hours.

KOLKATA AND WEST BENGAL:
Pre-monsoon thunderstorm activity is intensifying over the Gangetic West Bengal.
SQUALL with wind speeds of 60-70 km/h is possible over Kolkata and adjoining
districts. Hailstorm is also possible over Darjeeling, Kalimpong, and Jalpaiguri.

BENGALURU ADVISORY:
The city is under Yellow Alert for thunderstorm. Moderate to heavy rain with
thunder and lightning is expected during afternoon and evening hours (1500-2100 IST).
Residents are advised to stay indoors during thunderstorm activity.

SAFETY INSTRUCTIONS:
- Stay away from tall trees, electric poles, and open fields during lightning.
- Avoid using mobile phones in open spaces during thunderstorm.
- Park vehicles in covered areas. Avoid driving through waterlogged roads.
- Disconnect electrical appliances to avoid damage from power surges.

COLOUR CODE: YELLOW (Be Updated) for Bengaluru, ORANGE for Kolkata"""
    },
    {
        "source":   "IMD Air Quality Bulletin — Delhi NCR",
        "category": "air_quality",
        "text": """AIR QUALITY AND WEATHER COMBINED ADVISORY
Issued by: IMD in coordination with CPCB
Region: Delhi-NCR

CURRENT AIR QUALITY STATUS:
The AQI over Delhi-NCR has reached HAZARDOUS levels (AQI > 400) due to the
combined effect of dust storm activity from Rajasthan and calm wind conditions
that are preventing dispersion of pollutants.

Primary Pollutants: PM2.5 and PM10 are the dominant pollutants.
PM10 concentrations exceeding 500 μg/m³ have been recorded at several stations.

METEOROLOGICAL FACTORS:
- Wind speed: 5-8 km/h (very low — poor dispersion conditions)
- Mixing height: 200-300m (extremely low — trapping pollutants near surface)
- Relative humidity: 15-20% (dry conditions intensifying dust suspension)
- Visibility: Reduced to 2-4 km at some locations due to dust haze.

HEALTH ADVISORY BY AQI CATEGORY:
AQI 300-400 (Very Poor): Healthy people may experience breathing discomfort.
AQI >400 (Severe/Hazardous): People with lung and heart disease, children and
older adults should avoid all outdoor exertion. Everyone else should avoid
prolonged outdoor activities.

RECOMMENDED ACTIONS:
- Use N95/FFP2 masks when venturing outdoors.
- Keep windows and doors closed. Use air purifiers if available.
- Schools may consider suspending outdoor activities.
- Construction and demolition activities should be stopped."""
    },
    {
        "source":   "IMD Cyclone Preparedness Bulletin",
        "category": "cyclone",
        "text": """CYCLONE AWARENESS AND PREPAREDNESS BULLETIN
Issued by: India Meteorological Department

UNDERSTANDING CYCLONE WARNINGS:
IMD issues cyclone warnings in 4 stages:
1. PRE-CYCLONE WATCH: 72 hours before landfall
2. CYCLONE ALERT: 48 hours before landfall (Yellow)
3. CYCLONE WARNING: 24 hours before landfall (Orange)
4. POST-LANDFALL OUTLOOK: After landfall (Red)

BAY OF BENGAL CYCLONE SEASON (April-December):
Kolkata and coastal West Bengal are at risk during this period.
The Sundarbans region is particularly vulnerable due to storm surge.
Storm surge of 1-2 metres can be expected with severe cyclonic storms.

ARABIAN SEA CYCLONE SEASON (May-June, October-November):
Mumbai and coastal Maharashtra may be affected.
Cyclones in the Arabian Sea have become more intense in recent years
due to rising sea surface temperatures.

GENERAL PREPAREDNESS:
- Keep emergency kit ready: water, food, medicines, documents, torch.
- Know your nearest cyclone shelter.
- Follow official IMD advisories only. Avoid rumours.
- Fishermen must return to shore when cyclone alert is issued.
- Evacuate if directed by local authorities without delay."""
    },
    {
        "source":   "IMD Monsoon Progress Report — June 2026",
        "category": "monsoon",
        "text": """SOUTHWEST MONSOON ONSET AND PROGRESS REPORT
Issued by: India Meteorological Department, New Delhi

ONSET STATUS:
The Southwest Monsoon has onset over Kerala on June 1 (normal date: June 1).
The monsoon has further advanced into most parts of South Peninsula,
parts of Central India, and the entire Northeast India.

CITY-WISE MONSOON ARRIVAL (Expected):
- Kerala: June 1
- Mumbai: June 10-15
- Hyderabad: June 10-12
- Chennai: October-November (retreating NE monsoon)
- Bengaluru: June 8-12
- Kolkata: June 5-8
- Delhi: Late June to early July (June 27 normal date)

SEASONAL OUTLOOK:
India Meteorological Department has forecast ABOVE NORMAL rainfall
(>104% of Long Period Average) for the 2026 Southwest Monsoon season.
Above normal rainfall is likely over most parts of the country.
Below normal rainfall may be observed over parts of Northwest India.

IMD DEFINITION OF RAINFALL CATEGORIES:
- Deficient: <75% of normal
- Below Normal: 75-89% of normal
- Normal: 90-110% of normal
- Above Normal: 110-125% of normal
- Excess: >125% of normal"""
    },
    {
        "source":   "IMD Cold Wave Advisory — North India",
        "category": "cold_wave",
        "text": """COLD WAVE WARNING — NORTH INDIA
Issued by: National Weather Forecasting Centre, New Delhi

COLD WAVE CONDITIONS are very likely over Punjab, Haryana, Delhi, Uttar Pradesh,
Rajasthan and Madhya Pradesh during the next 3 days.

DEFINITION: Cold wave is declared when minimum temperature drops to 4°C or below,
OR when minimum temperature is 4.5°C or more below normal for 2 consecutive days.

DENSE FOG WARNING:
Dense to very dense fog is expected in the Indo-Gangetic plains during
early morning hours (0000-0900 IST). Visibility may drop below 50 metres
at isolated places, severely affecting road, rail and air transport.

DELHI FORECAST:
Minimum temperature: 4-6°C (5-6°C below normal)
Maximum temperature: 14-16°C
Wind: Light northwesterly winds from Himalayas
Fog: Dense fog likely before 0900 IST

IMPACT ON TRANSPORT:
- Over 200 trains typically delayed during dense fog conditions.
- IGI Airport operations may be affected; check flight status before travel.
- Drive slowly with fog lights on. Do not use high beam during fog.

COLD WAVE HEALTH ADVISORY:
- Keep elderly, infants and homeless people warm.
- Wear multiple layers of clothing.
- Hypothermia risk is real — seek medical help if someone becomes unresponsive."""
    },
    {
        "source":   "IMD UV Index and Sun Safety Bulletin",
        "category": "uv_radiation",
        "text": """UV INDEX ADVISORY — INDIA METEOROLOGICAL DEPARTMENT

UV INDEX SCALE:
0-2  : Low      — No protection needed
3-5  : Moderate — Some protection required
6-7  : High     — Protection essential
8-10 : Very High — Extra protection needed
11+  : Extreme  — Stay indoors during midday

CURRENT CONDITIONS (Summer 2026):
Cities in Northwest India (Delhi, Jaipur, Lucknow) are recording UV Index
values of 10-12 (Very High to Extreme) between 1000-1400 IST.

South Indian cities (Chennai, Hyderabad) are recording UV Index 8-10
due to overhead sun position.

PROTECTION MEASURES:
- Seek shade between 1000-1600 IST when UV is strongest.
- Apply broad-spectrum sunscreen SPF 30+ every 2 hours.
- Wear UV-blocking sunglasses, wide-brimmed hat.
- UV radiation can penetrate clouds — protection needed on cloudy days too.
- UV levels are highest at high altitudes — extra precaution in hill stations.

AGRICULTURAL ADVISORY:
Farmers working in open fields during peak UV hours should take mandatory
breaks every 30 minutes and use appropriate protective clothing."""
    },
]


# ── Chunking utility ───────────────────────────────────────────────────────
def chunk_text(text: str, chunk_size: int = 400, overlap: int = 60) -> list[str]:
    """
    Splits long text into overlapping chunks.
    overlap ensures context isn't lost at chunk boundaries.
    """
    words  = text.split()
    chunks = []
    start  = 0
    while start < len(words):
        end = start + chunk_size
        chunks.append(" ".join(words[start:end]))
        start += chunk_size - overlap
    return chunks


# ── PDF ingestion (for real bulletins when you have them) ──────────────────
def ingest_pdf(pdf_path: str, source_name: str, category: str = "general"):
    """
    Extracts text from a PDF and ingests it into ChromaDB.
    Usage: ingest_pdf("bulletins/cyclone_alert.pdf", "Cyclone Alert May 2026")
    """
    try:
        from pypdf import PdfReader
        reader = PdfReader(pdf_path)
        full_text = ""
        for page in reader.pages:
            full_text += page.extract_text() + "\n"
        log.info(f"📄 Extracted {len(full_text)} chars from {pdf_path}")
        return [{"source": source_name, "category": category, "text": full_text}]
    except Exception as e:
        log.error(f"PDF read failed: {e}")
        return []


# ── Main ingestion ─────────────────────────────────────────────────────────
def ingest_all():
    collection = get_collection()
    existing   = collection.count()
    log.info(f"📚 Starting ingestion — {existing} chunks already in DB")

    # Get existing IDs to avoid duplicates
    if existing > 0:
        existing_ids = set(collection.get()["ids"])
    else:
        existing_ids = set()

    # Ingest any real PDFs from /bulletins folder if it exists
    bulletins_dir = "./bulletins"
    pdf_bulletins = []
    if os.path.exists(bulletins_dir):
        for filename in os.listdir(bulletins_dir):
            if filename.endswith(".pdf"):
                path = os.path.join(bulletins_dir, filename)
                name = filename.replace(".pdf", "").replace("_", " ").title()
                pdf_bulletins.extend(ingest_pdf(path, name))
                log.info(f"  Found PDF: {filename}")

    all_bulletins = SAMPLE_BULLETINS + pdf_bulletins
    total_chunks  = 0
    skipped       = 0

    for bulletin in all_bulletins:
        chunks = chunk_text(bulletin["text"])
        log.info(f"\n📄 {bulletin['source']} → {len(chunks)} chunks")

        for i, chunk in enumerate(chunks):
            chunk_id = f"{bulletin['source'].replace(' ', '_')}__chunk_{i}"

            if chunk_id in existing_ids:
                skipped += 1
                continue

            collection.add(
                ids        = [chunk_id],
                documents  = [chunk],
                metadatas  = [{
                    "source":   bulletin["source"],
                    "category": bulletin["category"],
                    "chunk":    i,
                }]
            )
            total_chunks += 1

        log.info(f"  ✅ Added {len(chunks) - skipped} new chunks")

    log.info(f"\n🎉 Ingestion complete!")
    log.info(f"   New chunks added : {total_chunks}")
    log.info(f"   Skipped (exist)  : {skipped}")
    log.info(f"   Total in DB      : {collection.count()}")


if __name__ == "__main__":
    ingest_all()