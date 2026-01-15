import { cn } from '@/lib/utils'

interface ScoreCardProps {
  title: string
  score: number
  maxScore?: number
  description?: string
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

function getScoreColor(score: number): { text: string; bg: string; ring: string } {
  if (score >= 80)
    return { text: 'text-emerald-600', bg: 'bg-emerald-500', ring: 'ring-emerald-100' }
  if (score >= 60) return { text: 'text-amber-600', bg: 'bg-amber-500', ring: 'ring-amber-100' }
  if (score >= 40) return { text: 'text-orange-600', bg: 'bg-orange-500', ring: 'ring-orange-100' }
  return { text: 'text-red-600', bg: 'bg-red-500', ring: 'ring-red-100' }
}

export function ScoreCard({
  title,
  score,
  maxScore = 100,
  description,
  size = 'md',
  className,
}: ScoreCardProps) {
  const percentage = Math.round((score / maxScore) * 100)
  const colors = getScoreColor(percentage)

  const sizeStyles = {
    sm: { card: 'p-4', title: 'text-xs', score: 'text-2xl', bar: 'h-1.5' },
    md: { card: 'p-5', title: 'text-sm', score: 'text-3xl', bar: 'h-2' },
    lg: { card: 'p-6', title: 'text-sm', score: 'text-4xl', bar: 'h-2.5' },
  }

  const styles = sizeStyles[size]

  return (
    <div
      className={cn(
        'rounded-xl border border-slate-200 bg-white transition-all hover:shadow-md',
        styles.card,
        className
      )}
    >
      <div className="mb-3 flex items-center justify-between">
        <p className={cn('font-medium text-slate-500', styles.title)}>{title}</p>
        <div
          className={cn('rounded-full px-2 py-0.5 text-xs font-medium', colors.ring, colors.text)}
        >
          {percentage >= 80
            ? 'Excellent'
            : percentage >= 60
              ? 'Good'
              : percentage >= 40
                ? 'Fair'
                : 'Needs work'}
        </div>
      </div>

      <div className="flex items-baseline gap-1">
        <span className={cn('font-bold tracking-tight', styles.score, colors.text)}>{score}</span>
        <span className="text-sm text-slate-400">/ {maxScore}</span>
      </div>

      <div className={cn('mt-4 w-full overflow-hidden rounded-full bg-slate-100', styles.bar)}>
        <div
          className={cn('h-full rounded-full transition-all duration-500 ease-out', colors.bg)}
          style={{ width: `${percentage}%` }}
        />
      </div>

      {description && <p className="mt-3 text-xs text-slate-500">{description}</p>}
    </div>
  )
}
