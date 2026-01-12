import type { IClientReview } from '../models/ClientReview'
import Project, { type LoadRisk } from '../models/Project'
import type { ITeamReport } from '../models/TeamReport'

export const calculateDeliveryReliabilityScore = (report: ITeamReport): number => {
  let score = 50

  const confidenceContribution = (report.onTimeConfidence / 5) * 25
  score += confidenceContribution

  const totalTasks = report.tasksCompleted + report.tasksPending
  if (totalTasks > 0) {
    const completionRatio = report.tasksCompleted / totalTasks
    score += completionRatio * 15
  }

  const blockerPenalty = Math.min(report.blockers.length * 5, 15)
  score -= blockerPenalty

  return Math.max(0, Math.min(100, Math.round(score)))
}

export const calculateClientHappinessIndex = (review: IClientReview): number => {
  let score = 0

  score += review.overallSatisfaction * 12
  score += review.responsiveness * 6
  score += review.deliveryQuality * 2

  if (review.flaggedProblem) {
    score -= 20
  }

  return Math.max(0, Math.min(100, Math.round(score)))
}

export const calculateTeamLoadRisk = (report: ITeamReport): LoadRisk => {
  if (report.workloadLevel === 'heavy' || report.tasksPending > 10 || report.blockers.length > 3) {
    return 'high'
  }

  if (
    report.workloadLevel === 'normal' &&
    (report.tasksPending > 5 || report.blockers.length > 1)
  ) {
    return 'medium'
  }

  return 'low'
}

export const updateProjectScores = async (
  projectId: string,
  teamReport?: ITeamReport,
  clientReview?: IClientReview
): Promise<void> => {
  const project = await Project.findById(projectId)
  if (!project) return

  if (teamReport) {
    project.deliveryReliabilityScore = calculateDeliveryReliabilityScore(teamReport)
    project.teamLoadRisk = calculateTeamLoadRisk(teamReport)
  }

  if (clientReview) {
    project.clientHappinessIndex = calculateClientHappinessIndex(clientReview)
  }

  await project.save()
}
