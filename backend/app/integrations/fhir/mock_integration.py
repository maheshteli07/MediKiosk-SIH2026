"""
mock_integration.py – Mock Integration Service for Development
Developer 5
"""

import asyncio


async def mock_push_fhir(patient_data: dict, clinical_summary: dict) -> dict:
    await asyncio.sleep(1.0)
    return {"status": "success", "fhir_bundle_id": "mock-bundle-001", "provider": "mock"}


async def mock_push_abdm(patient_abha: str, record_data: dict) -> dict:
    await asyncio.sleep(0.8)
    return {"status": "success", "abdm_transaction_id": "mock-abdm-001", "provider": "mock"}


async def mock_push_his(patient_data: dict, clinical_summary: dict) -> dict:
    await asyncio.sleep(0.6)
    return {"status": "success", "his_record_id": "mock-his-001", "provider": "mock"}
