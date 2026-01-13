'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useAuth } from '@/hooks/use-auth'
import api from '@/services/api'
import type { Team, User } from '@/types'

interface TeamFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
  team?: Team
}

export function TeamFormDialog({ open, onOpenChange, onSuccess, team }: TeamFormDialogProps) {
  const { token } = useAuth()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [availableMembers, setAvailableMembers] = useState<User[]>([])
  const [selectedMembers, setSelectedMembers] = useState<string[]>([])

  const [formData, setFormData] = useState({
    name: '',
    description: '',
  })

  useEffect(() => {
    if (open && token) {
      api.get<User[]>('/users?role=team', token).then(setAvailableMembers).catch(console.error)
    }
  }, [open, token])

  useEffect(() => {
    if (!open) return
    if (team) {
      setFormData({
        name: team.name,
        description: team.description,
      })
      setSelectedMembers(team.members.map(m => m._id))
    } else {
      setFormData({ name: '', description: '' })
      setSelectedMembers([])
    }
  }, [team, open])

  const toggleMember = (memberId: string) => {
    setSelectedMembers(prev =>
      prev.includes(memberId) ? prev.filter(id => id !== memberId) : [...prev, memberId]
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!token) return
    setError('')
    setIsSubmitting(true)

    try {
      if (team) {
        await api.put(`/teams/${team._id}`, formData, token)

        const currentMemberIds = team.members.map(m => m._id)
        const toAdd = selectedMembers.filter(id => !currentMemberIds.includes(id))
        const toRemove = currentMemberIds.filter(id => !selectedMembers.includes(id))

        for (const userId of toAdd) {
          await api.post(`/teams/${team._id}/members`, { userId }, token)
        }
        for (const userId of toRemove) {
          await api.delete(`/teams/${team._id}/members/${userId}`, token)
        }
      } else {
        await api.post('/teams', { ...formData, members: selectedMembers }, token)
      }

      onSuccess()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save team')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{team ? 'Edit Team' : 'Create Team'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <div className="rounded-md bg-red-50 p-3 text-sm text-red-600">{error}</div>}

          <div className="space-y-2">
            <Label htmlFor="name">Team Name</Label>
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

          <div className="space-y-2">
            <Label>Members</Label>
            <div className="max-h-48 overflow-y-auto rounded-md border p-2 space-y-1">
              {availableMembers.length === 0 ? (
                <p className="text-sm text-gray-400 py-2 text-center">No team members available</p>
              ) : (
                availableMembers.map(member => (
                  <label
                    key={member._id}
                    className="flex items-center gap-2 rounded p-2 hover:bg-gray-50 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={selectedMembers.includes(member._id)}
                      onChange={() => toggleMember(member._id)}
                      className="rounded"
                    />
                    <span className="text-sm">{member.name}</span>
                    <span className="text-xs text-gray-400">{member.email}</span>
                  </label>
                ))
              )}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : team ? 'Update' : 'Create'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
