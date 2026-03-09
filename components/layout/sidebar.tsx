'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useStore } from '@/lib/store';
import { cn } from '@/lib/utils';
import {
  Zap,
  LayoutDashboard,
  Globe,
  AlertCircle,
  GitBranch,
  Lightbulb,
  FileText,
  Megaphone,
  MessageSquare,
  CheckSquare,
  Shield,
  Bot,
  Settings,
  ChevronRight,
} from 'lucide-react';

type NavItem = {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge: string | null;
  pendingCount?: boolean;
};

const navItems: { section: string; items: NavItem[] }[] = [
  {
    section: 'Pipeline',
    items: [
      { href: '/', label: 'Dashboard', icon: LayoutDashboard, badge: null },
      { href: '/veille', label: 'Market Veille', icon: Globe, badge: 'A' },
      { href: '/pain-points', label: 'Pain Points', icon: AlertCircle, badge: 'B' },
      { href: '/clusters', label: 'Clusters', icon: GitBranch, badge: 'B' },
      { href: '/ideas', label: 'Ideas', icon: Lightbulb, badge: 'C/D' },
      { href: '/projects', label: 'Projects & PRDs', icon: FileText, badge: 'E' },
    ],
  },
  {
    section: 'Execution',
    items: [
      { href: '/gtm', label: 'GTM', icon: Megaphone, badge: 'G' },
      { href: '/feedback', label: 'Feedback', icon: MessageSquare, badge: 'H' },
    ],
  },
  {
    section: 'System',
    items: [
      { href: '/approvals', label: 'Approvals', icon: CheckSquare, badge: null, pendingCount: true },
      { href: '/audit', label: 'Audit Log', icon: Shield, badge: null },
      { href: '/agent-config', label: 'Agent Models', icon: Bot, badge: null },
      { href: '/settings', label: 'Settings', icon: Settings, badge: null },
    ],
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const pendingCount = useStore((s) => s.approvals.filter((a) => a.status === 'pending').length);

  return (
    <aside className="w-[240px] shrink-0 flex flex-col h-screen bg-[#0a0a12] border-r border-white/[0.06] overflow-y-auto">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-white/[0.06]">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-violet-600/20 border border-violet-500/30 flex items-center justify-center">
            <Zap className="h-4 w-4 text-violet-400" />
          </div>
          <div>
            <div className="text-sm font-bold text-slate-100 leading-none">AI Factory</div>
            <div className="text-[10px] text-slate-500 mt-0.5">Pipeline v0.1</div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-6">
        {navItems.map((section) => (
          <div key={section.section}>
            <div className="text-[10px] font-semibold uppercase tracking-widest text-slate-600 px-2 mb-2">
              {section.section}
            </div>
            <ul className="space-y-0.5">
              {section.items.map((item) => {
                const isActive = pathname === item.href;
                const Icon = item.icon;
                const itemPendingCount = item.pendingCount ? pendingCount : 0;

                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={cn(
                        'flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm font-medium transition-all duration-150 group',
                        isActive
                          ? 'bg-violet-600/20 text-violet-300 border border-violet-500/20'
                          : 'text-slate-500 hover:text-slate-300 hover:bg-white/[0.04] border border-transparent'
                      )}
                    >
                      <Icon
                        className={cn(
                          'h-4 w-4 shrink-0',
                          isActive ? 'text-violet-400' : 'text-slate-600 group-hover:text-slate-400'
                        )}
                      />
                      <span className="flex-1 truncate">{item.label}</span>

                      {/* Stage badge */}
                      {item.badge && (
                        <span
                          className={cn(
                            'text-[9px] font-bold px-1.5 py-0.5 rounded border',
                            isActive
                              ? 'bg-violet-500/20 text-violet-400 border-violet-500/30'
                              : 'bg-white/5 text-slate-600 border-white/10'
                          )}
                        >
                          {item.badge}
                        </span>
                      )}

                      {/* Pending count */}
                      {itemPendingCount > 0 && (
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-red-500/20 text-red-400 border border-red-500/30">
                          {itemPendingCount}
                        </span>
                      )}

                      {/* Active indicator */}
                      {isActive && (
                        <ChevronRight className="h-3 w-3 text-violet-500 shrink-0" />
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="px-4 py-4 border-t border-white/[0.06]">
        <div className="flex items-center gap-2 px-2 py-2 rounded-lg bg-white/[0.02] border border-white/[0.04]">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[10px] text-slate-500">Powered by GPT-4o</span>
        </div>
      </div>
    </aside>
  );
}
