'use client';

import { useState } from 'react';
import { useStore } from '@/lib/store';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { statusToColor, timeAgo, truncate } from '@/lib/utils';
import {
  CheckCircle,
  XCircle,
  AlertCircle,
  ChevronDown,
  ChevronRight,
  Clock,
} from 'lucide-react';

const STAGE_OPTIONS = ['All', 'Veille', 'Pain Points', 'Clusters', 'Ideas', 'PRDs', 'Deploy', 'GTM'];

const stageBadgeVariant = (stage: string): 'violet' | 'info' | 'warning' | 'success' | 'error' | 'muted' => {
  if (stage.includes('A') || stage.toLowerCase().includes('veille')) return 'info';
  if (stage.includes('B') || stage.toLowerCase().includes('cluster') || stage.toLowerCase().includes('pain')) return 'warning';
  if (stage.includes('C') || stage.includes('D') || stage.toLowerCase().includes('idea')) return 'violet';
  if (stage.includes('E') || stage.toLowerCase().includes('prd')) return 'success';
  if (stage.includes('G') || stage.toLowerCase().includes('gtm')) return 'info';
  return 'muted';
};

export default function ApprovalsPage() {
  const { approvals, approveItem, rejectItem } = useStore();
  const [tabFilter, setTabFilter] = useState('All');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [rejectingId, setRejectingId] = useState<string | null>(null);

  const filtered = approvals.filter((a) => {
    if (tabFilter === 'All') return true;
    return a.stage.toLowerCase().includes(tabFilter.toLowerCase()) ||
      a.entityType.toLowerCase().includes(tabFilter.toLowerCase());
  });

  const pending = approvals.filter((a) => a.status === 'pending');
  const approvedToday = approvals.filter((a) => {
    if (a.status !== 'approved') return false;
    const resolved = a.resolvedAt ? new Date(a.resolvedAt) : null;
    if (!resolved) return false;
    const today = new Date();
    return resolved.toDateString() === today.toDateString();
  });

  const handleApprove = (id: string) => {
    approveItem(id, 'User', notes[id]);
    setNotes((n) => ({ ...n, [id]: '' }));
    setRejectingId(null);
  };

  const handleReject = (id: string) => {
    rejectItem(id, 'User', notes[id]);
    setNotes((n) => ({ ...n, [id]: '' }));
    setRejectingId(null);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-[#13131d] border border-white/[0.06] rounded-xl p-4 flex items-center gap-3">
          <div className="p-2 bg-amber-500/10 rounded-lg">
            <Clock className="h-4 w-4 text-amber-400" />
          </div>
          <div>
            <div className="text-xl font-bold text-slate-100">{pending.length}</div>
            <div className="text-xs text-slate-500">Pending</div>
          </div>
        </div>
        <div className="bg-[#13131d] border border-white/[0.06] rounded-xl p-4 flex items-center gap-3">
          <div className="p-2 bg-emerald-500/10 rounded-lg">
            <CheckCircle className="h-4 w-4 text-emerald-400" />
          </div>
          <div>
            <div className="text-xl font-bold text-slate-100">{approvedToday.length}</div>
            <div className="text-xs text-slate-500">Approved Today</div>
          </div>
        </div>
        <div className="bg-[#13131d] border border-white/[0.06] rounded-xl p-4 flex items-center gap-3">
          <div className="p-2 bg-blue-500/10 rounded-lg">
            <AlertCircle className="h-4 w-4 text-blue-400" />
          </div>
          <div>
            <div className="text-xl font-bold text-slate-100">{approvals.length}</div>
            <div className="text-xs text-slate-500">Total Queue</div>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1 overflow-x-auto pb-1">
        {STAGE_OPTIONS.map((tab) => (
          <button
            key={tab}
            onClick={() => setTabFilter(tab)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
              tabFilter === tab
                ? 'bg-violet-600/20 text-violet-300 border border-violet-500/30'
                : 'text-slate-500 hover:text-slate-300 hover:bg-white/[0.04] border border-transparent'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Approval Cards */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-slate-500">
            <CheckCircle className="h-12 w-12 text-emerald-500/30 mb-3" />
            <p className="text-sm font-medium text-slate-400">Queue is clear!</p>
            <p className="text-xs text-slate-600 mt-1">All items have been reviewed.</p>
          </div>
        ) : (
          filtered.map((appr) => (
            <div
              key={appr.id}
              className="bg-[#13131d] border border-white/[0.06] rounded-xl overflow-hidden transition-all"
            >
              <div className="p-4">
                <div className="flex items-start justify-between gap-4">
                  {/* Left */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <Badge variant={stageBadgeVariant(appr.stage)}>
                        {appr.stage}
                      </Badge>
                      <span className={`text-xs px-1.5 py-0.5 rounded border ${statusToColor(appr.status)}`}>
                        {appr.status}
                      </span>
                    </div>
                    <h3 className="text-sm font-semibold text-slate-200">{appr.entityTitle}</h3>
                    <div className="flex items-center gap-3 mt-1 text-xs text-slate-500">
                      <span>{appr.entityType}</span>
                      <span>·</span>
                      <span>{timeAgo(appr.createdAt)}</span>
                      {appr.actor && <><span>·</span><span className="text-slate-400">by {appr.actor}</span></>}
                    </div>
                    {appr.notes && (
                      <p className="text-xs text-slate-500 mt-1.5 italic">{truncate(appr.notes, 100)}</p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 shrink-0">
                    {appr.status === 'pending' && (
                      <>
                        <Button
                          variant="success"
                          size="sm"
                          icon={<CheckCircle className="h-3 w-3" />}
                          onClick={() => handleApprove(appr.id)}
                        >
                          Approve
                        </Button>
                        <Button
                          variant="danger"
                          size="sm"
                          icon={<XCircle className="h-3 w-3" />}
                          onClick={() => setRejectingId(rejectingId === appr.id ? null : appr.id)}
                        >
                          Reject
                        </Button>
                      </>
                    )}
                    <button
                      onClick={() => setExpandedId(expandedId === appr.id ? null : appr.id)}
                      className="text-slate-500 hover:text-slate-300 transition-colors p-1"
                    >
                      {expandedId === appr.id ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Reject notes */}
                {rejectingId === appr.id && (
                  <div className="mt-3 pt-3 border-t border-white/[0.04] space-y-2">
                    <label className="text-xs text-slate-400">Rejection notes (optional)</label>
                    <textarea
                      rows={2}
                      value={notes[appr.id] || ''}
                      onChange={(e) => setNotes((n) => ({ ...n, [appr.id]: e.target.value }))}
                      placeholder="Explain the reason for rejection..."
                      className="w-full bg-[#0f0f17] border border-white/[0.08] rounded-lg px-3 py-2 text-xs text-slate-300 placeholder-slate-600 focus:outline-none focus:border-red-500/50 resize-none"
                    />
                    <div className="flex gap-2">
                      <Button variant="danger" size="sm" onClick={() => handleReject(appr.id)}>
                        Confirm Reject
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => setRejectingId(null)}>
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}
              </div>

              {/* Expanded details */}
              {expandedId === appr.id && (
                <div className="px-4 pb-4 pt-0 border-t border-white/[0.04]">
                  <div className="bg-[#0f0f17] rounded-lg p-3 mt-3 space-y-2">
                    <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Entity Details</div>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-slate-500">ID: </span>
                        <span className="text-slate-400 font-mono">{appr.entityId}</span>
                      </div>
                      <div>
                        <span className="text-slate-500">Type: </span>
                        <span className="text-slate-400">{appr.entityType}</span>
                      </div>
                      <div>
                        <span className="text-slate-500">Created: </span>
                        <span className="text-slate-400">{new Date(appr.createdAt).toLocaleString()}</span>
                      </div>
                      {appr.resolvedAt && (
                        <div>
                          <span className="text-slate-500">Resolved: </span>
                          <span className="text-slate-400">{new Date(appr.resolvedAt).toLocaleString()}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
