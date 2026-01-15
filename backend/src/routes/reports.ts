import { Router } from 'express'
import {
  deleteClientReview,
  deleteTeamReport,
  getClientReviews,
  getPendingReports,
  getTeamReports,
  submitClientReview,
  submitTeamReport,
} from '../controllers/reportController'
import { authenticate } from '../middleware/auth'
import { isAdmin, isClient, isTeamMember } from '../middleware/roleCheck'

const router = Router()

router.use(authenticate)

router.get('/pending', getPendingReports)
router.get('/team', getTeamReports)
router.get('/client', getClientReviews)
router.post('/team', isTeamMember, submitTeamReport)
router.post('/client', isClient, submitClientReview)
router.delete('/team/:id', isAdmin, deleteTeamReport)
router.delete('/client/:id', isAdmin, deleteClientReview)

export default router
