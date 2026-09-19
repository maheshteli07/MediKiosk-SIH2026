import asyncio
import time
from app.core.config import settings
from app.integrations.ai.nvidia_llm_service import _call_nvidia_llm

async def main():
    models = [
        "meta/llama-3.2-11b-vision-instruct",
        "nvidia/nemotron-3-super-120b-a12b",
        "nvidia/nemotron-3.5-lightning-30b-a3b"
    ]
    for model in models:
        settings.nvidia_llm_model = model
        t0 = time.time()
        try:
            prompt = "You are a clinical assistant. Patient says: I have fever for 3 days. Ask one empathetic question in JSON: {\"question\": \"...\"}"
            result = await _call_nvidia_llm(prompt, max_tokens=150)
            print(f"SUCCESS {model} in {time.time()-t0:.2f}s: {result[:120]}")
        except Exception as e:
            print(f"FAILED {model} in {time.time()-t0:.2f}s: {e}")

if __name__ == "__main__":
    asyncio.run(main())
