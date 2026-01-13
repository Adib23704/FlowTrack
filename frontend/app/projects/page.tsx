'use client'

import { Plus } from 'lucide-react'
import Link from 'next/link'
import { useCallback, useEffect, useState } from 'react'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { EmptyState, PageHeader, RiskBadge, StatusBadge } from '@/components/shared'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
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
import type { Project } from '@/types'
import { ProjectFormDialog } from './project-form-dialog'

export default function ProjectsPage() {
  const { token, user } = useAuth()
  const [projects, setProjects] = useState<Project[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showCreateDialog, setShowCreateDialog] = useState(false)

  const fetchProjects = useCallback(async () => {
    if (!token) return
    try {
      const data = await api.get<Project[]>('/projects', token)
      setProjects(data)
    } catch (error) {
      console.error('Failed to fetch projects:', error)
    } finally {
      setIsLoading(false)
    }
  }, [token])

  useEffect(() => {
    fetchProjects()
  }, [fetchProjects])

  const getTeamName = (project: Project) => {
    if (typeof project.teamId === 'object') {
      return project.teamId.name
    }
    return 'Unknown'
  }

  const getClientName = (project: Project) => {
    if (typeof project.clientId === 'object') {
      return project.clientId.name
    }
    return 'Unknown'
  }

  return (
    <DashboardLayout>
      <PageHeader title="Projects" description="Manage and track all projects">
        {user?.role === 'admin' && (
          <Button onClick={() => setShowCreateDialog(true)}>
            <Plus className="mr-2 h-4 w-4" />
            New Project
          </Button>
        )}
      </PageHeader>

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
            </div>
          ) : projects.length === 0 ? (
            <EmptyState
              title="No projects yet"
              description="Create your first project to get started"
              className="py-12"
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Project</TableHead>
                  <TableHead>Team</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Reliability</TableHead>
                  <TableHead>Happiness</TableHead>
                  <TableHead>Load Risk</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {projects.map(project => (
                  <TableRow key={project._id}>
                    <TableCell>
                      <Link
                        href={`/projects/${project._id}`}
                        className="font-medium text-blue-600 hover:underline"
                      >
                        {project.name}
                      </Link>
                      <p className="text-sm text-gray-500 truncate max-w-xs">
                        {project.description}
                      </p>
                    </TableCell>
                    <TableCell>{getTeamName(project)}</TableCell>
                    <TableCell>{getClientName(project)}</TableCell>
                    <TableCell>
                      <StatusBadge status={project.status} />
                    </TableCell>
                    <TableCell>
                      <span
                        className={
                          project.deliveryReliabilityScore >= 70
                            ? 'text-green-600'
                            : project.deliveryReliabilityScore >= 50
                              ? 'text-yellow-600'
                              : 'text-red-600'
                        }
                      >
                        {project.deliveryReliabilityScore}%
                      </span>
                    </TableCell>
                    <TableCell>
                      <span
                        className={
                          project.clientHappinessIndex >= 70
                            ? 'text-green-600'
                            : project.clientHappinessIndex >= 50
                              ? 'text-yellow-600'
                              : 'text-red-600'
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
          )}
        </CardContent>
      </Card>

      {user?.role === 'admin' && (
        <ProjectFormDialog
          open={showCreateDialog}
          onOpenChange={setShowCreateDialog}
          onSuccess={() => {
            setShowCreateDialog(false)
            fetchProjects()
          }}
        />
      )}
    </DashboardLayout>
  )
}
