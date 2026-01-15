'use client'

import { ArrowLeft, Edit, Trash2 } from 'lucide-react'
import { useParams, useRouter } from 'next/navigation'
import { useCallback, useEffect, useState } from 'react'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { PageHeader, RiskBadge, ScoreCard, StatusBadge } from '@/components/shared'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuth } from '@/hooks/use-auth'
import api from '@/services/api'
import type { Activity, Project } from '@/types'
import { ProjectFormDialog } from '../project-form-dialog'

export default function ProjectDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { token, user } = useAuth()
  const [project, setProject] = useState<Project | null>(null)
  const [activities, setActivities] = useState<Activity[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showEditDialog, setShowEditDialog] = useState(false)

  const fetchProject = useCallback(async () => {
    if (!token || !params.id) return
    try {
      const [projectData, activityData] = await Promise.all([
        api.get<Project>(`/projects/${params.id}`, token),
        api.get<Activity[]>(`/projects/${params.id}/activity`, token),
      ])
      setProject(projectData)
      setActivities(activityData)
    } catch (error) {
      console.error('Failed to fetch project:', error)
    } finally {
      setIsLoading(false)
    }
  }, [token, params.id])

  useEffect(() => {
    fetchProject()
  }, [fetchProject])

  const handleDelete = async () => {
    if (!token) return
    if (!confirm('Are you sure you want to delete this project?')) return
    try {
      await api.delete(`/projects/${params.id}`, token)
      router.push('/projects')
    } catch (error) {
      console.error('Failed to delete project:', error)
    }
  }

  const getTeamName = () => {
    if (project && typeof project.teamId === 'object' && project.teamId) {
      return project.teamId.name
    }
    return 'Unassigned'
  }

  const getClientName = () => {
    if (project && typeof project.clientId === 'object' && project.clientId) {
      return project.clientId.name
    }
    return 'No client'
  }

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
        </div>
      </DashboardLayout>
    )
  }

  if (!project) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <p className="text-gray-500">Project not found</p>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="mb-6">
        <Button variant="ghost" onClick={() => router.push('/projects')} className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Projects
        </Button>
      </div>

      <PageHeader title={project.name} description={project.description}>
        <StatusBadge status={project.status} />
        {user?.role === 'admin' && (
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setShowEditDialog(true)}>
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </Button>
          </div>
        )}
      </PageHeader>

      <div className="grid gap-6 md:grid-cols-3 mb-8">
        <ScoreCard
          title="Delivery Reliability Score"
          score={project.deliveryReliabilityScore}
          description="Based on task completion and on-time confidence"
        />
        <ScoreCard
          title="Client Happiness Index"
          score={project.clientHappinessIndex}
          description="Based on client satisfaction ratings"
        />
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Team Load Risk</CardTitle>
          </CardHeader>
          <CardContent>
            <RiskBadge risk={project.teamLoadRisk} />
            <p className="mt-2 text-xs text-gray-500">Based on workload and blockers</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Project Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Team</p>
                <p className="font-medium">{getTeamName()}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Client</p>
                <p className="font-medium">{getClientName()}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Start Date</p>
                <p className="font-medium">
                  {new Date(project.timeline.startDate).toLocaleDateString()}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">End Date</p>
                <p className="font-medium">
                  {new Date(project.timeline.endDate).toLocaleDateString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            {activities.length === 0 ? (
              <p className="text-sm text-gray-500">No activity yet</p>
            ) : (
              <div className="space-y-3">
                {activities.slice(0, 5).map(activity => (
                  <div key={activity._id} className="flex items-start gap-3">
                    <div
                      className={`mt-1 h-2 w-2 rounded-full ${
                        activity.type === 'flag'
                          ? 'bg-red-500'
                          : activity.type === 'report'
                            ? 'bg-blue-500'
                            : activity.type === 'review'
                              ? 'bg-green-500'
                              : 'bg-gray-500'
                      }`}
                    />
                    <div className="flex-1">
                      <p className="text-sm">{activity.description}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(activity.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {user?.role === 'admin' && project && (
        <ProjectFormDialog
          open={showEditDialog}
          onOpenChange={setShowEditDialog}
          project={project}
          onSuccess={() => {
            setShowEditDialog(false)
            fetchProject()
          }}
        />
      )}
    </DashboardLayout>
  )
}
