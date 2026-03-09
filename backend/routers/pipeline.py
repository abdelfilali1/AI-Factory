import asyncio
import uuid
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from pydantic import BaseModel
from typing import Optional

from backend.database.connection import get_db
from backend.database.models import (
    PipelineRun, Document, PainPoint, Cluster, Idea,
    Scorecard, Project, GTMAsset, AuditEntry
)

router = APIRouter()


class RunPipelineRequest(BaseModel):
    sources: list[str] = []
    keywords: list[str] = ["AI", "automation", "SaaS"]
    target_segments: list[str] = ["B2B"]


class ResumeRequest(BaseModel):
    action: str  # 'approved' | 'rejected'
    notes: Optional[str] = None
    selected_idea_id: Optional[str] = None


async def _persist_outputs(db: AsyncSession, thread_id: str, final_state: dict) -> None:
    """Persist graph outputs to SQLite after a successful run."""
    now = datetime.utcnow().isoformat()

    for doc in final_state.get("documents", []):
        existing = await db.get(Document, doc.get("id", ""))
        if not existing:
            db.add(Document(
                id=doc.get("id", str(uuid.uuid4())),
                source_id=doc.get("sourceId", "src-scan-1"),
                source_name=doc.get("sourceName", ""),
                title=doc.get("title", ""),
                content=doc.get("content", ""),
                url=doc.get("url", ""),
                published_at=doc.get("publishedAt", now),
                tags=doc.get("tags", []),
                segment=doc.get("segment", "both"),
                created_at=now,
            ))

    for pp in final_state.get("pain_points", []):
        existing = await db.get(PainPoint, pp.get("id", ""))
        if not existing:
            db.add(PainPoint(
                id=pp.get("id", str(uuid.uuid4())),
                document_id=pp.get("documentId", ""),
                role=pp.get("role", ""),
                statement=pp.get("statement", ""),
                context=pp.get("context", ""),
                workaround=pp.get("workaround", ""),
                evidence_quote=pp.get("evidenceQuote", ""),
                severity=pp.get("severity", 3),
                segment=pp.get("segment", "both"),
                cluster_id=pp.get("clusterId"),
                created_at=now,
            ))

    for cluster in final_state.get("clusters", []):
        existing = await db.get(Cluster, cluster.get("id", ""))
        if not existing:
            db.add(Cluster(
                id=cluster.get("id", str(uuid.uuid4())),
                name=cluster.get("name", ""),
                theme=cluster.get("theme", ""),
                pain_point_ids=cluster.get("painPointIds", []),
                frequency=cluster.get("frequency", 50),
                urgency=cluster.get("urgency", 50),
                trend=cluster.get("trend", "stable"),
                status=cluster.get("status", "pending"),
                created_at=now,
            ))

    for idea in final_state.get("ideas", []):
        existing = await db.get(Idea, idea.get("id", ""))
        if not existing:
            db.add(Idea(
                id=idea.get("id", str(uuid.uuid4())),
                cluster_id=idea.get("clusterId", ""),
                cluster_name=idea.get("clusterName", ""),
                type=idea.get("type", "saas"),
                title=idea.get("title", ""),
                description=idea.get("description", ""),
                mvp_scope=idea.get("mvpScope", ""),
                positioning=idea.get("positioning", ""),
                differentiation=idea.get("differentiation", ""),
                status=idea.get("status", "draft"),
                created_at=now,
            ))

    for sc in final_state.get("scorecards", []):
        existing = await db.get(Scorecard, sc.get("id", ""))
        if not existing:
            db.add(Scorecard(
                id=sc.get("id", str(uuid.uuid4())),
                idea_id=sc.get("ideaId", ""),
                scores=sc.get("scores", {}),
                total_score=sc.get("totalScore", 0),
                rationale=sc.get("rationale", ""),
                risk_flags=sc.get("riskFlags", []),
                rubric_version=sc.get("rubricVersion", "1.0"),
                ai_review=sc.get("aiReview"),
                created_at=now,
            ))

    project = final_state.get("project")
    if project:
        existing = await db.get(Project, project.get("id", ""))
        if not existing:
            db.add(Project(
                id=project.get("id", str(uuid.uuid4())),
                idea_id=project.get("ideaId", ""),
                idea_title=project.get("ideaTitle", ""),
                prd=project.get("prd", {}),
                status=project.get("status", "draft"),
                created_at=now,
            ))

    for asset in final_state.get("gtm_assets", []):
        existing = await db.get(GTMAsset, asset.get("id", ""))
        if not existing:
            db.add(GTMAsset(
                id=asset.get("id", str(uuid.uuid4())),
                project_id=asset.get("projectId", ""),
                type=asset.get("type", "campaign"),
                title=asset.get("title", ""),
                content=asset.get("content", ""),
                status=asset.get("status", "draft"),
                created_at=now,
            ))

    # Persist audit buffer
    for entry in final_state.get("audit_buffer", []):
        db.add(AuditEntry(
            id=entry.get("id", str(uuid.uuid4())),
            agent_id=entry.get("agentId", ""),
            agent_name=entry.get("agentName", ""),
            action=entry.get("action", ""),
            entity_type=entry.get("entityType", ""),
            entity_id=entry.get("entityId", ""),
            input_summary=entry.get("inputSummary", ""),
            output_summary=entry.get("outputSummary", ""),
            tokens_used=entry.get("tokensUsed", 0),
            latency_ms=entry.get("latencyMs", 0),
            created_at=entry.get("createdAt", now),
        ))

    await db.commit()


