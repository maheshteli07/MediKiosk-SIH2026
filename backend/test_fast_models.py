import httpx
from app.core.config import settings

headers = {"Authorization": f"Bearer {settings.NVIDIA_API_KEY}"}
candidate_models = [
    "nv-mistralai/mistral-nemo-12b-instruct",
    "nvidia/mistral-nemo-minitron-8b-8k-instruct",
    "writer/palmyra-med-70b",
    "ibm/granite-3.0-8b-instruct",
    "deepseek-ai/deepseek-v4-flash-0731",
    "google/gemma-3-12b-it",
    "nvidia/nemotron-nano-3-30b-a3b",
    "nvidia/nemotron-3.5-lightning-30b-a3b"
]

for m in candidate_models:
    try:
        payload = {
            "model": m,
            "messages": [{"role": "user", "content": "Respond strictly with JSON: {\"status\": \"ok\"}"}],
            "max_tokens": 20,
            "temperature": 0.1
        }
        r = httpx.post("https://integrate.api.nvidia.com/v1/chat/completions", json=payload, headers=headers, timeout=6.0)
        if r.status_code == 200:
            content = r.json()["choices"][0]["message"]["content"]
            print(f"[SUCCESS 200] {m} -> {content.strip()}")
        else:
            print(f"[FAILED {r.status_code}] {m}")
    except Exception as e:
        print(f"[TIMEOUT/ERROR] {m} -> {e}")
