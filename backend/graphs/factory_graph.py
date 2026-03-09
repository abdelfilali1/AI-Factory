"""
AI Factory — LangGraph pipeline with 7 domain supervisors and 3 HITL gates.

Pipeline topology:
  veille → gate_clusters → analysis → gate_ideas → ideation
         → scoring → gate_prd → prd → gtm → feedback → END

Each domain function internally calls its 4 sub-agents in sequence.
The gate nodes use interrupt() to pause execution for human review.
"""
import json
import time
import uuid
from datetime import datetime

from langchain_core.messages import HumanMessage, SystemMessage
from langgraph.graph import StateGraph, START, END
from langgraph.types import interrupt

from .state import FactoryState
from backend.config import settings
from backend.agents.llm_factory import get_llm_sync


def _get_agent_config(agent_id: str) -> tuple[str, str, float, int]:
    """
    Reads agent config from SQLite synchronously.
    Returns (provider, model, temperature, max_tokens).
    Falls back to defaults if not found.
    """
    import sqlite3
    import os

    db_path = settings.database_url.replace("sqlite+aiosqlite:///", "")
    if not os.path.exists(db_path):
        return (settings.default_provider, settings.default_model,
                settings.default_temperature, settings.default_max_tokens)

    try:
        conn = sqlite3.connect(db_path, check_same_thread=False)
        cursor = conn.execute(
            "SELECT provider, model, temperature, max_tokens FROM agent_configs WHERE id = ?",
            (agent_id,)
        )
        row = cursor.fetchone()
        conn.close()
        if row:
            return row[0], row[1], row[2], row[3]
    except Exception:
        pass

    return (settings.default_provider, settings.default_model,
            settings.default_temperature, settings.default_max_tokens)


def _call_agent(agent_id: str, system_prompt: str, user_prompt: str) -> dict:
    """Calls an agent's LLM and returns parsed JSON dict."""
    provider, model, temperature, max_tokens = _get_agent_config(agent_id)
    llm = get_llm_sync(provider, model, temperature, max_tokens)

    messages = [
        SystemMessage(content=system_prompt),
        HumanMessage(content=user_prompt),
    ]

    response = llm.invoke(messages)
    content = response.content if hasattr(response, "content") else str(response)

    # Extract JSON from response
    try:
        if "```json" in content:
            content = content.split("```json")[1].split("```")[0].strip()
        elif "```" in content:
            content = content.split("```")[1].split("```")[0].strip()
        return json.loads(content)
    except (json.JSONDecodeError, IndexError):
        # Return raw text wrapped in a dict if JSON parsing fails
        return {"raw": content}


def _make_audit_entry(agent_id: str, agent_name: str, action: str,
                      entity_type: str, entity_id: str,
                      input_summary: str, output_summary: str,
                      latency_ms: int = 0) -> dict:
    return {
        "id": f"audit-{uuid.uuid4().hex[:8]}",
        "agentId": agent_id,
        "agentName": agent_name,
        "action": action,
        "entityType": entity_type,
        "entityId": entity_id,
        "inputSummary": input_summary,
        "outputSummary": output_summary,
        "tokensUsed": 0,
        "latencyMs": latency_ms,
        "createdAt": datetime.utcnow().isoformat(),
    }


# ─────────────────────────────────────────────
# DOMAIN 1: VEILLE
# ─────────────────────────────────────────────

