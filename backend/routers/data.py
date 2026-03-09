"""
Data CRUD router — replaces the Zustand mock data with SQLite persistence.
All frontend store reads/writes map to endpoints here.
"""
import uuid
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from pydantic import BaseModel
from typing import Optional

from backend.database.connection import get_db
from backend.database.models import (
    Source, Document, PainPoint, Cluster, Idea, Scorecard, Project,
    Approval, AuditEntry, GTMAsset, FeedbackItem, LearningReport, RubricWeights
)

router = APIRouter()

now = lambda: datetime.utcnow().isoformat()


# ─────── SOURCES ───────

class SourceCreate(BaseModel):
    name: str
    url: str
    type: str = "web"
    enabled: bool = True
    compliant: bool = True


@router.get("/sources")
async def list_sources(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Source).order_by(Source.added_at.desc()))
    return [{"id": s.id, "name": s.name, "url": s.url, "type": s.type,
             "enabled": s.enabled, "compliant": s.compliant, "addedAt": s.added_at}
            for s in result.scalars().all()]


@router.post("/sources")
async def create_source(body: SourceCreate, db: AsyncSession = Depends(get_db)):
    source = Source(id=str(uuid.uuid4()), added_at=now(), **body.model_dump())
    db.add(source)
    await db.commit()
    return {"id": source.id, "name": source.name, "url": source.url, "type": source.type,
            "enabled": source.enabled, "compliant": source.compliant, "addedAt": source.added_at}


@router.patch("/sources/{source_id}")
async def update_source(source_id: str, body: dict, db: AsyncSession = Depends(get_db)):
    source = await db.get(Source, source_id)
    if not source:
        raise HTTPException(status_code=404, detail="Source not found")
    for k, v in body.items():
        if hasattr(source, k):
            setattr(source, k, v)
    await db.commit()
    return {"id": source.id, "enabled": source.enabled}


@router.delete("/sources/{source_id}")
async def delete_source(source_id: str, db: AsyncSession = Depends(get_db)):
    source = await db.get(Source, source_id)
    if not source:
        raise HTTPException(status_code=404, detail="Source not found")
    await db.delete(source)
    await db.commit()
    return {"deleted": True}


# ─────── DOCUMENTS ───────

@router.get("/documents")
async def list_documents(
    limit: int = Query(50, le=200),
    offset: int = 0,
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Document).order_by(Document.created_at.desc()).limit(limit).offset(offset)
    )
    return [{"id": d.id, "sourceId": d.source_id, "sourceName": d.source_name,
             "title": d.title, "content": d.content, "url": d.url,
             "publishedAt": d.published_at, "tags": d.tags, "segment": d.segment}
            for d in result.scalars().all()]


@router.get("/documents/{doc_id}")
async def get_document(doc_id: str, db: AsyncSession = Depends(get_db)):
    doc = await db.get(Document, doc_id)
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    return {"id": doc.id, "sourceId": doc.source_id, "sourceName": doc.source_name,
            "title": doc.title, "content": doc.content, "url": doc.url,
            "publishedAt": doc.published_at, "tags": doc.tags, "segment": doc.segment}


# ─────── PAIN POINTS ───────

@router.get("/pain-points")
async def list_pain_points(
    cluster_id: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
):
    query = select(PainPoint).order_by(PainPoint.created_at.desc())
    if cluster_id:
        query = query.where(PainPoint.cluster_id == cluster_id)
    result = await db.execute(query)
    return [{"id": pp.id, "documentId": pp.document_id, "role": pp.role,
             "statement": pp.statement, "context": pp.context, "workaround": pp.workaround,
             "evidenceQuote": pp.evidence_quote, "severity": pp.severity,
             "segment": pp.segment, "clusterId": pp.cluster_id, "createdAt": pp.created_at}
            for pp in result.scalars().all()]


# ─────── CLUSTERS ───────

