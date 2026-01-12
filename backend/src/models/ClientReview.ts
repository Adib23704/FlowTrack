import mongoose, { type Document, Schema } from 'mongoose'

export interface IClientReview extends Document {
  projectId: mongoose.Types.ObjectId
  submittedBy: mongoose.Types.ObjectId
  weekNumber: number
  year: number
  deliveryQuality: number
  responsiveness: number
  overallSatisfaction: number
  comment?: string
  flaggedProblem: boolean
  createdAt: Date
  updatedAt: Date
}

const clientReviewSchema = new Schema<IClientReview>(
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
    deliveryQuality: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    responsiveness: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    overallSatisfaction: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      default: '',
    },
    flaggedProblem: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
)

clientReviewSchema.index({ projectId: 1, weekNumber: 1, year: 1 })

export default mongoose.model<IClientReview>('ClientReview', clientReviewSchema)
