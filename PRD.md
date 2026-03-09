# AI Factory — Product Requirements Document (PRD) v1.0

**Date:** March 2026
**Based on:** AI Factory Blueprint (18 Feb 2026)
**Status:** Draft

---

## 1. Product Overview

### Problem Statement
Solo builders and small teams waste enormous effort manually scanning markets, generating ideas ad-hoc, and building products without validated demand. There is no system that continuously converts market signals into ranked, evidence-backed product opportunities and executes on them with governance.

### Solution
An AI Factory web application powered by LangGraph multi-agent orchestration that runs a continuous pipeline: **market veille → pain extraction → idea generation → scoring → PRD → MVP → GTM → feedback loop**, with mandatory Human-in-the-Loop (HITL) gates at every strategic decision point.

### Core Design Principles

| Principle | Meaning |
|---|---|
| Evidence-first | Every pain/idea links to source quotes + URLs |
| Workflow + gates | Autonomous between stages; mandatory human approval before risky actions |
| Traceability | All prompts, outputs, scores, decisions stored and auditable |
| Progressive automation | Start with idea pipeline; automate build/GTM later |
| Domain isolation | Each domain has a supervisor agent + sub-agents; no cross-domain chaos |

---

## 2. Target Users

| User | Need |
|---|---|
| Solo founder / indie builder | Continuous idea radar without manual research |
| Small product team (2-5) | Shared pipeline from veille to shipped MVP |
| Internal innovation lab | Governed, auditable product experimentation |

---

## 3. Functional Requirements

### 3.1 Control Plane (Web App — Next.js)

| Feature | Description | Priority |
|---|---|---|
| Workflow Kanban | Boards for each stage (Veille → PRD → Build → GTM → Feedback) | P0 |
| Human Review Queue | Unified inbox for all HITL approval requests | P0 |
| Approval Actions | Approve / Reject / Edit with notes per item | P0 |
| Configuration Panel | Target segments, sources, keywords, scoring rubric weights, budgets, no-go rules | P0 |
| Audit Log | Every agent run, output, score, decision with full trace | P0 |
| Prompt Manager | Version-controlled prompts and rubric configs per agent | P1 |
| Opportunity Map | Visual cluster map with frequency + urgency heat | P1 |
| Idea Backlog | Sortable ranked table with scores and evidence links | P0 |
| PRD Viewer | Rendered PRD with export to Markdown/PDF | P0 |
| Analytics Dashboard | Pipeline velocity, approval rates, idea-to-MVP conversion | P2 |

### 3.2 Execution Plane (LangGraph Agents)

Full agent hierarchy defined in Section 5.

### 3.3 Workflow Stages & HITL Gates

| Stage | Trigger | HITL Gate | Output |
|---|---|---|---|
| A — Market Veille | Scheduled (daily) | Approve/block sources & keywords | Market Feed |
| B — Pain Extraction | After veille run | Validate clusters: merge/split/rename | Pain Point Cards + Opportunity Map |
| C — Idea Generation | After B approval | Shortlist ideas; reject constraint violations | Idea Backlog |
| D — Idea Scoring | After C | Adjust rubric weights; override scores with notes | Scored Idea Scorecards |
| E — PRD Generation | Human selects idea | Approve scope + success metrics | PRD v1 + build backlog |
| F — MVP Build | After E approval | Approve repo creation, code, deploy to prod | Running MVP URL |
| G — GTM Execution | After F | Approve brand voice, outbound messages, paid spend | Landing page, campaigns, CRM |
| H — Feedback Loop | Weekly | Pick roadmap items + iteration priorities | Learning Report + sprint plan |

---

## 4. Non-Functional Requirements

| Requirement | Target |
|---|---|
| HITL response time | Approvals surfaced in <5 min of agent completion |
| Traceability | 100% of agent runs stored with input/output/model metadata |
| Source compliance | Strict allowlist; no scraping of non-compliant sites |
| Outbound gating | Zero outbound messages sent without explicit human approval |
| GDPR | All lead data approval-gated + logged; PII handling documented |
| Auditability | Full diff history on prompts, rubrics, scores |

---

## 5. Agent & Sub-Agent Architecture (LangGraph)

### Architecture Pattern

```
SupervisorGraph (top-level LangGraph StateGraph)
  ├─ Domain Supervisor Node  →  routes to sub-agent subgraph
  │     └─ SubAgent SubGraph (nested StateGraph per sub-agent)
  └─ HITL Interrupt Node     →  suspends graph; resumes on human signal
```

