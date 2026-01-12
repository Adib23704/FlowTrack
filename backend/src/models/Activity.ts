import mongoose, { type Document, Schema } from 'mongoose'
import type { UserRole } from './User'

export type ActivityType = 'report' | 'review' | 'flag' | 'status_change'

export interface IActivity extends Document {
  projectId: mongoose.Types.ObjectId
  type: ActivityType
  actorId: mongoose.Types.ObjectId
  actorRole: UserRole
  description: string
  metadata?: Record<string, unknown>
  createdAt: Date
}

const activitySchema = new Schema<IActivity>(
  {
    projectId: {
      type: Schema.Types.ObjectId,
      ref: 'Project',
      required: true,
    },
    type: {
      type: String,
      enum: ['report', 'review', 'flag', 'status_change'],
      required: true,
    },
    actorId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    actorRole: {
      type: String,
      enum: ['admin', 'team', 'client'],
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    metadata: {
      type: Schema.Types.Mixed,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
)

activitySchema.index({ projectId: 1, createdAt: -1 })

export default mongoose.model<IActivity>('Activity', activitySchema)
