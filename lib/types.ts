export interface Source {
  id: string;
  name: string;
  url: string;
  type: 'rss' | 'web' | 'manual';
  enabled: boolean;
  compliant: boolean;
  addedAt: string;
}

export interface Document {
  id: string;
  sourceId: string;
  sourceName: string;
  title: string;
  content: string;
  url: string;
  publishedAt: string;
  tags: string[];
  segment: 'B2B' | 'B2C' | 'both';
}

export interface PainPoint {
  id: string;
  documentId: string;
  role: string;
  statement: string;
  context: string;
  workaround: string;
  evidenceQuote: string;
  severity: 1 | 2 | 3 | 4 | 5;
  segment: 'B2B' | 'B2C' | 'both';
  clusterId?: string;
  createdAt: string;
}

export interface Cluster {
  id: string;
  name: string;
  theme: string;
  painPointIds: string[];
  frequency: number;
  urgency: number;
  trend: 'rising' | 'stable' | 'falling';
  status: 'pending' | 'validated' | 'rejected';
  createdAt: string;
}

export interface Idea {
  id: string;
  clusterId: string;
  clusterName: string;
  type: 'saas' | 'service' | 'automation' | 'hybrid';
  title: string;
  description: string;
  mvpScope: string;
  positioning: string;
  differentiation: string;
  status: 'draft' | 'shortlisted' | 'selected' | 'rejected';
  createdAt: string;
}

export interface AIReview {
  score: number;
  summary: string;
  strengths: string[];
  weaknesses: string[];
  recommendation: 'proceed' | 'revise' | 'reject';
}

export interface Scorecard {
  id: string;
  ideaId: string;
  scores: Record<string, number>;
  totalScore: number;
  rationale: string;
  riskFlags: string[];
  rubricVersion: string;
  aiReview?: AIReview;
  createdAt: string;
}

export interface UserStory {
  id: string;
  role: string;
  want: string;
  so: string;
  acceptanceCriteria: string[];
  priority: 'must' | 'should' | 'could';
}

export interface PRD {
  problem: string;
  icp: string;
  solution: string;
  mvpScope: string;
  differentiation: string;
  pricingHypothesis: string;
  gtmPlan: string;
  metrics: string[];
  risks: string[];
  userStories: UserStory[];
  aiReview?: AIReview;
}

export interface Project {
  id: string;
  ideaId: string;
  ideaTitle: string;
  prd: PRD;
  status: 'draft' | 'approved' | 'building' | 'live';
  createdAt: string;
}

export interface Approval {
  id: string;
  entityType: string;
  entityId: string;
  entityTitle: string;
  stage: string;
  status: 'pending' | 'approved' | 'rejected';
  actor?: string;
  notes?: string;
  createdAt: string;
  resolvedAt?: string;
}

export interface AuditEntry {
  id: string;
  agentId: string;
  agentName: string;
  action: string;
  entityType: string;
  entityId: string;
  inputSummary: string;
  outputSummary: string;
  tokensUsed: number;
  latencyMs: number;
  createdAt: string;
}

export interface GTMAsset {
  id: string;
  projectId: string;
  type: 'landing-page' | 'campaign' | 'outreach' | 'content-brief';
  title: string;
  content: string;
  status: 'draft' | 'approved' | 'published';
  createdAt: string;
}

export interface FeedbackItem {
  id: string;
  projectId: string;
  source: string;
  content: string;
  sentiment: 'positive' | 'neutral' | 'negative';
  tags: string[];
  createdAt: string;
}

export interface LearningReport {
  id: string;
  weekOf: string;
  keyFindings: string[];
  improvements: string[];
  experiments: string[];
  roadmapItems: string[];
  createdAt: string;
}

export interface RubricWeights {
  marketSize: number;
  feasibility: number;
  timeToValue: number;
  riskLevel: number;
  strategicFit: number;
  differentiation: number;
}

export interface PipelineStats {
  totalDocuments: number;
  totalPainPoints: number;
  totalClusters: number;
  totalIdeas: number;
  totalProjects: number;
  pendingApprovals: number;
  weeklyIdeas: number;
  conversionRate: number;
}
