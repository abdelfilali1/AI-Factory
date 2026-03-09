import { cn } from '@/lib/utils';
import type { AIReview } from '@/lib/types';
import { ScoreRing } from './score-ring';
import { Badge } from './badge';
import { CheckCircle, XCircle, ArrowRight } from 'lucide-react';

interface AIReviewCardProps {
  review: AIReview;
  className?: string;
  compact?: boolean;
}

export function AIReviewCard({ review, className, compact }: AIReviewCardProps) {
  const recVariant =
    review.recommendation === 'proceed'
      ? 'success'
      : review.recommendation === 'revise'
      ? 'warning'
      : 'error';

  const recLabel =
    review.recommendation === 'proceed'
      ? 'Proceed'
      : review.recommendation === 'revise'
      ? 'Revise'
      : 'Reject';

  return (
    <div
      className={cn(
        'rounded-xl border border-violet-500/20 bg-violet-500/5 p-4',
        'shadow-[0_0_20px_rgba(124,58,237,0.08)]',
        className
      )}
    >
      {/* Header */}
      <div className="flex items-start gap-4">
        <div>
          <ScoreRing score={review.score} size={compact ? 52 : 64} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-xs font-semibold text-violet-400 uppercase tracking-wider">
              AI Reviewer
            </span>
            <Badge variant={recVariant}>
              <ArrowRight className="h-2.5 w-2.5" />
              {recLabel}
            </Badge>
          </div>
          <p className={cn('text-slate-300', compact ? 'text-xs' : 'text-sm')}>
            {review.summary}
          </p>
        </div>
      </div>

      {/* Strengths & Weaknesses */}
      {!compact && (
        <div className="mt-4 grid grid-cols-1 gap-3">
          {review.strengths.length > 0 && (
            <div>
              <div className="text-xs font-medium text-emerald-400 mb-2">Strengths</div>
              <ul className="space-y-1.5">
                {review.strengths.map((s, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs text-slate-400">
                    <CheckCircle className="h-3.5 w-3.5 text-emerald-500 shrink-0 mt-0.5" />
                    {s}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {review.weaknesses.length > 0 && (
            <div>
              <div className="text-xs font-medium text-red-400 mb-2">Weaknesses</div>
              <ul className="space-y-1.5">
                {review.weaknesses.map((w, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs text-slate-400">
                    <XCircle className="h-3.5 w-3.5 text-red-500 shrink-0 mt-0.5" />
                    {w}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
