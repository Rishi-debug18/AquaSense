# Re-export remaining admin routers from the combined file
from app.routers.admin_leakage import alerts_router as router

__all__ = ["router"]
