import { Router } from 'express'
import {
  createProject,
  deleteProject,
  getProjectActivity,
  getProjectById,
  getProjects,
  updateProject,
  updateProjectStatus,
} from '../controllers/projectController'
import { authenticate } from '../middleware/auth'
import { isAdmin } from '../middleware/roleCheck'

const router = Router()

router.use(authenticate)

router.get('/', getProjects)
router.get('/:id', getProjectById)
router.get('/:id/activity', getProjectActivity)
router.post('/', isAdmin, createProject)
router.put('/:id', isAdmin, updateProject)
router.patch('/:id/status', isAdmin, updateProjectStatus)
router.delete('/:id', isAdmin, deleteProject)

export default router
