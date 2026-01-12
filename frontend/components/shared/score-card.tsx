import { cn } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface ScoreCardProps {
  title: string
  score: number
  maxScore?: number
  description?: string
  trend?: 'up' | 'down' | 'stable'
  className?: string
}

function getScoreColor(score: number): string {
  if (score >= 80) return 'text-green-600'
  if (score >= 60) return 'text-yellow-600'
  if (score >= 40) return 'text-orange-600'
  return 'text-red-600'
}

function getScoreBg(score: number): string {
  if (score >= 80) return 'bg-green-100'
  if (score >= 60) return 'bg-yellow-100'
  if (score >= 40) return 'bg-orange-100'
  return 'bg-red-100'
}

export function ScoreCard({
  title,
  score,
  maxScore = 100,
  description,
  className,
}: ScoreCardProps) {
  const percentage = Math.round((score / maxScore) * 100)

  return (
    <Card className={cn('', className)}>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-gray-600">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-end gap-2">
          <span className={cn('text-3xl font-bold', getScoreColor(percentage))}>{score}</span>
          <span className="mb-1 text-sm text-gray-500">/ {maxScore}</span>
        </div>
        <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-gray-200">
          <div
            className={cn('h-full rounded-full transition-all', getScoreBg(percentage))}
            style={{ width: `${percentage}%` }}
          />
        </div>
        {description && <p className="mt-2 text-xs text-gray-500">{description}</p>}
      </CardContent>
    </Card>
  )
}