@router.get("/clusters")
async def list_clusters(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Cluster).order_by(Cluster.created_at.desc()))
    return [{"id": c.id, "name": c.name, "theme": c.theme, "painPointIds": c.pain_point_ids,
             "frequency": c.frequency, "urgency": c.urgency, "trend": c.trend,
             "status": c.status, "createdAt": c.created_at}
            for c in result.scalars().all()]


@router.patch("/clusters/{cluster_id}")
async def update_cluster(cluster_id: str, body: dict, db: AsyncSession = Depends(get_db)):
    cluster = await db.get(Cluster, cluster_id)
    if not cluster:
        raise HTTPException(status_code=404, detail="Cluster not found")
    allowed = {"name", "theme", "status", "trend", "frequency", "urgency"}
    for k, v in body.items():
        if k in allowed:
            setattr(cluster, k, v)
    await db.commit()
    return {"id": cluster.id, "status": cluster.status}


# ─────── IDEAS ───────

@router.get("/ideas")
async def list_ideas(
    cluster_id: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
):
    query = select(Idea).order_by(Idea.created_at.desc())
    if cluster_id:
        query = query.where(Idea.cluster_id == cluster_id)
    result = await db.execute(query)
    return [{"id": i.id, "clusterId": i.cluster_id, "clusterName": i.cluster_name,
             "type": i.type, "title": i.title, "description": i.description,
             "mvpScope": i.mvp_scope, "positioning": i.positioning,
             "differentiation": i.differentiation, "status": i.status, "createdAt": i.created_at}
            for i in result.scalars().all()]


@router.get("/ideas/{idea_id}")
async def get_idea(idea_id: str, db: AsyncSession = Depends(get_db)):
    idea = await db.get(Idea, idea_id)
    if not idea:
        raise HTTPException(status_code=404, detail="Idea not found")
    return {"id": idea.id, "clusterId": idea.cluster_id, "clusterName": idea.cluster_name,
            "type": idea.type, "title": idea.title, "description": idea.description,
            "mvpScope": idea.mvp_scope, "positioning": idea.positioning,
            "differentiation": idea.differentiation, "status": idea.status, "createdAt": idea.created_at}


@router.patch("/ideas/{idea_id}")
async def update_idea(idea_id: str, body: dict, db: AsyncSession = Depends(get_db)):
    idea = await db.get(Idea, idea_id)
    if not idea:
        raise HTTPException(status_code=404, detail="Idea not found")
    if "status" in body:
        idea.status = body["status"]
    await db.commit()
    return {"id": idea.id, "status": idea.status}


# ─────── SCORECARDS ───────

@router.get("/scorecards")
async def list_scorecards(
    idea_id: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
):
    query = select(Scorecard).order_by(Scorecard.created_at.desc())
    if idea_id:
        query = query.where(Scorecard.idea_id == idea_id)
    result = await db.execute(query)
    return [{"id": sc.id, "ideaId": sc.idea_id, "scores": sc.scores,
             "totalScore": sc.total_score, "rationale": sc.rationale,
             "riskFlags": sc.risk_flags, "rubricVersion": sc.rubric_version,
             "aiReview": sc.ai_review, "createdAt": sc.created_at}
            for sc in result.scalars().all()]


# ─────── PROJECTS ───────

@router.get("/projects")
async def list_projects(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Project).order_by(Project.created_at.desc()))
    return [{"id": p.id, "ideaId": p.idea_id, "ideaTitle": p.idea_title,
             "prd": p.prd, "status": p.status, "createdAt": p.created_at}
            for p in result.scalars().all()]


