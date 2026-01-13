'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
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
import type { Project } from '@/types'

interface ClientReviewDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
  projects: Project[]
}

export function ClientReviewDialog({
  open,
  onOpenChange,
  onSuccess,
  projects,
}: ClientReviewDialogProps) {
  const { token } = useAuth()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  const [formData, setFormData] = useState({
    projectId: '',
    deliveryQuality: 3,
    responsiveness: 3,
    overallSatisfaction: 3,
    comment: '',
    flaggedProblem: false,
  })

  const getCurrentWeek = () => {
    const now = new Date()
    const start = new Date(now.getFullYear(), 0, 1)
    const diff = now.getTime() - start.getTime()
    const oneWeek = 604800000
    return Math.ceil(diff / oneWeek)
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
        '/reports/client',
        {
          ...formData,
          weekNumber: getCurrentWeek(),
          year: new Date().getFullYear(),
        },
        token
      )
      setFormData({
        projectId: '',
        deliveryQuality: 3,
        responsiveness: 3,
        overallSatisfaction: 3,
        comment: '',
        flaggedProblem: false,
      })
      onSuccess()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit review')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Submit Client Review</DialogTitle>
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

          <div className="space-y-2">
            <Label>Delivery Quality (1-5)</Label>
            <RatingSelector
              value={formData.deliveryQuality}
              onChange={value => setFormData(prev => ({ ...prev, deliveryQuality: value }))}
            />
          </div>

          <div className="space-y-2">
            <Label>Responsiveness (1-5)</Label>
            <RatingSelector
              value={formData.responsiveness}
              onChange={value => setFormData(prev => ({ ...prev, responsiveness: value }))}
            />
          </div>

          <div className="space-y-2">
            <Label>Overall Satisfaction (1-5)</Label>
            <RatingSelector
              value={formData.overallSatisfaction}
              onChange={value => setFormData(prev => ({ ...prev, overallSatisfaction: value }))}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="comment">Comment (optional)</Label>
            <Textarea
              id="comment"
              value={formData.comment}
              onChange={e => setFormData(prev => ({ ...prev, comment: e.target.value }))}
              placeholder="Share your feedback..."
              rows={3}
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="flaggedProblem"
              checked={formData.flaggedProblem}
              onChange={e => setFormData(prev => ({ ...prev, flaggedProblem: e.target.checked }))}
              className="rounded border-gray-300"
            />
            <Label htmlFor="flaggedProblem" className="text-sm font-normal cursor-pointer">
              Flag a problem with this project
            </Label>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Submitting...' : 'Submit Review'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function RatingSelector({ value, onChange }: { value: number; onChange: (value: number) => void }) {
  return (
    <div className="flex gap-2">
      {[1, 2, 3, 4, 5].map(n => (
        <button
          key={n}
          type="button"
          onClick={() => onChange(n)}
          className={`h-10 w-10 rounded-lg border-2 font-medium transition-colors ${
            value === n
              ? 'border-yellow-400 bg-yellow-50 text-yellow-700'
              : 'border-gray-200 hover:border-gray-300'
          }`}
        >
          {n}
        </button>
      ))}
    </div>
  )
}
