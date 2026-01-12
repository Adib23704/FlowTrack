import { Router } from 'express'
import { getMe, login } from '../controllers/authController'
import { authenticate } from '../middleware/auth'

const router = Router()

router.post('/login', login)
router.get('/me', authenticate, getMe)

export default router
