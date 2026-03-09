import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { formatDistanceToNow, format } from 'date-fns';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return format(d, 'MMM d, yyyy');
}

export function formatDateTime(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return format(d, 'MMM d, yyyy HH:mm');
}

export function timeAgo(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return formatDistanceToNow(d, { addSuffix: true });
}

export function truncate(str: string, length: number): string {
  if (str.length <= length) return str;
  return str.slice(0, length) + '...';
}

export function scoreToColor(score: number): string {
  if (score >= 80) return 'text-emerald-400';
  if (score >= 60) return 'text-amber-400';
  if (score >= 40) return 'text-orange-400';
  return 'text-red-400';
}

export function scoreToRingColor(score: number): string {
  if (score >= 80) return '#10b981';
  if (score >= 60) return '#f59e0b';
  if (score >= 40) return '#f97316';
  return '#ef4444';
}

export function scoreToLabel(score: number): string {
  if (score >= 80) return 'Excellent';
  if (score >= 60) return 'Good';
  if (score >= 40) return 'Fair';
  return 'Poor';
}

export function severityToColor(severity: number): string {
  if (severity === 5) return 'text-red-400';
  if (severity === 4) return 'text-orange-400';
  if (severity === 3) return 'text-amber-400';
  if (severity === 2) return 'text-blue-400';
  return 'text-slate-400';
}

export function severityToBg(severity: number): string {
  if (severity === 5) return 'bg-red-500/10 text-red-400 border-red-500/20';
  if (severity === 4) return 'bg-orange-500/10 text-orange-400 border-orange-500/20';
  if (severity === 3) return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
  if (severity === 2) return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
  return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
}

export function statusToColor(status: string): string {
  switch (status) {
    case 'approved':
    case 'live':
    case 'validated':
    case 'published':
      return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
    case 'pending':
    case 'draft':
      return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
    case 'rejected':
    case 'falling':
      return 'bg-red-500/10 text-red-400 border-red-500/20';
    case 'shortlisted':
    case 'selected':
    case 'building':
      return 'bg-violet-500/10 text-violet-400 border-violet-500/20';
    case 'rising':
      return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
    case 'stable':
      return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
    default:
      return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
  }
}

export function trendIcon(trend: string): string {
  if (trend === 'rising') return '↑';
  if (trend === 'falling') return '↓';
  return '→';
}

export function generateId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}
