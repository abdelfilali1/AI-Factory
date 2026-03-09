'use client';

import { useState } from 'react';
import { useStore } from '@/lib/store';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { statusToColor, timeAgo } from '@/lib/utils';
import {
  Megaphone,
  Globe,
  Mail,
  FileText,
  BarChart2,
  Lock,
  Unlock,
  Zap,
} from 'lucide-react';
import type { GTMAsset } from '@/lib/types';

const TAB_TYPES: { key: GTMAsset['type'] | 'all'; label: string; icon: React.ReactNode }[] = [
  { key: 'all', label: 'All Assets', icon: <Megaphone className="h-3.5 w-3.5" /> },
  { key: 'landing-page', label: 'Landing Pages', icon: <Globe className="h-3.5 w-3.5" /> },
  { key: 'campaign', label: 'Campaigns', icon: <BarChart2 className="h-3.5 w-3.5" /> },
  { key: 'outreach', label: 'Outreach', icon: <Mail className="h-3.5 w-3.5" /> },
  { key: 'content-brief', label: 'Content Briefs', icon: <FileText className="h-3.5 w-3.5" /> },
];

export default function GTMPage() {
  const { gtmAssets, projects } = useStore();
  const [activeTab, setActiveTab] = useState<GTMAsset['type'] | 'all'>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const [selectedProject, setSelectedProject] = useState('');

  const filtered = activeTab === 'all'
    ? gtmAssets
    : gtmAssets.filter((a) => a.type === activeTab);

  const typeIcon = (type: GTMAsset['type']) => {
    switch (type) {
      case 'landing-page': return <Globe className="h-4 w-4 text-blue-400" />;
      case 'campaign': return <BarChart2 className="h-4 w-4 text-violet-400" />;
      case 'outreach': return <Mail className="h-4 w-4 text-amber-400" />;
      case 'content-brief': return <FileText className="h-4 w-4 text-emerald-400" />;
    }
  };

  const handleGenerate = async () => {
    const project = projects.find((p) => p.id === selectedProject);
    if (!project) return;
    setGenerating(true);
    try {
      await fetch('/api/agents/gtm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ project }),
      });
    } catch (err) {
      console.error(err);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="p-6 space-y-5">
      {/* Header actions */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex-1">
          <select
            value={selectedProject}
            onChange={(e) => setSelectedProject(e.target.value)}
            className="bg-[#0f0f17] border border-white/[0.08] rounded-lg px-3 py-2 text-sm text-slate-300 focus:outline-none focus:border-violet-500/50"
          >
            <option value="">Select project...</option>
            {projects.filter((p) => p.status === 'approved' || p.status === 'building').map((p) => (
              <option key={p.id} value={p.id}>{p.ideaTitle}</option>
            ))}
          </select>
        </div>
        <Button
          variant="primary"
          icon={<Zap className="h-3.5 w-3.5" />}
          loading={generating}
          disabled={!selectedProject}
          onClick={handleGenerate}
        >
          Generate GTM Kit
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 overflow-x-auto">
        {TAB_TYPES.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
              activeTab === tab.key
                ? 'bg-violet-600/20 text-violet-300 border border-violet-500/30'
                : 'text-slate-500 hover:text-slate-300 hover:bg-white/[0.04] border border-transparent'
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Assets */}
      <div className="grid grid-cols-1 gap-4">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-slate-500">
            <Megaphone className="h-12 w-12 text-slate-700 mb-3" />
            <p className="text-sm">No GTM assets yet. Select a project and generate a kit.</p>
          </div>
        ) : (
          filtered.map((asset) => {
            const project = projects.find((p) => p.id === asset.projectId);
            const isApproved = asset.status === 'approved' || asset.status === 'published';
            const isExpanded = expandedId === asset.id;

            return (
              <Card key={asset.id}>
                <CardHeader>
                  <div className="flex items-center gap-3">
                    {typeIcon(asset.type)}
                    <div>
                      <CardTitle>{asset.title}</CardTitle>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="muted" size="sm">{asset.type}</Badge>
                        {project && <Badge variant="violet" size="sm">{project.ideaTitle.slice(0, 30)}...</Badge>}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-slate-600">{timeAgo(asset.createdAt)}</span>
                    <span className={`text-xs px-1.5 py-0.5 rounded border ${statusToColor(asset.status)}`}>
                      {asset.status}
                    </span>
                    {!isApproved ? (
                      <Lock className="h-4 w-4 text-slate-600" />
                    ) : (
                      <Unlock className="h-4 w-4 text-emerald-400" />
                    )}
                  </div>
                </CardHeader>

                {/* Content preview/full */}
                <CardContent>
                  {isExpanded ? (
                    <div className="prose prose-invert prose-sm max-w-none">
                      <pre className="text-xs text-slate-400 whitespace-pre-wrap font-sans leading-relaxed bg-[#0f0f17] rounded-lg p-4 border border-white/[0.04]">
                        {asset.content}
                      </pre>
                    </div>
                  ) : (
                    <p className="text-xs text-slate-500 leading-relaxed">
                      {asset.content.slice(0, 180)}...
                    </p>
                  )}
                  <div className="flex items-center gap-2 mt-3">
                    <button
                      onClick={() => setExpandedId(isExpanded ? null : asset.id)}
                      className="text-xs text-violet-400 hover:text-violet-300"
                    >
                      {isExpanded ? 'Collapse' : 'View Full Content'}
                    </button>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
