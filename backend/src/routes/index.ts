import { Router } from 'express'

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

export default router
