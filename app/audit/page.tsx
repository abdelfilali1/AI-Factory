'use client';

import { useState } from 'react';
import { useStore } from '@/lib/store';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatDateTime, truncate } from '@/lib/utils';
import { Shield, ChevronDown, ChevronRight, Download } from 'lucide-react';

export default function AuditPage() {
  const { auditEntries } = useStore();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [agentFilter, setAgentFilter] = useState('');
  const [actionFilter, setActionFilter] = useState('');

  const uniqueAgents = [...new Set(auditEntries.map((e) => e.agentName))];
  const uniqueActions = [...new Set(auditEntries.map((e) => e.action))];

  const filtered = auditEntries.filter((e) => {
    if (agentFilter && e.agentName !== agentFilter) return false;
    if (actionFilter && e.action !== actionFilter) return false;
    return true;
  });

  const agentVariant = (name: string) => {
    if (name.includes('Scanner')) return 'info';
    if (name.includes('Extractor')) return 'warning';
    if (name.includes('Scorer')) return 'success';
    if (name.includes('PRD')) return 'violet';
    if (name.includes('Reviewer')) return 'error';
    return 'muted';
  };

  const handleExport = () => {
    const rows = [
      ['Timestamp', 'Agent', 'Action', 'EntityType', 'EntityId', 'InputSummary', 'OutputSummary', 'TokensUsed', 'LatencyMs'],
      ...filtered.map((e) => [
        e.createdAt,
        e.agentName,
        e.action,
        e.entityType,
        e.entityId,
        `"${e.inputSummary.replace(/"/g, '""')}"`,
        `"${e.outputSummary.replace(/"/g, '""')}"`,
        e.tokensUsed,
        e.latencyMs,
      ]),
    ];
    const csv = rows.map((r) => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'audit-log.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-6 space-y-5">
      {/* Toolbar */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <Shield className="h-4 w-4 text-violet-400" />
          <span className="text-sm text-slate-400">{filtered.length} entries</span>
        </div>

        <select
          value={agentFilter}
          onChange={(e) => setAgentFilter(e.target.value)}
          className="bg-[#0f0f17] border border-white/[0.08] rounded-lg px-3 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-violet-500/50"
        >
          <option value="">All Agents</option>
          {uniqueAgents.map((a) => <option key={a} value={a}>{a}</option>)}
        </select>

        <select
          value={actionFilter}
          onChange={(e) => setActionFilter(e.target.value)}
          className="bg-[#0f0f17] border border-white/[0.08] rounded-lg px-3 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-violet-500/50"
        >
          <option value="">All Actions</option>
          {uniqueActions.map((a) => <option key={a} value={a}>{a}</option>)}
        </select>

        <div className="ml-auto">
          <Button variant="secondary" size="sm" icon={<Download className="h-3.5 w-3.5" />} onClick={handleExport}>
            Export CSV
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-white/[0.06] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-[#0f0f17] border-b border-white/[0.06]">
                {['Timestamp', 'Agent', 'Action', 'Entity', 'Input', 'Output', 'Tokens', 'Latency'].map((col) => (
                  <th key={col} className="text-left text-[10px] font-semibold text-slate-500 uppercase tracking-wider px-4 py-3 whitespace-nowrap">
                    {col}
                  </th>
                ))}
                <th className="w-8" />
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {filtered.map((entry) => (
                <>
                  <tr
                    key={entry.id}
                    className="hover:bg-white/[0.02] transition-colors cursor-pointer"
                    onClick={() => setExpandedId(expandedId === entry.id ? null : entry.id)}
                  >
                    <td className="px-4 py-3 text-xs text-slate-500 whitespace-nowrap">
                      {formatDateTime(entry.createdAt)}
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={agentVariant(entry.agentName) as 'info' | 'warning' | 'success' | 'violet' | 'error' | 'muted'} size="sm">
                        {entry.agentName}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs font-mono text-slate-400">{entry.action}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-xs text-slate-400">{entry.entityType}</div>
                      <div className="text-[10px] text-slate-600 font-mono">{entry.entityId.slice(0, 12)}</div>
                    </td>
                    <td className="px-4 py-3 max-w-[160px]">
                      <span className="text-xs text-slate-500">{truncate(entry.inputSummary, 50)}</span>
                    </td>
                    <td className="px-4 py-3 max-w-[160px]">
                      <span className="text-xs text-slate-500">{truncate(entry.outputSummary, 50)}</span>
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-400 whitespace-nowrap">
                      {entry.tokensUsed.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-xs whitespace-nowrap">
                      <span className={entry.latencyMs > 10000 ? 'text-amber-400' : 'text-emerald-400'}>
                        {(entry.latencyMs / 1000).toFixed(1)}s
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {expandedId === entry.id ? (
                        <ChevronDown className="h-3.5 w-3.5 text-slate-500" />
                      ) : (
                        <ChevronRight className="h-3.5 w-3.5 text-slate-600" />
                      )}
                    </td>
                  </tr>
                  {expandedId === entry.id && (
                    <tr key={`${entry.id}-detail`} className="bg-white/[0.01]">
                      <td colSpan={9} className="px-6 py-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-2">Input</div>
                            <pre className="text-xs text-slate-400 bg-[#0f0f17] rounded-lg p-3 border border-white/[0.04] overflow-auto max-h-32 whitespace-pre-wrap">
                              {entry.inputSummary}
                            </pre>
                          </div>
                          <div>
                            <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-2">Output</div>
                            <pre className="text-xs text-slate-400 bg-[#0f0f17] rounded-lg p-3 border border-white/[0.04] overflow-auto max-h-32 whitespace-pre-wrap">
                              {entry.outputSummary}
                            </pre>
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
      </div>
    </div>
  );
}
