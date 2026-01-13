'use client'

import { Plus, Users } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { EmptyState, PageHeader } from '@/components/shared'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuth } from '@/hooks/use-auth'
import api from '@/services/api'
import type { Team } from '@/types'
import { TeamFormDialog } from './team-form-dialog'

export default function TeamsPage() {
  const { token } = useAuth()
  const [teams, setTeams] = useState<Team[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [editingTeam, setEditingTeam] = useState<Team | undefined>()

  const fetchTeams = useCallback(async () => {
    if (!token) return
    try {
      const data = await api.get<Team[]>('/teams', token)
      setTeams(data)
    } catch (error) {
      console.error('Failed to fetch teams:', error)
    } finally {
      setIsLoading(false)
    }
  }, [token])

  useEffect(() => {
    fetchTeams()
  }, [fetchTeams])

  const handleDelete = async (teamId: string) => {
    if (!token) return
    if (!confirm('Are you sure you want to delete this team?')) return
    try {
      await api.delete(`/teams/${teamId}`, token)
      fetchTeams()
    } catch (error) {
      console.error('Failed to delete team:', error)
    }
  }

  return (
    <DashboardLayout allowedRoles={['admin']}>
      <PageHeader title="Teams" description="Manage your teams and their members">
        <Button onClick={() => setShowCreateDialog(true)}>
          <Plus className="mr-2 h-4 w-4" />
          New Team
        </Button>
      </PageHeader>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
        </div>
      ) : teams.length === 0 ? (
        <EmptyState
          icon={<Users className="h-12 w-12" />}
          title="No teams yet"
          description="Create your first team to get started"
          action={
            <Button onClick={() => setShowCreateDialog(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Create Team
            </Button>
          }
        />
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {teams.map(team => (
            <Card key={team._id}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>{team.name}</span>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setEditingTeam(team)
                        setShowCreateDialog(true)
                      }}
                    >
                      Edit
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(team._id)}>
                      Delete
                    </Button>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-500 mb-4">{team.description || 'No description'}</p>
                <div>
                  <p className="text-sm font-medium mb-2">Members ({team.members.length})</p>
                  {team.members.length === 0 ? (
                    <p className="text-sm text-gray-400">No members</p>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {team.members.map(member => (
                        <div
                          key={member._id}
                          className="flex items-center gap-2 rounded-full bg-gray-100 px-3 py-1"
                        >
                          <Avatar className="h-6 w-6">
                            <AvatarFallback className="text-xs">
                              {member.name.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-sm">{member.name}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <TeamFormDialog
        open={showCreateDialog}
        onOpenChange={open => {
          setShowCreateDialog(open)
          if (!open) setEditingTeam(undefined)
        }}
        team={editingTeam}
        onSuccess={() => {
          setShowCreateDialog(false)
          setEditingTeam(undefined)
          fetchTeams()
        }}
      />
    </DashboardLayout>
  )
}
