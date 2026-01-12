import { Router } from 'express'
import analyticsRoutes from './analytics'
import authRoutes from './auth'
import projectRoutes from './projects'
import reportRoutes from './reports'
import teamRoutes from './teams'
import userRoutes from './users'

const router = Router()

router.get('/', (_req, res) => {
  res.json({
    message: 'FlowTrack API',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      users: '/api/users',
      teams: '/api/teams',
      projects: '/api/projects',
      reports: '/api/reports',
      analytics: '/api/analytics',
    },
  })
})

router.use('/auth', authRoutes)
router.use('/users', userRoutes)
router.use('/teams', teamRoutes)
router.use('/projects', projectRoutes)
router.use('/reports', reportRoutes)
router.use('/analytics', analyticsRoutes)

export default router