Each domain is a **LangGraph subgraph** with its own `StateGraph`. The top-level graph is a **supervisor graph** that routes between domains. HITL gates use LangGraph's `interrupt()` primitive to suspend execution until a human approves via the web app.

---

### Domain 1 — Market Intelligence

**Supervisor:** `MarketIntelligenceSupervisor`
- Routes tasks to sub-agents based on source type and task
- Aggregates outputs into normalized Market Feed
- HITL Gate: source/keyword approval before any new source is activated

| Sub-Agent | Role | Tools |
|---|---|---|
| `MarketScoutAgent` | Crawls approved sources (RSS, HN, Reddit, ProductHunt, G2, Capterra, job boards, changelogs) | Tavily Search, RSS parser, web scraper |
| `TrendDetectorAgent` | Identifies rising topics, anomalies, velocity spikes in the feed | Embedding similarity, time-series stats |
| `CompetitorMapperAgent` | Maps competitors per cluster: pricing signals, feature gaps, substitutes | Web search, structured extraction |
| `SourceCuratorAgent` | Manages allowlist/blocklist; validates new sources for compliance | Source metadata DB, compliance rules |

**LangGraph State:**
```python
class MarketIntelligenceState(TypedDict):
    sources: list[Source]
    raw_documents: list[Document]
    trend_signals: list[TrendSignal]
    competitor_maps: list[CompetitorMap]
    hitl_pending: bool
    approved_sources: list[str]
```

---

### Domain 2 — Insight & Pain Analysis

**Supervisor:** `InsightAnalysisSupervisor`
- Processes raw Market Feed into structured pain points
- Builds and maintains the Opportunity Map
- HITL Gate: cluster validation (rename, merge, split, reject)

| Sub-Agent | Role | Tools |
|---|---|---|
| `PainExtractorAgent` | Extracts: user role, pain statement, trigger context, workaround, evidence quote | Claude/GPT structured output (Pydantic schema) |
| `ClusterBuilderAgent` | Groups pain points into themes via embeddings + HDBSCAN/k-means | pgvector, scikit-learn |
| `EvidenceValidatorAgent` | Scores evidence quality; flags weak/unsourced pain points | Retrieval check, source quality heuristics |
| `OpportunityRankerAgent` | Scores clusters by frequency, urgency, trend velocity | Statistical aggregation |

**LangGraph State:**
```python
class InsightAnalysisState(TypedDict):
    documents: list[Document]
    pain_point_cards: list[PainPointCard]
    clusters: list[Cluster]
    opportunity_map: OpportunityMap
    hitl_pending: bool
    human_cluster_edits: list[ClusterEdit]
```

---

### Domain 3 — Ideation & Strategy

**Supervisor:** `IdeationSupervisor`
- Generates and scores ideas per approved cluster
- Manages the idea pipeline and portfolio balance
- HITL Gates: idea shortlist approval; score weight overrides; PRD sign-off

| Sub-Agent | Role | Tools |
|---|---|---|
| `IdeaGeneratorAgent` | Generates N ideas per cluster: service, SaaS, automation, hybrid — with MVP scope and positioning | LLM generation with cluster context |
| `IdeaScoringAgent` | Scores ideas on rubric: market size, feasibility, speed, risk, fit, differentiation | Configurable rubric (weights stored in DB) |
| `PortfolioManagerAgent` | Maintains a balanced pipeline; flags over-concentration by segment/risk | Portfolio analytics |
| `PRDWriterAgent` | Generates full PRD: problem/ICP, solution, MVP scope, differentiation, pricing hypothesis, GTM plan, metrics, risks | LLM generation with structured schema |

**Scoring Rubric (editable via UI):**

| Criteria | Default Weight |
|---|---|
| Market Size | 20% |
| Feasibility | 20% |
| Time-to-Value | 15% |
| Risk Level | 15% |
| Strategic Fit | 15% |
| Differentiation | 15% |

**LangGraph State:**
```python
class IdeationState(TypedDict):
    clusters: list[Cluster]
    ideas: list[Idea]
    scorecards: list[Scorecard]
    portfolio_view: PortfolioView
    selected_idea: Idea | None
    prd: PRD | None
    hitl_pending: bool
    human_shortlist: list[str]  # idea IDs
    rubric_weights: dict[str, float]
```

---

### Domain 4 — Build & Engineering

**Supervisor:** `BuildSupervisor`
- Template-based MVP generation from approved PRD
- Enforces approval gates before every deploy
- HITL Gates: repo creation, code changes, staging deploy, production deploy

