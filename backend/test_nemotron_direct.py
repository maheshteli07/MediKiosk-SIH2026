import httpx
import time
from app.core.config import settings

headers = {"Authorization": f"Bearer {settings.NVIDIA_API_KEY}"}
payload = {
    "model": "nvidia/nemotron-3.5-lightning-30b-a3b",
    "messages": [{"role": "user", "content": "Respond with only JSON: {\"status\": \"ok\", \"connection\": \"verified\"}"}],
    "max_tokens": 50,
    "temperature": 0.1
}

t0 = time.time()
print("Sending request to NVIDIA Nemotron 3.5 Lightning...")
r = httpx.post("https://integrate.api.nvidia.com/v1/chat/completions", json=payload, headers=headers, timeout=60.0)
print(f"Completed in {round(time.time() - t0, 2)} seconds. Status code: {r.status_code}")
if r.status_code == 200:
    print("Response Content:")
    print(r.json()["choices"][0]["message"]["content"])
else:
    print("Error:", r.text)
