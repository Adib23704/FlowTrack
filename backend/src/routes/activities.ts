import { Router } from 'express'
import { getActivities } from '../controllers/activityController'
import { authenticate } from '../middleware/auth'
import { isAdmin } from '../middleware/roleCheck'

const router = Router()

router.get('/', authenticate, isAdmin, getActivities)

export default router
