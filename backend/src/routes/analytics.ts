import { Router } from 'express'
import {
  getDashboardStats,
  getHighLoadTeams,
  getProjectTrends,
  getProjectsAnalytics,
  getUnhappyClients,
} from '../controllers/analyticsController'
import { authenticate } from '../middleware/auth'
import { isAdmin } from '../middleware/roleCheck'

const router = Router()

router.use(authenticate)
router.use(isAdmin)

router.get('/dashboard', getDashboardStats)
router.get('/projects', getProjectsAnalytics)
router.get('/unhappy-clients', getUnhappyClients)
router.get('/high-load-teams', getHighLoadTeams)
router.get('/projects/:projectId/trends', getProjectTrends)

export default router
