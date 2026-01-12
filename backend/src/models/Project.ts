import mongoose, { type Document, Schema } from 'mongoose'

export type ProjectStatus = 'planning' | 'in_progress' | 'completed' | 'on_hold'
export type LoadRisk = 'low' | 'medium' | 'high'

export interface IProject extends Document {
  name: string
  description: string
  timeline: {
    startDate: Date
    endDate: Date
  }
  teamId: mongoose.Types.ObjectId
  clientId: mongoose.Types.ObjectId
  status: ProjectStatus
  deliveryReliabilityScore: number
  clientHappinessIndex: number
  teamLoadRisk: LoadRisk
  createdAt: Date
  updatedAt: Date
}

const projectSchema = new Schema<IProject>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: '',
    },
    timeline: {
      startDate: {
        type: Date,
        required: true,
      },
      endDate: {
        type: Date,
        required: true,
      },
    },
    teamId: {
      type: Schema.Types.ObjectId,
      ref: 'Team',
      required: true,
    },
    clientId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    status: {
      type: String,
      enum: ['planning', 'in_progress', 'completed', 'on_hold'],
      default: 'planning',
    },
    deliveryReliabilityScore: {
      type: Number,
      default: 50,
      min: 0,
      max: 100,
    },
    clientHappinessIndex: {
      type: Number,
      default: 50,
      min: 0,
      max: 100,
    },
    teamLoadRisk: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'low',
    },
  },
  {
    timestamps: true,
  }
)

export default mongoose.model<IProject>('Project', projectSchema)
