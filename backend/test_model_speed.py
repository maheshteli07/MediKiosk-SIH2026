import httpx
from app.core.config import settings

headers = {"Authorization": f"Bearer {settings.NVIDIA_API_KEY}"}
models = [
    "nvidia/nemotron-3.5-lightning-30b-a3b",
    "nvidia/llama-3.1-nemotron-70b-instruct",
    "meta/llama-3.1-8b-instruct",
    "meta/llama-3.3-70b-instruct",
    "mistralai/mistral-7b-instruct-v0.3"
]

for m in models:
    try:
        payload = {
            "model": m,
            "messages": [{"role": "user", "content": "Respond strictly with JSON: {\"status\": \"connected\"}"}],
            "max_tokens": 30,
            "temperature": 0.1
        }
        r = httpx.post("https://integrate.api.nvidia.com/v1/chat/completions", json=payload, headers=headers, timeout=10.0)
        print(f"Model: {m}")
        print(f" -> Status: {r.status_code}")
        if r.status_code == 200:
            content = r.json()["choices"][0]["message"]["content"]
            print(f" -> Response: {content.strip()}")
        else:
            print(f" -> Error body: {r.text[:100]}")
    except Exception as e:
        print(f"Model: {m} -> Error: {e}")