| Sub-Agent | Role | Tools |
|---|---|---|
| `MVPArchitectAgent` | Selects template, designs schema, endpoint list, UI page map from PRD | Template library, schema generator |
| `CodeGeneratorAgent` | Fills template: schema migrations, API endpoints, UI components, tests | Code generation LLM, Git API |
| `QASafetyAgent` | Runs security checks (OWASP basics), linting, type checks; blocks risky releases | Bandit, ESLint, pytest, Semgrep |
| `DeployAgent` | Deploys to staging → runs smoke tests → awaits approval → production | Vercel/Railway/Fly.io API, env var manager |

**LangGraph State:**
```python
class BuildState(TypedDict):
    prd: PRD
    selected_template: Template
    repo_url: str | None
    staging_url: str | None
    prod_url: str | None
    qa_report: QAReport | None
    hitl_pending: bool
    approval_stage: Literal["repo", "code", "staging", "production"]
```

---

### Domain 5 — Go-to-Market

**Supervisor:** `GTMSupervisor`
- Generates all GTM assets from the approved PRD + MVP
- Hard approval gate on ALL outbound actions
- HITL Gates: brand voice approval, any outbound message, any paid spend

| Sub-Agent | Role | Tools |
|---|---|---|
| `ContentStrategistAgent` | Landing page copy variants, content briefs, blog outlines, ad copy | LLM generation, brand guidelines |
| `CampaignPlannerAgent` | Experiment plans, A/B test hypotheses, channel recommendations | Analytics data, market data |
| `LeadQualifierAgent` | ICP matching, lead scoring, CRM pipeline updates | CRM API (HubSpot/Attio), web enrichment |
| `OutreachDrafterAgent` | Personalized outreach sequences (email, LinkedIn) — draft only, never sends autonomously | LLM generation, contact data |

**LangGraph State:**
```python
class GTMState(TypedDict):
    prd: PRD
    mvp_url: str
    landing_page_variants: list[LandingPageVariant]
    campaign_plans: list[CampaignPlan]
    leads: list[Lead]
    outreach_drafts: list[OutreachDraft]
    hitl_pending: bool
    approved_assets: list[str]
```

---

### Domain 6 — Customer & Feedback

**Supervisor:** `CustomerFeedbackSupervisor`
- Closes the loop from usage signals back to roadmap
- Weekly synthesis cycle
- HITL Gate: roadmap item selection + iteration priority decision

| Sub-Agent | Role | Tools |
|---|---|---|
| `FeedbackAggregatorAgent` | Collects and normalizes: form submissions, support tickets, call notes, review sites | Webhook ingestion, Typeform, Intercom |
| `ChurnDetectorAgent` | Identifies disengagement signals and at-risk accounts | Usage analytics, cohort analysis |
| `ImprovementRecommenderAgent` | Proposes prioritized roadmap items from feedback patterns | LLM synthesis, pain-to-feature mapping |
| `LearningSynthesizerAgent` | Generates weekly Learning Report: key findings, experiments, updated rubric weights | Report generator, LLM summarization |

---

### Domain 7 — Governance & Compliance

**Supervisor:** `GovernanceSupervisor`
- Cross-cutting; invoked by all other supervisors before any side effect
- Cannot be bypassed
- Runs synchronously as a guard node in the top-level graph

| Sub-Agent | Role | Tools |
|---|---|---|
| `PolicyEnforcerAgent` | Validates action against approval rules; blocks unapproved side effects | Rules engine, approval DB |
| `ComplianceCheckerAgent` | Checks outbound actions for GDPR/CAN-SPAM compliance | Compliance rule set, PII detector |
| `AuditLoggerAgent` | Writes immutable audit record for every agent decision and action | Postgres append-only log |
| `BudgetGuardAgent` | Tracks spend vs. approved budget; blocks overage actions | Budget tracker, spend API |

---

### Top-Level LangGraph Graph

```
[START]
   │
   ▼
[Router Node]  ←─── human signal (resume after HITL)
   │
   ├──► MarketIntelligenceSupervisor ──► [HITL Gate A]
   │                                          │ approved
   ├──► InsightAnalysisSupervisor    ◄─────────┘
   │         │
   │    [HITL Gate B]
   │         │ approved
   ├──► IdeationSupervisor           ◄─────────┘
   │         │
   │    [HITL Gate C/D/E]
   │         │ approved
   ├──► BuildSupervisor              ◄─────────┘
   │         │
   │    [HITL Gate F]
   │         │ approved
   ├──► GTMSupervisor                ◄─────────┘
   │         │
   │    [HITL Gate G]
   │         │ approved
   └──► CustomerFeedbackSupervisor   ◄─────────┘
              │
         [HITL Gate H]
              │ → back to Router (continuous loop)
```

