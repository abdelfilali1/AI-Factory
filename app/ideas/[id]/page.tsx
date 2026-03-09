'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import { useStore } from '@/lib/store';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScoreRing } from '@/components/ui/score-ring';
import { AIReviewCard } from '@/components/ui/ai-review-card';
import { statusToColor, timeAgo } from '@/lib/utils';
import {
  ArrowLeft,
  FileText,
  Star,
  X,
  AlertTriangle,
  Quote,
  Zap,
} from 'lucide-react';
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import type { Idea } from '@/lib/types';

const TYPE_COLORS: Record<Idea['type'], string> = {
  saas: 'violet',
  service: 'info',
  automation: 'warning',
  hybrid: 'success',
};

export default function IdeaDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const { ideas, scorecards, clusters, painPoints, projects, updateIdea } = useStore();
  const [generatingPRD, setGeneratingPRD] = useState(false);

  const idea = ideas.find((i) => i.id === id);
  const scorecard = scorecards.find((sc) => sc.ideaId === id);
  const cluster = clusters.find((c) => c.id === idea?.clusterId);
  const clusterPains = painPoints.filter((pp) => pp.clusterId === idea?.clusterId);
  const existingProject = projects.find((p) => p.ideaId === id);

  if (!idea) {
    return (
      <div className="p-6 text-slate-500">Idea not found.</div>
    );
  }

  const radarData = scorecard
    ? Object.entries(scorecard.scores).map(([key, val]) => ({
        subject: key.replace(/([A-Z])/g, ' $1').replace(/^./, (s) => s.toUpperCase()),
        score: val,
        fullMark: 20,
      }))
    : [];

  const handleGeneratePRD = async () => {
    if (!scorecard) return;
    setGeneratingPRD(true);
    try {
      const response = await fetch('/api/agents/prd', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idea, scorecard }),
      });
      if (response.ok) {
        const data = await response.json();
        if (data.projectId) {
          router.push(`/projects/${data.projectId}`);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setGeneratingPRD(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Back */}
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-300 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Ideas
      </button>

      {/* Hero */}
      <div className="flex items-start justify-between gap-6">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2 flex-wrap">
            <Badge variant={(TYPE_COLORS[idea.type] as 'violet' | 'info' | 'warning' | 'success') || 'muted'}>
              {idea.type}
            </Badge>
            <span className={`text-xs px-2 py-0.5 rounded border ${statusToColor(idea.status)}`}>
              {idea.status}
            </span>
            {cluster && (
              <a href="/clusters" className="text-xs text-violet-400 hover:text-violet-300">
                {cluster.name}
              </a>
            )}
            <span className="text-xs text-slate-600">{timeAgo(idea.createdAt)}</span>
          </div>
          <h1 className="text-xl font-bold text-slate-100 leading-snug">{idea.title}</h1>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {existingProject ? (
            <Button variant="secondary" size="sm" onClick={() => router.push(`/projects/${existingProject.id}`)}>
              <FileText className="h-3.5 w-3.5 mr-1.5" />
              View PRD
            </Button>
          ) : (
            <Button
              variant="primary"
              size="sm"
              icon={<FileText className="h-3.5 w-3.5" />}
              loading={generatingPRD}
              onClick={handleGeneratePRD}
              disabled={!scorecard}
            >
              Generate PRD
            </Button>
          )}
          <Button
            variant="secondary"
            size="sm"
            icon={<Star className="h-3.5 w-3.5" />}
            onClick={() => updateIdea(idea.id, { status: 'shortlisted' })}
          >
            Shortlist
          </Button>
          <Button
            variant="danger"
            size="sm"
            icon={<X className="h-3.5 w-3.5" />}
            onClick={() => updateIdea(idea.id, { status: 'rejected' })}
          >
            Reject
          </Button>
        </div>
      </div>

      {/* Two Column */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Details */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Description</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-400 leading-relaxed">{idea.description}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>MVP Scope</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-400 leading-relaxed">{idea.mvpScope}</p>
            </CardContent>
          </Card>

          <div className="grid grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Positioning</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-slate-300 font-medium italic leading-relaxed">
                  &ldquo;{idea.positioning}&rdquo;
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Differentiation</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-slate-400 leading-relaxed">{idea.differentiation}</p>
              </CardContent>
            </Card>
          </div>

          {/* Related Pain Points */}
          {clusterPains.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Related Pain Points</CardTitle>
                <Badge variant="muted">{clusterPains.length}</Badge>
              </CardHeader>
              <CardContent className="space-y-3">
                {clusterPains.slice(0, 3).map((pp) => (
                  <div key={pp.id} className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-violet-400">{pp.role}</span>
                      <Badge variant={pp.severity >= 4 ? 'error' : pp.severity >= 3 ? 'warning' : 'muted'} size="sm">
                        S{pp.severity}
                      </Badge>
                    </div>
                    <p className="text-xs text-slate-400">{pp.statement}</p>
                    {pp.evidenceQuote && (
                      <div className="border-l-2 border-violet-500/30 pl-2.5">
                        <p className="text-xs text-slate-500 italic flex items-start gap-1">
                          <Quote className="h-2.5 w-2.5 text-violet-400/50 shrink-0 mt-0.5" />
                          {pp.evidenceQuote.slice(0, 120)}...
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right: Scorecard */}
        <div className="space-y-4">
          {scorecard ? (
            <>
              <Card glow>
                <CardHeader>
                  <CardTitle>Scorecard</CardTitle>
                  <ScoreRing score={scorecard.totalScore} size={48} />
                </CardHeader>
                <CardContent>
                  {radarData.length > 0 && (
                    <ResponsiveContainer width="100%" height={200}>
                      <RadarChart data={radarData}>
                        <PolarGrid stroke="rgba(255,255,255,0.06)" />
                        <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10, fill: '#64748b' }} />
                        <Radar
                          dataKey="score"
                          stroke="#7c3aed"
                          fill="#7c3aed"
                          fillOpacity={0.15}
                          strokeWidth={2}
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: '#13131d',
                            border: '1px solid rgba(255,255,255,0.08)',
                            borderRadius: '8px',
                            fontSize: '11px',
                            color: '#f1f5f9',
                          }}
                        />
                      </RadarChart>
                    </ResponsiveContainer>
                  )}

                  {/* Score breakdown */}
                  <div className="mt-3 space-y-2">
                    {Object.entries(scorecard.scores).map(([key, val]) => (
                      <div key={key} className="flex items-center gap-2">
                        <span className="text-[10px] text-slate-500 w-24 capitalize">
                          {key.replace(/([A-Z])/g, ' $1')}
                        </span>
                        <div className="flex-1 h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
                          <div
                            className="h-full bg-violet-500/60 rounded-full"
                            style={{ width: `${(val / 20) * 100}%` }}
                          />
                        </div>
                        <span className="text-[10px] font-semibold text-slate-300 w-6 text-right">{val}</span>
                      </div>
                    ))}
                  </div>

                  <p className="text-xs text-slate-500 mt-4 leading-relaxed">{scorecard.rationale}</p>
                </CardContent>
              </Card>

              {/* Risk Flags */}
              {scorecard.riskFlags.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <AlertTriangle className="h-3.5 w-3.5 text-amber-400" />
                      Risk Flags
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {scorecard.riskFlags.map((flag, i) => (
                      <div key={i} className="flex items-start gap-2 text-xs text-slate-400">
                        <AlertTriangle className="h-3 w-3 text-amber-400 shrink-0 mt-0.5" />
                        {flag}
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}

              {/* AI Review */}
              {scorecard.aiReview && (
                <AIReviewCard review={scorecard.aiReview} />
              )}
            </>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-8 text-center gap-3">
                <Zap className="h-8 w-8 text-slate-600" />
                <p className="text-sm text-slate-500">No scorecard yet.</p>
                <Button variant="primary" size="sm">Score This Idea</Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
