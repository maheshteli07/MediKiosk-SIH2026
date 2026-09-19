"""Quick end-to-end test: auto provider -> RAG -> LLM"""
import asyncio, time

async def main():
    from app.integrations.ai.llm_service import resolve_provider, reset_provider_cache
    from app.integrations.rag.rag_service import index_session_documents, rag_chat_turn
    from app.integrations.rag.rag_store import clear_session, get_indexed_count

    reset_provider_cache()
    t0 = time.time()
    ela = lambda: f"{time.time()-t0:.1f}s"

    print("=== AUTO PROVIDER DETECTION ===")
    provider = await resolve_provider()
    print(f"Selected provider: {provider.upper()}  [{ela()}]")

    print("\n=== RAG INDEX ===")
    sid = "quick_test_001"
    clear_session(sid)
    docs = [
        {"extracted_text": "Patient has Type 2 Diabetes. Taking Metformin 500mg BD. Allergy: Penicillin.", 
         "diagnoses": ["Type 2 Diabetes"], "medicines": ["Metformin 500mg"]},
        {"extracted_text": "Lab: HbA1c 8.2% High. FBS 165 mg/dL High. BP 140/90 mmHg."},
    ]
    n = await asyncio.wait_for(index_session_documents(sid, docs), timeout=10)
    print(f"Indexed {n} chunks  [{ela()}]")

    print("\n=== RAG + LLM CHAT TURN ===")
    query = "I have high blood sugar and dizziness since morning"
    history = [{"role": "assistant", "text": "Hello, how can I help you?"}]
    try:
        result = await asyncio.wait_for(
            rag_chat_turn(sid, query, history),
            timeout=60,
        )
        print(f"Provider used  : {provider.upper()}")
        print(f"AI Question    : {result.get('ai_prompt', '')[:120]}")
        print(f"Red Flags      : {result.get('red_flags', [])}")
        print(f"Entities       : {result.get('extracted_entities', [])}")
        print(f"Context chunks : {len(result.get('retrieved_context', []))}")
        print(f"\n[OK] RAG + LLM pipeline WORKING  [{ela()}]")
    except asyncio.TimeoutError:
        print(f"[WARN] Timed out after 60s. Provider '{provider}' is slow.  [{ela()}]")
    except Exception as e:
        print(f"[FAIL] {type(e).__name__}: {e}  [{ela()}]")

if __name__ == "__main__":
    asyncio.run(main())