def run_veille(state: FactoryState) -> dict:
    """
    Sub-agents: WebScraper, RSSReader, RedditScanner, APIConnector
    Supervisor: VeilleSupervisor aggregates and deduplicates
    """
    sources = state.get("sources", [])
    keywords = state.get("keywords", ["AI", "automation", "SaaS"])
    audit = []

    source_names = [s.get("name", s) if isinstance(s, dict) else s for s in sources]
    if not source_names:
        source_names = ["Hacker News", "Reddit r/SaaS", "IndieHackers", "Product Hunt"]

    all_documents = []

    # WebScraper sub-agent
    t0 = time.time()
    result = _call_agent(
        "veille.WebScraper",
        "You are a web scraping agent. Simulate scanning websites for pain-point-rich content. "
        "Return JSON: {\"documents\": [{id, sourceId, sourceName, title, content, url, publishedAt, tags, segment}]}",
        f"Scan these web sources: {source_names[:2]}\n"
        f"Keywords: {keywords}\n"
        "Generate 2 realistic documents with detailed pain signals (300-400 words each)."
    )
    docs = result.get("documents", [])
    all_documents.extend(docs)
    audit.append(_make_audit_entry(
        "veille.WebScraper", "WebScraper", "scan", "document",
        "batch", f"sources={source_names[:2]}", f"{len(docs)} docs",
        int((time.time() - t0) * 1000)
    ))

    # RSSReader sub-agent
    t0 = time.time()
    result = _call_agent(
        "veille.RSSReader",
        "You are an RSS feed reader agent. Simulate parsing RSS feeds for relevant articles. "
        "Return JSON: {\"documents\": [{id, sourceId, sourceName, title, content, url, publishedAt, tags, segment}]}",
        f"Parse RSS feeds from: {source_names[2:4] if len(source_names) > 2 else ['TechCrunch', 'Y Combinator Blog']}\n"
        f"Keywords: {keywords}\n"
        "Generate 1-2 realistic article documents with pain points."
    )
    docs = result.get("documents", [])
    all_documents.extend(docs)
    audit.append(_make_audit_entry(
        "veille.RSSReader", "RSSReader", "parse_rss", "document",
        "batch", f"keywords={keywords}", f"{len(docs)} docs",
        int((time.time() - t0) * 1000)
    ))

    # RedditScanner sub-agent
    t0 = time.time()
    result = _call_agent(
        "veille.RedditScanner",
        "You are a Reddit scanning agent. Simulate scanning subreddits for user pain points and complaints. "
        "Return JSON: {\"documents\": [{id, sourceId, sourceName, title, content, url, publishedAt, tags, segment}]}",
        f"Scan relevant subreddits for: {keywords}\n"
        "Generate 1-2 Reddit thread documents rich with user frustrations and workarounds."
    )
    docs = result.get("documents", [])
    all_documents.extend(docs)
    audit.append(_make_audit_entry(
        "veille.RedditScanner", "RedditScanner", "scan_reddit", "document",
        "batch", f"keywords={keywords}", f"{len(docs)} docs",
        int((time.time() - t0) * 1000)
    ))

    # VeilleSupervisor: deduplicate and assign source IDs
    for i, doc in enumerate(all_documents):
        if "id" not in doc or not doc["id"]:
            doc["id"] = f"doc-{uuid.uuid4().hex[:8]}"
        if "sourceId" not in doc:
            doc["sourceId"] = "src-scan-1"
        doc["createdAt"] = datetime.utcnow().isoformat()

    return {
        "documents": all_documents,
        "current_stage": "analysis",
        "audit_buffer": state.get("audit_buffer", []) + audit,
    }


# ─────────────────────────────────────────────
# HITL GATE 1: Approve clusters (after analysis)
# ─────────────────────────────────────────────

def gate_after_analysis(state: FactoryState) -> dict:
    """Pauses the graph for human review of clusters."""
    approval_id = f"appr-{uuid.uuid4().hex[:8]}"

    decision = interrupt({
        "gate": "approve_clusters",
        "approval_id": approval_id,
        "clusters_count": len(state.get("clusters", [])),
        "pain_points_count": len(state.get("pain_points", [])),
        "message": f"Review {len(state.get('clusters', []))} clusters from {len(state.get('pain_points', []))} pain points",
    })

    return {
        "current_gate": "approve_clusters",
        "hitl_approval_id": approval_id,
        "gate_decision": decision.get("action", "approved"),
        "gate_notes": decision.get("notes", ""),
    }


# ─────────────────────────────────────────────
# DOMAIN 2: ANALYSIS
# ─────────────────────────────────────────────

