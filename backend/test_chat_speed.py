import asyncio
import time
from app.modules.conversation.service import direct_llm_chat_turn

async def main():
    print("Turn 1...")
    t0 = time.time()
    q, e, r = await direct_llm_chat_turn("I have headache and fever for 2 days", [])
    print(f"Turn 1 in {time.time()-t0:.2f}s: {q}")

    print("Turn 2...")
    t1 = time.time()
    q2, e2, r2 = await direct_llm_chat_turn("The fever is around 102 degrees", [{"role": "assistant", "text": q}, {"role": "patient", "text": "The fever is around 102 degrees"}])
    print(f"Turn 2 in {time.time()-t1:.2f}s: {q2}")

if __name__ == "__main__":
    asyncio.run(main())
