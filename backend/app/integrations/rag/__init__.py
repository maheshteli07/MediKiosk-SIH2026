"""
integrations/rag/__init__.py
Public API surface for the RAG module.
"""

from .rag_embedder import embed_text                          # noqa: F401
from .rag_store import index_documents, retrieve, clear_session  # noqa: F401
from .rag_service import (                                    # noqa: F401
    index_session_documents,
    rag_chat_turn,
    rag_generate_summary,
)
