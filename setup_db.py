"""
setup_db.py
-----------
One-time migration script.
Run this ONCE to:
  1. Create all tables in PostgreSQL
  2. Import your weather_report.csv into the weather_records table
  3. Log the migration in fetch_logs

Run with:  python setup_db.py
"""

import pandas as pd
from datetime import datetime, timezone
from database import init_db, SessionLocal, WeatherRecord, FetchLog

CSV_PATH = "data/weather_report.csv"


def migrate():
    # Step 1: create tables
    print("🔧 Initialising database tables...")
    init_db()

    db = SessionLocal()
    try:
        # Step 2: load CSV
        print(f"📂 Reading {CSV_PATH}...")
        df = pd.read_csv(CSV_PATH).fillna("None")

        # normalise column names (strip spaces, lowercase)
        df.columns = [c.strip().lower().replace(" ", "_") for c in df.columns]

        records_inserted = 0
        records_skipped  = 0

        for _, row in df.iterrows():
            city = str(row.get("city", "")).strip()
            if not city:
                records_skipped += 1
                continue

            # Check if city already exists — update instead of duplicate
            existing = db.query(WeatherRecord).filter_by(city=city).first()

            data = dict(
                city        = city,
                date        = str(row.get("date", "")),
                temperature = float(row.get("temperature", 0)),
                feels_like  = float(row.get("feels_like",  0)) if row.get("feels_like",  "None") != "None" else None,
                high        = float(row.get("high",        0)) if row.get("high",        "None") != "None" else None,
                low         = float(row.get("low",         0)) if row.get("low",         "None") != "None" else None,
                humidity    = int(float(row.get("humidity",    0))),
                condition   = str(row.get("condition",  "Unknown")),
                warning     = str(row.get("warning",    "None")),
                wind_speed  = float(row.get("wind_speed", 0)) if row.get("wind_speed",  "None") != "None" else None,
                wind_dir    = str(row.get("wind_dir",   "N")),
                wind_deg    = int(float(row.get("wind_deg",   0))) if row.get("wind_deg",    "None") != "None" else None,
                pressure    = float(row.get("pressure",  1013)) if row.get("pressure",   "None") != "None" else None,
                visibility  = float(row.get("visibility", 10))  if row.get("visibility", "None") != "None" else None,
                uv_index    = int(float(row.get("uv_index",   5))) if row.get("uv_index",   "None") != "None" else None,
                aqi         = int(float(row.get("aqi",        50))) if row.get("aqi",        "None") != "None" else None,
                cloud_cover = int(float(row.get("cloud_cover", 0))) if row.get("cloud_cover","None") != "None" else None,
                updated_at  = datetime.now(timezone.utc),
            )

            if existing:
                for key, val in data.items():
                    setattr(existing, key, val)
                print(f"  🔄 Updated  : {city}")
            else:
                db.add(WeatherRecord(**data))
                print(f"  ✅ Inserted : {city}")
                records_inserted += 1

        db.commit()

        # Step 3: log the migration
        log = FetchLog(
            source          = "csv",
            city            = "ALL",
            success         = True,
            records_updated = records_inserted,
            error_message   = None,
        )
        db.add(log)
        db.commit()

        print(f"\n🎉 Migration complete!")
        print(f"   Inserted : {records_inserted} cities")
        print(f"   Skipped  : {records_skipped} rows")

    except Exception as e:
        db.rollback()

        # log the failure
        log = FetchLog(
            source        = "csv",
            city          = "ALL",
            success       = False,
            error_message = str(e),
        )
        db.add(log)
        db.commit()

        print(f"\n❌ Migration failed: {e}")
        raise

    finally:
        db.close()


def verify():
    """Quick sanity check — prints all rows from weather_records."""
    db = SessionLocal()
    try:
        rows = db.query(WeatherRecord).all()
        print(f"\n📊 weather_records table — {len(rows)} rows:")
        for r in rows:
            print(f"  {r.city:<15} {r.temperature}°C  {r.condition:<15} warning={r.warning}")

        logs = db.query(FetchLog).order_by(FetchLog.fetched_at.desc()).limit(5).all()
        print(f"\n📋 fetch_logs (last 5):")
        for l in logs:
            status = "✅" if l.success else "❌"
            print(f"  {status} {l.fetched_at}  source={l.source}  records={l.records_updated}  err={l.error_message}")
    finally:
        db.close()


if __name__ == "__main__":
    migrate()
    verify()