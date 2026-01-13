'use client'

import { Activity, AlertTriangle, CheckCircle, Clock, FileText, MessageSquare } from 'lucide-react'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { EmptyState, PageHeader } from '@/components/shared'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useAuth } from '@/hooks/use-auth'
import api from '@/services/api'
import type { Activity as ActivityType } from '@/types'

interface ActivityWithDetails extends Omit<ActivityType, 'projectId' | 'actorId'> {
  projectId: { _id: string; name: string } | null
  actorId: { _id: string; name: string } | null
}

const activityIcons: Record<string, React.ReactNode> = {
  report: <FileText className="h-4 w-4" />,
  review: <MessageSquare className="h-4 w-4" />,
  flag: <AlertTriangle className="h-4 w-4" />,
  status_change: <CheckCircle className="h-4 w-4" />,
  default: <Activity className="h-4 w-4" />,
}

const activityColors: Record<string, string> = {
  report: 'bg-blue-100 text-blue-600',
  review: 'bg-purple-100 text-purple-600',
  flag: 'bg-red-100 text-red-600',
  status_change: 'bg-green-100 text-green-600',
  default: 'bg-gray-100 text-gray-600',
}

export default function ActivityPage() {
  const { token } = useAuth()
  const [activities, setActivities] = useState<ActivityWithDetails[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filter, setFilter] = useState<string>('all')

  useEffect(() => {
    if (!token) return

    const fetchActivities = async () => {
      try {
        const url = filter === 'all' ? '/activities' : `/activities?type=${filter}`
        const data = await api.get<ActivityWithDetails[]>(url, token)
        setActivities(data)
      } catch (error) {
        console.error('Failed to fetch activities:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchActivities()
  }, [token, filter])

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (minutes < 1) return 'Just now'
    if (minutes < 60) return `${minutes}m ago`
    if (hours < 24) return `${hours}h ago`
    if (days < 7) return `${days}d ago`
    return date.toLocaleDateString()
  }

  const groupByDate = (items: ActivityWithDetails[]) => {
    const groups: Record<string, ActivityWithDetails[]> = {}

    for (const item of items) {
      const date = new Date(item.createdAt).toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'short',
        day: 'numeric',
      })
      if (!groups[date]) groups[date] = []
      groups[date].push(item)
    }

    return groups
  }

  const groupedActivities = groupByDate(activities)

  return (
    <DashboardLayout allowedRoles={['admin']}>
      <PageHeader title="Activity Feed" description="Recent activity across all projects">
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Activities</SelectItem>
            <SelectItem value="report">Team Reports</SelectItem>
            <SelectItem value="review">Client Reviews</SelectItem>
            <SelectItem value="flag">Flagged Issues</SelectItem>
            <SelectItem value="status_change">Status Changes</SelectItem>
          </SelectContent>
        </Select>
      </PageHeader>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
        </div>
      ) : activities.length === 0 ? (
        <EmptyState
          icon={<Activity className="h-12 w-12" />}
          title="No activities yet"
          description="Activity will appear here as team members and clients interact with projects"
        />
      ) : (
        <div className="space-y-8">
          {Object.entries(groupedActivities).map(([date, items]) => (
            <div key={date}>
              <h3 className="mb-4 text-sm font-medium text-gray-500">{date}</h3>
              <Card>
                <CardContent className="divide-y p-0">
                  {items.map(activity => (
                    <div key={activity._id} className="flex items-start gap-4 p-4">
                      <div
                        className={`mt-0.5 rounded-full p-2 ${activityColors[activity.type] || activityColors.default}`}
                      >
                        {activityIcons[activity.type] || activityIcons.default}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-900">{activity.description}</p>
                        <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-gray-500">
                          {activity.projectId && (
                            <Link
                              href={`/projects/${activity.projectId._id}`}
                              className="text-blue-600 hover:underline"
                            >
                              {activity.projectId.name}
                            </Link>
                          )}
                          {activity.actorId && (
                            <>
                              <span>by</span>
                              <span className="font-medium">{activity.actorId.name}</span>
                            </>
                          )}
                          <Badge variant="outline" className="text-xs">
                            {activity.actorRole}
                          </Badge>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {formatTime(activity.createdAt)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
      )}
    </DashboardLayout>
  )
}
