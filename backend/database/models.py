from datetime import datetime
from sqlalchemy import (
    Column, String, Text, Float, Integer, Boolean, DateTime, JSON
)
from sqlalchemy.orm import DeclarativeBase


class Base(DeclarativeBase):
    pass


class Source(Base):
    __tablename__ = "sources"
    id = Column(String, primary_key=True)
    name = Column(String, nullable=False)
    url = Column(String, nullable=False)
    type = Column(String, default="web")  # 'rss' | 'web' | 'manual'
    enabled = Column(Boolean, default=True)
    compliant = Column(Boolean, default=True)
    added_at = Column(String, default=lambda: datetime.utcnow().isoformat())


class Document(Base):
    __tablename__ = "documents"
    id = Column(String, primary_key=True)
    source_id = Column(String, nullable=False)
    source_name = Column(String, nullable=False)
    title = Column(Text, nullable=False)
    content = Column(Text, nullable=False)
    url = Column(String, nullable=False)
    published_at = Column(String)
    tags = Column(JSON, default=list)
    segment = Column(String, default="both")  # 'B2B' | 'B2C' | 'both'
    created_at = Column(String, default=lambda: datetime.utcnow().isoformat())


class PainPoint(Base):
    __tablename__ = "pain_points"
    id = Column(String, primary_key=True)
    document_id = Column(String, nullable=False)
    role = Column(String, nullable=False)
    statement = Column(Text, nullable=False)
    context = Column(Text, nullable=False)
    workaround = Column(Text, nullable=False)
    evidence_quote = Column(Text, nullable=False)
    severity = Column(Integer, default=3)
    segment = Column(String, default="both")
    cluster_id = Column(String, nullable=True)
    created_at = Column(String, default=lambda: datetime.utcnow().isoformat())


class Cluster(Base):
    __tablename__ = "clusters"
    id = Column(String, primary_key=True)
    name = Column(String, nullable=False)
    theme = Column(Text, nullable=False)
    pain_point_ids = Column(JSON, default=list)
    frequency = Column(Float, default=50.0)
    urgency = Column(Float, default=50.0)
    trend = Column(String, default="stable")  # 'rising' | 'stable' | 'falling'
    status = Column(String, default="pending")  # 'pending' | 'validated' | 'rejected'
    created_at = Column(String, default=lambda: datetime.utcnow().isoformat())


class Idea(Base):
    __tablename__ = "ideas"
    id = Column(String, primary_key=True)
    cluster_id = Column(String, nullable=False)
    cluster_name = Column(String, nullable=False)
    type = Column(String, default="saas")  # 'saas' | 'service' | 'automation' | 'hybrid'
    title = Column(String, nullable=False)
    description = Column(Text, nullable=False)
    mvp_scope = Column(Text, nullable=False)
    positioning = Column(Text, nullable=False)
    differentiation = Column(Text, nullable=False)
    status = Column(String, default="draft")  # 'draft' | 'shortlisted' | 'selected' | 'rejected'
    created_at = Column(String, default=lambda: datetime.utcnow().isoformat())


class Scorecard(Base):
    __tablename__ = "scorecards"
    id = Column(String, primary_key=True)
    idea_id = Column(String, nullable=False)
    scores = Column(JSON, default=dict)
    total_score = Column(Float, default=0.0)
    rationale = Column(Text, nullable=False)
    risk_flags = Column(JSON, default=list)
    rubric_version = Column(String, default="1.0")
    ai_review = Column(JSON, nullable=True)
    created_at = Column(String, default=lambda: datetime.utcnow().isoformat())


class Project(Base):
    __tablename__ = "projects"
    id = Column(String, primary_key=True)
    idea_id = Column(String, nullable=False)
    idea_title = Column(String, nullable=False)
    prd = Column(JSON, nullable=False)
    status = Column(String, default="draft")  # 'draft' | 'approved' | 'building' | 'live'
    created_at = Column(String, default=lambda: datetime.utcnow().isoformat())


class Approval(Base):
    __tablename__ = "approvals"
    id = Column(String, primary_key=True)
    entity_type = Column(String, nullable=False)
    entity_id = Column(String, nullable=False)
    entity_title = Column(String, nullable=False)
    stage = Column(String, nullable=False)
    status = Column(String, default="pending")  # 'pending' | 'approved' | 'rejected'
    actor = Column(String, nullable=True)
    notes = Column(Text, nullable=True)
    created_at = Column(String, default=lambda: datetime.utcnow().isoformat())
    resolved_at = Column(String, nullable=True)


