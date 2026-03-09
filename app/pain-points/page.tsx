'use client';

import { useState } from 'react';
import { useStore } from '@/lib/store';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { severityToBg, timeAgo } from '@/lib/utils';
import { AlertCircle, User, Quote, Zap } from 'lucide-react';

const SEVERITY_LABELS: Record<number, string> = {
  1: 'Minimal',
  2: 'Low',
  3: 'Medium',
  4: 'High',
  5: 'Critical',
};

export default function PainPointsPage() {
  const { painPoints, clusters, documents } = useStore();
  const [clusterFilter, setClusterFilter] = useState('');
  const [severityFilter, setSeverityFilter] = useState(0);
  const [segmentFilter, setSegmentFilter] = useState('');
  const [extracting, setExtracting] = useState<string | null>(null);

  const filtered = painPoints.filter((pp) => {
    if (clusterFilter && pp.clusterId !== clusterFilter) return false;
    if (severityFilter && pp.severity < severityFilter) return false;
    if (segmentFilter && pp.segment !== segmentFilter && pp.segment !== 'both') return false;
    return true;
  });

  const handleExtract = async (docId: string) => {
    setExtracting(docId);
    const doc = documents.find((d) => d.id === docId);
    if (!doc) { setExtracting(null); return; }
    try {
      await fetch('/api/agents/extract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ document: doc }),
      });
    } catch (err) {
      console.error(err);
    } finally {
      setExtracting(null);
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Filter Bar */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <AlertCircle className="h-4 w-4 text-slate-500" />
          <span className="text-sm text-slate-400">{filtered.length} pain points</span>
        </div>
        <div className="h-4 w-px bg-white/[0.08]" />

        {/* Cluster filter */}
        <select
          value={clusterFilter}
          onChange={(e) => setClusterFilter(e.target.value)}
          className="bg-[#0f0f17] border border-white/[0.08] rounded-lg px-3 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-violet-500/50"
        >
          <option value="">All Clusters</option>
          {clusters.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>

        {/* Severity filter */}
        <select
          value={severityFilter}
          onChange={(e) => setSeverityFilter(Number(e.target.value))}
          className="bg-[#0f0f17] border border-white/[0.08] rounded-lg px-3 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-violet-500/50"
        >
          <option value={0}>All Severity</option>
          <option value={5}>5 — Critical</option>
          <option value={4}>4+ — High</option>
          <option value={3}>3+ — Medium</option>
        </select>

        {/* Segment filter */}
        <select
          value={segmentFilter}
          onChange={(e) => setSegmentFilter(e.target.value)}
          className="bg-[#0f0f17] border border-white/[0.08] rounded-lg px-3 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-violet-500/50"
        >
          <option value="">All Segments</option>
          <option value="B2B">B2B</option>
          <option value="B2C">B2C</option>
        </select>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {filtered.length === 0 ? (
          <div className="col-span-2 flex flex-col items-center justify-center py-16 text-slate-500">
            <AlertCircle className="h-12 w-12 text-slate-700 mb-3" />
            <p className="text-sm">No pain points match your filters.</p>
          </div>
        ) : (
          filtered.map((pp) => {
            const cluster = clusters.find((c) => c.id === pp.clusterId);
            return (
              <div
                key={pp.id}
                className="p-5 rounded-xl bg-[#13131d] border border-white/[0.06] hover:border-white/[0.1] transition-all space-y-4"
              >
                {/* Top row */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`text-xs px-2 py-0.5 rounded-full border font-semibold ${severityToBg(pp.severity)}`}>
                      S{pp.severity} — {SEVERITY_LABELS[pp.severity]}
                    </span>
                    <Badge variant={pp.segment === 'B2B' ? 'info' : 'violet'} size="sm">
                      {pp.segment}
                    </Badge>
                    {cluster && (
                      <Badge variant="muted" size="sm">{cluster.name}</Badge>
                    )}
                  </div>
                  <span className="text-[10px] text-slate-600 shrink-0">{timeAgo(pp.createdAt)}</span>
                </div>

                {/* Role */}
                <div className="flex items-center gap-2">
                  <User className="h-3.5 w-3.5 text-slate-600" />
                  <span className="text-xs font-semibold text-violet-400">{pp.role}</span>
                </div>

                {/* Pain Statement */}
                <p className="text-sm font-medium text-slate-200 leading-snug">
                  {pp.statement}
                </p>

                {/* Context */}
                {pp.context && (
                  <p className="text-xs text-slate-500 leading-relaxed">
                    <span className="font-medium text-slate-400">Context: </span>
                    {pp.context}
                  </p>
                )}

                {/* Workaround */}
                {pp.workaround && (
                  <p className="text-xs text-slate-500 italic leading-relaxed">
                    <span className="not-italic font-medium text-slate-400">Workaround: </span>
                    {pp.workaround}
                  </p>
                )}

                {/* Evidence Quote */}
                {pp.evidenceQuote && (
                  <div className="border-l-2 border-violet-500/40 pl-3 py-1">
                    <div className="flex items-start gap-1.5">
                      <Quote className="h-3 w-3 text-violet-400/50 shrink-0 mt-0.5" />
                      <p className="text-xs text-slate-400 italic leading-relaxed">
                        {pp.evidenceQuote}
                      </p>
                    </div>
                  </div>
                )}

                {/* Extract More */}
                <div className="flex items-center justify-between pt-1">
                  <div className="text-[10px] text-slate-600">
                    from doc-{pp.documentId.slice(-4)}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    icon={<Zap className="h-3 w-3" />}
                    loading={extracting === pp.documentId}
                    onClick={() => handleExtract(pp.documentId)}
                  >
                    Extract More
                  </Button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
