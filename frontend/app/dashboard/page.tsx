'use client'

import {
  AlertTriangle,
  ArrowRight,
  ClipboardList,
  FolderKanban,
  TrendingUp,
  Users,
  UsersRound,
} from 'lucide-react'
import Link from 'next/link'
import { useCallback, useEffect, useState } from 'react'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { PageHeader, StatsCard } from '@/components/shared'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/hooks/use-auth'
import api from '@/services/api'
import type { Project } from '@/types'

interface DashboardStats {
  totalProjects: number
  activeProjects: number
  totalTeams: number
  totalClients: number
  projectsByStatus: Record<string, number>
}

export default function DashboardPage() {
  const { user, token } = useAuth()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [projects, setProjects] = useState<Project[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const fetchData = useCallback(async () => {
    if (!token) return

    try {
      const projectsData = await api.get<Project[]>('/projects', token)
      setProjects(projectsData)

      if (user?.role === 'admin') {
        const statsData = await api.get<DashboardStats>('/analytics/dashboard', token)
        setStats(statsData)
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error)
    } finally {
      setIsLoading(false)
    }
  }, [token, user?.role])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good morning'
    if (hour < 18) return 'Good afternoon'
    return 'Good evening'
  }

  const activeProjects = projects.filter(p => p.status === 'active' || p.status === 'in_progress')
  const atRiskProjects = projects.filter(
    p => p.teamLoadRisk === 'high' || (p.clientHappinessIndex ?? 0) < 60
  )

  return (
    <DashboardLayout>
      <PageHeader
        title={`${getGreeting()}, ${user?.name?.split(' ')[0]}`}
        description={
          user?.role === 'admin'
            ? "Here's an overview of your projects and team performance."
            : "Here's what's happening with your projects."
        }
      />

      {user?.role === 'admin' && (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatsCard
              title="Total Projects"
              value={isLoading ? '—' : (stats?.totalProjects ?? 0)}
              icon={<FolderKanban className="h-5 w-5" />}
            />
            <StatsCard
              title="Active Projects"
              value={isLoading ? '—' : (stats?.activeProjects ?? 0)}
              icon={<TrendingUp className="h-5 w-5" />}
              description="Currently in progress"
            />
            <StatsCard
              title="Teams"
              value={isLoading ? '—' : (stats?.totalTeams ?? 0)}
              icon={<UsersRound className="h-5 w-5" />}
            />
            <StatsCard
              title="Clients"
              value={isLoading ? '—' : (stats?.totalClients ?? 0)}
              icon={<Users className="h-5 w-5" />}
            />
          </div>

          {atRiskProjects.length > 0 && (
            <div className="mt-8 rounded-xl border border-amber-200 bg-amber-50 p-5">
              <div className="flex items-start gap-3">
                <div className="rounded-lg bg-amber-100 p-2">
                  <AlertTriangle className="h-5 w-5 text-amber-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-amber-900">Attention needed</h3>
                  <p className="mt-1 text-sm text-amber-700">
                    {atRiskProjects.length} project{atRiskProjects.length > 1 ? 's' : ''} need
                    attention due to high load risk or low satisfaction scores.
                  </p>
                  <Link
                    href="/analytics"
                    className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-amber-700 hover:text-amber-800"
                  >
                    View analytics
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      <div className="mt-8">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-medium text-slate-900">
            {user?.role === 'admin' ? 'Recent Projects' : 'Your Projects'}
          </h2>
          <Link href="/projects">
            <Button variant="ghost" size="sm" className="gap-1 text-slate-600">
              View all
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-[3px] border-slate-200 border-t-indigo-600" />
          </div>
        ) : activeProjects.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 py-12 text-center">
            <FolderKanban className="mx-auto h-10 w-10 text-slate-400" />
            <p className="mt-3 text-sm font-medium text-slate-600">No active projects</p>
            <p className="mt-1 text-xs text-slate-500">
              {user?.role === 'admin'
                ? 'Create a project to get started.'
                : 'You have no assigned projects yet.'}
            </p>
            {user?.role === 'admin' && (
              <Link href="/projects" className="mt-4 inline-block">
                <Button size="sm">Create Project</Button>
              </Link>
            )}
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {activeProjects.slice(0, 6).map(project => (
              <Link
                key={project._id}
                href={`/projects/${project._id}`}
                className="group rounded-xl border border-slate-200 bg-white p-5 transition-all hover:border-slate-300 hover:shadow-md"
              >
                <div className="flex items-start justify-between">
                  <div className="min-w-0 flex-1">
                    <h3 className="truncate font-medium text-slate-900 group-hover:text-indigo-600">
                      {project.name}
                    </h3>
                    <p className="mt-1 text-xs text-slate-500">
                      {typeof project.clientId === 'object' && project.clientId
                        ? project.clientId.name
                        : 'No client'}
                    </p>
                  </div>
                  <span
                    className={`shrink-0 rounded-full px-2 py-1 text-xs font-medium ${
                      project.teamLoadRisk === 'high'
                        ? 'bg-red-100 text-red-700'
                        : project.teamLoadRisk === 'medium'
                          ? 'bg-amber-100 text-amber-700'
                          : 'bg-emerald-100 text-emerald-700'
                    }`}
                  >
                    {project.teamLoadRisk || 'low'} risk
                  </span>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-3">
                  <div className="rounded-lg bg-slate-50 px-3 py-2">
                    <p className="text-xs text-slate-500">Reliability</p>
                    <p className="text-lg font-semibold text-slate-900">
                      {project.deliveryReliabilityScore ?? '—'}%
                    </p>
                  </div>
                  <div className="rounded-lg bg-slate-50 px-3 py-2">
                    <p className="text-xs text-slate-500">Happiness</p>
                    <p className="text-lg font-semibold text-slate-900">
                      {project.clientHappinessIndex ?? '—'}%
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {(user?.role === 'team' || user?.role === 'client') && (
        <div className="mt-8 rounded-xl border border-slate-200 bg-gradient-to-br from-slate-50 to-white p-6">
          <div className="flex items-start gap-4">
            <div className="rounded-lg bg-indigo-100 p-3">
              <ClipboardList className="h-6 w-6 text-indigo-600" />
            </div>
            <div>
              <h3 className="font-medium text-slate-900">
                {user.role === 'team' ? 'Submit your weekly report' : 'Share your feedback'}
              </h3>
              <p className="mt-1 text-sm text-slate-500">
                {user.role === 'team'
                  ? 'Keep your team updated on your progress, blockers, and workload.'
                  : 'Let us know how the project is going and rate your satisfaction.'}
              </p>
              <Link href="/reports" className="mt-4 inline-block">
                <Button size="sm" className="gap-1">
                  {user.role === 'team' ? 'Submit Report' : 'Submit Review'}
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  )
}
