import type { Response } from 'express'
import type { AuthRequest } from '../middleware/auth'
import ClientReview from '../models/ClientReview'
import Project from '../models/Project'
import Team from '../models/Team'
import TeamReport from '../models/TeamReport'
import User from '../models/User'

export const getDashboardStats = async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const [totalProjects, activeProjects, totalTeams, totalClients, projectsByStatus] =
      await Promise.all([
        Project.countDocuments(),
        Project.countDocuments({ status: { $in: ['planning', 'in_progress'] } }),
        Team.countDocuments(),
        User.countDocuments({ role: 'client' }),
        Project.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
      ])

    const statusCounts = projectsByStatus.reduce(
      (acc, curr) => {
        acc[curr._id] = curr.count
        return acc
      },
      {} as Record<string, number>
    )

    res.json({
      totalProjects,
      activeProjects,
      totalTeams,
      totalClients,
      projectsByStatus: statusCounts,
    })
  } catch (error) {
    console.error('Dashboard stats error:', error)
    res.status(500).json({ message: 'Server error' })
  }
}

export const getProjectsAnalytics = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { sortBy = 'deliveryReliabilityScore', order = 'asc' } = req.query

    const sortField = String(sortBy)
    const sortOrder = order === 'desc' ? -1 : 1

    const projects = await Project.find()
      .populate('teamId', 'name')
      .populate('clientId', 'name')
      .sort({ [sortField]: sortOrder })

    res.json(projects)
  } catch (error) {
    console.error('Projects analytics error:', error)
    res.status(500).json({ message: 'Server error' })
  }
}

export const getUnhappyClients = async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const unhappyProjects = await Project.find({
      $or: [{ clientHappinessIndex: { $lt: 50 } }],
      status: { $in: ['planning', 'in_progress'] },
    })
      .populate('teamId', 'name')
      .populate('clientId', 'name email')
      .sort({ clientHappinessIndex: 1 })

    const projectIds = unhappyProjects.map(p => p._id)
    const flaggedReviews = await ClientReview.find({
      projectId: { $in: projectIds },
      flaggedProblem: true,
    })
      .sort({ createdAt: -1 })
      .limit(10)

    const recentFlags = await ClientReview.find({ flaggedProblem: true })
      .populate('projectId', 'name')
      .populate('submittedBy', 'name')
      .sort({ createdAt: -1 })
      .limit(5)

    res.json({
      unhappyProjects,
      flaggedCount: flaggedReviews.length,
      recentFlags,
    })
  } catch (error) {
    console.error('Unhappy clients error:', error)
    res.status(500).json({ message: 'Server error' })
  }
}

export const getHighLoadTeams = async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const highLoadProjects = await Project.find({
      teamLoadRisk: 'high',
      status: { $in: ['planning', 'in_progress'] },
    })
      .populate('teamId', 'name members')
      .populate('clientId', 'name')
      .sort({ deliveryReliabilityScore: 1 })

    const teamIds = [...new Set(highLoadProjects.map(p => p.teamId._id.toString()))]

    const teamWorkloads = await Promise.all(
      teamIds.map(async teamId => {
        const projectCount = await Project.countDocuments({
          teamId,
          status: { $in: ['planning', 'in_progress'] },
        })

        const latestReports = await TeamReport.find({
          projectId: { $in: highLoadProjects.map(p => p._id) },
        })
          .sort({ createdAt: -1 })
          .limit(5)

        return {
          teamId,
          projectCount,
          recentBlockers: latestReports.flatMap(r => r.blockers).slice(0, 5),
        }
      })
    )

    res.json({
      highLoadProjects,
      teamWorkloads,
    })
  } catch (error) {
    console.error('High load teams error:', error)
    res.status(500).json({ message: 'Server error' })
  }
}

export const getProjectTrends = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { projectId } = req.params
    const { weeks = 8 } = req.query

    const teamReports = await TeamReport.find({ projectId })
      .sort({ year: -1, weekNumber: -1 })
      .limit(Number(weeks))

    const clientReviews = await ClientReview.find({ projectId })
      .sort({ year: -1, weekNumber: -1 })
      .limit(Number(weeks))

    const trends = {
      reliability: teamReports.reverse().map(r => ({
        week: `${r.year}-W${r.weekNumber}`,
        tasksCompleted: r.tasksCompleted,
        tasksPending: r.tasksPending,
        confidence: r.onTimeConfidence,
        blockers: r.blockers.length,
      })),
      satisfaction: clientReviews.reverse().map(r => ({
        week: `${r.year}-W${r.weekNumber}`,
        quality: r.deliveryQuality,
        responsiveness: r.responsiveness,
        satisfaction: r.overallSatisfaction,
        flagged: r.flaggedProblem,
      })),
    }

    res.json(trends)
  } catch (error) {
    console.error('Project trends error:', error)
    res.status(500).json({ message: 'Server error' })
  }
}
