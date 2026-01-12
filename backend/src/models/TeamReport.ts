import mongoose, { type Document, Schema } from 'mongoose'

export type WorkloadLevel = 'light' | 'normal' | 'heavy'

export interface ITeamReport extends Document {
  projectId: mongoose.Types.ObjectId
  submittedBy: mongoose.Types.ObjectId
  weekNumber: number
  year: number
  tasksCompleted: number
  tasksPending: number
  workloadLevel: WorkloadLevel
  onTimeConfidence: number
  blockers: string[]
  createdAt: Date
  updatedAt: Date
}

const teamReportSchema = new Schema<ITeamReport>(
  {
    projectId: {
      type: Schema.Types.ObjectId,
      ref: 'Project',
      required: true,
    },
    submittedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    weekNumber: {
      type: Number,
      required: true,
      min: 1,
      max: 53,
    },
    year: {
      type: Number,
      required: true,
    },
    tasksCompleted: {
      type: Number,
      required: true,
      min: 0,
    },
    tasksPending: {
      type: Number,
      required: true,
      min: 0,
    },
    workloadLevel: {
      type: String,
      enum: ['light', 'normal', 'heavy'],
      required: true,
    },
    onTimeConfidence: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    blockers: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  }
)

teamReportSchema.index({ projectId: 1, weekNumber: 1, year: 1 })

export default mongoose.model<ITeamReport>('TeamReport', teamReportSchema)
