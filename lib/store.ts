import { create } from 'zustand';
import type {
  Source,
  Document,
  PainPoint,
  Cluster,
  Idea,
  Scorecard,
  Project,
  Approval,
  AuditEntry,
  GTMAsset,
  FeedbackItem,
  LearningReport,
  RubricWeights,
  PipelineStats,
} from './types';

interface StoreState {
  // Data
  sources: Source[];
  documents: Document[];
  painPoints: PainPoint[];
  clusters: Cluster[];
  ideas: Idea[];
  scorecards: Scorecard[];
  projects: Project[];
  approvals: Approval[];
  auditEntries: AuditEntry[];
  gtmAssets: GTMAsset[];
  feedbackItems: FeedbackItem[];
  learningReports: LearningReport[];
  rubricWeights: RubricWeights;

  // Actions
  addSource: (source: Source) => void;
  toggleSource: (id: string) => void;
  addDocument: (doc: Document) => void;
  addPainPoint: (pp: PainPoint) => void;
  addCluster: (cluster: Cluster) => void;
  updateCluster: (id: string, updates: Partial<Cluster>) => void;
  addIdea: (idea: Idea) => void;
  updateIdea: (id: string, updates: Partial<Idea>) => void;
  addScorecard: (sc: Scorecard) => void;
  addProject: (project: Project) => void;
  updateProject: (id: string, updates: Partial<Project>) => void;
  approveItem: (id: string, actor: string, notes?: string) => void;
  rejectItem: (id: string, actor: string, notes?: string) => void;
  addAuditEntry: (entry: AuditEntry) => void;
  addGTMAsset: (asset: GTMAsset) => void;
  addFeedback: (item: FeedbackItem) => void;
  addLearningReport: (report: LearningReport) => void;
  updateRubricWeights: (weights: RubricWeights) => void;

  // Computed
  getPendingApprovals: () => Approval[];
  getPipelineStats: () => PipelineStats;
  getScorecardForIdea: (ideaId: string) => Scorecard | undefined;
  getProjectForIdea: (ideaId: string) => Project | undefined;
  getPainPointsForCluster: (clusterId: string) => PainPoint[];
  getIdeasForCluster: (clusterId: string) => Idea[];
}

export const useStore = create<StoreState>((set, get) => ({
  // Initial data (empty — populated by API)
  sources: [],
  documents: [],
  painPoints: [],
  clusters: [],
  ideas: [],
  scorecards: [],
  projects: [],
  approvals: [],
  auditEntries: [],
  gtmAssets: [],
  feedbackItems: [],
  learningReports: [],
  rubricWeights: { marketSize: 1, feasibility: 1, timeToValue: 1, riskLevel: 1, strategicFit: 1, differentiation: 1 },

  // Actions
  addSource: (source) =>
    set((state) => ({ sources: [...state.sources, source] })),

  toggleSource: (id) =>
    set((state) => ({
      sources: state.sources.map((s) =>
        s.id === id ? { ...s, enabled: !s.enabled } : s
      ),
    })),

  addDocument: (doc) =>
    set((state) => ({ documents: [...state.documents, doc] })),

  addPainPoint: (pp) =>
    set((state) => ({ painPoints: [...state.painPoints, pp] })),

  addCluster: (cluster) =>
    set((state) => ({ clusters: [...state.clusters, cluster] })),

  updateCluster: (id, updates) =>
    set((state) => ({
      clusters: state.clusters.map((c) =>
        c.id === id ? { ...c, ...updates } : c
      ),
    })),

  addIdea: (idea) =>
    set((state) => ({ ideas: [...state.ideas, idea] })),

  updateIdea: (id, updates) =>
    set((state) => ({
      ideas: state.ideas.map((i) =>
        i.id === id ? { ...i, ...updates } : i
      ),
    })),

  addScorecard: (sc) =>
    set((state) => ({ scorecards: [...state.scorecards, sc] })),

  addProject: (project) =>
    set((state) => ({ projects: [...state.projects, project] })),

  updateProject: (id, updates) =>
    set((state) => ({
      projects: state.projects.map((p) =>
        p.id === id ? { ...p, ...updates } : p
      ),
    })),

  approveItem: (id, actor, notes) =>
    set((state) => ({
      approvals: state.approvals.map((a) =>
        a.id === id
          ? {
              ...a,
              status: 'approved' as const,
              actor,
              notes,
              resolvedAt: new Date().toISOString(),
            }
          : a
      ),
    })),

  rejectItem: (id, actor, notes) =>
    set((state) => ({
      approvals: state.approvals.map((a) =>
        a.id === id
          ? {
              ...a,
              status: 'rejected' as const,
              actor,
              notes,
              resolvedAt: new Date().toISOString(),
            }
          : a
      ),
    })),

  addAuditEntry: (entry) =>
    set((state) => ({
      auditEntries: [entry, ...state.auditEntries],
    })),

  addGTMAsset: (asset) =>
    set((state) => ({ gtmAssets: [...state.gtmAssets, asset] })),

  addFeedback: (item) =>
    set((state) => ({ feedbackItems: [...state.feedbackItems, item] })),

  addLearningReport: (report) =>
    set((state) => ({
      learningReports: [...state.learningReports, report],
    })),

  updateRubricWeights: (weights) => set({ rubricWeights: weights }),

  // Computed
  getPendingApprovals: () =>
    get().approvals.filter((a) => a.status === 'pending'),

  getPipelineStats: () => {
    const state = get();
    const pending = state.approvals.filter((a) => a.status === 'pending');
    const thisWeek = state.ideas.filter((i) => {
      const created = new Date(i.createdAt);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return created >= weekAgo;
    });

    return {
      totalDocuments: state.documents.length,
      totalPainPoints: state.painPoints.length,
      totalClusters: state.clusters.length,
      totalIdeas: state.ideas.length,
      totalProjects: state.projects.length,
      pendingApprovals: pending.length,
      weeklyIdeas: thisWeek.length,
      conversionRate:
        state.documents.length > 0
          ? Math.round((state.ideas.length / state.documents.length) * 100)
          : 0,
    };
  },

  getScorecardForIdea: (ideaId) =>
    get().scorecards.find((sc) => sc.ideaId === ideaId),

  getProjectForIdea: (ideaId) =>
    get().projects.find((p) => p.ideaId === ideaId),

  getPainPointsForCluster: (clusterId) =>
    get().painPoints.filter((pp) => pp.clusterId === clusterId),

  getIdeasForCluster: (clusterId) =>
    get().ideas.filter((i) => i.clusterId === clusterId),
}));
