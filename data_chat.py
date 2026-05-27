import pandas as pd
from langchain_community.llms import Ollama
from difflib import get_close_matches

# 1. Load Data
df = pd.read_csv("data/weather_report.csv").fillna("None")
city_map = {city.lower(): city for city in df["city"].tolist()}

# 2. Initialize AI
llm = Ollama(model="llama3.1")

SYSTEM_PROMPT = """You are an intelligent weather assistant for the India Meteorological Department (IMD).
Answer using ONLY the data provided. Be concise (under 4 sentences).
Always mention active warnings if present. Do NOT invent data."""


def find_cities_in_query(user_text: str) -> list[str]:
    text_lower = user_text.lower()
    found = []
    # Exact match
    for key, original in city_map.items():
        if key in text_lower and original not in found:
            found.append(original)
    # Fuzzy match fallback
    if not found:
        tokens = text_lower.split()
        candidates = list(city_map.keys())
        for token in tokens:
            matches = get_close_matches(token, candidates, n=1, cutoff=0.82)
            if matches:
                original = city_map[matches[0]]
                if original not in found:
                    found.append(original)
        for i in range(len(tokens) - 1):
            bigram = f"{tokens[i]} {tokens[i+1]}"
            matches = get_close_matches(bigram, candidates, n=1, cutoff=0.82)
            if matches:
                original = city_map[matches[0]]
                if original not in found:
                    found.append(original)
    return found


def build_context(cities: list[str]) -> str:
    """
    Builds context using ALL columns from weather_report.csv.
    Previously only sent 4 fields — now sends every field so the LLM
    can answer questions about wind speed, pressure, UV index, AQI, etc.
    """
    rows = []
    for city in cities:
        row = df[df["city"] == city].iloc[0]
        rows.append(
            f"- {city}:"
            f" Temperature={row['temperature']}°C,"
            f" Feels Like={row['feels_like']}°C,"
            f" High={row['high']}°C,"
            f" Low={row['low']}°C,"
            f" Humidity={row['humidity']}%,"
            f" Condition={row['condition']},"
            f" Warning={row['warning']},"
            f" Wind Speed={row['wind_speed']} km/h,"
            f" Wind Direction={row['wind_dir']} ({row['wind_deg']}°),"
            f" Pressure={row['pressure']} hPa,"
            f" Visibility={row['visibility']} km,"
            f" UV Index={row['uv_index']},"
            f" AQI={row['aqi']},"
            f" Cloud Cover={row['cloud_cover']}%"
        )
    return "\n".join(rows)


def ask_weather(user_query: str) -> str:
    cities = find_cities_in_query(user_query)
    if cities:
        context = build_context(cities)
        print(f"\n[System]: Found data for: {', '.join(cities)}")
    else:
        # General query — pass all city data
        context = build_context(df["city"].tolist())
        print("\n[System]: No specific city detected. Using full dataset...")

    prompt = f"""{SYSTEM_PROMPT}
Weather data:
{context}

User question: {user_query}
Answer:"""
    return llm.invoke(prompt)


# 3. Run
if __name__ == "__main__":
    print("--- IMD AI Assistant Active ---")
    print("Cities available:", ", ".join(df["city"].tolist()))
    print("Type 'quit' to exit.\n")
    while True:
        user_input = input("You: ").strip()
        if user_input.lower() in ("quit", "exit"):
            break
        if not user_input:
            continue
        response = ask_weather(user_input)
        print(f"\nAI: {response}\n")