async def _run_pipeline_task(thread_id: str, initial_state: dict) -> None:
    """Background task: runs the LangGraph pipeline."""
    from backend.graphs.factory_graph import get_graph
    from backend.database.connection import AsyncSessionLocal
    from langgraph.errors import GraphInterrupt

    graph = get_graph()
    config = {"configurable": {"thread_id": thread_id}}

    async with AsyncSessionLocal() as db:
        run = await db.get(PipelineRun, thread_id)
        if not run:
            return

        try:
            # Run in executor since SqliteSaver is synchronous
            loop = asyncio.get_event_loop()
            final_state = await loop.run_in_executor(
                None,
                lambda: graph.invoke(initial_state, config=config)
            )

            run.status = "completed"
            run.stage = final_state.get("current_stage", "complete")
            run.updated_at = datetime.utcnow().isoformat()
            await db.commit()

            await _persist_outputs(db, thread_id, final_state)

        except GraphInterrupt as gi:
            # Graph paused at a HITL gate
            interrupt_value = gi.args[0] if gi.args else {}
            run.status = "interrupted"
            run.gate = interrupt_value.get("gate", "unknown") if isinstance(interrupt_value, dict) else "unknown"
            run.updated_at = datetime.utcnow().isoformat()
            await db.commit()

        except Exception as e:
            run.status = "failed"
            run.error = str(e)[:500]
            run.updated_at = datetime.utcnow().isoformat()
            await db.commit()


@router.post("/run")
async def run_pipeline(
    body: RunPipelineRequest,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db),
):
    thread_id = str(uuid.uuid4())
    now = datetime.utcnow().isoformat()

    initial_state = {
        "thread_id": thread_id,
        "sources": body.sources,
        "keywords": body.keywords,
        "target_segments": body.target_segments,
        "documents": [],
        "pain_points": [],
        "clusters": [],
        "ideas": [],
        "scorecards": [],
        "selected_idea_id": None,
        "project": None,
        "gtm_assets": [],
        "feedback_items": [],
        "learning_report": None,
        "current_gate": None,
        "hitl_approval_id": None,
        "gate_decision": None,
        "gate_notes": None,
        "current_stage": "veille",
        "error": None,
        "audit_buffer": [],
    }

    run = PipelineRun(
        id=thread_id,
        stage="veille",
        status="running",
        config={"sources": body.sources, "keywords": body.keywords},
        started_at=now,
        updated_at=now,
    )
    db.add(run)
    await db.commit()

    background_tasks.add_task(_run_pipeline_task, thread_id, initial_state)

    return {"threadId": thread_id, "status": "started"}


@router.get("/status/{thread_id}")
async def get_status(thread_id: str, db: AsyncSession = Depends(get_db)):
    run = await db.get(PipelineRun, thread_id)
    if not run:
        raise HTTPException(status_code=404, detail="Pipeline run not found")

    return {
        "threadId": run.id,
        "status": run.status,
        "stage": run.stage,
        "gate": run.gate,
        "error": run.error,
        "startedAt": run.started_at,
        "updatedAt": run.updated_at,
    }


@router.post("/resume/{thread_id}")
async def resume_pipeline(
    thread_id: str,
    body: ResumeRequest,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db),
):
    run = await db.get(PipelineRun, thread_id)
    if not run:
        raise HTTPException(status_code=404, detail="Pipeline run not found")
    if run.status != "interrupted":
        raise HTTPException(status_code=400, detail=f"Run is not interrupted (status: {run.status})")

    run.status = "running"
    run.gate = None
    run.updated_at = datetime.utcnow().isoformat()
    await db.commit()

    resume_value = {
        "action": body.action,
        "notes": body.notes or "",
        "selected_idea_id": body.selected_idea_id,
    }

    async def _resume_task():
        from backend.graphs.factory_graph import get_graph
        from backend.database.connection import AsyncSessionLocal
        from langgraph.errors import GraphInterrupt
        from langgraph.types import Command

        graph = get_graph()
        config = {"configurable": {"thread_id": thread_id}}

        async with AsyncSessionLocal() as session:
            r = await session.get(PipelineRun, thread_id)
            if not r:
                return
            try:
                loop = asyncio.get_event_loop()
                final_state = await loop.run_in_executor(
                    None,
                    lambda: graph.invoke(Command(resume=resume_value), config=config)
                )
                r.status = "completed" if final_state.get("current_stage") == "complete" else "interrupted"
                r.stage = final_state.get("current_stage", "unknown")
                r.updated_at = datetime.utcnow().isoformat()
                await session.commit()
                if r.status == "completed":
                    await _persist_outputs(session, thread_id, final_state)
            except GraphInterrupt as gi:
                interrupt_value = gi.args[0] if gi.args else {}
                r.status = "interrupted"
                r.gate = interrupt_value.get("gate", "unknown") if isinstance(interrupt_value, dict) else "unknown"
                r.updated_at = datetime.utcnow().isoformat()
                await session.commit()
            except Exception as e:
                r.status = "failed"
                r.error = str(e)[:500]
                r.updated_at = datetime.utcnow().isoformat()
                await session.commit()

    background_tasks.add_task(_resume_task)
    return {"status": "resumed", "threadId": thread_id}


@router.get("/runs")
async def list_runs(db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(PipelineRun).order_by(PipelineRun.started_at.desc()).limit(20)
    )
    runs = result.scalars().all()
    return [
        {
            "threadId": r.id,
            "status": r.status,
            "stage": r.stage,
            "gate": r.gate,
            "config": r.config,
            "startedAt": r.started_at,
            "updatedAt": r.updated_at,
        }
        for r in runs
    ]
