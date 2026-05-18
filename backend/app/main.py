from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os
from dotenv import load_dotenv

load_dotenv()

from app.auth.routes import router as auth_router
from app.routes.goals import router as goals_router
from app.routes.cycles import router as cycles_router
from app.routes.thrust_areas import router as thrust_areas_router
from app.routes.users import router as users_router
from app.routes.achievements import router as achievements_router
from app.routes.checkins import router as checkins_router
from app.routes.audit import router as audit_router
from app.routes.analytics import router as analytics_router
from app.routes.reports import router as reports_router
from app.routes.dashboard import router as dashboard_router

app = FastAPI(title="AtomQuest API")

# CORS configuration
origins = [
    "http://localhost:5173", # Vite default port
    os.getenv("FRONTEND_ORIGIN", ""),
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router, prefix="/api")
app.include_router(goals_router, prefix="/api")
app.include_router(cycles_router, prefix="/api")
app.include_router(thrust_areas_router, prefix="/api")
app.include_router(users_router, prefix="/api")
app.include_router(achievements_router, prefix="/api")
app.include_router(checkins_router, prefix="/api")
app.include_router(audit_router, prefix="/api")
app.include_router(analytics_router, prefix="/api")
app.include_router(reports_router, prefix="/api")
app.include_router(dashboard_router, prefix="/api")

@app.get("/health")
def health_check():
    return {"status": "healthy"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
