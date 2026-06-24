"""
database.py
-----------
SQLAlchemy models and connection setup.
v3 — adds moonrise, moonset, forecast_json, and source-tracking
     columns to support the IMD + Open-Meteo hybrid fetcher.
"""

import os
from dotenv import load_dotenv
from sqlalchemy import (
    create_engine, Column, Integer, Float, String,
    DateTime, Boolean, Text, text as sql_text
)
from sqlalchemy.orm import declarative_base, sessionmaker
from datetime import datetime, timezone

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    raise ValueError("DATABASE_URL not found in .env file")

engine = create_engine(
    DATABASE_URL,
    pool_pre_ping=True,
    pool_size=5,
    max_overflow=10,
)

SessionLocal = sessionmaker(bind=engine, autocommit=False, autoflush=False)
Base = declarative_base()


# ── Table 1: Weather records ───────────────────────────────────────────────
class WeatherRecord(Base):
    __tablename__ = "weather_records"

    id            = Column(Integer, primary_key=True, index=True)

    # Location
    city          = Column(String(100), nullable=False, index=True)
    state         = Column(String(100), nullable=True)
    lat           = Column(Float, nullable=True)
    lon           = Column(Float, nullable=True)

    # Date
    date          = Column(String(20), nullable=False)

    # Temperature
    temperature   = Column(Float, nullable=False)
    feels_like    = Column(Float)
    high          = Column(Float)
    low           = Column(Float)

    # Atmosphere
    humidity      = Column(Integer)
    condition     = Column(String(100))
    warning       = Column(String(200), default="None")
    cloud_cover   = Column(Integer)
    pressure      = Column(Float)
    visibility    = Column(Float)

    # Wind
    wind_speed    = Column(Float)
    wind_dir      = Column(String(10))
    wind_deg      = Column(Integer)
    wind_gust     = Column(Float)

    # Indices
    uv_index      = Column(Integer)
    aqi           = Column(Integer)

    # Real-time condition fields
    weather_code      = Column(Integer, default=0)
    precipitation     = Column(Float,   default=0.0)
    is_raining        = Column(Boolean, default=False)
    is_thunderstorm   = Column(Boolean, default=False)
    is_snowfall       = Column(Boolean, default=False)
    is_foggy          = Column(Boolean, default=False)
    condition_detail  = Column(String(200), default="")

    # Sun / Moon
    sunrise           = Column(String(20), nullable=True)
    sunset             = Column(String(20), nullable=True)
    moonrise           = Column(String(20), nullable=True)
    moonset            = Column(String(20), nullable=True)

    # 7-day forecast — stored as a JSON string.
    # Days 1-5 come from IMD cityforecastloc (with forecast text),
    # Days 6-7 come from Open-Meteo (temps only, text=null).
    # Example: '[{"day":"Today","high":36.0,"low":28.0,"text":"Partly cloudy..."}]'
    forecast_json      = Column(Text, nullable=True)

    # Which upstream source supplied the CURRENT conditions for this row.
    # One of: "imd_synop", "imd_aws", "open_meteo"
    # Useful for debugging and for showing data provenance if ever needed.
    data_source        = Column(String(20), default="open_meteo")

    updated_at    = Column(DateTime,
                           default=lambda: datetime.now(timezone.utc),
                           onupdate=lambda: datetime.now(timezone.utc))

    def to_dict(self):
        return {c.name: getattr(self, c.name) for c in self.__table__.columns}


# ── Table 2: Fetch log ────────────────────────────────────────────────────
class FetchLog(Base):
    __tablename__ = "fetch_logs"

    id              = Column(Integer, primary_key=True, index=True)
    fetched_at      = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    source          = Column(String(50), default="csv")
    city            = Column(String(100))
    success         = Column(Boolean, default=True)
    records_updated = Column(Integer, default=0)
    error_message   = Column(Text, nullable=True)

    def to_dict(self):
        return {c.name: getattr(self, c.name) for c in self.__table__.columns}


# ── Session helper ────────────────────────────────────────────────────────
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# ── Init — creates tables if they don't exist, adds missing columns safely ─
def init_db():
    Base.metadata.create_all(bind=engine)

    new_columns = [
        ("state",            "VARCHAR(100)"),
        ("lat",              "FLOAT"),
        ("lon",              "FLOAT"),
        ("weather_code",     "INTEGER DEFAULT 0"),
        ("precipitation",    "FLOAT DEFAULT 0.0"),
        ("is_raining",       "BOOLEAN DEFAULT FALSE"),
        ("is_thunderstorm",  "BOOLEAN DEFAULT FALSE"),
        ("is_snowfall",      "BOOLEAN DEFAULT FALSE"),
        ("is_foggy",         "BOOLEAN DEFAULT FALSE"),
        ("condition_detail", "VARCHAR(200) DEFAULT ''"),
        ("sunrise",          "VARCHAR(20)"),
        ("sunset",           "VARCHAR(20)"),
        # ── v3 additions for IMD integration ───────────────────────────
        ("moonrise",         "VARCHAR(20)"),
        ("moonset",          "VARCHAR(20)"),
        ("wind_gust",        "FLOAT"),
        ("forecast_json",    "TEXT"),
        ("data_source",      "VARCHAR(20) DEFAULT 'open_meteo'"),
    ]

    with engine.connect() as conn:
        for col_name, col_type in new_columns:
            try:
                conn.execute(
                    sql_text(
                        f"ALTER TABLE weather_records ADD COLUMN IF NOT EXISTS {col_name} {col_type}"
                    )
                )
                conn.commit()
            except Exception:
                conn.rollback()

    print("✅ Database schema up to date (v3 — IMD hybrid columns added).")


if __name__ == "__main__":
    init_db()