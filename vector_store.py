"""
vector_store.py — lightweight stub for cloud deployment
sentence-transformers removed (too heavy for 512MB Render free tier)
RAG search replaced with simple keyword matching
"""

def search_bulletins(query: str, n_results: int = 2) -> list:
    """Keyword-based fallback — no ML model needed."""
    bulletins = [
        {"text": "During heatwave conditions stay hydrated, avoid outdoor activity between 12-4 PM, wear light clothing.", "source": "IMD Heatwave Advisory"},
        {"text": "During heavy rainfall avoid waterlogged areas, do not drive through flooded roads.", "source": "IMD Flood Advisory"},
        {"text": "Thunderstorm warning: stay indoors, avoid open fields and tall trees.", "source": "IMD Storm Advisory"},
        {"text": "High AQI alert: wear N95 masks outdoors, avoid morning exercise.", "source": "IMD Air Quality Advisory"},
        {"text": "Cyclone preparedness: stock essentials, follow evacuation orders immediately.", "source": "IMD Cyclone Advisory"},
        {"text": "Cold wave alert: keep elderly and children indoors, use warm clothing.", "source": "IMD Cold Wave Advisory"},
    ]
    query_lower = query.lower()
    keywords = {
        "heat": ["heatwave", "hot", "temperature", "summer"],
        "rain": ["rain", "flood", "waterlog", "wet"],
        "storm": ["thunder", "storm", "lightning", "cyclone"],
        "aqi": ["aqi", "air", "pollution", "smoke", "dust"],
        "cold": ["cold", "winter", "fog", "chill"],
    }
    scored = []
    for b in bulletins:
        score = 0
        for key, words in keywords.items():
            if any(w in query_lower for w in words):
                if key in b["text"].lower():
                    score += 1
        scored.append((score, b))
    scored.sort(key=lambda x: x[0], reverse=True)
    return [b for _, b in scored[:n_results]]


def format_rag_context(results: list, max_chars: int = 500) -> str:
    if not results:
        return ""
    return "\n".join(f"- {r['text']}" for r in results)[:max_chars]


def collection_stats() -> dict:
    return {"total_chunks": 6, "source": "keyword-based"}