from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .app.database.connection import Base, engine
from .app.database.seed import seed_database
from .app.api.router import api_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: ensure tables are created and seed database
    Base.metadata.create_all(bind=engine)
    seed_database()
    yield
    # Shutdown


app = FastAPI(
    title="AfyaConnect Healthcare Platform API",
    description="Bilingual Conversational Healthcare Access & Hospital Coordination Platform (Nairobi, Kenya)",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS middleware allowing frontend communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include central API router
app.include_router(api_router)


@app.get("/")
def root():
    return {
        "name": "AfyaConnect API",
        "status": "online",
        "version": "1.0.0",
        "description": "Bilingual (Kiswahili / English / Sheng) Location-Aware Healthcare Access Platform",
        "docsUrl": "/docs",
    }


@app.get("/health")
@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "database": "connected",
        "claudeEngine": "ready",
        "kenyaHotlines": "1199, 999",
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.main:app", host="0.0.0.0", port=8000, reload=True)
