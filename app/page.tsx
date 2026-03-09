'use client';

import { useStore } from '@/lib/store';
import { StatCard } from '@/components/ui/stat-card';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScoreRing } from '@/components/ui/score-ring';
import { AIReviewCard } from '@/components/ui/ai-review-card';
import { statusToColor, timeAgo, truncate } from '@/lib/utils';
import {
  FileText,
  AlertCircle,
  Lightbulb,
  FolderOpen,
  CheckCircle,
  XCircle,
  ArrowRight,
  Activity,
} from 'lucide-react';

const STAGE_LABELS = ['A — Veille', 'B — Pain Points', 'C — Clusters', 'D — Ideas', 'E — PRD', 'F — Score', 'G — GTM', 'H — Feedback'];

export default function Dashboard() {
  const { documents, painPoints, clusters, ideas, projects, scorecards, approvals, gtmAssets, learningReports } = useStore();
  const approveItem = useStore((s) => s.approveItem);
  const rejectItem = useStore((s) => s.rejectItem);

  const pending = approvals.filter((a) => a.status === 'pending');
  const topIdeas = ideas
    .map((idea) => ({
      idea,
      scorecard: scorecards.find((sc) => sc.ideaId === idea.id),
    }))
    .filter((i) => i.scorecard)
    .sort((a, b) => (b.scorecard?.totalScore || 0) - (a.scorecard?.totalScore || 0))
    .slice(0, 3);

  const stageCounts = [
    documents.length,
    painPoints.length,
    clusters.length,
    ideas.length,
    projects.length,
    scorecards.length,
    gtmAssets.length,
    learningReports.length,
  ];

  // AI reviewer recent reviews from scorecards
  const recentReviews = scorecards
    .filter((sc) => sc.aiReview)
    .slice(0, 4)
    .map((sc) => ({
      step: 'Idea Scoring',
      ideaId: sc.ideaId,
      idea: ideas.find((i) => i.id === sc.ideaId),
      review: sc.aiReview!,
    }));

  return (
    <div className="p-6 space-y-6">
      {/* Pipeline Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Pipeline Overview</CardTitle>
          <Badge variant="violet">Active</Badge>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-0 overflow-x-auto pb-2">
            {STAGE_LABELS.map((label, i) => {
              const count = stageCounts[i];
              const isLast = i === STAGE_LABELS.length - 1;
              return (
                <div key={i} className="flex items-center shrink-0">
                  <div className="flex flex-col items-center gap-1.5 px-3">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold border transition-all ${
                        count > 0
                          ? 'bg-violet-500/15 border-violet-500/30 text-violet-300'
                          : 'bg-white/[0.03] border-white/[0.06] text-slate-600'
                      }`}
                    >
                      {count}
                    </div>
                    <span className="text-[10px] text-slate-500 text-center whitespace-nowrap">
                      {label}
                    </span>
                  </div>
                  {!isLast && (
                    <ArrowRight className="h-3 w-3 text-slate-700 shrink-0" />
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={<FileText className="h-4 w-4" />}
          label="Documents Ingested"
          value={documents.length}
          accentColor="blue"
        />
        <StatCard
          icon={<AlertCircle className="h-4 w-4" />}
          label="Pain Points"
          value={painPoints.length}
          accentColor="amber"
        />
        <StatCard
          icon={<Lightbulb className="h-4 w-4" />}
          label="Ideas Scored"
          value={scorecards.length}
          accentColor="violet"
        />
        <StatCard
          icon={<FolderOpen className="h-4 w-4" />}
          label="Active Projects"
          value={projects.length}
          accentColor="emerald"
        />
      </div>

      {/* Two Column */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Ideas */}
        <Card>
          <CardHeader>
            <CardTitle>Top Scored Ideas</CardTitle>
            <a href="/ideas" className="text-xs text-violet-400 hover:text-violet-300 flex items-center gap-1">
              View all <ArrowRight className="h-3 w-3" />
            </a>
          </CardHeader>
          <CardContent className="space-y-3 p-4">
            {topIdeas.map(({ idea, scorecard }, i) => (
              <a
                key={idea.id}
                href={`/ideas/${idea.id}`}
                className="flex items-center gap-4 p-3 rounded-lg bg-white/[0.02] border border-white/[0.04] hover:bg-white/[0.05] hover:border-white/[0.08] transition-all group"
              >
                <div className="text-sm font-bold text-slate-600 w-4 shrink-0">#{i + 1}</div>
                <ScoreRing score={scorecard?.totalScore || 0} size={44} />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-slate-200 truncate group-hover:text-white">
                    {idea.title}
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="violet" size="sm">{idea.type}</Badge>
                    <span
                      className={`text-xs px-1.5 py-0.5 rounded border ${statusToColor(idea.status)}`}
                    >
                      {idea.status}
                    </span>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-slate-700 group-hover:text-slate-400 shrink-0" />
              </a>
            ))}
          </CardContent>
        </Card>

        {/* Pending Approvals */}
        <Card>
          <CardHeader>
            <CardTitle>Pending Approvals</CardTitle>
            <Badge variant="error">{pending.length} pending</Badge>
          </CardHeader>
          <CardContent className="p-4 space-y-3">
            {pending.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-slate-500">
                <CheckCircle className="h-8 w-8 text-emerald-500/50 mb-2" />
                <span className="text-sm">Queue is clear</span>
              </div>
            ) : (
              pending.map((appr) => (
                <div
                  key={appr.id}
                  className="p-3 rounded-lg bg-white/[0.02] border border-white/[0.04] space-y-2"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="text-sm font-medium text-slate-200 leading-snug">
                        {truncate(appr.entityTitle, 48)}
                      </div>
                      <div className="text-xs text-slate-500 mt-0.5">{appr.stage}</div>
                    </div>
                    <span className="text-[10px] text-slate-600 shrink-0">{timeAgo(appr.createdAt)}</span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => approveItem(appr.id, 'User')}
                      className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 transition-colors"
                    >
                      <CheckCircle className="h-3 w-3" />
                      Approve
                    </button>
                    <button
                      onClick={() => rejectItem(appr.id, 'User')}
                      className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-md bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 transition-colors"
                    >
                      <XCircle className="h-3 w-3" />
                      Reject
                    </button>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      {/* Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Pipeline Activity — Weekly</CardTitle>
          <div className="flex items-center gap-4 text-xs text-slate-500">
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-violet-500" />Ideas</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-500" />Documents</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-500" />Pain Points</span>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-[220px] text-slate-600 text-sm">
            No pipeline runs yet — activity will appear here.
          </div>
        </CardContent>
      </Card>

      {/* AI Reviewer Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-4 w-4 text-violet-400" />
            AI Reviewer Status
          </CardTitle>
          <Badge variant="violet">Last 24h</Badge>
        </CardHeader>
        <CardContent>
          {recentReviews.length === 0 ? (
            <p className="text-sm text-slate-500">No reviews yet. Run the pipeline to generate AI reviews.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {recentReviews.map((r, i) => (
                <div key={i} className="p-3 rounded-lg bg-white/[0.02] border border-white/[0.04]">
                  <div className="text-xs text-slate-500 mb-2">
                    {r.step} — <span className="text-slate-400">{r.idea?.title ? truncate(r.idea.title, 32) : 'Unknown'}</span>
                  </div>
                  <AIReviewCard review={r.review} compact />
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
