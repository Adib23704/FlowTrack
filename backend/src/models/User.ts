import bcrypt from 'bcryptjs'
import mongoose, { type Document, Schema } from 'mongoose'

export type UserRole = 'admin' | 'team' | 'client'

export interface IUser extends Document {
  name: string
  email: string
  password: string
  role: UserRole
  teamId?: mongoose.Types.ObjectId
  createdAt: Date
  updatedAt: Date
  comparePassword(candidatePassword: string): Promise<boolean>
}

const userSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    role: {
      type: String,
      enum: ['admin', 'team', 'client'],
      default: 'team',
    },
    teamId: {
      type: Schema.Types.ObjectId,
      ref: 'Team',
    },
  },
  {
    timestamps: true,
  }
)

userSchema.pre('save', async function () {
  if (!this.isModified('password')) return
  const salt = await bcrypt.genSalt(10)
  this.password = await bcrypt.hash(this.password, salt)
})

userSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password)
}

userSchema.set('toJSON', {
  transform: (_doc, ret) => {
    // biome-ignore lint/performance/noDelete: needed to remove password from response
    delete (ret as { password?: string }).password
    return ret
  },
})

export default mongoose.model<IUser>('User', userSchema)