Every domain supervisor calls `GovernanceSupervisor` as a guard before any write or external action.

---

## 6. Tech Stack

| Layer | Technology | Reason |
|---|---|---|
| Frontend | Next.js 15 (TypeScript, App Router) | SSR, real-time updates, shadcn/ui |
| Backend API | Python + FastAPI | Agent services, structured outputs |
| Agent Orchestration | LangGraph (Python) | Stateful multi-agent graphs, HITL interrupts, subgraphs per domain |
| LLM | claude-sonnet-4-6 (default) / claude-opus-4-6 (PRD/scoring) | Latest capability, structured output |
| Database | PostgreSQL + pgvector | Relational records + semantic search |
| Object Storage | S3-compatible | Artifacts, documents, PRD exports |
| Task Queue | Redis + Celery (or LangGraph's built-in persistence) | Scheduled veille, async agent runs |
| Observability | LangSmith (LangGraph native tracing) | Agent traces, run inspection |
| Auth | NextAuth.js | User sessions |
| Deployment | Docker Compose (local) → Vercel (web) + Railway/Fly.io (API) | Progressive deployment |

---

## 7. Data Storage Architecture

### PostgreSQL — Primary Database (structured data)
Everything that is a record, entity, or decision:
- `sources` — approved/blocked source list, compliance notes
- `documents` — ingested market feed items + metadata
- `pain_points` — extracted structured pain cards
- `clusters` — grouped themes + human edits
- `ideas` — generated ideas per cluster
- `scorecards` — scores, rationale, risk flags, rubric version
- `projects` — selected ideas + PRD data
- `approvals` — every HITL decision (who, when, action, notes)
- `audit_log` — immutable append-only agent action log
- `artifacts` — versioned agent outputs (diffs over time)
- `prompt_versions` — every prompt + rubric config change
- `budget_tracker` — spend records per agent/action

### pgvector (Postgres extension) — Vector Store
- `document_embeddings` — raw market feed docs
- `pain_point_embeddings` — for clustering via similarity
- `idea_embeddings` — for deduplication + portfolio analysis
- `cluster_centroids` — for assigning new pains to clusters

### S3-compatible Object Storage — Artifact Store
- `raw_html/` — scraped document originals
- `prd_exports/` — PRD as Markdown + PDF
- `mvp_artifacts/` — generated code zips, release notes
- `landing_pages/` — generated copy variants
- `reports/` — weekly Learning Reports
- `prompt_snapshots/` — full prompt text (DB stores only hash + ref)

### Redis — Ephemeral / Operational State
- `agent_run_queue` — pending agent tasks
- `session_cache` — user session data
- `rate_limit_counters` — per source, per agent, per user
- `hitl_notification` — pub/sub for real-time approval alerts to UI
- `workflow_locks` — prevent duplicate runs of same workflow

### LangGraph Checkpointer (Postgres-backed) — Workflow State
- `graph_checkpoints` — full state snapshot at each node
- `thread_id` — links a user session to a running graph
- `interrupt_state` — frozen graph state waiting for human approval
- `resume_signals` — human decision that unfreezes the graph

### LangSmith — Observability (external SaaS)
Agent traces and debugging only — no business data:
- `agent_traces` — every LLM call: input, output, latency, tokens
- `run_trees` — full subgraph execution tree per workflow run
- `prompt_playground` — test prompts against stored versions

### Data Storage Summary

| What | Where | Why |
|---|---|---|
| Entities (pains, ideas, PRDs, approvals) | PostgreSQL | Relational, queryable, ACID |
| Embeddings for clustering/search | pgvector (Postgres ext.) | Co-located with metadata |
| Large files, exports, raw docs | S3-compatible storage | Cheap, scalable blob store |
| Queues, locks, cache, real-time | Redis | Fast, ephemeral |
| LangGraph workflow state + HITL pauses | Postgres (LangGraph PostgresSaver) | Durable, resumable |
| Agent traces and LLM call logs | LangSmith | Observability only |

---

## 8. Data Model (Core Entities)

```
sources          → id, url, type, allowlisted, compliance_notes
documents        → id, source_id, content, metadata, embedding, hash
pain_points      → id, document_id, role, statement, context, workaround, evidence_quote, severity
clusters         → id, name, theme, pain_point_ids[], frequency, urgency, status
ideas            → id, cluster_id, type, title, description, mvp_scope, positioning
scorecards       → id, idea_id, scores{}, total_score, rationale, risk_flags, rubric_version
projects         → id, idea_id, scorecard_id, prd{}, status
artifacts        → id, project_id, type, content, version, created_at
approvals        → id, entity_type, entity_id, status, actor, notes, timestamp
audit_log        → id, agent_id, action, input_hash, output_hash, decision, timestamp
```

---

## 9. Build Phases

### Phase 1 — Factory MVP (Idea Radar)
**Goal:** Working pipeline from veille → ranked ideas → PRD

- Monorepo setup: `/apps/web`, `/services/api`, `/services/agents`
- LangGraph graph skeleton with HITL interrupt nodes
- Domain 1 (Market Intelligence) + Domain 2 (Insight Analysis)
- Domain 3 (Ideation + Scoring + PRD Writer)
- Web app: Kanban, approval queue, idea backlog, PRD viewer
- Governance domain (Audit + Policy)

**Deliverable:** Internal tool producing weekly ranked ideas + PRDs

### Phase 2 — Build Engine
**Goal:** Template-based MVP generation + deploy

- Domain 4 (Build & Engineering) with 1 template (Next.js + auth + CRUD)
- QA safety checks, staging pipeline, prod deploy gate
- Analytics + feedback capture embedded in MVP template

**Deliverable:** Constrained, repeatable MVP generation

### Phase 3 — GTM Engine
**Goal:** GTM kit ships with every MVP

- Domain 5 (GTM): landing page generator, outreach drafts, CRM integration
- All outbound actions HITL-gated + compliance-checked

**Deliverable:** Each MVP ships with landing page + managed lead pipeline

### Phase 4 — Feedback Loop + Hardening
**Goal:** Closed loop from usage to roadmap

- Domain 6 (Customer & Feedback): weekly Learning Reports
- Domain 7 hardening: rate limits, budget guards, permission model
- Rubric self-improvement from feedback signals

**Deliverable:** Self-improving factory with governance

---

## 10. Success Metrics

| Metric | Phase 1 Target |
|---|---|
| Pain points extracted per week | > 50 from approved sources |
| Ideas generated per cluster | 3-5 with scores |
| PRD generation time | < 5 min after idea selection |
| HITL approval queue latency | < 24h human response time |
| Idea-to-shortlist conversion | Track from day 1 |
| Audit coverage | 100% of agent actions logged |

---

## 11. Key Risks & Mitigations

| Risk | Mitigation |
|---|---|
| Agent hallucination in pain/idea extraction | Evidence-first: every output requires source quote; validator sub-agent rejects ungrounded output |
| Outbound compliance breach | Zero autonomous outbound; Governance domain blocks at graph level |
| LLM cost overrun | Budget guard agent; haiku for extraction, sonnet for scoring, opus for PRD only |
| Agent chaos / unpredictable behavior | Domain isolation via subgraphs; supervisor-only cross-domain routing |
| Source compliance (scraping) | Strict allowlist managed by SourceCuratorAgent; no scraping without explicit permission |

---

## 12. Agent Hierarchy Summary

```
AI Factory (LangGraph Top-Level Graph)
│
├── Domain 1: Market Intelligence
│   ├── MarketScoutAgent
│   ├── TrendDetectorAgent
│   ├── CompetitorMapperAgent
│   └── SourceCuratorAgent
│
├── Domain 2: Insight & Pain Analysis
│   ├── PainExtractorAgent
│   ├── ClusterBuilderAgent
│   ├── EvidenceValidatorAgent
│   └── OpportunityRankerAgent
│
├── Domain 3: Ideation & Strategy
│   ├── IdeaGeneratorAgent
│   ├── IdeaScoringAgent
│   ├── PortfolioManagerAgent
│   └── PRDWriterAgent
│
├── Domain 4: Build & Engineering
│   ├── MVPArchitectAgent
│   ├── CodeGeneratorAgent
│   ├── QASafetyAgent
│   └── DeployAgent
│
├── Domain 5: Go-to-Market
│   ├── ContentStrategistAgent
│   ├── CampaignPlannerAgent
│   ├── LeadQualifierAgent
│   └── OutreachDrafterAgent
│
├── Domain 6: Customer & Feedback
│   ├── FeedbackAggregatorAgent
│   ├── ChurnDetectorAgent
│   ├── ImprovementRecommenderAgent
│   └── LearningSynthesizerAgent
│
└── Domain 7: Governance & Compliance (cross-cutting guard)
    ├── PolicyEnforcerAgent
    ├── ComplianceCheckerAgent
    ├── AuditLoggerAgent
    └── BudgetGuardAgent
```

**7 domain supervisors · 28 sub-agents · 8 HITL gates · 1 governance layer**

---

*PRD v1.0 — AI Factory — Generated March 2026*
