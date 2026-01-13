'use client'

import { AlertTriangle, TrendingDown } from 'lucide-react'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { PageHeader, RiskBadge, StatusBadge } from '@/components/shared'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useAuth } from '@/hooks/use-auth'
import api from '@/services/api'
import type { ClientReview, Project } from '@/types'

interface UnhappyClientsData {
  unhappyProjects: Project[]
  flaggedCount: number
  recentFlags: (ClientReview & { projectId: { name: string }; submittedBy: { name: string } })[]
}

interface HighLoadData {
  highLoadProjects: Project[]
  teamWorkloads: { teamId: string; projectCount: number; recentBlockers: string[] }[]
}

export default function AnalyticsPage() {
  const { token } = useAuth()
  const [projects, setProjects] = useState<Project[]>([])
  const [unhappyData, setUnhappyData] = useState<UnhappyClientsData | null>(null)
  const [highLoadData, setHighLoadData] = useState<HighLoadData | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!token) return

    Promise.all([
      api.get<Project[]>('/analytics/projects?sortBy=deliveryReliabilityScore&order=asc', token),
      api.get<UnhappyClientsData>('/analytics/unhappy-clients', token),
      api.get<HighLoadData>('/analytics/high-load-teams', token),
    ])
      .then(([projectsData, unhappy, highLoad]) => {
        setProjects(projectsData)
        setUnhappyData(unhappy)
        setHighLoadData(highLoad)
      })
      .catch(console.error)
      .finally(() => setIsLoading(false))
  }, [token])

  if (isLoading) {
    return (
      <DashboardLayout allowedRoles={['admin']}>
        <div className="flex items-center justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout allowedRoles={['admin']}>
      <PageHeader title="Analytics" description="Overview of project health and team performance" />

      <div className="grid gap-6 md:grid-cols-2 mb-8">
        <Card className="border-red-200 bg-red-50/50">
          <CardHeader className="flex flex-row items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            <CardTitle className="text-red-800">Unhappy Clients</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-red-600 mb-2">
              {unhappyData?.unhappyProjects.length ?? 0}
            </p>
            <p className="text-sm text-red-700">Projects with Client Happiness Index below 50%</p>
            {unhappyData && unhappyData.flaggedCount > 0 && (
              <p className="text-sm text-red-600 mt-2">
                {unhappyData.flaggedCount} flagged problems
              </p>
            )}
          </CardContent>
        </Card>

        <Card className="border-yellow-200 bg-yellow-50/50">
          <CardHeader className="flex flex-row items-center gap-2">
            <TrendingDown className="h-5 w-5 text-yellow-600" />
            <CardTitle className="text-yellow-800">High Load Teams</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-yellow-600 mb-2">
              {highLoadData?.highLoadProjects.length ?? 0}
            </p>
            <p className="text-sm text-yellow-700">Projects with high team load risk</p>
          </CardContent>
        </Card>
      </div>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Projects by Reliability Score</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Project</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Reliability</TableHead>
                <TableHead>Happiness</TableHead>
                <TableHead>Load Risk</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {projects.slice(0, 10).map(project => (
                <TableRow key={project._id}>
                  <TableCell>
                    <Link
                      href={`/projects/${project._id}`}
                      className="font-medium text-blue-600 hover:underline"
                    >
                      {project.name}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={project.status} />
                  </TableCell>
                  <TableCell>
                    <span
                      className={
                        project.deliveryReliabilityScore >= 70
                          ? 'text-green-600 font-medium'
                          : project.deliveryReliabilityScore >= 50
                            ? 'text-yellow-600 font-medium'
                            : 'text-red-600 font-medium'
                      }
                    >
                      {project.deliveryReliabilityScore}%
                    </span>
                  </TableCell>
                  <TableCell>
                    <span
                      className={
                        project.clientHappinessIndex >= 70
                          ? 'text-green-600 font-medium'
                          : project.clientHappinessIndex >= 50
                            ? 'text-yellow-600 font-medium'
                            : 'text-red-600 font-medium'
                      }
                    >
                      {project.clientHappinessIndex}%
                    </span>
                  </TableCell>
                  <TableCell>
                    <RiskBadge risk={project.teamLoadRisk} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {unhappyData && unhappyData.recentFlags.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Flagged Problems</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {unhappyData.recentFlags.map(flag => (
                <div key={flag._id} className="flex items-start gap-3 p-3 bg-red-50 rounded-lg">
                  <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5" />
                  <div>
                    <p className="font-medium">
                      {typeof flag.projectId === 'object' ? flag.projectId.name : 'Unknown Project'}
                    </p>
                    <p className="text-sm text-gray-600">{flag.comment || 'No comment provided'}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      Flagged by{' '}
                      {typeof flag.submittedBy === 'object' ? flag.submittedBy.name : 'Unknown'} on{' '}
                      {new Date(flag.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </DashboardLayout>
  )
}
