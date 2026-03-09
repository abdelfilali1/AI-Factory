'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import { useStore } from '@/lib/store';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AIReviewCard } from '@/components/ui/ai-review-card';
import { statusToColor, timeAgo } from '@/lib/utils';
import {
  ArrowLeft,
  CheckCircle,
  AlertTriangle,
  Users,
  DollarSign,
  Target,
  BarChart2,
  FileText,
  Download,
  RefreshCw,
  Hammer,
} from 'lucide-react';
import type { UserStory } from '@/lib/types';

const priorityColors: Record<UserStory['priority'], string> = {
  must: 'bg-red-500/10 text-red-400 border-red-500/20',
  should: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  could: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
};

export default function ProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const { projects, updateProject } = useStore();
  const [expandedStory, setExpandedStory] = useState<string | null>(null);

  const project = projects.find((p) => p.id === id);

  if (!project) {
    return <div className="p-6 text-slate-500">Project not found.</div>;
  }

  const { prd } = project;

  return (
    <div className="p-6 space-y-6 max-w-4xl">
      {/* Back */}
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-300 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Projects
      </button>

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className={`text-xs px-2 py-0.5 rounded border ${statusToColor(project.status)}`}>
              {project.status}
            </span>
            <span className="text-xs text-slate-600">{timeAgo(project.createdAt)}</span>
          </div>
          <h1 className="text-xl font-bold text-slate-100 leading-snug">{project.ideaTitle}</h1>
          <p className="text-sm text-slate-500 mt-1">Product Requirements Document</p>
        </div>
        <div className="flex items-center gap-2">
          {project.status === 'approved' && (
            <Button
              variant="primary"
              size="sm"
              icon={<Hammer className="h-3.5 w-3.5" />}
              onClick={() => updateProject(id, { status: 'building' })}
            >
              Send to Build
            </Button>
          )}
          {project.status === 'draft' && (
            <Button
              variant="success"
              size="sm"
              icon={<CheckCircle className="h-3.5 w-3.5" />}
              onClick={() => updateProject(id, { status: 'approved' })}
            >
              Approve PRD
            </Button>
          )}
          <Button variant="secondary" size="sm" icon={<Download className="h-3.5 w-3.5" />}>
            Export
          </Button>
          <Button variant="ghost" size="sm" icon={<RefreshCw className="h-3.5 w-3.5" />}>
            Revise
          </Button>
        </div>
      </div>

      {/* Problem & ICP */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-amber-400" />
            Problem & ICP
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="text-xs font-semibold text-slate-400 mb-2">Problem Statement</div>
            <p className="text-sm text-slate-300 leading-relaxed">{prd.problem}</p>
          </div>
          <div className="border-t border-white/[0.06] pt-4">
            <div className="text-xs font-semibold text-slate-400 mb-2 flex items-center gap-1.5">
              <Users className="h-3.5 w-3.5 text-blue-400" />
              Ideal Customer Profile
            </div>
            <p className="text-sm text-slate-300 leading-relaxed">{prd.icp}</p>
          </div>
        </CardContent>
      </Card>

      {/* Solution */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-4 w-4 text-violet-400" />
            Solution & Differentiation
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="text-xs font-semibold text-slate-400 mb-2">Solution Overview</div>
            <p className="text-sm text-slate-300 leading-relaxed">{prd.solution}</p>
          </div>
          <div className="border-t border-white/[0.06] pt-4">
            <div className="text-xs font-semibold text-slate-400 mb-2">Differentiation</div>
            <p className="text-sm text-slate-400 leading-relaxed">{prd.differentiation}</p>
          </div>
        </CardContent>
      </Card>

      {/* MVP Scope */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-blue-400" />
            MVP Scope
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-slate-300 leading-relaxed">{prd.mvpScope}</p>
        </CardContent>
      </Card>

      {/* Pricing & GTM */}
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-emerald-400" />
              Pricing Hypothesis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-slate-300 leading-relaxed">{prd.pricingHypothesis}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-4 w-4 text-amber-400" />
              GTM Plan
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-slate-300 leading-relaxed">{prd.gtmPlan}</p>
          </CardContent>
        </Card>
      </div>

      {/* Metrics */}
      {prd.metrics.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart2 className="h-4 w-4 text-blue-400" />
              Success Metrics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {prd.metrics.map((metric, i) => (
                <div
                  key={i}
                  className="px-3 py-1.5 bg-blue-500/10 border border-blue-500/20 rounded-lg text-xs text-blue-300"
                >
                  {metric}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Risks */}
      {prd.risks.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-red-400" />
              Risks
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {prd.risks.map((risk, i) => (
                <div key={i} className="flex items-start gap-2.5 p-3 bg-red-500/5 border border-red-500/10 rounded-lg">
                  <AlertTriangle className="h-3.5 w-3.5 text-red-400 shrink-0 mt-0.5" />
                  <p className="text-sm text-slate-400">{risk}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* User Stories */}
      {prd.userStories.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>User Stories</CardTitle>
            <Badge variant="muted">{prd.userStories.length} stories</Badge>
          </CardHeader>
          <CardContent className="space-y-3">
            {prd.userStories.map((story) => (
              <div
                key={story.id}
                className="p-4 bg-white/[0.02] border border-white/[0.04] rounded-lg cursor-pointer hover:border-white/[0.08] transition-colors"
                onClick={() => setExpandedStory(expandedStory === story.id ? null : story.id)}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded border ${priorityColors[story.priority]}`}>
                        {story.priority}
                      </span>
                    </div>
                    <p className="text-sm text-slate-300">
                      <span className="text-slate-500">As a </span>
                      <span className="font-medium">{story.role}</span>
                      <span className="text-slate-500">, I want to </span>
                      <span className="text-slate-300">{story.want}</span>
                      <span className="text-slate-500">, so that </span>
                      <span className="text-slate-300">{story.so}</span>
                    </p>
                  </div>
                  <Badge variant="muted" size="sm">
                    {story.acceptanceCriteria.length} criteria
                  </Badge>
                </div>

                {expandedStory === story.id && story.acceptanceCriteria.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-white/[0.04]">
                    <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-2">
                      Acceptance Criteria
                    </div>
                    <ul className="space-y-1.5">
                      {story.acceptanceCriteria.map((ac, i) => (
                        <li key={i} className="flex items-start gap-2 text-xs text-slate-400">
                          <CheckCircle className="h-3.5 w-3.5 text-emerald-500/50 shrink-0 mt-0.5" />
                          {ac}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* AI Review */}
      {prd.aiReview && (
        <div>
          <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">PRD AI Review</h3>
          <AIReviewCard review={prd.aiReview} />
        </div>
      )}
    </div>
  );
}
