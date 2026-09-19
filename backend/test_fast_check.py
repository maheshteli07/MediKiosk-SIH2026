import time, httpx
from app.core.config import settings

headers = {"Authorization": f"Bearer {settings.NVIDIA_API_KEY}"}
candidates = [
    "nvidia/nemotron-3-super-120b-a12b",
    "meta/llama-3.1-8b-instruct",
    "meta/llama-3.2-3b-instruct",
    "meta/llama-3.2-1b-instruct",
    "mistralai/mistral-small-24b-instruct-2501",
    "deepseek-ai/deepseek-r1",
    "qwen/qwen2.5-7b-instruct"
]

for m in candidates:
    t0 = time.time()
    try:
        r = httpx.post("https://integrate.api.nvidia.com/v1/chat/completions", json={
            "model": m,
            "messages": [{"role": "user", "content": "hi"}],
            "max_tokens": 10
        }, headers=headers, timeout=5.0)
        dt = time.time() - t0
        if r.status_code == 200:
            print(f"ONLINE in {dt:.2f}s: {m}")
        else:
            print(f"FAILED {r.status_code} in {dt:.2f}s: {m}")
    except Exception as e:
        print(f"TIMEOUT/ERR: {m} -> {e}")
