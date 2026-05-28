# """
# vector_store.py
# ---------------
# Initialises ChromaDB and provides search functions.
# The AI in main.py will call search_bulletins() before answering
# to find relevant IMD bulletin text for the user's question.
# """

# import chromadb
# from chromadb.utils import embedding_functions
# import logging

# log = logging.getLogger(__name__)

# # ── ChromaDB setup ─────────────────────────────────────────────────────────
# # Persistent storage — survives restarts, stored in ./chroma_db folder
# CHROMA_PATH       = "./chroma_db"
# COLLECTION_NAME   = "imd_bulletins"

# # Uses a local sentence-transformer model — no API key needed
# EMBEDDING_MODEL   = "all-MiniLM-L6-v2"

# _client     = None
# _collection = None


# def get_collection():
#     """Returns the ChromaDB collection, initialising it if needed."""
#     global _client, _collection
#     if _collection is not None:
#         return _collection

#     _client = chromadb.PersistentClient(path=CHROMA_PATH)

#     ef = embedding_functions.SentenceTransformerEmbeddingFunction(
#         model_name=EMBEDDING_MODEL
#     )

#     _collection = _client.get_or_create_collection(
#         name=COLLECTION_NAME,
#         embedding_function=ef,
#         metadata={"hnsw:space": "cosine"},
#     )

#     log.info(f"✅ ChromaDB ready — collection '{COLLECTION_NAME}' "
#              f"has {_collection.count()} chunks")
#     return _collection


# def search_bulletins(query: str, n_results: int = 3) -> list[dict]:
#     """
#     Searches the bulletin collection for text relevant to the query.
#     Returns a list of dicts with 'text', 'source', and 'distance'.
#     Lower distance = more relevant.
#     """
#     collection = get_collection()

#     if collection.count() == 0:
#         log.warning("ChromaDB is empty — no bulletins ingested yet.")
#         return []

#     results = collection.query(
#         query_texts=[query],
#         n_results=min(n_results, collection.count()),
#         include=["documents", "metadatas", "distances"],
#     )

#     hits = []
#     for doc, meta, dist in zip(
#         results["documents"][0],
#         results["metadatas"][0],
#         results["distances"][0],
#     ):
#         hits.append({
#             "text":     doc,
#             "source":   meta.get("source", "unknown"),
#             "category": meta.get("category", "general"),
#             "distance": round(dist, 4),
#         })

#     return hits


# def format_rag_context(hits: list[dict], max_chars: int = 1200) -> str:
#     """
#     Formats search hits into a clean context string for the LLM prompt.
#     Only includes hits with distance < 0.7 (reasonably relevant).
#     """
#     relevant = [h for h in hits if h["distance"] < 0.7]
#     if not relevant:
#         return ""

#     parts = []
#     total = 0
#     for h in relevant:
#         chunk = f"[{h['source']}]\n{h['text']}"
#         if total + len(chunk) > max_chars:
#             break
#         parts.append(chunk)
#         total += len(chunk)

#     return "\n\n".join(parts)


# def collection_stats() -> dict:
#     """Returns basic stats about the vector store."""
#     collection = get_collection()
#     return {
#         "total_chunks": collection.count(),
#         "collection":   COLLECTION_NAME,
#         "model":        EMBEDDING_MODEL,
#         "path":         CHROMA_PATH,
#     }








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