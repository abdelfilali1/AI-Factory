from typing import TypedDict, Literal, Optional


class FactoryState(TypedDict):
    # Pipeline inputs
    thread_id: str
    sources: list[dict]
    keywords: list[str]
    target_segments: list[str]

    # Stage outputs
    documents: list[dict]
    pain_points: list[dict]
    clusters: list[dict]
    ideas: list[dict]
    scorecards: list[dict]
    selected_idea_id: Optional[str]
    project: Optional[dict]
    gtm_assets: list[dict]
    feedback_items: list[dict]
    learning_report: Optional[dict]

    # HITL control
    # Gates: "approve_clusters" | "approve_ideas" | "approve_prd"
    current_gate: Optional[str]
    hitl_approval_id: Optional[str]
    gate_decision: Optional[Literal["approved", "rejected"]]
    gate_notes: Optional[str]

    # Pipeline control
    current_stage: str
    error: Optional[str]

    # Audit buffer — flushed to DB at graph end
    audit_buffer: list[dict]
