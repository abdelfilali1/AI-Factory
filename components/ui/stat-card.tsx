import { cn } from '@/lib/utils';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  accentColor?: string;
  className?: string;
}

export function StatCard({
  icon,
  label,
  value,
  change,
  changeLabel,
  accentColor = 'violet',
  className,
}: StatCardProps) {
  const isPositive = change !== undefined && change >= 0;

  const colorMap: Record<string, string> = {
    violet: 'bg-violet-500/10 text-violet-400',
    emerald: 'bg-emerald-500/10 text-emerald-400',
    blue: 'bg-blue-500/10 text-blue-400',
    amber: 'bg-amber-500/10 text-amber-400',
    red: 'bg-red-500/10 text-red-400',
  };

  const iconBg = colorMap[accentColor] || colorMap.violet;

  return (
    <div
      className={cn(
        'bg-[#13131d] border border-white/[0.06] rounded-xl p-5',
        'hover:border-white/10 transition-all duration-200',
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div className={cn('p-2.5 rounded-lg', iconBg)}>
          {icon}
        </div>
        {change !== undefined && (
          <div
            className={cn(
              'flex items-center gap-1 text-xs font-medium',
              isPositive ? 'text-emerald-400' : 'text-red-400'
            )}
          >
            {isPositive ? (
              <TrendingUp className="h-3 w-3" />
            ) : (
              <TrendingDown className="h-3 w-3" />
            )}
            {Math.abs(change)}%
          </div>
        )}
      </div>
      <div className="mt-4">
        <div className="text-2xl font-bold text-slate-100">{value}</div>
        <div className="text-xs text-slate-500 mt-1">{label}</div>
        {changeLabel && (
          <div className="text-xs text-slate-600 mt-0.5">{changeLabel}</div>
        )}
      </div>
    </div>
  );
}
