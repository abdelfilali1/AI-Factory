'use client';

import { useStore } from '@/lib/store';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { statusToColor, timeAgo } from '@/lib/utils';
import { FolderOpen, ArrowRight, Plus } from 'lucide-react';
import type { Project } from '@/lib/types';

const COLUMNS: { key: Project['status']; label: string }[] = [
  { key: 'draft', label: 'Draft' },
  { key: 'approved', label: 'Approved' },
  { key: 'building', label: 'Building' },
  { key: 'live', label: 'Live' },
];

const columnColors: Record<Project['status'], string> = {
  draft: 'border-amber-500/20',
  approved: 'border-violet-500/20',
  building: 'border-blue-500/20',
  live: 'border-emerald-500/20',
};

const columnHeaderColors: Record<Project['status'], string> = {
  draft: 'text-amber-400',
  approved: 'text-violet-400',
  building: 'text-blue-400',
  live: 'text-emerald-400',
};

export default function ProjectsPage() {
  const { projects, ideas } = useStore();

  return (
    <div className="p-6 h-full flex flex-col gap-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FolderOpen className="h-4 w-4 text-violet-400" />
          <span className="text-sm text-slate-400">{projects.length} projects</span>
        </div>
        <Button variant="primary" size="sm" icon={<Plus className="h-3.5 w-3.5" />}>
          Create from Idea
        </Button>
      </div>

      {/* Kanban */}
      <div className="flex gap-4 flex-1 overflow-x-auto pb-4">
        {COLUMNS.map((col) => {
          const colProjects = projects.filter((p) => p.status === col.key);
          return (
            <div key={col.key} className="w-72 shrink-0 flex flex-col gap-3">
              {/* Column Header */}
              <div className={`flex items-center justify-between px-3 py-2 rounded-lg bg-white/[0.02] border border-white/[0.04]`}>
                <span className={`text-xs font-semibold ${columnHeaderColors[col.key]}`}>
                  {col.label}
                </span>
                <span className="text-[10px] text-slate-500 px-1.5 py-0.5 bg-white/[0.04] rounded">
                  {colProjects.length}
                </span>
              </div>

              {/* Cards */}
              <div className="space-y-2">
                {colProjects.map((project) => {
                  const idea = ideas.find((i) => i.id === project.ideaId);
                  return (
                    <a
                      key={project.id}
                      href={`/projects/${project.id}`}
                      className={`block p-4 bg-[#13131d] border rounded-xl hover:border-white/[0.1] transition-all group ${columnColors[project.status]}`}
                    >
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <span className={`text-xs px-1.5 py-0.5 rounded border ${statusToColor(project.status)}`}>
                          {project.status}
                        </span>
                        <span className="text-[10px] text-slate-600">{timeAgo(project.createdAt)}</span>
                      </div>
                      <h3 className="text-sm font-semibold text-slate-200 leading-snug group-hover:text-white mb-2">
                        {project.ideaTitle}
                      </h3>
                      {idea && (
                        <Badge variant="muted" size="sm">{idea.type}</Badge>
                      )}
                      <div className="flex items-center gap-1 mt-3 text-xs text-violet-400 group-hover:text-violet-300">
                        View PRD <ArrowRight className="h-3 w-3" />
                      </div>
                    </a>
                  );
                })}

                {colProjects.length === 0 && (
                  <div className="flex items-center justify-center py-8 rounded-lg border border-dashed border-white/[0.04] text-slate-600 text-xs">
                    Empty
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