@router.get("/projects/{project_id}")
async def get_project(project_id: str, db: AsyncSession = Depends(get_db)):
    project = await db.get(Project, project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    return {"id": project.id, "ideaId": project.idea_id, "ideaTitle": project.idea_title,
            "prd": project.prd, "status": project.status, "createdAt": project.created_at}


@router.patch("/projects/{project_id}")
async def update_project(project_id: str, body: dict, db: AsyncSession = Depends(get_db)):
    project = await db.get(Project, project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    if "status" in body:
        project.status = body["status"]
    await db.commit()
    return {"id": project.id, "status": project.status}


# ─────── APPROVALS ───────

class ApprovalAction(BaseModel):
    actor: str = "human"
    notes: Optional[str] = None


@router.get("/approvals")
async def list_approvals(
    status: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
):
    query = select(Approval).order_by(Approval.created_at.desc())
    if status:
        query = query.where(Approval.status == status)
    result = await db.execute(query)
    return [{"id": a.id, "entityType": a.entity_type, "entityId": a.entity_id,
             "entityTitle": a.entity_title, "stage": a.stage, "status": a.status,
             "actor": a.actor, "notes": a.notes, "createdAt": a.created_at,
             "resolvedAt": a.resolved_at}
            for a in result.scalars().all()]


@router.post("/approvals/{approval_id}/approve")
async def approve_item(
    approval_id: str,
    body: ApprovalAction,
    db: AsyncSession = Depends(get_db),
):
    approval = await db.get(Approval, approval_id)
    if not approval:
        raise HTTPException(status_code=404, detail="Approval not found")
    approval.status = "approved"
    approval.actor = body.actor
    approval.notes = body.notes
    approval.resolved_at = now()
    await db.commit()
    return {"id": approval.id, "status": "approved"}


@router.post("/approvals/{approval_id}/reject")
async def reject_item(
    approval_id: str,
    body: ApprovalAction,
    db: AsyncSession = Depends(get_db),
):
    approval = await db.get(Approval, approval_id)
    if not approval:
        raise HTTPException(status_code=404, detail="Approval not found")
    approval.status = "rejected"
    approval.actor = body.actor
    approval.notes = body.notes
    approval.resolved_at = now()
    await db.commit()
    return {"id": approval.id, "status": "rejected"}


# ─────── AUDIT LOG ───────

@router.get("/audit")
async def list_audit(
    agent_id: Optional[str] = None,
    limit: int = Query(50, le=200),
    offset: int = 0,
    db: AsyncSession = Depends(get_db),
):
    query = select(AuditEntry).order_by(AuditEntry.created_at.desc()).limit(limit).offset(offset)
    if agent_id:
        query = query.where(AuditEntry.agent_id == agent_id)
    result = await db.execute(query)
    return [{"id": e.id, "agentId": e.agent_id, "agentName": e.agent_name,
             "action": e.action, "entityType": e.entity_type, "entityId": e.entity_id,
             "inputSummary": e.input_summary, "outputSummary": e.output_summary,
             "tokensUsed": e.tokens_used, "latencyMs": e.latency_ms, "createdAt": e.created_at}
            for e in result.scalars().all()]


# ─────── GTM ASSETS ───────

@router.get("/gtm-assets")
async def list_gtm_assets(
    project_id: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
):
    query = select(GTMAsset).order_by(GTMAsset.created_at.desc())
    if project_id:
        query = query.where(GTMAsset.project_id == project_id)
    result = await db.execute(query)
    return [{"id": a.id, "projectId": a.project_id, "type": a.type,
             "title": a.title, "content": a.content, "status": a.status,
             "createdAt": a.created_at}
            for a in result.scalars().all()]


@router.patch("/gtm-assets/{asset_id}")
async def update_gtm_asset(asset_id: str, body: dict, db: AsyncSession = Depends(get_db)):
    asset = await db.get(GTMAsset, asset_id)
    if not asset:
        raise HTTPException(status_code=404, detail="GTM asset not found")
    if "status" in body:
        asset.status = body["status"]
    await db.commit()
    return {"id": asset.id, "status": asset.status}


# ─────── FEEDBACK ───────

class FeedbackCreate(BaseModel):
    projectId: str
    source: str
    content: str
    sentiment: str = "neutral"
    tags: list[str] = []


@router.get("/feedback")
async def list_feedback(
    project_id: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
):
    query = select(FeedbackItem).order_by(FeedbackItem.created_at.desc())
    if project_id:
        query = query.where(FeedbackItem.project_id == project_id)
    result = await db.execute(query)
    return [{"id": f.id, "projectId": f.project_id, "source": f.source,
             "content": f.content, "sentiment": f.sentiment, "tags": f.tags,
             "createdAt": f.created_at}
            for f in result.scalars().all()]


@router.post("/feedback")
async def create_feedback(body: FeedbackCreate, db: AsyncSession = Depends(get_db)):
    item = FeedbackItem(
        id=str(uuid.uuid4()),
        project_id=body.projectId,
        source=body.source,
        content=body.content,
        sentiment=body.sentiment,
        tags=body.tags,
        created_at=now(),
    )
    db.add(item)
    await db.commit()
    return {"id": item.id, "projectId": item.project_id}


# ─────── LEARNING REPORTS ───────

@router.get("/learning-reports")
async def list_learning_reports(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(LearningReport).order_by(LearningReport.created_at.desc()))
    return [{"id": r.id, "weekOf": r.week_of, "keyFindings": r.key_findings,
             "improvements": r.improvements, "experiments": r.experiments,
             "roadmapItems": r.roadmap_items, "createdAt": r.created_at}
            for r in result.scalars().all()]


@router.get("/learning-reports/{report_id}")
async def get_learning_report(report_id: str, db: AsyncSession = Depends(get_db)):
    report = await db.get(LearningReport, report_id)
    if not report:
        raise HTTPException(status_code=404, detail="Learning report not found")
    return {"id": report.id, "weekOf": report.week_of, "keyFindings": report.key_findings,
            "improvements": report.improvements, "experiments": report.experiments,
            "roadmapItems": report.roadmap_items, "createdAt": report.created_at}


# ─────── RUBRIC WEIGHTS ───────

class RubricWeightsUpdate(BaseModel):
    marketSize: float
    feasibility: float
    timeToValue: float
    riskLevel: float
    strategicFit: float
    differentiation: float


@router.get("/rubric-weights")
async def get_rubric_weights(db: AsyncSession = Depends(get_db)):
    weights = await db.get(RubricWeights, "default")
    if not weights:
        raise HTTPException(status_code=404, detail="Rubric weights not found")
    return {"marketSize": weights.market_size, "feasibility": weights.feasibility,
            "timeToValue": weights.time_to_value, "riskLevel": weights.risk_level,
            "strategicFit": weights.strategic_fit, "differentiation": weights.differentiation}


@router.put("/rubric-weights")
async def update_rubric_weights(body: RubricWeightsUpdate, db: AsyncSession = Depends(get_db)):
    weights = await db.get(RubricWeights, "default")
    if not weights:
        raise HTTPException(status_code=404, detail="Rubric weights not found")
    weights.market_size = body.marketSize
    weights.feasibility = body.feasibility
    weights.time_to_value = body.timeToValue
    weights.risk_level = body.riskLevel
    weights.strategic_fit = body.strategicFit
    weights.differentiation = body.differentiation
    weights.updated_at = now()
    await db.commit()
    return {"updated": True}


# ─────── STATS ───────

@router.get("/stats")
async def get_stats(db: AsyncSession = Depends(get_db)):
    async def count(model):
        result = await db.execute(select(func.count()).select_from(model))
        return result.scalar() or 0

    total_docs = await count(Document)
    total_pps = await count(PainPoint)
    total_clusters = await count(Cluster)
    total_ideas = await count(Idea)
    total_projects = await count(Project)

    pending_result = await db.execute(
        select(func.count()).select_from(Approval).where(Approval.status == "pending")
    )
    pending = pending_result.scalar() or 0

    return {
        "totalDocuments": total_docs,
        "totalPainPoints": total_pps,
        "totalClusters": total_clusters,
        "totalIdeas": total_ideas,
        "totalProjects": total_projects,
        "pendingApprovals": pending,
        "weeklyIdeas": 0,
        "conversionRate": round((total_ideas / total_docs * 100) if total_docs > 0 else 0, 1),
    }
