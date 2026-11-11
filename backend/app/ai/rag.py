import re
import math
from collections import Counter
from typing import List, Dict, Any
from sqlalchemy.orm import Session
from app.models.models import KnowledgeChunk, FAQ, KnowledgeDocument

def tokenize(text: str) -> List[str]:
    """Simple lower-case alphanumeric tokenizer."""
    return re.findall(r'\w+', text.lower())

def compute_tf(tokens: List[str]) -> Dict[str, float]:
    total = len(tokens)
    if total == 0:
        return {}
    counts = Counter(tokens)
    return {word: count / total for word, count in counts.items()}

def cosine_similarity(vec1: Dict[str, float], vec2: Dict[str, float]) -> float:
    intersection = set(vec1.keys()) & set(vec2.keys())
    numerator = sum([vec1[x] * vec2[x] for x in intersection])
    sum1 = sum([vec1[x] ** 2 for x in vec1.keys()])
    sum2 = sum([vec2[x] ** 2 for x in vec2.keys()])
    denominator = math.sqrt(sum1) * math.sqrt(sum2)
    if not denominator:
        return 0.0
    return float(numerator) / denominator

class RAGRetriever:
    """
    RAG Retriever layer over PostgreSQL/SQLite Knowledge Chunks & FAQs.
    Uses TF-IDF term frequency cosine similarity for fast zero-dependency local vector retrieval.
    """
    @staticmethod
    def retrieve(db: Session, query: str, top_k: int = 3, threshold: float = 0.1) -> List[Dict[str, Any]]:
        query_tokens = tokenize(query)
        if not query_tokens:
            return []
        query_vec = compute_tf(query_tokens)

        results = []

        # 1. Search Knowledge Chunks
        chunks = db.query(KnowledgeChunk).all()
        for chunk in chunks:
            c_tokens = tokenize(chunk.chunk_text)
            c_vec = compute_tf(c_tokens)
            score = cosine_similarity(query_vec, c_vec)

            # Boost score if exact keyword match in chunk
            for qt in query_tokens:
                if len(qt) > 3 and qt in chunk.chunk_text.lower():
                    score += 0.05

            if score >= threshold:
                doc_title = chunk.document.title if chunk.document else "Clinic Guide"
                results.append({
                    "score": score,
                    "source": doc_title,
                    "content": chunk.chunk_text,
                    "type": "document_chunk"
                })

        # 2. Search FAQs
        faqs = db.query(FAQ).filter(FAQ.is_active == True).all()
        for faq in faqs:
            combined_text = f"{faq.question} {faq.answer}"
            f_tokens = tokenize(combined_text)
            f_vec = compute_tf(f_tokens)
            score = cosine_similarity(query_vec, f_vec)

            for qt in query_tokens:
                if len(qt) > 3 and qt in combined_text.lower():
                    score += 0.08

            if score >= threshold:
                results.append({
                    "score": score,
                    "source": f"FAQ: {faq.category}",
                    "content": f"Q: {faq.question}\nA: {faq.answer}",
                    "type": "faq"
                })

        # Sort by score descending
        results.sort(key=lambda x: x["score"], reverse=True)
        return results[:top_k]

    @staticmethod
    def format_context(retrieved_items: List[Dict[str, Any]]) -> str:
        if not retrieved_items:
            return ""

        context_lines = ["--- RETRIEVED CLINIC KNOWLEDGE CONTEXT ---"]
        for idx, item in enumerate(retrieved_items, start=1):
            context_lines.append(f"[{idx}] Source: {item['source']}")
            context_lines.append(f"{item['content']}\n")
        context_lines.append("-------------------------------------------")
        return "\n".join(context_lines)
