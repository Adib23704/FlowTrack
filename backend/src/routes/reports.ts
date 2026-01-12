import { Router } from 'express'
import {
  getClientReviews,
  getPendingReports,
  getTeamReports,
  submitClientReview,
  submitTeamReport,
} from '../controllers/reportController'
import { authenticate } from '../middleware/auth'
import { isClient, isTeamMember } from '../middleware/roleCheck'

const router = Router()

router.use(authenticate)

router.get('/pending', getPendingReports)
router.get('/team', getTeamReports)
router.get('/client', getClientReviews)
router.post('/team', isTeamMember, submitTeamReport)
router.post('/client', isClient, submitClientReview)

export default router
