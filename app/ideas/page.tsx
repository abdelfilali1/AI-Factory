'use client';

import { useState } from 'react';
import { useStore } from '@/lib/store';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { statusToColor } from '@/lib/utils';
import {
  Lightbulb,
  ChevronDown,
  ChevronRight,
  Play,
  Star,
  X,
} from 'lucide-react';
import type { Idea } from '@/lib/types';

const TYPE_COLORS: Record<Idea['type'], string> = {
  saas: 'bg-violet-500/10 text-violet-400 border-violet-500/20',
  service: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  automation: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  hybrid: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
};

export default function IdeasPage() {
  const { ideas, scorecards, clusters, updateIdea } = useStore();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [typeFilter, setTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [minScore, setMinScore] = useState(0);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [scoring, setScoring] = useState(false);
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [selectedCluster, setSelectedCluster] = useState('');
  const [generating, setGenerating] = useState(false);

  const getScorecardForIdea = (id: string) => scorecards.find((sc) => sc.ideaId === id);

  const filtered = ideas
    .map((idea) => ({
      idea,
      scorecard: getScorecardForIdea(idea.id),
    }))
    .filter(({ idea, scorecard }) => {
      if (typeFilter && idea.type !== typeFilter) return false;
      if (statusFilter && idea.status !== statusFilter) return false;
      if (minScore > 0 && (scorecard?.totalScore || 0) < minScore) return false;
      return true;
    })
    .sort((a, b) => (b.scorecard?.totalScore || 0) - (a.scorecard?.totalScore || 0));

  const toggleExpand = (id: string) => setExpandedId(expandedId === id ? null : id);
  const toggleSelect = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  };

  const handleShortlist = () => {
    selectedIds.forEach((id) => updateIdea(id, { status: 'shortlisted' }));
    setSelectedIds(new Set());
  };

  const handleScoreAll = async () => {
    setScoring(true);
    const unscored = ideas.filter((idea) => !getScorecardForIdea(idea.id));
    for (const idea of unscored) {
      const cluster = clusters.find((c) => c.id === idea.clusterId);
      if (!cluster) continue;
      try {
        await fetch('/api/agents/score', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ idea, cluster, weights: { marketSize: 20, feasibility: 20, timeToValue: 15, riskLevel: 15, strategicFit: 15, differentiation: 15 } }),
        });
      } catch (err) {
        console.error(err);
      }
    }
    setScoring(false);
  };

  const handleGenerate = async () => {
    if (!selectedCluster) return;
    setGenerating(true);
    const cluster = clusters.find((c) => c.id === selectedCluster);
    if (!cluster) { setGenerating(false); return; }
    const pps = ideas.filter((i) => i.clusterId === selectedCluster).slice(0, 5);
    try {
      await fetch('/api/agents/generate-ideas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cluster, painPoints: pps }),
      });
    } catch (err) {
      console.error(err);
    } finally {
      setGenerating(false);
      setShowGenerateModal(false);
    }
  };

  return (
    <div className="p-6 space-y-5">
      {/* Toolbar */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <Lightbulb className="h-4 w-4 text-violet-400" />
          <span className="text-sm text-slate-400">{filtered.length} ideas</span>
        </div>
        <div className="flex items-center gap-2 flex-wrap ml-auto">
          {/* Score filter */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500">Min score:</span>
            <input
              type="range"
              min={0}
              max={100}
              step={10}
              value={minScore}
              onChange={(e) => setMinScore(Number(e.target.value))}
              className="w-24 accent-violet-500"
            />
            <span className="text-xs text-slate-300 w-6">{minScore}</span>
          </div>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="bg-[#0f0f17] border border-white/[0.08] rounded-lg px-3 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-violet-500/50"
          >
            <option value="">All Types</option>
            <option value="saas">SaaS</option>
            <option value="service">Service</option>
            <option value="automation">Automation</option>
            <option value="hybrid">Hybrid</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-[#0f0f17] border border-white/[0.08] rounded-lg px-3 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-violet-500/50"
          >
            <option value="">All Status</option>
            <option value="draft">Draft</option>
            <option value="shortlisted">Shortlisted</option>
            <option value="selected">Selected</option>
            <option value="rejected">Rejected</option>
          </select>

          {selectedIds.size > 0 && (
            <Button
              variant="success"
              size="sm"
              icon={<Star className="h-3 w-3" />}
              onClick={handleShortlist}
            >
              Shortlist ({selectedIds.size})
            </Button>
          )}

          <Button
            variant="secondary"
            size="sm"
            icon={<Play className="h-3 w-3" />}
            loading={scoring}
            onClick={handleScoreAll}
          >
            Score All
          </Button>

          <Button
            variant="primary"
            size="sm"
            icon={<Lightbulb className="h-3 w-3" />}
            onClick={() => setShowGenerateModal(true)}
          >
            Generate Ideas
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-white/[0.06] overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-[#0f0f17] border-b border-white/[0.06]">
              <th className="text-left text-[10px] font-semibold text-slate-500 uppercase tracking-wider px-4 py-3 w-8">
                <input type="checkbox" className="accent-violet-500" />
              </th>
              <th className="text-left text-[10px] font-semibold text-slate-500 uppercase tracking-wider px-4 py-3 w-8">#</th>
              <th className="text-left text-[10px] font-semibold text-slate-500 uppercase tracking-wider px-4 py-3">Title</th>
              <th className="text-left text-[10px] font-semibold text-slate-500 uppercase tracking-wider px-4 py-3 w-24">Type</th>
              <th className="text-left text-[10px] font-semibold text-slate-500 uppercase tracking-wider px-4 py-3 w-36">Cluster</th>
              <th className="text-left text-[10px] font-semibold text-slate-500 uppercase tracking-wider px-4 py-3 w-28">Score</th>
              <th className="text-left text-[10px] font-semibold text-slate-500 uppercase tracking-wider px-4 py-3 w-24">Status</th>
              <th className="text-right text-[10px] font-semibold text-slate-500 uppercase tracking-wider px-4 py-3 w-20">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.04]">
            {filtered.map(({ idea, scorecard }, i) => (
              <>
                <tr
                  key={idea.id}
                  className={`transition-colors hover:bg-white/[0.02] ${expandedId === idea.id ? 'bg-white/[0.02]' : ''}`}
                >
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={selectedIds.has(idea.id)}
                      onChange={() => toggleSelect(idea.id)}
                      className="accent-violet-500"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-xs font-bold text-slate-600">#{i + 1}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-sm font-medium text-slate-200">{idea.title}</div>
                    <div className="text-xs text-slate-600 mt-0.5">{idea.clusterName}</div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded border ${TYPE_COLORS[idea.type]}`}>
                      {idea.type}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-xs text-slate-500 truncate">{idea.clusterName}</span>
                  </td>
                  <td className="px-4 py-3">
                    {scorecard ? (
                      <div className="flex items-center gap-2">
                        <div
                          className="h-1.5 rounded-full bg-white/[0.06] overflow-hidden flex-1"
                          style={{ maxWidth: '80px' }}
                        >
                          <div
                            className={`h-full rounded-full ${
                              scorecard.totalScore >= 80
                                ? 'bg-emerald-500'
                                : scorecard.totalScore >= 60
                                ? 'bg-amber-500'
                                : 'bg-red-500'
                            }`}
                            style={{ width: `${scorecard.totalScore}%` }}
                          />
                        </div>
                        <span
                          className={`text-xs font-bold ${
                            scorecard.totalScore >= 80
                              ? 'text-emerald-400'
                              : scorecard.totalScore >= 60
                              ? 'text-amber-400'
                              : 'text-red-400'
                          }`}
                        >
                          {scorecard.totalScore}
                        </span>
                      </div>
                    ) : (
                      <span className="text-xs text-slate-600">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-1.5 py-0.5 rounded border ${statusToColor(idea.status)}`}>
                      {idea.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => toggleExpand(idea.id)}
                      className="text-slate-500 hover:text-slate-300 transition-colors"
                    >
                      {expandedId === idea.id ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                    </button>
                  </td>
                </tr>
                {expandedId === idea.id && (
                  <tr key={`${idea.id}-expanded`} className="bg-white/[0.02]">
                    <td colSpan={8} className="px-8 pb-4 pt-2">
                      <div className="space-y-3">
                        <p className="text-sm text-slate-400 leading-relaxed">{idea.description}</p>
                        <div className="flex items-center gap-3">
                          <a
                            href={`/ideas/${idea.id}`}
                            className="text-xs text-violet-400 hover:text-violet-300 flex items-center gap-1"
                          >
                            View full details <ChevronRight className="h-3 w-3" />
                          </a>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => updateIdea(idea.id, { status: 'shortlisted' })}
                          >
                            <Star className="h-3 w-3 mr-1" />
                            Shortlist
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => updateIdea(idea.id, { status: 'rejected' })}
                          >
                            <X className="h-3 w-3 mr-1" />
                            Reject
                          </Button>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </>
            ))}
          </tbody>
        </table>
      </div>

      {/* Generate Modal */}
      {showGenerateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-[#13131d] border border-white/[0.08] rounded-2xl p-6 w-[400px] shadow-2xl">
            <h2 className="text-base font-semibold text-slate-200 mb-4">Generate Ideas</h2>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-medium text-slate-400 mb-1.5 block">Select Cluster</label>
                <select
                  value={selectedCluster}
                  onChange={(e) => setSelectedCluster(e.target.value)}
                  className="w-full bg-[#0f0f17] border border-white/[0.08] rounded-lg px-3 py-2 text-sm text-slate-300 focus:outline-none focus:border-violet-500/50"
                >
                  <option value="">Choose a cluster...</option>
                  {clusters.filter((c) => c.status === 'validated').map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <Button variant="secondary" className="flex-1" onClick={() => setShowGenerateModal(false)}>
                Cancel
              </Button>
              <Button
                variant="primary"
                className="flex-1"
                loading={generating}
                onClick={handleGenerate}
                disabled={!selectedCluster}
              >
                Generate
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