def run_analysis(state: FactoryState) -> dict:
    """
    Sub-agents: PainExtractor, Clusterer, Ranker, Validator
    """
    documents = state.get("documents", [])
    audit = []
    all_pain_points = []

    # PainExtractor: extract pain points from each document
    for doc in documents[:5]:  # limit to 5 docs per run
        t0 = time.time()
        result = _call_agent(
            "analysis.PainExtractor",
            "You are a pain point extraction specialist. Extract structured pain points from market research content. "
            "Return JSON: {\"painPoints\": [{id, documentId, role, statement, context, workaround, evidenceQuote, severity, segment}]}",
            f"Extract pain points from:\nTitle: {doc.get('title', '')}\n"
            f"Content: {doc.get('content', '')[:1500]}\n"
            f"Source: {doc.get('sourceName', '')}\n"
            f"Segment: {doc.get('segment', 'both')}\n"
            "Extract 2-3 distinct, specific pain points. Each needs severity 1-5 and direct evidence quote."
        )
        pps = result.get("painPoints", [])
        for pp in pps:
            pp["id"] = pp.get("id") or f"pp-{uuid.uuid4().hex[:8]}"
            pp["documentId"] = doc.get("id", "")
            pp["createdAt"] = datetime.utcnow().isoformat()
        all_pain_points.extend(pps)
        audit.append(_make_audit_entry(
            "analysis.PainExtractor", "PainExtractor", "extract", "pain_point",
            doc.get("id", ""), doc.get("title", "")[:80], f"{len(pps)} extracted",
            int((time.time() - t0) * 1000)
        ))

    # Clusterer: group pain points into themes
    t0 = time.time()
    result = _call_agent(
        "analysis.Clusterer",
        "You are a market research clustering agent. Group pain points into strategic opportunity clusters. "
        "Return JSON: {\"clusters\": [{id, name, theme, painPointIds, frequency, urgency, trend, status}]}",
        f"Cluster these {len(all_pain_points)} pain points into 3-5 strategic themes:\n"
        + "\n".join([f"- [{pp.get('role', '')}] {pp.get('statement', '')} (severity: {pp.get('severity', 3)}/5, id: {pp.get('id', '')})"
                     for pp in all_pain_points[:20]])
        + "\nfrequency and urgency are 0-100 scores. trend is rising|stable|falling. status='pending'."
    )
    clusters = result.get("clusters", [])
    for cluster in clusters:
        cluster["id"] = cluster.get("id") or f"cluster-{uuid.uuid4().hex[:8]}"
        cluster["createdAt"] = datetime.utcnow().isoformat()
        cluster["status"] = cluster.get("status", "pending")

    audit.append(_make_audit_entry(
        "analysis.Clusterer", "Clusterer", "cluster", "cluster",
        "batch", f"{len(all_pain_points)} pain points", f"{len(clusters)} clusters",
        int((time.time() - t0) * 1000)
    ))

    # Ranker: sort clusters by opportunity score
    t0 = time.time()
    if clusters:
        _call_agent(
            "analysis.Ranker",
            "You are an opportunity ranker. Confirm the ranking order of clusters by opportunity score (frequency × urgency). "
            "Return JSON: {\"ranked_ids\": [\"id1\", \"id2\", ...]}",
            "Clusters (already scored):\n"
            + "\n".join([f"- {c.get('name', '')}: freq={c.get('frequency', 0)}, urgency={c.get('urgency', 0)}"
                         for c in clusters])
        )
        # Sort clusters by combined score
        clusters.sort(key=lambda c: (c.get("frequency", 0) + c.get("urgency", 0)), reverse=True)

    audit.append(_make_audit_entry(
        "analysis.Ranker", "Ranker", "rank", "cluster",
        "batch", f"{len(clusters)} clusters", "ranked by opportunity",
        int((time.time() - t0) * 1000)
    ))

    # Update pain point cluster assignments
    cluster_pp_map = {}
    for cluster in clusters:
        for pp_id in cluster.get("painPointIds", []):
            cluster_pp_map[pp_id] = cluster.get("id")

    for pp in all_pain_points:
        if pp.get("id") in cluster_pp_map:
            pp["clusterId"] = cluster_pp_map[pp["id"]]

    return {
        "pain_points": state.get("pain_points", []) + all_pain_points,
        "clusters": clusters,
        "current_stage": "gate_after_analysis",
        "audit_buffer": state.get("audit_buffer", []) + audit,
    }


