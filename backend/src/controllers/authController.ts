import type { Request, Response } from 'express'
import User from '../models/User'
import { generateToken } from '../utils/jwt'
import type { AuthRequest } from '../middleware/auth'

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      res.status(400).json({ message: 'Email and password are required' })
      return
    }

    const user = await User.findOne({ email: email.toLowerCase() })
    if (!user) {
      res.status(401).json({ message: 'Invalid credentials' })
      return
    }

    const isMatch = await user.comparePassword(password)
    if (!isMatch) {
      res.status(401).json({ message: 'Invalid credentials' })
      return
    }

    const token = generateToken({
      userId: user._id.toString(),
      role: user.role,
    })

    res.json({
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        teamId: user.teamId,
      },
    })
  } catch (error) {
    console.error('Login error:', error)
    res.status(500).json({ message: 'Server error' })
  }
}

export const getMe = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Not authenticated' })
      return
    }

    const user = await User.findById(req.user._id).populate('teamId')

    if (!user) {
      res.status(404).json({ message: 'User not found' })
      return
    }

    res.json({ user })
  } catch (error) {
    console.error('GetMe error:', error)
    res.status(500).json({ message: 'Server error' })
  }
}
