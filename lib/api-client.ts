/**
 * Centralized API client for the Python FastAPI backend (http://localhost:8000).
 * All calls go through apiClient() which handles errors uniformly.
 */

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

async function apiClient<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(error.detail || error.error || `HTTP ${res.status}`);
  }
  return res.json();
}

// ─── Health ───────────────────────────────────────────────────────────────

export async function checkHealth(): Promise<{ status: string }> {
  return apiClient('/health');
}

// ─── Pipeline ─────────────────────────────────────────────────────────────

export async function runPipeline(body: {
  sources?: string[];
  keywords?: string[];
  target_segments?: string[];
}): Promise<{ threadId: string; status: string }> {
  return apiClient('/pipeline/run', { method: 'POST', body: JSON.stringify(body) });
}

export async function getPipelineStatus(threadId: string): Promise<{
  threadId: string;
  status: 'running' | 'interrupted' | 'completed' | 'failed';
  stage: string;
  gate: string | null;
  error: string | null;
}> {
  return apiClient(`/pipeline/status/${threadId}`);
}

export async function resumePipeline(
  threadId: string,
  body: { action: 'approved' | 'rejected'; notes?: string; selected_idea_id?: string }
): Promise<{ status: string }> {
  return apiClient(`/pipeline/resume/${threadId}`, {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export async function listPipelineRuns(): Promise<unknown[]> {
  return apiClient('/pipeline/runs');
}

// ─── Agent Config ─────────────────────────────────────────────────────────

export interface AgentConfigItem {
  id: string;
  domain: string;
  agentName: string;
  role: 'supervisor' | 'sub_agent';
  provider: string;
  model: string;
  temperature: number;
  maxTokens: number;
  systemPrompt: string | null;
  updatedAt: string;
}

export async function listAgentConfigs(): Promise<AgentConfigItem[]> {
  return apiClient('/agent-config');
}

export async function updateAgentConfig(
  agentId: string,
  body: {
    provider: string;
    model: string;
    temperature: number;
    max_tokens: number;
    system_prompt?: string | null;
  }
): Promise<AgentConfigItem> {
  return apiClient(`/agent-config/${encodeURIComponent(agentId)}`, {
    method: 'PUT',
    body: JSON.stringify(body),
  });
}

// ─── API Keys ─────────────────────────────────────────────────────────────

export interface ApiKeyItem {
  id: string;
  provider: string;
  keyHint: string;
  isActive: boolean;
  createdAt: string;
}

export async function listApiKeys(): Promise<ApiKeyItem[]> {
  return apiClient('/api-keys');
}

export async function saveApiKey(body: {
  provider: string;
  key_value: string;
}): Promise<ApiKeyItem> {
  return apiClient('/api-keys', { method: 'POST', body: JSON.stringify(body) });
}

export async function deleteApiKey(id: string): Promise<void> {
  await apiClient(`/api-keys/${id}`, { method: 'DELETE' });
}

export async function testApiKey(id: string): Promise<{ valid: boolean; error: string | null }> {
  return apiClient(`/api-keys/${id}/test`, { method: 'POST' });
}

// ─── Data ─────────────────────────────────────────────────────────────────

export async function fetchSources() { return apiClient('/data/sources'); }
export async function fetchDocuments(limit = 50) { return apiClient(`/data/documents?limit=${limit}`); }
export async function fetchPainPoints(clusterId?: string) {
  return apiClient(`/data/pain-points${clusterId ? `?cluster_id=${clusterId}` : ''}`);
}
export async function fetchClusters() { return apiClient('/data/clusters'); }
export async function fetchIdeas(clusterId?: string) {
  return apiClient(`/data/ideas${clusterId ? `?cluster_id=${clusterId}` : ''}`);
}
export async function fetchScorecards(ideaId?: string) {
  return apiClient(`/data/scorecards${ideaId ? `?idea_id=${ideaId}` : ''}`);
}
export async function fetchProjects() { return apiClient('/data/projects'); }
export async function fetchProject(id: string) { return apiClient(`/data/projects/${id}`); }
export async function fetchApprovals(status?: string) {
  return apiClient(`/data/approvals${status ? `?status=${status}` : ''}`);
}
export async function approveItem(id: string, actor = 'human', notes?: string) {
  return apiClient(`/data/approvals/${id}/approve`, {
    method: 'POST', body: JSON.stringify({ actor, notes }),
  });
}
export async function rejectItem(id: string, actor = 'human', notes?: string) {
  return apiClient(`/data/approvals/${id}/reject`, {
    method: 'POST', body: JSON.stringify({ actor, notes }),
  });
}
export async function fetchAuditLog(limit = 50) { return apiClient(`/data/audit?limit=${limit}`); }
export async function fetchGTMAssets(projectId?: string) {
  return apiClient(`/data/gtm-assets${projectId ? `?project_id=${projectId}` : ''}`);
}
export async function fetchFeedback(projectId?: string) {
  return apiClient(`/data/feedback${projectId ? `?project_id=${projectId}` : ''}`);
}
export async function fetchLearningReports() { return apiClient('/data/learning-reports'); }
export async function fetchStats() { return apiClient('/data/stats'); }
export async function fetchRubricWeights() { return apiClient('/data/rubric-weights'); }
export async function updateRubricWeights(weights: Record<string, number>) {
  return apiClient('/data/rubric-weights', { method: 'PUT', body: JSON.stringify(weights) });
}
