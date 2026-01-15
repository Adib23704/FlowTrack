'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { useAuth } from '@/hooks/use-auth'
import api from '@/services/api'
import type { Project, ProjectStatus, Team, User } from '@/types'

interface ProjectFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
  project?: Project
}

export function ProjectFormDialog({
  open,
  onOpenChange,
  onSuccess,
  project,
}: ProjectFormDialogProps) {
  const { token } = useAuth()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [teams, setTeams] = useState<Team[]>([])
  const [clients, setClients] = useState<User[]>([])

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    startDate: '',
    endDate: '',
    teamId: '',
    clientId: '',
    status: 'planning' as ProjectStatus,
  })

  useEffect(() => {
    if (open && token) {
      api.get<Team[]>('/teams', token).then(setTeams).catch(console.error)
      api.get<User[]>('/users?role=client', token).then(setClients).catch(console.error)
    }
  }, [open, token])

  useEffect(() => {
    if (!open) return
    if (project) {
      setFormData({
        name: project.name,
        description: project.description,
        startDate: project.timeline.startDate.split('T')[0],
        endDate: project.timeline.endDate.split('T')[0],
        teamId:
          typeof project.teamId === 'object' && project.teamId
            ? project.teamId._id
            : (project.teamId ?? ''),
        clientId:
          typeof project.clientId === 'object' && project.clientId
            ? project.clientId._id
            : (project.clientId ?? ''),
        status: project.status,
      })
    } else {
      setFormData({
        name: '',
        description: '',
        startDate: '',
        endDate: '',
        teamId: '',
        clientId: '',
        status: 'planning',
      })
    }
  }, [project, open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsSubmitting(true)

    if (!token) return

    try {
      const payload = {
        name: formData.name,
        description: formData.description,
        timeline: {
          startDate: formData.startDate,
          endDate: formData.endDate,
        },
        teamId: formData.teamId,
        clientId: formData.clientId,
        status: formData.status,
      }

      if (project) {
        await api.put(`/projects/${project._id}`, payload, token)
      } else {
        await api.post('/projects', payload, token)
      }

      onSuccess()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save project')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{project ? 'Edit Project' : 'Create Project'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <div className="rounded-md bg-red-50 p-3 text-sm text-red-600">{error}</div>}

          <div className="space-y-2">
            <Label htmlFor="name">Project Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate">Start Date</Label>
              <Input
                id="startDate"
                type="date"
                value={formData.startDate}
                onChange={e => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endDate">End Date</Label>
              <Input
                id="endDate"
                type="date"
                value={formData.endDate}
                onChange={e => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Team</Label>
            <Select
              value={formData.teamId}
              onValueChange={value => setFormData(prev => ({ ...prev, teamId: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a team" />
              </SelectTrigger>
              <SelectContent>
                {teams.map(team => (
                  <SelectItem key={team._id} value={team._id}>
                    {team.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Client</Label>
            <Select
              value={formData.clientId}
              onValueChange={value => setFormData(prev => ({ ...prev, clientId: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a client" />
              </SelectTrigger>
              <SelectContent>
                {clients.map(client => (
                  <SelectItem key={client._id} value={client._id}>
                    {client.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {project && (
            <div className="space-y-2">
              <Label>Status</Label>
              <Select
                value={formData.status}
                onValueChange={value =>
                  setFormData(prev => ({ ...prev, status: value as ProjectStatus }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="planning">Planning</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="on_hold">On Hold</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : project ? 'Update' : 'Create'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
