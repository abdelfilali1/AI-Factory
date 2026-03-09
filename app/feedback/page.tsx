'use client';

import { useState } from 'react';
import { useStore } from '@/lib/store';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { timeAgo } from '@/lib/utils';
import {
  MessageSquare,
  ChevronDown,
  ChevronRight,
  Zap,
  TrendingUp,
  Map,
  SmilePlus,
  Meh,
  Frown,
} from 'lucide-react';
import type { FeedbackItem } from '@/lib/types';

const sentimentConfig = {
  positive: { icon: SmilePlus, color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20', label: 'Positive' },
  neutral: { icon: Meh, color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/20', label: 'Neutral' },
  negative: { icon: Frown, color: 'text-red-400', bg: 'bg-red-500/10 border-red-500/20', label: 'Negative' },
};

export default function FeedbackPage() {
  const { feedbackItems, learningReports } = useStore();
  const [reportExpanded, setReportExpanded] = useState(true);
  const [synthesizing, setSynthesizing] = useState(false);
  const [sentimentFilter, setSentimentFilter] = useState<FeedbackItem['sentiment'] | 'all'>('all');

  const latestReport = learningReports[learningReports.length - 1];

  const filtered = sentimentFilter === 'all'
    ? feedbackItems
    : feedbackItems.filter((f) => f.sentiment === sentimentFilter);

  const sentimentCounts = {
    positive: feedbackItems.filter((f) => f.sentiment === 'positive').length,
    neutral: feedbackItems.filter((f) => f.sentiment === 'neutral').length,
    negative: feedbackItems.filter((f) => f.sentiment === 'negative').length,
  };

  const handleSynthesize = async () => {
    setSynthesizing(true);
    try {
      await fetch('/api/agents/synthesize-feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ feedback: feedbackItems }),
      });
    } catch (err) {
      console.error(err);
    } finally {
      setSynthesizing(false);
    }
  };

  // Aggregate top tags from feedback
  const tagCounts: Record<string, number> = {};
  feedbackItems.forEach((f) => f.tags.forEach((t) => { tagCounts[t] = (tagCounts[t] || 0) + 1; }));
  const topTags = Object.entries(tagCounts).sort((a, b) => b[1] - a[1]).slice(0, 8);

  return (
    <div className="p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MessageSquare className="h-4 w-4 text-violet-400" />
          <span className="text-sm text-slate-400">{feedbackItems.length} feedback items</span>
        </div>
        <Button
          variant="primary"
          icon={<Zap className="h-3.5 w-3.5" />}
          loading={synthesizing}
          onClick={handleSynthesize}
        >
          Synthesize Feedback
        </Button>
      </div>

      {/* Sentiment Stats */}
      <div className="grid grid-cols-3 gap-3">
        {(['positive', 'neutral', 'negative'] as const).map((s) => {
          const config = sentimentConfig[s];
          const Icon = config.icon;
          return (
            <button
              key={s}
              onClick={() => setSentimentFilter(sentimentFilter === s ? 'all' : s)}
              className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
                sentimentFilter === s
                  ? config.bg + ' border-opacity-60'
                  : 'bg-[#13131d] border-white/[0.06] hover:border-white/[0.1]'
              }`}
            >
              <Icon className={`h-5 w-5 ${config.color}`} />
              <div className="text-left">
                <div className="text-lg font-bold text-slate-100">{sentimentCounts[s]}</div>
                <div className="text-xs text-slate-500">{config.label}</div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Learning Report */}
      {latestReport && (
        <Card glow>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-violet-400" />
              Weekly Learning Report — Week of {latestReport.weekOf}
            </CardTitle>
            <button
              onClick={() => setReportExpanded(!reportExpanded)}
              className="text-slate-500 hover:text-slate-300"
            >
              {reportExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            </button>
          </CardHeader>
          {reportExpanded && (
            <CardContent className="space-y-5">
              <div className="grid grid-cols-2 gap-5">
                {/* Key Findings */}
                <div>
                  <div className="text-xs font-semibold text-slate-400 mb-2.5">Key Findings</div>
                  <ul className="space-y-2">
                    {latestReport.keyFindings.map((f, i) => (
                      <li key={i} className="flex items-start gap-2 text-xs text-slate-400">
                        <span className="text-violet-400 font-bold shrink-0">{i + 1}.</span>
                        {f}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Improvements */}
                <div>
                  <div className="text-xs font-semibold text-slate-400 mb-2.5">Improvements Proposed</div>
                  <ul className="space-y-2">
                    {latestReport.improvements.map((imp, i) => (
                      <li key={i} className="flex items-start gap-2 text-xs text-slate-400">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0 mt-1.5" />
                        {imp}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-5 border-t border-white/[0.06] pt-4">
                {/* Experiments */}
                <div>
                  <div className="text-xs font-semibold text-slate-400 mb-2.5">Experiments to Run</div>
                  <ul className="space-y-2">
                    {latestReport.experiments.map((exp, i) => (
                      <li key={i} className="flex items-start gap-2 text-xs text-slate-400">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0 mt-1.5" />
                        {exp}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Roadmap */}
                <div>
                  <div className="text-xs font-semibold text-slate-400 mb-2.5 flex items-center gap-1.5">
                    <Map className="h-3.5 w-3.5 text-violet-400" />
                    Roadmap Proposals
                  </div>
                  <div className="space-y-1.5">
                    {latestReport.roadmapItems.map((item, i) => (
                      <div key={i} className="px-2.5 py-1.5 bg-violet-500/5 border border-violet-500/10 rounded-lg text-xs text-slate-400">
                        {item}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          )}
        </Card>
      )}

      {/* Top Issues (aggregated tags) */}
      <Card>
        <CardHeader>
          <CardTitle>Top Issue Themes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {topTags.map(([tag, count]) => (
              <div key={tag} className="flex items-center gap-3">
                <span className="text-xs text-slate-400 w-32 truncate">#{tag}</span>
                <div className="flex-1 h-2 bg-white/[0.06] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-violet-500/50 rounded-full"
                    style={{ width: `${(count / feedbackItems.length) * 100}%` }}
                  />
                </div>
                <span className="text-xs text-slate-500 w-4 text-right">{count}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Feedback Stream */}
      <div className="space-y-3">
        <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Feedback Stream</h3>
        {filtered.map((item) => {
          const config = sentimentConfig[item.sentiment];
          const Icon = config.icon;
          return (
            <div
              key={item.id}
              className="p-4 bg-[#13131d] border border-white/[0.06] rounded-xl hover:border-white/[0.1] transition-all"
            >
              <div className="flex items-start gap-3">
                <Icon className={`h-4 w-4 ${config.color} shrink-0 mt-0.5`} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <span className="text-xs font-medium text-slate-300">{item.source}</span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded border ${config.bg}`}>
                      {item.sentiment}
                    </span>
                    <span className="text-[10px] text-slate-600">{timeAgo(item.createdAt)}</span>
                  </div>
                  <p className="text-sm text-slate-400 leading-relaxed">{item.content}</p>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {item.tags.map((tag) => (
                      <Badge key={tag} variant="muted" size="sm">#{tag}</Badge>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
