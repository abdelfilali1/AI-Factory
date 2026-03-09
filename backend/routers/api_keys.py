import uuid
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from pydantic import BaseModel

from backend.database.connection import get_db
from backend.database.models import ApiKey
from backend.config import settings

router = APIRouter()


class ApiKeyCreate(BaseModel):
    provider: str  # 'openai' | 'anthropic'
    key_value: str
    label: str = ""


def _to_dict(k: ApiKey) -> dict:
    return {
        "id": k.id,
        "provider": k.provider,
        "keyHint": k.key_hint,
        "isActive": k.is_active,
        "createdAt": k.created_at,
    }


@router.get("")
async def list_api_keys(db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(ApiKey).where(ApiKey.is_active == True).order_by(ApiKey.created_at.desc())
    )
    return [_to_dict(k) for k in result.scalars().all()]


@router.post("")
async def save_api_key(body: ApiKeyCreate, db: AsyncSession = Depends(get_db)):
    if body.provider not in ("openai", "anthropic"):
        raise HTTPException(status_code=400, detail="provider must be 'openai' or 'anthropic'")
    if len(body.key_value) < 10:
        raise HTTPException(status_code=400, detail="API key too short")

    # Deactivate previous keys for this provider
    result = await db.execute(
        select(ApiKey).where(ApiKey.provider == body.provider, ApiKey.is_active == True)
    )
    for old_key in result.scalars().all():
        old_key.is_active = False

    key = ApiKey(
        id=str(uuid.uuid4()),
        provider=body.provider,
        key_hint=body.key_value[-4:],
        key_value=body.key_value,  # stored locally in SQLite
        is_active=True,
        created_at=datetime.utcnow().isoformat(),
    )
    db.add(key)
    await db.commit()

    # Update the in-memory settings so agents use the new key immediately
    if body.provider == "openai":
        settings.openai_api_key = body.key_value
    elif body.provider == "anthropic":
        settings.anthropic_api_key = body.key_value

    return _to_dict(key)


@router.delete("/{key_id}")
async def delete_api_key(key_id: str, db: AsyncSession = Depends(get_db)):
    key = await db.get(ApiKey, key_id)
    if not key:
        raise HTTPException(status_code=404, detail="API key not found")
    key.is_active = False
    await db.commit()
    return {"deleted": True}


@router.post("/{key_id}/test")
async def test_api_key(key_id: str, db: AsyncSession = Depends(get_db)):
    key = await db.get(ApiKey, key_id)
    if not key:
        raise HTTPException(status_code=404, detail="API key not found")

    try:
        if key.provider == "openai":
            from langchain_openai import ChatOpenAI
            llm = ChatOpenAI(model="gpt-3.5-turbo", max_tokens=5, api_key=key.key_value)
            from langchain_core.messages import HumanMessage
            llm.invoke([HumanMessage(content="ping")])
        elif key.provider == "anthropic":
            from langchain_anthropic import ChatAnthropic
            llm = ChatAnthropic(model="claude-haiku-4-5-20251001", max_tokens=5, api_key=key.key_value)
            from langchain_core.messages import HumanMessage
            llm.invoke([HumanMessage(content="ping")])
        return {"valid": True, "error": None}
    except Exception as e:
        return {"valid": False, "error": str(e)[:200]}
