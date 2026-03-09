from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from pydantic import BaseModel
from typing import Optional

from backend.database.connection import get_db
from backend.database.models import AgentConfig
from backend.config import ALL_MODELS, OPENAI_MODELS, ANTHROPIC_MODELS

router = APIRouter()


class AgentConfigUpdate(BaseModel):
    provider: str
    model: str
    temperature: float = 0.7
    max_tokens: int = 4096
    system_prompt: Optional[str] = None


def _to_dict(cfg: AgentConfig) -> dict:
    return {
        "id": cfg.id,
        "domain": cfg.domain,
        "agentName": cfg.agent_name,
        "role": cfg.role,
        "provider": cfg.provider,
        "model": cfg.model,
        "temperature": cfg.temperature,
        "maxTokens": cfg.max_tokens,
        "systemPrompt": cfg.system_prompt,
        "updatedAt": cfg.updated_at,
    }


@router.get("")
async def list_agent_configs(db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(AgentConfig).order_by(AgentConfig.domain, AgentConfig.role.desc(), AgentConfig.agent_name)
    )
    return [_to_dict(cfg) for cfg in result.scalars().all()]


@router.get("/domain/{domain}")
async def list_by_domain(domain: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(AgentConfig)
        .where(AgentConfig.domain == domain)
        .order_by(AgentConfig.role.desc(), AgentConfig.agent_name)
    )
    return [_to_dict(cfg) for cfg in result.scalars().all()]


@router.get("/{agent_id:path}")
async def get_agent_config(agent_id: str, db: AsyncSession = Depends(get_db)):
    cfg = await db.get(AgentConfig, agent_id)
    if not cfg:
        raise HTTPException(status_code=404, detail=f"Agent config not found: {agent_id}")
    return _to_dict(cfg)


@router.put("/{agent_id:path}")
async def update_agent_config(
    agent_id: str,
    body: AgentConfigUpdate,
    db: AsyncSession = Depends(get_db),
):
    # Validate model/provider consistency
    if body.model not in ALL_MODELS:
        raise HTTPException(status_code=400, detail=f"Unsupported model: {body.model}")

    expected_provider = "openai" if body.model in OPENAI_MODELS else "anthropic"
    if body.provider != expected_provider:
        raise HTTPException(
            status_code=400,
            detail=f"Model {body.model} requires provider '{expected_provider}', got '{body.provider}'"
        )

    cfg = await db.get(AgentConfig, agent_id)
    if not cfg:
        raise HTTPException(status_code=404, detail=f"Agent config not found: {agent_id}")

    cfg.provider = body.provider
    cfg.model = body.model
    cfg.temperature = body.temperature
    cfg.max_tokens = body.max_tokens
    cfg.system_prompt = body.system_prompt
    cfg.updated_at = datetime.utcnow().isoformat()

    await db.commit()
    await db.refresh(cfg)
    return _to_dict(cfg)
