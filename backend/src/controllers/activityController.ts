import type { Response } from 'express'
import type { AuthRequest } from '../middleware/auth'
import { Activity } from '../models'

export const getActivities = async (req: AuthRequest, res: Response) => {
  try {
    const { type, limit = 50 } = req.query

    const filter: Record<string, unknown> = {}
    if (type && type !== 'all') {
      filter.type = type
    }

    const activities = await Activity.find(filter)
      .populate('projectId', 'name')
      .populate('actorId', 'name')
      .sort({ createdAt: -1 })
      .limit(Number(limit))

    res.json(activities)
  } catch (_error) {
    res.status(500).json({ message: 'Failed to fetch activities' })
  }
}