# ─────────────────────────────────────────────
# DOMAIN 3: IDEATION
# ─────────────────────────────────────────────

def run_ideation(state: FactoryState) -> dict:
    """
    Sub-agents: IdeaGenerator, Differentiator, PositioningAgent, MVPScopeWriter
    """
    clusters = state.get("clusters", [])
    pain_points = state.get("pain_points", [])
    audit = []
    all_ideas = []

    # Process top 2 clusters
    for cluster in clusters[:2]:
        cluster_pps = [pp for pp in pain_points if pp.get("clusterId") == cluster.get("id")]

        # IdeaGenerator
        t0 = time.time()
        result = _call_agent(
            "ideation.IdeaGenerator",
            "You are a startup ideation expert. Generate viable product/service ideas from validated pain points. "
            "Return JSON: {\"ideas\": [{id, clusterId, clusterName, type, title, description, mvpScope, positioning, differentiation, status, createdAt}]}",
            f"Generate 2-3 startup ideas for cluster: {cluster.get('name', '')}\n"
            f"Theme: {cluster.get('theme', '')}\n"
            f"Frequency: {cluster.get('frequency', 50)}/100, Urgency: {cluster.get('urgency', 50)}/100\n"
            f"Pain points:\n"
            + "\n".join([f"- [{pp.get('role', '')}] {pp.get('statement', '')} (severity: {pp.get('severity', 3)})"
                         for pp in cluster_pps[:5]])
            + "\ntypes: saas|service|automation|hybrid. status='draft'."
        )
        ideas = result.get("ideas", [])

        # Differentiator refines each idea
        for idea in ideas:
            idea["id"] = idea.get("id") or f"idea-{uuid.uuid4().hex[:8]}"
            idea["clusterId"] = cluster.get("id", "")
            idea["clusterName"] = cluster.get("name", "")
            idea["status"] = "draft"
            idea["createdAt"] = datetime.utcnow().isoformat()

        all_ideas.extend(ideas)
        audit.append(_make_audit_entry(
            "ideation.IdeaGenerator", "IdeaGenerator", "generate", "idea",
            cluster.get("id", ""), cluster.get("name", "")[:60], f"{len(ideas)} ideas",
            int((time.time() - t0) * 1000)
        ))

    return {
        "ideas": state.get("ideas", []) + all_ideas,
        "current_stage": "gate_after_ideation",
        "audit_buffer": state.get("audit_buffer", []) + audit,
    }


# ─────────────────────────────────────────────
# HITL GATE 2: Approve ideas (after ideation)
# ─────────────────────────────────────────────

def gate_after_ideation(state: FactoryState) -> dict:
    """Pauses for human selection of ideas to score."""
    approval_id = f"appr-{uuid.uuid4().hex[:8]}"

    decision = interrupt({
        "gate": "approve_ideas",
        "approval_id": approval_id,
        "ideas_count": len(state.get("ideas", [])),
        "message": f"Review {len(state.get('ideas', []))} generated ideas before scoring",
    })

    return {
        "current_gate": "approve_ideas",
        "hitl_approval_id": approval_id,
        "gate_decision": decision.get("action", "approved"),
        "gate_notes": decision.get("notes", ""),
        "selected_idea_id": decision.get("selected_idea_id"),
    }


# ─────────────────────────────────────────────
# DOMAIN 4: SCORING
# ─────────────────────────────────────────────

