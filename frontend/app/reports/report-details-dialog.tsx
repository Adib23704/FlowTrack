'use client'

import { AlertTriangle, Calendar, CheckCircle, Clock, User } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import type { Project, User as UserType } from '@/types'

interface TeamReportDetails {
  _id: string
  projectId: Project | null
  submittedBy: { name: string } | null
  weekNumber: number
  year: number
  tasksCompleted: number
  tasksPending: number
  workloadLevel: 'light' | 'normal' | 'heavy'
  onTimeConfidence: number
  blockers: string[]
  createdAt: string
}

interface ClientReviewDetails {
  _id: string
  projectId: Project | null
  submittedBy: { name: string } | null
  weekNumber: number
  year: number
  deliveryQuality: number
  responsiveness: number
  overallSatisfaction: number
  comment?: string
  flaggedProblem: boolean
  createdAt: string
}

interface ReportDetailsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  type: 'team' | 'client'
  report: TeamReportDetails | ClientReviewDetails | null
  isAdmin?: boolean
  onDelete?: () => void
  isDeleting?: boolean
}

function RatingDisplay({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-gray-600">{label}</span>
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map(n => (
          <div
            key={n}
            className={`h-3 w-3 rounded-full ${n <= value ? 'bg-yellow-400' : 'bg-gray-200'}`}
          />
        ))}
        <span className="ml-2 text-sm font-medium">{value}/5</span>
      </div>
    </div>
  )
}

function getWorkloadBadgeColor(level: string) {
  switch (level) {
    case 'heavy':
      return 'bg-red-100 text-red-700 border-red-200'
    case 'normal':
      return 'bg-yellow-100 text-yellow-700 border-yellow-200'
    case 'light':
      return 'bg-green-100 text-green-700 border-green-200'
    default:
      return 'bg-gray-100 text-gray-700 border-gray-200'
  }
}

export function ReportDetailsDialog({
  open,
  onOpenChange,
  type,
  report,
  isAdmin = false,
  onDelete,
  isDeleting = false,
}: ReportDetailsDialogProps) {
  if (!report) return null

  const isTeamReport = type === 'team'
  const teamReport = isTeamReport ? (report as TeamReportDetails) : null
  const clientReview = !isTeamReport ? (report as ClientReviewDetails) : null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {isTeamReport ? 'Team Report Details' : 'Client Review Details'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="rounded-lg bg-gray-50 p-4">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="font-semibold">
                {report.projectId?.name ?? 'Unknown Project'}
              </h3>
              <Badge variant="outline">
                W{report.weekNumber}/{report.year}
              </Badge>
            </div>
            <div className="flex flex-wrap gap-4 text-sm text-gray-600">
              <div className="flex items-center gap-1">
                <User className="h-4 w-4" />
                <span>{report.submittedBy?.name ?? 'Unknown'}</span>
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                <span>{new Date(report.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          </div>

          {teamReport && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-lg border p-3">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>Completed</span>
                  </div>
                  <p className="mt-1 text-2xl font-semibold text-green-600">
                    {teamReport.tasksCompleted}
                  </p>
                </div>
                <div className="rounded-lg border p-3">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Clock className="h-4 w-4 text-yellow-500" />
                    <span>Pending</span>
                  </div>
                  <p className="mt-1 text-2xl font-semibold text-yellow-600">
                    {teamReport.tasksPending}
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Workload Level</span>
                  <span
                    className={`inline-flex rounded-full border px-3 py-1 text-sm font-medium capitalize ${getWorkloadBadgeColor(teamReport.workloadLevel)}`}
                  >
                    {teamReport.workloadLevel}
                  </span>
                </div>

                <RatingDisplay
                  value={teamReport.onTimeConfidence}
                  label="On-Time Confidence"
                />
              </div>

              <div>
                <h4 className="mb-2 text-sm font-medium text-gray-700">Blockers</h4>
                {teamReport.blockers.length > 0 ? (
                  <ul className="space-y-2">
                    {teamReport.blockers.map((blocker, index) => (
                      <li
                        key={index}
                        className="flex items-start gap-2 rounded-md bg-red-50 p-2 text-sm text-red-700"
                      >
                        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                        <span>{blocker}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-gray-500">No blockers reported</p>
                )}
              </div>
            </>
          )}

          {clientReview && (
            <>
              <div className="space-y-3">
                <RatingDisplay
                  value={clientReview.deliveryQuality}
                  label="Delivery Quality"
                />
                <RatingDisplay
                  value={clientReview.responsiveness}
                  label="Responsiveness"
                />
                <RatingDisplay
                  value={clientReview.overallSatisfaction}
                  label="Overall Satisfaction"
                />
              </div>

              {clientReview.flaggedProblem && (
                <div className="flex items-center gap-2 rounded-md bg-red-50 p-3 text-red-700">
                  <AlertTriangle className="h-5 w-5" />
                  <span className="font-medium">Problem Flagged</span>
                </div>
              )}

              <div>
                <h4 className="mb-2 text-sm font-medium text-gray-700">Comment</h4>
                {clientReview.comment ? (
                  <p className="rounded-md bg-gray-50 p-3 text-sm text-gray-700">
                    {clientReview.comment}
                  </p>
                ) : (
                  <p className="text-sm text-gray-500">No comment provided</p>
                )}
              </div>
            </>
          )}
        </div>

        <DialogFooter className="mt-4">
          {isAdmin && onDelete && (
            <Button
              variant="outline"
              className="mr-auto text-red-600 hover:bg-red-50 hover:text-red-700"
              onClick={onDelete}
              disabled={isDeleting}
            >
              {isDeleting ? 'Deleting...' : 'Delete Report'}
            </Button>
          )}
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
