'use client';

import { usePathname } from 'next/navigation';
import { useStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Bell, Play } from 'lucide-react';

const routeLabels: Record<string, string> = {
  '/': 'Dashboard',
  '/veille': 'Market Veille',
  '/pain-points': 'Pain Points',
  '/clusters': 'Opportunity Map',
  '/ideas': 'Idea Backlog',
  '/projects': 'Projects & PRDs',
  '/gtm': 'Go-To-Market',
  '/feedback': 'Feedback & Learning',
  '/approvals': 'Review Queue',
  '/audit': 'Audit Log',
  '/agent-config': 'Agent Models',
  '/settings': 'Settings',
};

interface HeaderProps {
  title?: string;
}

export function Header({ title }: HeaderProps) {
  const pathname = usePathname();
  const pendingCount = useStore((s) => s.approvals.filter((a) => a.status === 'pending').length);

  const pageTitle = title || routeLabels[pathname] || 'AI Factory';

  return (
    <header className="h-14 flex items-center justify-between px-6 border-b border-white/[0.06] bg-[#0f0f17]/80 backdrop-blur-sm shrink-0">
      {/* Title */}
      <div>
        <h1 className="text-sm font-semibold text-slate-200">{pageTitle}</h1>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-3">
        {/* Notification bell */}
        <button className="relative p-2 rounded-lg hover:bg-white/5 text-slate-500 hover:text-slate-300 transition-colors">
          <Bell className="h-4 w-4" />
          {pendingCount > 0 && (
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
          )}
        </button>

        {/* Run Pipeline */}
        <Button
          variant="primary"
          size="sm"
          icon={<Play className="h-3 w-3" />}
        >
          Run Pipeline
        </Button>

        {/* User avatar */}
        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-violet-500 to-blue-500 flex items-center justify-center text-[10px] font-bold text-white">
          AF
        </div>
      </div>
    </header>
  );
}
