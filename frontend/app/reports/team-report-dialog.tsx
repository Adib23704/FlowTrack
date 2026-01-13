'use client'

import { X } from 'lucide-react'
import { useState } from 'react'
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
import { useAuth } from '@/hooks/use-auth'
import api from '@/services/api'
import type { Project } from '@/types'

interface TeamReportDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
  projects: Project[]
}

export function TeamReportDialog({
  open,
  onOpenChange,
  onSuccess,
  projects,
}: TeamReportDialogProps) {
  const { token } = useAuth()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [blockers, setBlockers] = useState<Array<{ id: string; text: string }>>([])
  const [newBlocker, setNewBlocker] = useState('')
  const [blockerId, setBlockerId] = useState(0)

  const [formData, setFormData] = useState({
    projectId: '',
    tasksCompleted: 0,
    tasksPending: 0,
    workloadLevel: 'normal' as 'light' | 'normal' | 'heavy',
    onTimeConfidence: 3,
  })

  const getCurrentWeek = () => {
    const now = new Date()
    const start = new Date(now.getFullYear(), 0, 1)
    const diff = now.getTime() - start.getTime()
    const oneWeek = 604800000
    return Math.ceil(diff / oneWeek)
  }

  const addBlocker = () => {
    if (newBlocker.trim()) {
      setBlockers(prev => [...prev, { id: `blocker-${blockerId}`, text: newBlocker.trim() }])
      setBlockerId(prev => prev + 1)
      setNewBlocker('')
    }
  }

  const removeBlocker = (id: string) => {
    setBlockers(prev => prev.filter(b => b.id !== id))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!formData.projectId) {
      setError('Please select a project')
      return
    }

    if (!token) return

    setIsSubmitting(true)

    try {
      await api.post(
        '/reports/team',
        {
          ...formData,
          weekNumber: getCurrentWeek(),
          year: new Date().getFullYear(),
          blockers: blockers.map(b => b.text),
        },
        token
      )
      setFormData({
        projectId: '',
        tasksCompleted: 0,
        tasksPending: 0,
        workloadLevel: 'normal',
        onTimeConfidence: 3,
      })
      setBlockers([])
      onSuccess()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit report')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Submit Team Report</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <div className="rounded-md bg-red-50 p-3 text-sm text-red-600">{error}</div>}

          <div className="space-y-2">
            <Label>Project</Label>
            <Select
              value={formData.projectId}
              onValueChange={value => setFormData(prev => ({ ...prev, projectId: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a project" />
              </SelectTrigger>
              <SelectContent>
                {projects.map(project => (
                  <SelectItem key={project._id} value={project._id}>
                    {project.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="tasksCompleted">Tasks Completed</Label>
              <Input
                id="tasksCompleted"
                type="number"
                min={0}
                value={formData.tasksCompleted}
                onChange={e =>
                  setFormData(prev => ({
                    ...prev,
                    tasksCompleted: parseInt(e.target.value, 10) || 0,
                  }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tasksPending">Tasks Pending</Label>
              <Input
                id="tasksPending"
                type="number"
                min={0}
                value={formData.tasksPending}
                onChange={e =>
                  setFormData(prev => ({
                    ...prev,
                    tasksPending: parseInt(e.target.value, 10) || 0,
                  }))
                }
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Workload Level</Label>
            <Select
              value={formData.workloadLevel}
              onValueChange={value =>
                setFormData(prev => ({
                  ...prev,
                  workloadLevel: value as 'light' | 'normal' | 'heavy',
                }))
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="light">Light</SelectItem>
                <SelectItem value="normal">Normal</SelectItem>
                <SelectItem value="heavy">Heavy</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>On-Time Confidence (1-5)</Label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map(n => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, onTimeConfidence: n }))}
                  className={`h-10 w-10 rounded-lg border-2 font-medium transition-colors ${
                    formData.onTimeConfidence === n
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Blockers</Label>
            <div className="flex gap-2">
              <Input
                value={newBlocker}
                onChange={e => setNewBlocker(e.target.value)}
                placeholder="Add a blocker..."
                onKeyDown={e => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    addBlocker()
                  }
                }}
              />
              <Button type="button" variant="outline" onClick={addBlocker}>
                Add
              </Button>
            </div>
            {blockers.length > 0 && (
              <div className="mt-2 space-y-1">
                {blockers.map(blocker => (
                  <div
                    key={blocker.id}
                    className="flex items-center justify-between rounded bg-gray-50 px-3 py-2 text-sm"
                  >
                    <span>{blocker.text}</span>
                    <button
                      type="button"
                      onClick={() => removeBlocker(blocker.id)}
                      className="text-gray-400 hover:text-red-500"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Submitting...' : 'Submit Report'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