class AuditEntry(Base):
    __tablename__ = "audit_entries"
    id = Column(String, primary_key=True)
    agent_id = Column(String, nullable=False)
    agent_name = Column(String, nullable=False)
    action = Column(String, nullable=False)
    entity_type = Column(String, nullable=False)
    entity_id = Column(String, nullable=False)
    input_summary = Column(Text, nullable=False)
    output_summary = Column(Text, nullable=False)
    tokens_used = Column(Integer, default=0)
    latency_ms = Column(Integer, default=0)
    created_at = Column(String, default=lambda: datetime.utcnow().isoformat())


class GTMAsset(Base):
    __tablename__ = "gtm_assets"
    id = Column(String, primary_key=True)
    project_id = Column(String, nullable=False)
    type = Column(String, nullable=False)  # 'landing-page' | 'campaign' | 'outreach' | 'content-brief'
    title = Column(String, nullable=False)
    content = Column(Text, nullable=False)
    status = Column(String, default="draft")  # 'draft' | 'approved' | 'published'
    created_at = Column(String, default=lambda: datetime.utcnow().isoformat())


class FeedbackItem(Base):
    __tablename__ = "feedback_items"
    id = Column(String, primary_key=True)
    project_id = Column(String, nullable=False)
    source = Column(String, nullable=False)
    content = Column(Text, nullable=False)
    sentiment = Column(String, default="neutral")  # 'positive' | 'neutral' | 'negative'
    tags = Column(JSON, default=list)
    created_at = Column(String, default=lambda: datetime.utcnow().isoformat())


class LearningReport(Base):
    __tablename__ = "learning_reports"
    id = Column(String, primary_key=True)
    week_of = Column(String, nullable=False)
    key_findings = Column(JSON, default=list)
    improvements = Column(JSON, default=list)
    experiments = Column(JSON, default=list)
    roadmap_items = Column(JSON, default=list)
    created_at = Column(String, default=lambda: datetime.utcnow().isoformat())


class RubricWeights(Base):
    __tablename__ = "rubric_weights"
    id = Column(String, primary_key=True, default="default")
    market_size = Column(Float, default=20.0)
    feasibility = Column(Float, default=20.0)
    time_to_value = Column(Float, default=15.0)
    risk_level = Column(Float, default=15.0)
    strategic_fit = Column(Float, default=15.0)
    differentiation = Column(Float, default=15.0)
    updated_at = Column(String, default=lambda: datetime.utcnow().isoformat())


class AgentConfig(Base):
    __tablename__ = "agent_configs"
    id = Column(String, primary_key=True)          # "domain.AgentName" e.g. "veille.WebScraper"
    domain = Column(String, nullable=False)         # 'veille' | 'analysis' | 'ideation' | ...
    agent_name = Column(String, nullable=False)     # "WebScraper"
    role = Column(String, nullable=False)           # 'supervisor' | 'sub_agent'
    provider = Column(String, nullable=False, default="anthropic")
    model = Column(String, nullable=False, default="claude-haiku-4-5-20251001")
    temperature = Column(Float, default=0.7)
    max_tokens = Column(Integer, default=4096)
    system_prompt = Column(Text, nullable=True)
    updated_at = Column(String, default=lambda: datetime.utcnow().isoformat())


class ApiKey(Base):
    __tablename__ = "api_keys"
    id = Column(String, primary_key=True)
    provider = Column(String, nullable=False)   # 'openai' | 'anthropic'
    key_hint = Column(String, nullable=False)   # last 4 chars, display only
    key_value = Column(Text, nullable=False)    # stored as-is (local SQLite, no network exposure)
    is_active = Column(Boolean, default=True)
    created_at = Column(String, default=lambda: datetime.utcnow().isoformat())


class PipelineRun(Base):
    __tablename__ = "pipeline_runs"
    id = Column(String, primary_key=True)       # LangGraph thread_id
    stage = Column(String, default="veille")
    status = Column(String, default="running")  # 'running' | 'interrupted' | 'completed' | 'failed'
    gate = Column(String, nullable=True)        # current HITL gate if interrupted
    config = Column(JSON, default=dict)
    error = Column(Text, nullable=True)
    started_at = Column(String, default=lambda: datetime.utcnow().isoformat())
    updated_at = Column(String, default=lambda: datetime.utcnow().isoformat())
