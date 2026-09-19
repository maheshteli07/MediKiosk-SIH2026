import asyncio
import httpx
from app.core.config import settings

async def test_nv_models():
    url = f"{settings.NVIDIA_LLM_BASE_URL}/embeddings"
    headers = {
        "Authorization": f"Bearer {settings.NVIDIA_API_KEY}",
        "Content-Type": "application/json"
    }
    models = [
        "baai/bge-large-en-v1.5",
        "nvidia/llama-3.2-nv-embedqa-1b-v2",
        "nvidia/nv-embedqa-mistral-7b-v2",
        "snowflake/arctic-embed-l"
    ]
    for model in models:
        payload = {
            "input": ["Patient has Type 2 Diabetes"],
            "model": model,
            "input_type": "passage"
        }
        try:
            async with httpx.AsyncClient(timeout=10) as client:
                resp = await client.post(url, json=payload, headers=headers)
                print(f"{model} -> Status: {resp.status_code}")
                if resp.status_code == 200:
                    data = resp.json()
                    vec = data["data"][0]["embedding"]
                    print(f"  -> SUCCESS! Vector length: {len(vec)}")
                    return model
        except Exception as e:
            print(f"{model} -> error: {e}")

if __name__ == "__main__":
    asyncio.run(test_nv_models())