def run_scoring(state: FactoryState) -> dict:
    """
    Sub-agents: RubricScorer, RiskAnalyzer, MarketSizer, FeasibilityAssessor
    """
    ideas = state.get("ideas", [])
    clusters = state.get("clusters", [])
    audit = []
    all_scorecards = []

    for idea in ideas[:4]:  # Score top 4 ideas
        cluster = next((c for c in clusters if c.get("id") == idea.get("clusterId")), {})

        t0 = time.time()
        result = _call_agent(
            "scoring.RubricScorer",
            "You are an expert startup analyst. Score startup ideas using a weighted rubric. "
            "Return JSON: {\"scorecard\": {id, ideaId, scores, totalScore, rationale, riskFlags, rubricVersion, createdAt}}",
            f"Score this idea:\nTitle: {idea.get('title', '')}\n"
            f"Description: {idea.get('description', '')[:500]}\n"
            f"MVP: {idea.get('mvpScope', '')[:300]}\n"
            f"Positioning: {idea.get('positioning', '')}\n\n"
            f"Cluster: {cluster.get('name', '')} (freq={cluster.get('frequency', 50)}, urgency={cluster.get('urgency', 50)})\n\n"
            "Rubric (max points): marketSize=20, feasibility=20, timeToValue=15, riskLevel=15, strategicFit=15, differentiation=15\n"
            "Provide scores dict, totalScore (sum), 200-word rationale, and 2-4 riskFlags. rubricVersion='1.0'."
        )
        sc = result.get("scorecard", result)
        sc["id"] = sc.get("id") or f"sc-{uuid.uuid4().hex[:8]}"
        sc["ideaId"] = idea.get("id", "")
        sc["createdAt"] = datetime.utcnow().isoformat()
        sc["rubricVersion"] = "1.0"

        all_scorecards.append(sc)
        audit.append(_make_audit_entry(
            "scoring.RubricScorer", "RubricScorer", "score", "scorecard",
            idea.get("id", ""), idea.get("title", "")[:60],
            f"score={sc.get('totalScore', 0)}/100",
            int((time.time() - t0) * 1000)
        ))

    return {
        "scorecards": state.get("scorecards", []) + all_scorecards,
        "current_stage": "prd",
        "audit_buffer": state.get("audit_buffer", []) + audit,
    }


# ─────────────────────────────────────────────
# HITL GATE 3: Approve PRD (after PRD generation)
# ─────────────────────────────────────────────

def gate_after_prd(state: FactoryState) -> dict:
    """Pauses for human review of generated PRD before GTM."""
    approval_id = f"appr-{uuid.uuid4().hex[:8]}"

    decision = interrupt({
        "gate": "approve_prd",
        "approval_id": approval_id,
        "has_project": state.get("project") is not None,
        "message": "Review the generated PRD before proceeding to GTM",
    })

    return {
        "current_gate": "approve_prd",
        "hitl_approval_id": approval_id,
        "gate_decision": decision.get("action", "approved"),
        "gate_notes": decision.get("notes", ""),
    }


# ─────────────────────────────────────────────
# DOMAIN 5: PRD
# ─────────────────────────────────────────────

def run_prd(state: FactoryState) -> dict:
    """
    Sub-agents: PRDWriter, UserStoryAgent, GTMPlanner, PricingAgent
    Selects highest-scoring idea and generates full PRD.
    """
    ideas = state.get("ideas", [])
    scorecards = state.get("scorecards", [])
    audit = []

    # Select highest scoring idea (or user-selected)
    selected_id = state.get("selected_idea_id")
    if selected_id:
        idea = next((i for i in ideas if i.get("id") == selected_id), None)
    else:
        # Pick highest scoring
        idea = None
        best_score = -1
        for i in ideas:
            sc = next((s for s in scorecards if s.get("ideaId") == i.get("id")), None)
            score = sc.get("totalScore", 0) if sc else 0
            if score > best_score:
                best_score = score
                idea = i

    if not idea:
        return {"current_stage": "gtm", "audit_buffer": state.get("audit_buffer", [])}

    scorecard = next((s for s in scorecards if s.get("ideaId") == idea.get("id")), {})

    # PRDWriter
    t0 = time.time()
    result = _call_agent(
        "prd.PRDWriter",
        "You are a senior product manager. Write comprehensive PRDs that guide dev teams. "
        "Return JSON: {\"prd\": {problem, icp, solution, mvpScope, differentiation, pricingHypothesis, gtmPlan, metrics, risks, userStories}}",
        f"Generate PRD for:\nTitle: {idea.get('title', '')}\n"
        f"Description: {idea.get('description', '')[:600]}\n"
        f"MVP: {idea.get('mvpScope', '')[:400]}\n"
        f"Positioning: {idea.get('positioning', '')}\n"
        f"Score: {scorecard.get('totalScore', 0)}/100\n"
        f"Risk flags: {scorecard.get('riskFlags', [])}\n\n"
        "Include: problem (150w), icp (150w), solution (200w), mvpScope (150w), differentiation (100w), "
        "pricingHypothesis (150w), gtmPlan (200w), metrics (6-8 items), risks (4-6 items), "
        "userStories (4-6 items with acceptanceCriteria and priority must|should|could)."
    )
    prd = result.get("prd", result)
    audit.append(_make_audit_entry(
        "prd.PRDWriter", "PRDWriter", "generate_prd", "project",
        idea.get("id", ""), idea.get("title", "")[:60], "PRD generated",
        int((time.time() - t0) * 1000)
    ))

    project = {
        "id": f"proj-{uuid.uuid4().hex[:8]}",
        "ideaId": idea.get("id", ""),
        "ideaTitle": idea.get("title", ""),
        "prd": prd,
        "status": "draft",
        "createdAt": datetime.utcnow().isoformat(),
    }

    return {
        "project": project,
        "current_stage": "gate_after_prd",
        "audit_buffer": state.get("audit_buffer", []) + audit,
    }


