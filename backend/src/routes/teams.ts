import { Router } from 'express'
import {
  addTeamMember,
  createTeam,
  deleteTeam,
  getTeamById,
  getTeams,
  removeTeamMember,
  updateTeam,
} from '../controllers/teamController'
import { authenticate } from '../middleware/auth'
import { isAdmin } from '../middleware/roleCheck'

const router = Router()

router.use(authenticate)

router.get('/', getTeams)
router.get('/:id', getTeamById)
router.post('/', isAdmin, createTeam)
router.put('/:id', isAdmin, updateTeam)
router.delete('/:id', isAdmin, deleteTeam)
router.post('/:id/members', isAdmin, addTeamMember)
router.delete('/:id/members/:userId', isAdmin, removeTeamMember)

export default router
