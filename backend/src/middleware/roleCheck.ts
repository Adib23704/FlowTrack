import type { NextFunction, Response } from 'express'
import type { UserRole } from '../models/User'
import type { AuthRequest } from './auth'

export const requireRole = (...allowedRoles: UserRole[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ message: 'Authentication required' })
      return
    }

    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({ message: 'Access denied. Insufficient permissions.' })
      return
    }

    next()
  }
}

export const isAdmin = requireRole('admin')
export const isTeamMember = requireRole('team')
export const isClient = requireRole('client')
export const isAdminOrTeam = requireRole('admin', 'team')
export const isAdminOrClient = requireRole('admin', 'client')
