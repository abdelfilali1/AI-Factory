"""
LLM Factory — resolves the configured LLM for a given agent at runtime.
Reads agent config from SQLite so changes take effect without restart.
"""
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from backend.database.models import AgentConfig
from backend.config import settings, OPENAI_MODELS, ANTHROPIC_MODELS


async def get_llm(agent_id: str, db: AsyncSession):
    """
    Returns a configured LangChain chat model for the given agent.
    agent_id format: "domain.AgentName"  e.g. "veille.WebScraper"

    Falls back to settings.default_* if no DB record exists.
    """
    result = await db.execute(
        select(AgentConfig).where(AgentConfig.id == agent_id)
    )
    config = result.scalar_one_or_none()

    if config is not None:
        provider = config.provider
        model = config.model
        temperature = config.temperature
        max_tokens = config.max_tokens
    else:
        provider = settings.default_provider
        model = settings.default_model
        temperature = settings.default_temperature
        max_tokens = settings.default_max_tokens

    return _build_llm(provider, model, temperature, max_tokens)


def get_llm_sync(provider: str, model: str, temperature: float = 0.7, max_tokens: int = 4096):
    """Synchronous version for use inside LangGraph node functions."""
    return _build_llm(provider, model, temperature, max_tokens)


def _build_llm(provider: str, model: str, temperature: float, max_tokens: int):
    if provider == "openai" or model in OPENAI_MODELS:
        from langchain_openai import ChatOpenAI
        api_key = settings.openai_api_key or None
        return ChatOpenAI(
            model=model,
            temperature=temperature,
            max_tokens=max_tokens,
            api_key=api_key,
        )
    elif provider == "anthropic" or model in ANTHROPIC_MODELS:
        from langchain_anthropic import ChatAnthropic
        api_key = settings.anthropic_api_key or None
        return ChatAnthropic(
            model=model,
            temperature=temperature,
            max_tokens=max_tokens,
            api_key=api_key,
        )
    else:
        raise ValueError(f"Unknown provider/model: {provider}/{model}")


def get_provider_for_model(model: str) -> str:
    if model in OPENAI_MODELS:
        return "openai"
    if model in ANTHROPIC_MODELS:
        return "anthropic"
    raise ValueError(f"Cannot determine provider for model: {model}")
