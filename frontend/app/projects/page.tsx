'use client'

import { FolderKanban, Plus, Search } from 'lucide-react'
import Link from 'next/link'
import { useCallback, useEffect, useState } from 'react'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { EmptyState, PageHeader, RiskBadge, StatusBadge } from '@/components/shared'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useAuth } from '@/hooks/use-auth'
import api from '@/services/api'
import type { Project } from '@/types'
import { ProjectFormDialog } from './project-form-dialog'

export default function ProjectsPage() {
  const { token, user } = useAuth()
  const [projects, setProjects] = useState<Project[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [search, setSearch] = useState('')

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

  const filteredProjects = projects.filter(
    p =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.description?.toLowerCase().includes(search.toLowerCase())
  )

  const getTeamName = (project: Project) => {
    if (typeof project.teamId === 'object') {
      return project.teamId.name
    }
    return 'Unassigned'
  }

  const getClientName = (project: Project) => {
    if (typeof project.clientId === 'object') {
      return project.clientId.name
    }
    return 'No client'
  }

  return (
    <DashboardLayout>
      <PageHeader title="Projects" description="Manage and track all projects">
        {user?.role === 'admin' && (
          <Button onClick={() => setShowCreateDialog(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            New Project
          </Button>
        )}
      </PageHeader>

      <div className="mb-6">
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            placeholder="Search projects..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="h-10 pl-9 border-slate-200"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-[3px] border-slate-200 border-t-indigo-600" />
        </div>
      ) : filteredProjects.length === 0 ? (
        <EmptyState
          icon={<FolderKanban className="h-8 w-8" />}
          title={search ? 'No projects found' : 'No projects yet'}
          description={
            search
              ? 'Try adjusting your search terms'
              : 'Create your first project to get started tracking delivery and satisfaction.'
          }
          action={
            user?.role === 'admin' && !search ? (
              <Button onClick={() => setShowCreateDialog(true)} className="gap-2">
                <Plus className="h-4 w-4" />
                Create Project
              </Button>
            ) : undefined
          }
        />
      ) : (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50">
                <th className="px-5 py-3.5 text-left text-xs font-medium uppercase tracking-wide text-slate-500">
                  Project
                </th>
                <th className="px-5 py-3.5 text-left text-xs font-medium uppercase tracking-wide text-slate-500">
                  Team
                </th>
                <th className="px-5 py-3.5 text-left text-xs font-medium uppercase tracking-wide text-slate-500">
                  Client
                </th>
                <th className="px-5 py-3.5 text-left text-xs font-medium uppercase tracking-wide text-slate-500">
                  Status
                </th>
                <th className="px-5 py-3.5 text-left text-xs font-medium uppercase tracking-wide text-slate-500">
                  Reliability
                </th>
                <th className="px-5 py-3.5 text-left text-xs font-medium uppercase tracking-wide text-slate-500">
                  Happiness
                </th>
                <th className="px-5 py-3.5 text-left text-xs font-medium uppercase tracking-wide text-slate-500">
                  Load
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredProjects.map(project => (
                <tr key={project._id} className="group transition-colors hover:bg-slate-50/50">
                  <td className="px-5 py-4">
                    <Link href={`/projects/${project._id}`} className="block">
                      <span className="font-medium text-slate-900 group-hover:text-indigo-600">
                        {project.name}
                      </span>
                      {project.description && (
                        <p className="mt-0.5 max-w-xs truncate text-sm text-slate-500">
                          {project.description}
                        </p>
                      )}
                    </Link>
                  </td>
                  <td className="px-5 py-4 text-sm text-slate-600">{getTeamName(project)}</td>
                  <td className="px-5 py-4 text-sm text-slate-600">{getClientName(project)}</td>
                  <td className="px-5 py-4">
                    <StatusBadge status={project.status} />
                  </td>
                  <td className="px-5 py-4">
                    <ScoreDisplay value={project.deliveryReliabilityScore} />
                  </td>
                  <td className="px-5 py-4">
                    <ScoreDisplay value={project.clientHappinessIndex} />
                  </td>
                  <td className="px-5 py-4">
                    <RiskBadge risk={project.teamLoadRisk ?? 'low'} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

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

function ScoreDisplay({ value }: { value?: number }) {
  if (value === undefined || value === null) {
    return <span className="text-sm text-slate-400">—</span>
  }

  const getColor = (score: number) => {
    if (score >= 80) return 'text-emerald-600'
    if (score >= 60) return 'text-amber-600'
    return 'text-red-600'
  }

  return <span className={`text-sm font-medium ${getColor(value)}`}>{value}%</span>
}