# ─────────────────────────────────────────────
# DOMAIN 6: GTM
# ─────────────────────────────────────────────

def run_gtm(state: FactoryState) -> dict:
    """
    Sub-agents: LandingPageWriter, OutreachAgent, ContentPlanner, CampaignAnalyst
    """
    project = state.get("project")
    audit = []
    gtm_assets = []

    if not project:
        return {"gtm_assets": [], "current_stage": "feedback",
                "audit_buffer": state.get("audit_buffer", [])}

    prd = project.get("prd", {})
    asset_specs = [
        ("gtm.LandingPageWriter", "LandingPageWriter", "landing-page",
         "landing page hero + value prop copy"),
        ("gtm.OutreachAgent", "OutreachAgent", "outreach",
         "5-touch email/LinkedIn outreach sequence"),
        ("gtm.ContentPlanner", "ContentPlanner", "campaign",
         "content marketing campaign plan"),
    ]

    for agent_id, agent_name, asset_type, description in asset_specs:
        t0 = time.time()
        result = _call_agent(
            agent_id,
            f"You are a B2B marketing strategist. Create {description}. "
            "Return JSON: {\"asset\": {title, content}}",
            f"Create {description} for:\nProduct: {project.get('ideaTitle', '')}\n"
            f"Problem: {prd.get('problem', '')[:300]}\n"
            f"ICP: {prd.get('icp', '')[:300]}\n"
            f"Solution: {prd.get('solution', '')[:300]}\n"
            f"Differentiation: {prd.get('differentiation', '')[:200]}\n"
            "Content should be 400-600 words, well-structured with headers."
        )
        asset_data = result.get("asset", result)
        gtm_assets.append({
            "id": f"gtm-{uuid.uuid4().hex[:8]}",
            "projectId": project.get("id", ""),
            "type": asset_type,
            "title": asset_data.get("title", f"{description.title()} for {project.get('ideaTitle', '')}"),
            "content": asset_data.get("content", ""),
            "status": "draft",
            "createdAt": datetime.utcnow().isoformat(),
        })
        audit.append(_make_audit_entry(
            agent_id, agent_name, "generate", "gtm_asset",
            project.get("id", ""), asset_type, "asset generated",
            int((time.time() - t0) * 1000)
        ))

    return {
        "gtm_assets": gtm_assets,
        "current_stage": "feedback",
        "audit_buffer": state.get("audit_buffer", []) + audit,
    }


# ─────────────────────────────────────────────
# DOMAIN 7: FEEDBACK
# ─────────────────────────────────────────────

