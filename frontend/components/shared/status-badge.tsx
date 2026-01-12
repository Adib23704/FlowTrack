import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import type { LoadRisk, ProjectStatus } from '@/types'

interface StatusBadgeProps {
  status: ProjectStatus
  className?: string
}

const statusConfig: Record<ProjectStatus, { label: string; className: string }> = {
  planning: {
    label: 'Planning',
    className: 'bg-gray-100 text-gray-700 hover:bg-gray-100',
  },
  in_progress: {
    label: 'In Progress',
    className: 'bg-blue-100 text-blue-700 hover:bg-blue-100',
  },
  completed: {
    label: 'Completed',
    className: 'bg-green-100 text-green-700 hover:bg-green-100',
  },
  on_hold: {
    label: 'On Hold',
    className: 'bg-yellow-100 text-yellow-700 hover:bg-yellow-100',
  },
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status]
  return (
    <Badge variant="secondary" className={cn(config.className, className)}>
      {config.label}
    </Badge>
  )
}

interface RiskBadgeProps {
  risk: LoadRisk
  className?: string
}

const riskConfig: Record<LoadRisk, { label: string; className: string }> = {
  low: {
    label: 'Low Risk',
    className: 'bg-green-100 text-green-700 hover:bg-green-100',
  },
  medium: {
    label: 'Medium Risk',
    className: 'bg-yellow-100 text-yellow-700 hover:bg-yellow-100',
  },
  high: {
    label: 'High Risk',
    className: 'bg-red-100 text-red-700 hover:bg-red-100',
  },
}

export function RiskBadge({ risk, className }: RiskBadgeProps) {
  const config = riskConfig[risk]
  return (
    <Badge variant="secondary" className={cn(config.className, className)}>
      {config.label}
    </Badge>
  )
}
