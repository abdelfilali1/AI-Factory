'use client';

import { useState } from 'react';
import { useStore } from '@/lib/store';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { timeAgo, truncate, generateId } from '@/lib/utils';
import {
  Globe,
  Plus,
  Play,
  ToggleLeft,
  ToggleRight,
  X,
  Tag,
  TrendingUp,
} from 'lucide-react';
import type { Source } from '@/lib/types';

function SkeletonCard() {
  return (
    <div className="p-4 rounded-xl bg-[#13131d] border border-white/[0.06] animate-pulse space-y-3">
      <div className="h-4 bg-white/5 rounded w-3/4" />
      <div className="h-3 bg-white/5 rounded w-1/2" />
      <div className="h-3 bg-white/5 rounded w-full" />
      <div className="h-3 bg-white/5 rounded w-5/6" />
    </div>
  );
}

export default function VeillePage() {
  const { sources, documents, toggleSource, addSource, addDocument } = useStore();
  const [isScanning, setIsScanning] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newSource, setNewSource] = useState({ name: '', url: '', type: 'rss' as Source['type'] });
  const [filter, setFilter] = useState('');

  const topKeywords = ['reporting', 'automation', 'agency', 'solopreneur', 'content', 'finance', 'meetings', 'CRM'];

  const filteredDocuments = documents.filter(
    (d) =>
      filter === '' ||
      d.title.toLowerCase().includes(filter.toLowerCase()) ||
      d.tags.some((t) => t.toLowerCase().includes(filter.toLowerCase()))
  );

  const handleScan = async () => {
    setIsScanning(true);
    try {
      const enabledSources = sources.filter((s) => s.enabled).map((s) => s.name);
      const response = await fetch('/api/agents/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sources: enabledSources, keywords: topKeywords }),
      });
      if (response.ok) {
        const data = await response.json();
        if (data.documents) {
          data.documents.forEach((doc: Parameters<typeof addDocument>[0]) => addDocument(doc));
        }
      }
    } catch (err) {
      console.error('Scan failed:', err);
    } finally {
      setIsScanning(false);
    }
  };

  const handleAddSource = () => {
    if (!newSource.name) return;
    addSource({
      id: generateId('src'),
      name: newSource.name,
      url: newSource.url,
      type: newSource.type,
      enabled: true,
      compliant: true,
      addedAt: new Date().toISOString(),
    });
    setNewSource({ name: '', url: '', type: 'rss' });
    setShowAddModal(false);
  };

  const segmentVariant = (seg: string) =>
    seg === 'B2B' ? 'info' : seg === 'B2C' ? 'violet' : 'muted';

  return (
    <div className="p-6 flex gap-6 h-full">
      {/* Left: Sources Panel */}
      <div className="w-72 shrink-0 space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-4 w-4 text-violet-400" />
              Sources
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              icon={<Plus className="h-3.5 w-3.5" />}
              onClick={() => setShowAddModal(true)}
            >
              Add
            </Button>
          </CardHeader>
          <CardContent className="p-3 space-y-1">
            {sources.map((source) => (
              <div
                key={source.id}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-white/[0.03] transition-colors"
              >
                <button onClick={() => toggleSource(source.id)}>
                  {source.enabled ? (
                    <ToggleRight className="h-5 w-5 text-violet-400" />
                  ) : (
                    <ToggleLeft className="h-5 w-5 text-slate-600" />
                  )}
                </button>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-medium text-slate-300 truncate">
                    {source.name}
                  </div>
                  <div className="text-[10px] text-slate-600">{source.type}</div>
                </div>
                {source.compliant && (
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                )}
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Keywords */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Tag className="h-4 w-4 text-violet-400" />
              Top Keywords
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3">
            <div className="flex flex-wrap gap-1.5">
              {topKeywords.map((kw) => (
                <Badge key={kw} variant="muted" size="sm">
                  {kw}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Trends */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-emerald-400" />
              Trending Signals
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 space-y-2">
            {['Agency automation', 'Solo finance', 'Content ops', 'Meeting AI'].map((trend, i) => (
              <div key={trend} className="flex items-center gap-2">
                <div className="text-xs text-slate-400 flex-1">{trend}</div>
                <div
                  className="h-1.5 rounded-full bg-violet-500/40"
                  style={{ width: `${80 - i * 15}%` }}
                />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Right: Feed */}
      <div className="flex-1 flex flex-col gap-4 min-w-0">
        {/* Toolbar */}
        <div className="flex items-center gap-3">
          <input
            type="text"
            placeholder="Filter documents..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="flex-1 bg-[#0f0f17] border border-white/[0.08] rounded-lg px-3 py-2 text-sm text-slate-300 placeholder-slate-600 focus:outline-none focus:border-violet-500/50"
          />
          <Button
            variant="primary"
            icon={<Play className="h-3.5 w-3.5" />}
            loading={isScanning}
            onClick={handleScan}
          >
            {isScanning ? 'Scanning...' : 'Run Market Scan'}
          </Button>
        </div>

        {/* Document Feed */}
        <div className="grid grid-cols-1 gap-3 overflow-y-auto pb-4">
          {isScanning ? (
            Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
          ) : filteredDocuments.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-slate-500">
              <Globe className="h-12 w-12 text-slate-700 mb-3" />
              <p className="text-sm">No documents yet. Run a market scan to get started.</p>
            </div>
          ) : (
            filteredDocuments.map((doc) => (
              <div
                key={doc.id}
                className="p-4 rounded-xl bg-[#13131d] border border-white/[0.06] hover:border-white/[0.1] transition-all"
              >
                <div className="flex items-start justify-between gap-4 mb-2">
                  <h3 className="text-sm font-semibold text-slate-200 leading-snug flex-1">
                    {doc.title}
                  </h3>
                  <div className="flex items-center gap-2 shrink-0">
                    <Badge variant={segmentVariant(doc.segment) as 'info' | 'violet' | 'muted'}>
                      {doc.segment}
                    </Badge>
                    <span className="text-[10px] text-slate-600">{timeAgo(doc.publishedAt)}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="muted" size="sm">{doc.sourceName}</Badge>
                  {doc.url && (
                    <a
                      href={doc.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[10px] text-violet-400 hover:text-violet-300 truncate max-w-[200px]"
                    >
                      {doc.url}
                    </a>
                  )}
                </div>

                <p className="text-xs text-slate-500 leading-relaxed mb-3">
                  {truncate(doc.content, 220)}
                </p>

                <div className="flex flex-wrap gap-1.5">
                  {doc.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-[10px] px-1.5 py-0.5 rounded bg-white/[0.04] text-slate-500 border border-white/[0.04]"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Add Source Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-[#13131d] border border-white/[0.08] rounded-2xl p-6 w-[420px] shadow-2xl">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-base font-semibold text-slate-200">Add Source</h2>
              <button onClick={() => setShowAddModal(false)} className="text-slate-500 hover:text-slate-300">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-medium text-slate-400 mb-1.5 block">Name</label>
                <input
                  type="text"
                  value={newSource.name}
                  onChange={(e) => setNewSource({ ...newSource, name: e.target.value })}
                  placeholder="e.g. HackerNews"
                  className="w-full bg-[#0f0f17] border border-white/[0.08] rounded-lg px-3 py-2 text-sm text-slate-300 placeholder-slate-600 focus:outline-none focus:border-violet-500/50"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-400 mb-1.5 block">URL</label>
                <input
                  type="text"
                  value={newSource.url}
                  onChange={(e) => setNewSource({ ...newSource, url: e.target.value })}
                  placeholder="https://..."
                  className="w-full bg-[#0f0f17] border border-white/[0.08] rounded-lg px-3 py-2 text-sm text-slate-300 placeholder-slate-600 focus:outline-none focus:border-violet-500/50"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-400 mb-1.5 block">Type</label>
                <select
                  value={newSource.type}
                  onChange={(e) => setNewSource({ ...newSource, type: e.target.value as Source['type'] })}
                  className="w-full bg-[#0f0f17] border border-white/[0.08] rounded-lg px-3 py-2 text-sm text-slate-300 focus:outline-none focus:border-violet-500/50"
                >
                  <option value="rss">RSS</option>
                  <option value="web">Web</option>
                  <option value="manual">Manual</option>
                </select>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <Button variant="secondary" className="flex-1" onClick={() => setShowAddModal(false)}>
                Cancel
              </Button>
              <Button variant="primary" className="flex-1" onClick={handleAddSource}>
                Add Source
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
