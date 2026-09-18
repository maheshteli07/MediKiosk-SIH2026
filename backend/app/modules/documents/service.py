"""service.py - Documents Module Business Logic - Developer 3"""
async def upload_document(file_bytes: bytes, filename: str, patient_id: str) -> dict:
    raise NotImplementedError

async def get_document(document_id: str) -> dict:
    raise NotImplementedError

async def get_patient_documents(patient_id: str) -> list:
    raise NotImplementedError

async def process_document_ocr(document_id: str) -> dict:
    raise NotImplementedError
