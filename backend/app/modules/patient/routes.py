"""
backend/app/modules/patient/routes.py – Patient Module Route Export Adapter
=============================================================================
Re-exports `router` from `app.modules.patient.router` to maintain backwards
compatibility with `app.main.py` without modifying core application wiring.
"""

from app.modules.patient.router import router

__all__ = ["router"]
