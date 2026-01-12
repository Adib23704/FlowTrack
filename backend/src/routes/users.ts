import { Router } from 'express'
import {
  createUser,
  deleteUser,
  getUserById,
  getUsers,
  updateUser,
} from '../controllers/userController'
import { authenticate } from '../middleware/auth'
import { isAdmin } from '../middleware/roleCheck'

const router = Router()

router.use(authenticate)

router.get('/', getUsers)
router.get('/:id', getUserById)
router.post('/', isAdmin, createUser)
router.put('/:id', isAdmin, updateUser)
router.delete('/:id', isAdmin, deleteUser)

export default router
