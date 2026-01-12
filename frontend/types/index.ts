export type UserRole = 'admin' | 'team' | 'client'

export interface User {
  _id: string
  name: string
  email: string
  role: UserRole
  teamId?: string
  createdAt: string
  updatedAt: string
}

export interface Team {
  _id: string
  name: string
  description: string
  members: User[]
  createdBy: string
  createdAt: string
  updatedAt: string
}

export type ProjectStatus = 'planning' | 'in_progress' | 'completed' | 'on_hold'
export type LoadRisk = 'low' | 'medium' | 'high'

export interface Project {
  _id: string
  name: string
  description: string
  timeline: {
    startDate: string
    endDate: string
  }
  teamId: string | Team
  clientId: string | User
  status: ProjectStatus
  deliveryReliabilityScore: number
  clientHappinessIndex: number
  teamLoadRisk: LoadRisk
  createdAt: string
  updatedAt: string
}

export type WorkloadLevel = 'light' | 'normal' | 'heavy'

export interface TeamReport {
  _id: string
  projectId: string | Project
  submittedBy: string | User
  weekNumber: number
  year: number
  tasksCompleted: number
  tasksPending: number
  workloadLevel: WorkloadLevel
  onTimeConfidence: number
  blockers: string[]
  createdAt: string
  updatedAt: string
}

export interface ClientReview {
  _id: string
  projectId: string | Project
  submittedBy: string | User
  weekNumber: number
  year: number
  deliveryQuality: number
  responsiveness: number
  overallSatisfaction: number
  comment?: string
  flaggedProblem: boolean
  createdAt: string
  updatedAt: string
}

export type ActivityType = 'report' | 'review' | 'flag' | 'status_change'

export interface Activity {
  _id: string
  projectId: string
  type: ActivityType
  actorId: string
  actorRole: UserRole
  description: string
  metadata?: Record<string, unknown>
  createdAt: string
}

export interface AuthResponse {
  token: string
  user: User
}

export interface ApiError {
  message: string
  errors?: { field: string; message: string }[]
}
