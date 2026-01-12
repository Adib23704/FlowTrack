import type { Response } from 'express'
import type { AuthRequest } from '../middleware/auth'
import User from '../models/User'

export const getUsers = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { role } = req.query
    const filter = role ? { role } : {}
    const users = await User.find(filter).select('-password').populate('teamId')
    res.json(users)
  } catch (error) {
    console.error('Get users error:', error)
    res.status(500).json({ message: 'Server error' })
  }
}

export const getUserById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.params.id).select('-password').populate('teamId')
    if (!user) {
      res.status(404).json({ message: 'User not found' })
      return
    }
    res.json(user)
  } catch (error) {
    console.error('Get user error:', error)
    res.status(500).json({ message: 'Server error' })
  }
}

export const createUser = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name, email, password, role, teamId } = req.body

    const existingUser = await User.findOne({ email: email.toLowerCase() })
    if (existingUser) {
      res.status(400).json({ message: 'User with this email already exists' })
      return
    }

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password,
      role,
      teamId,
    })

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      teamId: user.teamId,
    })
  } catch (error) {
    console.error('Create user error:', error)
    res.status(500).json({ message: 'Server error' })
  }
}

export const updateUser = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name, email, role, teamId } = req.body
    const user = await User.findById(req.params.id)

    if (!user) {
      res.status(404).json({ message: 'User not found' })
      return
    }

    if (email && email !== user.email) {
      const existingUser = await User.findOne({ email: email.toLowerCase() })
      if (existingUser) {
        res.status(400).json({ message: 'Email already in use' })
        return
      }
    }

    user.name = name || user.name
    user.email = email ? email.toLowerCase() : user.email
    user.role = role || user.role
    user.teamId = teamId !== undefined ? teamId : user.teamId

    await user.save()
    res.json(user)
  } catch (error) {
    console.error('Update user error:', error)
    res.status(500).json({ message: 'Server error' })
  }
}

export const deleteUser = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.params.id)
    if (!user) {
      res.status(404).json({ message: 'User not found' })
      return
    }

    await user.deleteOne()
    res.json({ message: 'User deleted' })
  } catch (error) {
    console.error('Delete user error:', error)
    res.status(500).json({ message: 'Server error' })
  }
}
