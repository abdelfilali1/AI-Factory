import os
from datetime import datetime
from typing import AsyncGenerator
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy import select, insert
from .models import Base, AgentConfig, RubricWeights

# Ensure data directory exists
os.makedirs("data", exist_ok=True)

from backend.config import settings

engine = create_async_engine(settings.database_url, echo=False)
AsyncSessionLocal = async_sessionmaker(engine, expire_on_commit=False)


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    async with AsyncSessionLocal() as session:
        yield session


# Default agent configurations: 7 domains × (1 supervisor + 4 sub-agents) = 35 agents
_DEFAULT_AGENTS = [
    # Veille domain
    ("veille", "VeilleSupervisor", "supervisor", "anthropic", "claude-sonnet-4-6"),
    ("veille", "WebScraper", "sub_agent", "anthropic", "claude-haiku-4-5-20251001"),
    ("veille", "RSSReader", "sub_agent", "anthropic", "claude-haiku-4-5-20251001"),
    ("veille", "RedditScanner", "sub_agent", "anthropic", "claude-haiku-4-5-20251001"),
    ("veille", "APIConnector", "sub_agent", "anthropic", "claude-haiku-4-5-20251001"),
    # Analysis domain
    ("analysis", "AnalysisSupervisor", "supervisor", "anthropic", "claude-sonnet-4-6"),
    ("analysis", "PainExtractor", "sub_agent", "anthropic", "claude-haiku-4-5-20251001"),
    ("analysis", "Clusterer", "sub_agent", "anthropic", "claude-sonnet-4-6"),
    ("analysis", "Ranker", "sub_agent", "anthropic", "claude-haiku-4-5-20251001"),
    ("analysis", "Validator", "sub_agent", "anthropic", "claude-sonnet-4-6"),
    # Ideation domain
    ("ideation", "IdeationSupervisor", "supervisor", "anthropic", "claude-sonnet-4-6"),
    ("ideation", "IdeaGenerator", "sub_agent", "anthropic", "claude-sonnet-4-6"),
    ("ideation", "Differentiator", "sub_agent", "anthropic", "claude-sonnet-4-6"),
    ("ideation", "PositioningAgent", "sub_agent", "anthropic", "claude-sonnet-4-6"),
    ("ideation", "MVPScopeWriter", "sub_agent", "anthropic", "claude-sonnet-4-6"),
    # Scoring domain
    ("scoring", "ScoringSupervisor", "supervisor", "anthropic", "claude-sonnet-4-6"),
    ("scoring", "RubricScorer", "sub_agent", "anthropic", "claude-sonnet-4-6"),
    ("scoring", "RiskAnalyzer", "sub_agent", "anthropic", "claude-sonnet-4-6"),
    ("scoring", "MarketSizer", "sub_agent", "anthropic", "claude-haiku-4-5-20251001"),
    ("scoring", "FeasibilityAssessor", "sub_agent", "anthropic", "claude-sonnet-4-6"),
    # PRD domain
    ("prd", "PRDSupervisor", "supervisor", "anthropic", "claude-opus-4-6"),
    ("prd", "PRDWriter", "sub_agent", "anthropic", "claude-opus-4-6"),
    ("prd", "UserStoryAgent", "sub_agent", "anthropic", "claude-sonnet-4-6"),
    ("prd", "GTMPlanner", "sub_agent", "anthropic", "claude-sonnet-4-6"),
    ("prd", "PricingAgent", "sub_agent", "anthropic", "claude-sonnet-4-6"),
    # GTM domain
    ("gtm", "GTMSupervisor", "supervisor", "anthropic", "claude-sonnet-4-6"),
    ("gtm", "LandingPageWriter", "sub_agent", "anthropic", "claude-sonnet-4-6"),
    ("gtm", "OutreachAgent", "sub_agent", "anthropic", "claude-sonnet-4-6"),
    ("gtm", "ContentPlanner", "sub_agent", "anthropic", "claude-sonnet-4-6"),
    ("gtm", "CampaignAnalyst", "sub_agent", "anthropic", "claude-haiku-4-5-20251001"),
    # Feedback domain
    ("feedback", "FeedbackSupervisor", "supervisor", "anthropic", "claude-sonnet-4-6"),
    ("feedback", "FeedbackIngester", "sub_agent", "anthropic", "claude-haiku-4-5-20251001"),
    ("feedback", "SentimentAnalyzer", "sub_agent", "anthropic", "claude-haiku-4-5-20251001"),
    ("feedback", "LearningExtractor", "sub_agent", "anthropic", "claude-sonnet-4-6"),
    ("feedback", "RoadmapPrioritizer", "sub_agent", "anthropic", "claude-sonnet-4-6"),
]


async def _seed_defaults(session: AsyncSession) -> None:
    now = datetime.utcnow().isoformat()

    # Seed agent configs (INSERT OR IGNORE equivalent)
    for domain, name, role, provider, model in _DEFAULT_AGENTS:
        agent_id = f"{domain}.{name}"
        existing = await session.get(AgentConfig, agent_id)
        if existing is None:
            session.add(AgentConfig(
                id=agent_id,
                domain=domain,
                agent_name=name,
                role=role,
                provider=provider,
                model=model,
                temperature=0.7,
                max_tokens=4096,
                updated_at=now,
            ))

    # Seed rubric weights
    existing_rubric = await session.get(RubricWeights, "default")
    if existing_rubric is None:
        session.add(RubricWeights(
            id="default",
            market_size=20.0,
            feasibility=20.0,
            time_to_value=15.0,
            risk_level=15.0,
            strategic_fit=15.0,
            differentiation=15.0,
            updated_at=now,
        ))

    await session.commit()


async def init_db() -> None:
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    async with AsyncSessionLocal() as session:
        await _seed_defaults(session)
