import asyncio
from app.integrations.ai.nvidia_llm_service import (
    nvidia_generate_adaptive_question,
    nvidia_extract_structured_info,
    nvidia_screen_red_flags,
    nvidia_generate_clinical_summary,
)

async def test_all_nvidia():
    print("Testing NVIDIA Nemotron LLM services...")

    print("\n1. Testing Red Flag Screening:")
    rf = await nvidia_screen_red_flags("Patient has crushing retrosternal chest pain radiating to left arm with sweating.")
    print("Red Flags Result:", rf)

    print("\n2. Testing Adaptive Questioning:")
    session_data = {
        "conversation": [
            {"role": "assistant", "text": "Hello, how can I help you today?"},
            {"role": "patient", "text": "I have been having a severe headache and fever for 3 days."},
        ],
        "covered_sections": ["chief_complaint"],
        "current_section": "history_of_present_illness",
    }
    q = await nvidia_generate_adaptive_question(session_data)
    print("Adaptive Question Result:", q)

    print("\n3. Testing Structured Extraction:")
    ext = await nvidia_extract_structured_info(
        "I am taking Metformin 500mg daily and Amlodipine 5mg for high blood pressure. I am allergic to sulfa drugs."
    )
    print("Extracted Info Result:", ext)

    print("\n4. Testing Clinical Summary:")
    summary = await nvidia_generate_clinical_summary(
        patient_history="Patient is a 54-year-old male with type 2 diabetes presenting with 3 days of productive cough.",
        symptoms=["Productive cough", "Mild fever", "Shortness of breath on exertion"],
        medications=["Metformin 500mg BD"],
        lab_results=["Fasting Blood Sugar: 145 mg/dL", "Chest X-ray: Clear lung fields"],
    )
    print("Summary Result:", summary)

if __name__ == "__main__":
    asyncio.run(test_all_nvidia())
