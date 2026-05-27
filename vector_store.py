"""
vector_store.py
---------------
Initialises ChromaDB and provides search functions.
The AI in main.py will call search_bulletins() before answering
to find relevant IMD bulletin text for the user's question.
"""

import chromadb
from chromadb.utils import embedding_functions
import logging

log = logging.getLogger(__name__)

# ── ChromaDB setup ─────────────────────────────────────────────────────────
# Persistent storage — survives restarts, stored in ./chroma_db folder
CHROMA_PATH       = "./chroma_db"
COLLECTION_NAME   = "imd_bulletins"

# Uses a local sentence-transformer model — no API key needed
EMBEDDING_MODEL   = "all-MiniLM-L6-v2"

_client     = None
_collection = None


def get_collection():
    """Returns the ChromaDB collection, initialising it if needed."""
    global _client, _collection
    if _collection is not None:
        return _collection

    _client = chromadb.PersistentClient(path=CHROMA_PATH)

    ef = embedding_functions.SentenceTransformerEmbeddingFunction(
        model_name=EMBEDDING_MODEL
    )

    _collection = _client.get_or_create_collection(
        name=COLLECTION_NAME,
        embedding_function=ef,
        metadata={"hnsw:space": "cosine"},
    )

    log.info(f"✅ ChromaDB ready — collection '{COLLECTION_NAME}' "
             f"has {_collection.count()} chunks")
    return _collection


def search_bulletins(query: str, n_results: int = 3) -> list[dict]:
    """
    Searches the bulletin collection for text relevant to the query.
    Returns a list of dicts with 'text', 'source', and 'distance'.
    Lower distance = more relevant.
    """
    collection = get_collection()

    if collection.count() == 0:
        log.warning("ChromaDB is empty — no bulletins ingested yet.")
        return []

    results = collection.query(
        query_texts=[query],
        n_results=min(n_results, collection.count()),
        include=["documents", "metadatas", "distances"],
    )

    hits = []
    for doc, meta, dist in zip(
        results["documents"][0],
        results["metadatas"][0],
        results["distances"][0],
    ):
        hits.append({
            "text":     doc,
            "source":   meta.get("source", "unknown"),
            "category": meta.get("category", "general"),
            "distance": round(dist, 4),
        })

    return hits


def format_rag_context(hits: list[dict], max_chars: int = 1200) -> str:
    """
    Formats search hits into a clean context string for the LLM prompt.
    Only includes hits with distance < 0.7 (reasonably relevant).
    """
    relevant = [h for h in hits if h["distance"] < 0.7]
    if not relevant:
        return ""

    parts = []
    total = 0
    for h in relevant:
        chunk = f"[{h['source']}]\n{h['text']}"
        if total + len(chunk) > max_chars:
            break
        parts.append(chunk)
        total += len(chunk)

    return "\n\n".join(parts)


def collection_stats() -> dict:
    """Returns basic stats about the vector store."""
    collection = get_collection()
    return {
        "total_chunks": collection.count(),
        "collection":   COLLECTION_NAME,
        "model":        EMBEDDING_MODEL,
        "path":         CHROMA_PATH,
    }