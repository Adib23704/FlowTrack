import { Router } from 'express'
import authRoutes from './auth'

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

export default router
