'use client'

import { useEffect, useState } from 'react'
import { FolderKanban, Users, UsersRound } from 'lucide-react'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { PageHeader, StatsCard } from '@/components/shared'
import { useAuth } from '@/hooks/use-auth'
import api from '@/services/api'

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
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (token && user?.role === 'admin') {
      api
        .get<DashboardStats>('/analytics/dashboard', token)
        .then(setStats)
        .catch(console.error)
        .finally(() => setIsLoading(false))
    } else {
      setIsLoading(false)
    }
  }, [token, user?.role])

  return (
    <DashboardLayout>
      <PageHeader
        title={`Welcome back, ${user?.name}`}
        description="Here's what's happening with your projects today."
      />

      {user?.role === 'admin' && (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <StatsCard
            title="Total Projects"
            value={isLoading ? '...' : stats?.totalProjects ?? 0}
            icon={<FolderKanban className="h-8 w-8" />}
          />
          <StatsCard
            title="Active Projects"
            value={isLoading ? '...' : stats?.activeProjects ?? 0}
            icon={<FolderKanban className="h-8 w-8" />}
          />
          <StatsCard
            title="Teams"
            value={isLoading ? '...' : stats?.totalTeams ?? 0}
            icon={<UsersRound className="h-8 w-8" />}
          />
          <StatsCard
            title="Clients"
            value={isLoading ? '...' : stats?.totalClients ?? 0}
            icon={<Users className="h-8 w-8" />}
          />
        </div>
      )}

      {user?.role === 'team' && (
        <div className="rounded-lg border bg-white p-6">
          <h2 className="text-lg font-semibold">Team Member Dashboard</h2>
          <p className="mt-2 text-gray-600">
            View your assigned projects and submit weekly reports from the Projects page.
          </p>
        </div>
      )}

      {user?.role === 'client' && (
        <div className="rounded-lg border bg-white p-6">
          <h2 className="text-lg font-semibold">Client Dashboard</h2>
          <p className="mt-2 text-gray-600">
            View your projects and submit weekly reviews from the Projects page.
          </p>
        </div>
      )}
    </DashboardLayout>
  )
}
