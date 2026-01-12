import type { NextFunction, Request, Response } from 'express'
import { verifyToken } from '../utils/jwt'
import User, { type IUser } from '../models/User'

export interface AuthRequest extends Request {
  user?: IUser
}

export const authenticate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization

    if (!authHeader?.startsWith('Bearer ')) {
      res.status(401).json({ message: 'No token provided' })
      return
    }

    const token = authHeader.split(' ')[1]
    const decoded = verifyToken(token)

    const user = await User.findById(decoded.userId)
    if (!user) {
      res.status(401).json({ message: 'User not found' })
      return
    }

    req.user = user
    next()
  } catch {
    res.status(401).json({ message: 'Invalid token' })
  }
}
