import { TrendingDown, TrendingUp } from 'lucide-react'
import { cn } from '@/lib/utils'

interface StatsCardProps {
  title: string
  value: string | number
  icon?: React.ReactNode
  description?: string
  trend?: { value: number; label: string }
  className?: string
}

export function StatsCard({ title, value, icon, description, trend, className }: StatsCardProps) {
  const isPositive = trend && trend.value >= 0

  return (
    <div
      className={cn(
        'group relative overflow-hidden rounded-xl border border-slate-200 bg-white p-5 transition-all hover:border-slate-300 hover:shadow-md',
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <p className="text-3xl font-semibold tracking-tight text-slate-900">{value}</p>
          {trend && (
            <div className="flex items-center gap-1.5">
              <span
                className={cn(
                  'flex items-center gap-0.5 text-xs font-medium',
                  isPositive ? 'text-emerald-600' : 'text-red-600'
                )}
              >
                {isPositive ? (
                  <TrendingUp className="h-3 w-3" />
                ) : (
                  <TrendingDown className="h-3 w-3" />
                )}
                {Math.abs(trend.value)}%
              </span>
              <span className="text-xs text-slate-400">{trend.label}</span>
            </div>
          )}
          {description && <p className="text-xs text-slate-400">{description}</p>}
        </div>
        {icon && (
          <div className="rounded-lg bg-slate-100 p-2.5 text-slate-500 transition-colors group-hover:bg-indigo-50 group-hover:text-indigo-600">
            {icon}
          </div>
        )}
      </div>
    </div>
  )
}
