import type { Response } from 'express'
import type { AuthRequest } from '../middleware/auth'
import Activity from '../models/Activity'
import ClientReview from '../models/ClientReview'
import Project, { type IProject } from '../models/Project'
import TeamReport from '../models/TeamReport'
import { updateProjectScores } from '../services/scoringService'

function getWeekNumber(date: Date): number {
  const firstDayOfYear = new Date(date.getFullYear(), 0, 1)
  const pastDaysOfYear = (date.getTime() - firstDayOfYear.getTime()) / 86400000
  return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7)
}

export const getTeamReports = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { projectId, weekNumber, year } = req.query
    const filter: Record<string, unknown> = {}

    if (projectId) filter.projectId = projectId
    if (weekNumber) filter.weekNumber = Number(weekNumber)
    if (year) filter.year = Number(year)

    const reports = await TeamReport.find(filter)
      .populate('projectId', 'name')
      .populate('submittedBy', 'name')
      .sort({ createdAt: -1 })

    res.json(reports)
  } catch (error) {
    console.error('Get team reports error:', error)
    res.status(500).json({ message: 'Server error' })
  }
}

export const submitTeamReport = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { projectId, tasksCompleted, tasksPending, workloadLevel, onTimeConfidence, blockers } =
      req.body

    const project = await Project.findById(projectId)
    if (!project) {
      res.status(404).json({ message: 'Project not found' })
      return
    }

    if (req.user?.teamId?.toString() !== project.teamId.toString()) {
      res.status(403).json({ message: 'You are not assigned to this project' })
      return
    }

    const now = new Date()
    const weekNumber = getWeekNumber(now)
    const year = now.getFullYear()

    const existingReport = await TeamReport.findOne({
      projectId,
      weekNumber,
      year,
    })

    if (existingReport) {
      res.status(400).json({ message: 'Report already submitted for this week' })
      return
    }

    const report = await TeamReport.create({
      projectId,
      submittedBy: req.user?._id,
      weekNumber,
      year,
      tasksCompleted,
      tasksPending,
      workloadLevel,
      onTimeConfidence,
      blockers: blockers || [],
    })

    await updateProjectScores(projectId, report)

    await Activity.create({
      projectId,
      type: 'report',
      actorId: req.user?._id,
      actorRole: 'team',
      description: `${req.user?.name} submitted weekly report`,
      metadata: {
        weekNumber,
        year,
        tasksCompleted,
        tasksPending,
      },
    })

    res.status(201).json(report)
  } catch (error) {
    console.error('Submit team report error:', error)
    res.status(500).json({ message: 'Server error' })
  }
}

export const getClientReviews = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { projectId, weekNumber, year } = req.query
    const filter: Record<string, unknown> = {}

    if (projectId) filter.projectId = projectId
    if (weekNumber) filter.weekNumber = Number(weekNumber)
    if (year) filter.year = Number(year)

    const reviews = await ClientReview.find(filter)
      .populate('projectId', 'name')
      .populate('submittedBy', 'name')
      .sort({ createdAt: -1 })

    res.json(reviews)
  } catch (error) {
    console.error('Get client reviews error:', error)
    res.status(500).json({ message: 'Server error' })
  }
}

export const submitClientReview = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const {
      projectId,
      deliveryQuality,
      responsiveness,
      overallSatisfaction,
      comment,
      flaggedProblem,
    } = req.body

    const project = await Project.findById(projectId)
    if (!project) {
      res.status(404).json({ message: 'Project not found' })
      return
    }

    if (req.user?._id.toString() !== project.clientId.toString()) {
      res.status(403).json({ message: 'You are not the client for this project' })
      return
    }

    const now = new Date()
    const weekNumber = getWeekNumber(now)
    const year = now.getFullYear()

    const existingReview = await ClientReview.findOne({
      projectId,
      weekNumber,
      year,
    })

    if (existingReview) {
      res.status(400).json({ message: 'Review already submitted for this week' })
      return
    }

    const review = await ClientReview.create({
      projectId,
      submittedBy: req.user?._id,
      weekNumber,
      year,
      deliveryQuality,
      responsiveness,
      overallSatisfaction,
      comment,
      flaggedProblem: flaggedProblem || false,
    })

    await updateProjectScores(projectId, undefined, review)

    const activityType = flaggedProblem ? 'flag' : 'review'
    await Activity.create({
      projectId,
      type: activityType,
      actorId: req.user?._id,
      actorRole: 'client',
      description: flaggedProblem
        ? `${req.user?.name} flagged a problem`
        : `${req.user?.name} submitted weekly review`,
      metadata: {
        weekNumber,
        year,
        satisfaction: overallSatisfaction,
        flagged: flaggedProblem,
      },
    })

    res.status(201).json(review)
  } catch (error) {
    console.error('Submit client review error:', error)
    res.status(500).json({ message: 'Server error' })
  }
}

export const getPendingReports = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = req.user
    const now = new Date()
    const weekNumber = getWeekNumber(now)
    const year = now.getFullYear()

    let projects: IProject[] = []

    if (user?.role === 'team' && user.teamId) {
      projects = await Project.find({
        teamId: user.teamId,
        status: { $in: ['planning', 'in_progress'] },
      })

      const projectIds = projects.map(p => p._id)
      const submittedReports = await TeamReport.find({
        projectId: { $in: projectIds },
        weekNumber,
        year,
      })

      const submittedProjectIds = new Set(submittedReports.map(r => r.projectId.toString()))
      const pending = projects.filter(p => !submittedProjectIds.has(p._id.toString()))

      res.json({
        type: 'team_report',
        pending: pending.map(p => ({ _id: p._id, name: p.name })),
        weekNumber,
        year,
      })
    } else if (user?.role === 'client') {
      projects = await Project.find({
        clientId: user._id,
        status: { $in: ['planning', 'in_progress'] },
      })

      const projectIds = projects.map(p => p._id)
      const submittedReviews = await ClientReview.find({
        projectId: { $in: projectIds },
        weekNumber,
        year,
      })

      const submittedProjectIds = new Set(submittedReviews.map(r => r.projectId.toString()))
      const pending = projects.filter(p => !submittedProjectIds.has(p._id.toString()))

      res.json({
        type: 'client_review',
        pending: pending.map(p => ({ _id: p._id, name: p.name })),
        weekNumber,
        year,
      })
    } else {
      res.json({ type: 'none', pending: [], weekNumber, year })
    }
  } catch (error) {
    console.error('Get pending reports error:', error)
    res.status(500).json({ message: 'Server error' })
  }
}
