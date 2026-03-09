from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.config import settings
from backend.database.connection import init_db
from backend.routers import agent_config, api_keys, pipeline, data


@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_db()
    yield


app = FastAPI(
    title="AI Factory API",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(pipeline.router, prefix="/pipeline", tags=["pipeline"])
app.include_router(agent_config.router, prefix="/agent-config", tags=["agent-config"])
app.include_router(api_keys.router, prefix="/api-keys", tags=["api-keys"])
app.include_router(data.router, prefix="/data", tags=["data"])


@app.get("/health")
async def health():
    return {"status": "ok", "version": "1.0.0"}
