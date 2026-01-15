import { cn } from '@/lib/utils'
import type { LoadRisk, ProjectStatus } from '@/types'

interface StatusBadgeProps {
  status: ProjectStatus
  className?: string
}

const statusConfig: Record<ProjectStatus, { label: string; className: string }> = {
  planning: {
    label: 'Planning',
    className: 'bg-slate-100 text-slate-600 ring-slate-200',
  },
  active: {
    label: 'Active',
    className: 'bg-indigo-50 text-indigo-700 ring-indigo-200',
  },
  in_progress: {
    label: 'In Progress',
    className: 'bg-blue-50 text-blue-700 ring-blue-200',
  },
  completed: {
    label: 'Completed',
    className: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  },
  on_hold: {
    label: 'On Hold',
    className: 'bg-amber-50 text-amber-700 ring-amber-200',
  },
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status] || statusConfig.planning
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset',
        config.className,
        className
      )}
    >
      {config.label}
    </span>
  )
}

interface RiskBadgeProps {
  risk: LoadRisk
  className?: string
}

const riskConfig: Record<LoadRisk, { label: string; dot: string; className: string }> = {
  low: {
    label: 'Low',
    dot: 'bg-emerald-500',
    className: 'text-emerald-700',
  },
  medium: {
    label: 'Medium',
    dot: 'bg-amber-500',
    className: 'text-amber-700',
  },
  high: {
    label: 'High',
    dot: 'bg-red-500',
    className: 'text-red-700',
  },
}

export function RiskBadge({ risk, className }: RiskBadgeProps) {
  const config = riskConfig[risk] || riskConfig.low
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 text-xs font-medium',
        config.className,
        className
      )}
    >
      <span className={cn('h-1.5 w-1.5 rounded-full', config.dot)} />
      {config.label}
    </span>
  )
}
