# Re-export from the consolidated admin_leakage.py
from app.routers.admin_leakage import tickets_router as router

__all__ = ["router"]