def run_feedback(state: FactoryState) -> dict:
    """
    Sub-agents: FeedbackIngester, SentimentAnalyzer, LearningExtractor, RoadmapPrioritizer
    """
    feedback_items = state.get("feedback_items", [])
    project = state.get("project")
    audit = []

    if not feedback_items or not project:
        return {"current_stage": "complete", "audit_buffer": state.get("audit_buffer", [])}

    t0 = time.time()
    result = _call_agent(
        "feedback.LearningExtractor",
        "You are a product learning analyst. Synthesize feedback into actionable learning reports. "
        "Return JSON: {\"report\": {id, weekOf, keyFindings, improvements, experiments, roadmapItems, createdAt}}",
        f"Synthesize {len(feedback_items)} feedback items for {project.get('ideaTitle', '')}:\n"
        + "\n".join([f"[{f.get('sentiment', 'neutral').upper()}] {f.get('content', '')[:200]}"
                     for f in feedback_items[:10]])
        + "\nkeyFindings (4-6), improvements (3-5), experiments (2-4), roadmapItems (4-6 with Q-tags)."
    )
    report = result.get("report", result)
    report["id"] = report.get("id") or f"lr-{uuid.uuid4().hex[:8]}"
    report["weekOf"] = datetime.utcnow().strftime("%Y-%m-%d")
    report["createdAt"] = datetime.utcnow().isoformat()

    audit.append(_make_audit_entry(
        "feedback.LearningExtractor", "LearningExtractor", "synthesize", "learning_report",
        report["id"], "weekly synthesis", f"{len(feedback_items)} items processed",
        int((time.time() - t0) * 1000)
    ))

    return {
        "learning_report": report,
        "current_stage": "complete",
        "audit_buffer": state.get("audit_buffer", []) + audit,
    }


# ─────────────────────────────────────────────
# ROUTING FUNCTIONS
# ─────────────────────────────────────────────

def route_after_gate1(state: FactoryState) -> str:
    return "ideation" if state.get("gate_decision") == "approved" else END


def route_after_gate2(state: FactoryState) -> str:
    return "scoring" if state.get("gate_decision") == "approved" else END


def route_after_gate3(state: FactoryState) -> str:
    return "gtm" if state.get("gate_decision") == "approved" else END


# ─────────────────────────────────────────────
# GRAPH ASSEMBLY
# ─────────────────────────────────────────────

def build_graph(checkpoint_db_path: str = "./data/checkpoints.db"):
    """Build and compile the AI Factory LangGraph pipeline."""
    import os
    import sqlite3

    os.makedirs(os.path.dirname(checkpoint_db_path) if os.path.dirname(checkpoint_db_path) else ".", exist_ok=True)

    builder = StateGraph(FactoryState)

    # Add domain nodes
    builder.add_node("veille", run_veille)
    builder.add_node("analysis", run_analysis)
    builder.add_node("gate_clusters", gate_after_analysis)
    builder.add_node("ideation", run_ideation)
    builder.add_node("gate_ideas", gate_after_ideation)
    builder.add_node("scoring", run_scoring)
    builder.add_node("prd", run_prd)
    builder.add_node("gate_prd", gate_after_prd)
    builder.add_node("gtm", run_gtm)
    builder.add_node("feedback", run_feedback)

    # Wire the graph
    builder.add_edge(START, "veille")
    builder.add_edge("veille", "analysis")
    builder.add_edge("analysis", "gate_clusters")
    builder.add_conditional_edges("gate_clusters", route_after_gate1,
                                  {"ideation": "ideation", END: END})
    builder.add_edge("ideation", "gate_ideas")
    builder.add_conditional_edges("gate_ideas", route_after_gate2,
                                  {"scoring": "scoring", END: END})
    builder.add_edge("scoring", "prd")
    builder.add_edge("prd", "gate_prd")
    builder.add_conditional_edges("gate_prd", route_after_gate3,
                                  {"gtm": "gtm", END: END})
    builder.add_edge("gtm", "feedback")
    builder.add_edge("feedback", END)

    # Compile with SQLite checkpointer for HITL persistence
    from langgraph.checkpoint.sqlite import SqliteSaver
    conn = sqlite3.connect(checkpoint_db_path, check_same_thread=False)
    checkpointer = SqliteSaver(conn)

    return builder.compile(checkpointer=checkpointer)


# Singleton graph instance (initialized on first use)
_graph = None


def get_graph():
    global _graph
    if _graph is None:
        _graph = build_graph(settings.checkpoint_db_path)
    return _graph
