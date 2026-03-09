'use client';

import { useState } from 'react';
import { useStore } from '@/lib/store';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { statusToColor, timeAgo } from '@/lib/utils';
import {
  GitBranch,
  LayoutGrid,
  ScatterChart as ScatterIcon,
  CheckCircle,
  XCircle,
  Lightbulb,
  TrendingUp,
  TrendingDown,
  Minus,
} from 'lucide-react';
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';

type ViewMode = 'grid' | 'map';

const trendIcon = (trend: string) => {
  if (trend === 'rising') return <TrendingUp className="h-3 w-3 text-emerald-400" />;
  if (trend === 'falling') return <TrendingDown className="h-3 w-3 text-red-400" />;
  return <Minus className="h-3 w-3 text-blue-400" />;
};

const trendVariant = (trend: string) => {
  if (trend === 'rising') return 'success';
  if (trend === 'falling') return 'error';
  return 'info';
};

export default function ClustersPage() {
  const { clusters, painPoints, updateCluster, approvals, approveItem } = useStore();
  const [view, setView] = useState<ViewMode>('grid');
  const [generating, setGenerating] = useState<string | null>(null);

  const handleValidate = (id: string) => {
    updateCluster(id, { status: 'validated' });
  };

  const handleReject = (id: string) => {
    updateCluster(id, { status: 'rejected' });
  };

  const handleGenerateIdeas = async (clusterId: string) => {
    const cluster = clusters.find((c) => c.id === clusterId);
    if (!cluster) return;
    setGenerating(clusterId);
    const clusterPainPoints = painPoints.filter((pp) => pp.clusterId === clusterId);
    try {
      await fetch('/api/agents/generate-ideas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cluster, painPoints: clusterPainPoints }),
      });
    } catch (err) {
      console.error(err);
    } finally {
      setGenerating(null);
    }
  };

  const scatterData = clusters.map((c) => ({
    x: c.frequency,
    y: c.urgency,
    z: c.painPointIds.length * 10 + 10,
    name: c.name,
    trend: c.trend,
    status: c.status,
  }));

  const clusterColor = (trend: string) => {
    if (trend === 'rising') return '#10b981';
    if (trend === 'falling') return '#ef4444';
    return '#3b82f6';
  };

  return (
    <div className="p-6 space-y-5">
      {/* Toolbar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <GitBranch className="h-4 w-4 text-violet-400" />
          <span className="text-sm text-slate-400">{clusters.length} clusters</span>
        </div>
        <div className="flex items-center gap-1 bg-[#0f0f17] rounded-lg p-1 border border-white/[0.06]">
          <button
            onClick={() => setView('grid')}
            className={`p-1.5 rounded-md transition-all ${view === 'grid' ? 'bg-violet-600/20 text-violet-400' : 'text-slate-500 hover:text-slate-300'}`}
          >
            <LayoutGrid className="h-4 w-4" />
          </button>
          <button
            onClick={() => setView('map')}
            className={`p-1.5 rounded-md transition-all ${view === 'map' ? 'bg-violet-600/20 text-violet-400' : 'text-slate-500 hover:text-slate-300'}`}
          >
            <ScatterIcon className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Grid View */}
      {view === 'grid' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {clusters.map((cluster) => {
            const clusterPains = painPoints.filter((pp) => pp.clusterId === cluster.id);
            return (
              <Card key={cluster.id} hover>
                <CardHeader>
                  <div className="flex items-start gap-3">
                    <div>
                      <CardTitle className="text-sm mb-1">{cluster.name}</CardTitle>
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge variant={trendVariant(cluster.trend) as 'success' | 'error' | 'info'} size="sm">
                          <span className="flex items-center gap-1">{trendIcon(cluster.trend)} {cluster.trend}</span>
                        </Badge>
                        <span className={`text-xs px-1.5 py-0.5 rounded border ${statusToColor(cluster.status)}`}>
                          {cluster.status}
                        </span>
                      </div>
                    </div>
                  </div>
                  <span className="text-[10px] text-slate-600 shrink-0">{timeAgo(cluster.createdAt)}</span>
                </CardHeader>
                <CardContent className="p-5 space-y-4">
                  <p className="text-xs text-slate-500 leading-relaxed">{cluster.theme}</p>

                  {/* Metrics */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] text-slate-500">Frequency</span>
                        <span className="text-[10px] font-semibold text-slate-300">{cluster.frequency}/100</span>
                      </div>
                      <div className="h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
                        <div
                          className="h-full bg-violet-500/60 rounded-full"
                          style={{ width: `${cluster.frequency}%` }}
                        />
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] text-slate-500">Urgency</span>
                        <span className="text-[10px] font-semibold text-slate-300">{cluster.urgency}/100</span>
                      </div>
                      <div className="h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
                        <div
                          className="h-full bg-amber-500/60 rounded-full"
                          style={{ width: `${cluster.urgency}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="text-xs text-slate-500">
                    {clusterPains.length} pain points ·{' '}
                    <span className="text-slate-400">{cluster.painPointIds.length} signals</span>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 flex-wrap">
                    {cluster.status === 'pending' && (
                      <>
                        <Button
                          variant="success"
                          size="sm"
                          icon={<CheckCircle className="h-3 w-3" />}
                          onClick={() => handleValidate(cluster.id)}
                        >
                          Validate
                        </Button>
                        <Button
                          variant="danger"
                          size="sm"
                          icon={<XCircle className="h-3 w-3" />}
                          onClick={() => handleReject(cluster.id)}
                        >
                          Reject
                        </Button>
                      </>
                    )}
                    {cluster.status === 'validated' && (
                      <Button
                        variant="primary"
                        size="sm"
                        icon={<Lightbulb className="h-3 w-3" />}
                        loading={generating === cluster.id}
                        onClick={() => handleGenerateIdeas(cluster.id)}
                      >
                        Generate Ideas
                      </Button>
                    )}
                    {cluster.status === 'rejected' && (
                      <span className="text-xs text-slate-600">Cluster rejected</span>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Map View */}
      {view === 'map' && (
        <Card>
          <CardHeader>
            <CardTitle>Opportunity Map — Frequency vs Urgency</CardTitle>
            <div className="flex items-center gap-4 text-xs text-slate-500">
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />Rising</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-blue-500/80" />Stable</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-red-500/80" />Falling</span>
            </div>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={380}>
              <ScatterChart margin={{ top: 20, right: 30, bottom: 20, left: -10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis
                  dataKey="x"
                  name="Frequency"
                  domain={[0, 100]}
                  tick={{ fontSize: 11, fill: '#334155' }}
                  axisLine={false}
                  tickLine={false}
                  label={{ value: 'Frequency →', position: 'insideBottom', fill: '#334155', fontSize: 11, offset: -10 }}
                />
                <YAxis
                  dataKey="y"
                  name="Urgency"
                  domain={[0, 100]}
                  tick={{ fontSize: 11, fill: '#334155' }}
                  axisLine={false}
                  tickLine={false}
                  label={{ value: '← Urgency', angle: -90, position: 'insideLeft', fill: '#334155', fontSize: 11 }}
                />
                <Tooltip
                  cursor={{ stroke: 'rgba(255,255,255,0.1)' }}
                  contentStyle={{
                    backgroundColor: '#13131d',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: '8px',
                    fontSize: '12px',
                    color: '#f1f5f9',
                  }}
                  formatter={(value, name) => [value, name]}
                  labelFormatter={() => ''}
                  content={({ active, payload }) => {
                    if (active && payload?.length) {
                      const d = payload[0]?.payload;
                      return (
                        <div className="bg-[#13131d] border border-white/10 rounded-lg p-3 text-xs">
                          <div className="font-semibold text-slate-200 mb-1">{d.name}</div>
                          <div className="text-slate-400">Frequency: {d.x}</div>
                          <div className="text-slate-400">Urgency: {d.y}</div>
                          <div className="text-slate-400">Trend: {d.trend}</div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Scatter data={scatterData} dataKey="z">
                  {scatterData.map((entry, i) => (
                    <Cell key={i} fill={clusterColor(entry.trend)} fillOpacity={0.7} />
                  ))}
                </Scatter>
              </ScatterChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
