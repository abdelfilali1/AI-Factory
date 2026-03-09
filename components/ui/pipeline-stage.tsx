import { cn } from '@/lib/utils';

const STAGES = [
  { id: 'A', label: 'Veille' },
  { id: 'B', label: 'Pain Points' },
  { id: 'C', label: 'Clusters' },
  { id: 'D', label: 'Ideas' },
  { id: 'E', label: 'Scoring' },
  { id: 'F', label: 'PRD' },
  { id: 'G', label: 'GTM' },
  { id: 'H', label: 'Feedback' },
];

interface PipelineStageProps {
  currentStage?: string;
  completedStages?: string[];
  className?: string;
}

export function PipelineStage({ currentStage, completedStages = [], className }: PipelineStageProps) {
  return (
    <div className={cn('flex items-center gap-0', className)}>
      {STAGES.map((stage, i) => {
        const isCompleted = completedStages.includes(stage.id);
        const isCurrent = currentStage === stage.id;
        const isLast = i === STAGES.length - 1;

        return (
          <div key={stage.id} className="flex items-center">
            <div className="flex flex-col items-center gap-1">
              <div
                className={cn(
                  'w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border transition-all',
                  isCompleted
                    ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400'
                    : isCurrent
                    ? 'bg-violet-500/20 border-violet-500/60 text-violet-300'
                    : 'bg-white/5 border-white/10 text-slate-500'
                )}
              >
                {stage.id}
              </div>
              <span
                className={cn(
                  'text-[10px] font-medium whitespace-nowrap',
                  isCompleted
                    ? 'text-emerald-500'
                    : isCurrent
                    ? 'text-violet-400'
                    : 'text-slate-600'
                )}
              >
                {stage.label}
              </span>
            </div>
            {!isLast && (
              <div
                className={cn(
                  'w-8 h-px mb-4 transition-colors',
                  isCompleted ? 'bg-emerald-500/30' : 'bg-white/[0.06]'
                )}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
