'use client'

import { Eye, Plus, Trash2 } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { EmptyState, PageHeader } from '@/components/shared'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useAuth } from '@/hooks/use-auth'
import api from '@/services/api'
import type { ClientReview, Project, TeamReport } from '@/types'
import { ClientReviewDialog } from './client-review-dialog'
import { ReportDetailsDialog } from './report-details-dialog'
import { TeamReportDialog } from './team-report-dialog'

interface TeamReportWithProject extends Omit<TeamReport, 'projectId' | 'submittedBy'> {
  projectId: Project | null
  submittedBy: { name: string } | null
}

interface ClientReviewWithProject extends Omit<ClientReview, 'projectId' | 'submittedBy'> {
  projectId: Project | null
  submittedBy: { name: string } | null
}

export default function ReportsPage() {
  const { token, user } = useAuth()
  const [teamReports, setTeamReports] = useState<TeamReportWithProject[]>([])
  const [clientReviews, setClientReviews] = useState<ClientReviewWithProject[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showTeamReportDialog, setShowTeamReportDialog] = useState(false)
  const [showClientReviewDialog, setShowClientReviewDialog] = useState(false)
  const [showDetailsDialog, setShowDetailsDialog] = useState(false)
  const [selectedReport, setSelectedReport] = useState<TeamReportWithProject | ClientReviewWithProject | null>(null)
  const [detailsType, setDetailsType] = useState<'team' | 'client'>('team')
  const [isDeleting, setIsDeleting] = useState(false)

  const fetchData = useCallback(async () => {
    if (!token) return
    try {
      const [reportsData, reviewsData, projectsData] = await Promise.all([
        api.get<TeamReportWithProject[]>('/reports/team', token),
        api.get<ClientReviewWithProject[]>('/reports/client', token),
        api.get<Project[]>('/projects', token),
      ])
      setTeamReports(reportsData)
      setClientReviews(reviewsData)
      setProjects(projectsData)
    } catch (error) {
      console.error('Failed to fetch reports:', error)
    } finally {
      setIsLoading(false)
    }
  }, [token])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const canSubmitTeamReport = user?.role === 'admin' || user?.role === 'team'
  const canSubmitClientReview = user?.role === 'admin' || user?.role === 'client'
  const isAdmin = user?.role === 'admin'

  const handleViewTeamReport = (report: TeamReportWithProject) => {
    setSelectedReport(report)
    setDetailsType('team')
    setShowDetailsDialog(true)
  }

  const handleViewClientReview = (review: ClientReviewWithProject) => {
    setSelectedReport(review)
    setDetailsType('client')
    setShowDetailsDialog(true)
  }

  const handleDelete = async () => {
    if (!selectedReport || !token) return

    setIsDeleting(true)
    try {
      const endpoint = detailsType === 'team'
        ? `/reports/team/${selectedReport._id}`
        : `/reports/client/${selectedReport._id}`
      await api.delete(endpoint, token)
      setShowDetailsDialog(false)
      setSelectedReport(null)
      fetchData()
    } catch (error) {
      console.error('Failed to delete report:', error)
    } finally {
      setIsDeleting(false)
    }
  }

  const getWorkloadBadgeColor = (level: string) => {
    switch (level) {
      case 'heavy':
        return 'bg-red-100 text-red-700'
      case 'normal':
        return 'bg-yellow-100 text-yellow-700'
      case 'light':
        return 'bg-green-100 text-green-700'
      default:
        return 'bg-gray-100 text-gray-700'
    }
  }

  return (
    <DashboardLayout allowedRoles={['admin', 'team', 'client']}>
      <PageHeader title="Reports" description="Weekly reports and client reviews">
        <div className="flex gap-2">
          {canSubmitTeamReport && (
            <Button variant="outline" onClick={() => setShowTeamReportDialog(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Team Report
            </Button>
          )}
          {canSubmitClientReview && (
            <Button onClick={() => setShowClientReviewDialog(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Client Review
            </Button>
          )}
        </div>
      </PageHeader>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
        </div>
      ) : (
        <Tabs defaultValue="team-reports" className="space-y-4">
          <TabsList>
            <TabsTrigger value="team-reports">Team Reports</TabsTrigger>
            <TabsTrigger value="client-reviews">Client Reviews</TabsTrigger>
          </TabsList>

          <TabsContent value="team-reports">
            <Card>
              <CardHeader>
                <CardTitle>Team Reports</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {teamReports.length === 0 ? (
                  <EmptyState
                    title="No team reports yet"
                    description="Team members can submit weekly reports to track progress"
                    className="py-12"
                  />
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Project</TableHead>
                        <TableHead>Week</TableHead>
                        <TableHead>Submitted By</TableHead>
                        <TableHead>Tasks</TableHead>
                        <TableHead>Workload</TableHead>
                        <TableHead>Confidence</TableHead>
                        <TableHead>Blockers</TableHead>
                        <TableHead className="w-[100px]">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {teamReports.map(report => (
                        <TableRow key={report._id}>
                          <TableCell className="font-medium">
                            {report.projectId?.name ?? 'Unknown'}
                          </TableCell>
                          <TableCell>
                            W{report.weekNumber}/{report.year}
                          </TableCell>
                          <TableCell>
                            {report.submittedBy?.name ?? 'Unknown'}
                          </TableCell>
                          <TableCell>
                            <span className="text-green-600">{report.tasksCompleted}</span>
                            {' / '}
                            <span className="text-yellow-600">{report.tasksPending}</span>
                          </TableCell>
                          <TableCell>
                            <span
                              className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${getWorkloadBadgeColor(report.workloadLevel)}`}
                            >
                              {report.workloadLevel}
                            </span>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              {[1, 2, 3, 4, 5].map(n => (
                                <div
                                  key={n}
                                  className={`h-2 w-2 rounded-full ${
                                    n <= report.onTimeConfidence ? 'bg-blue-500' : 'bg-gray-200'
                                  }`}
                                />
                              ))}
                            </div>
                          </TableCell>
                          <TableCell>
                            {report.blockers.length > 0 ? (
                              <span className="text-red-600">{report.blockers.length}</span>
                            ) : (
                              <span className="text-gray-400">None</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleViewTeamReport(report)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="client-reviews">
            <Card>
              <CardHeader>
                <CardTitle>Client Reviews</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {clientReviews.length === 0 ? (
                  <EmptyState
                    title="No client reviews yet"
                    description="Clients can submit weekly reviews to provide feedback"
                    className="py-12"
                  />
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Project</TableHead>
                        <TableHead>Week</TableHead>
                        <TableHead>Submitted By</TableHead>
                        <TableHead>Quality</TableHead>
                        <TableHead>Responsiveness</TableHead>
                        <TableHead>Satisfaction</TableHead>
                        <TableHead>Flagged</TableHead>
                        <TableHead className="w-[100px]">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {clientReviews.map(review => (
                        <TableRow key={review._id}>
                          <TableCell className="font-medium">
                            {review.projectId?.name ?? 'Unknown'}
                          </TableCell>
                          <TableCell>
                            W{review.weekNumber}/{review.year}
                          </TableCell>
                          <TableCell>
                            {review.submittedBy?.name ?? 'Unknown'}
                          </TableCell>
                          <TableCell>
                            <RatingDisplay value={review.deliveryQuality} />
                          </TableCell>
                          <TableCell>
                            <RatingDisplay value={review.responsiveness} />
                          </TableCell>
                          <TableCell>
                            <RatingDisplay value={review.overallSatisfaction} />
                          </TableCell>
                          <TableCell>
                            {review.flaggedProblem ? (
                              <span className="inline-flex rounded-full bg-red-100 px-2 py-1 text-xs font-medium text-red-700">
                                Flagged
                              </span>
                            ) : (
                              <span className="text-gray-400">No</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleViewClientReview(review)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}

      <TeamReportDialog
        open={showTeamReportDialog}
        onOpenChange={setShowTeamReportDialog}
        projects={projects}
        onSuccess={() => {
          setShowTeamReportDialog(false)
          fetchData()
        }}
      />

      <ClientReviewDialog
        open={showClientReviewDialog}
        onOpenChange={setShowClientReviewDialog}
        projects={projects}
        onSuccess={() => {
          setShowClientReviewDialog(false)
          fetchData()
        }}
      />

      <ReportDetailsDialog
        open={showDetailsDialog}
        onOpenChange={setShowDetailsDialog}
        type={detailsType}
        report={selectedReport}
        isAdmin={isAdmin}
        onDelete={handleDelete}
        isDeleting={isDeleting}
      />
    </DashboardLayout>
  )
}

function RatingDisplay({ value }: { value: number }) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map(n => (
        <div
          key={n}
          className={`h-2 w-2 rounded-full ${n <= value ? 'bg-yellow-400' : 'bg-gray-200'}`}
        />
      ))}
    </div>
  )
}
