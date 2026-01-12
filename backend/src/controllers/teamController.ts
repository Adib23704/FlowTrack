import type { Response } from 'express'
import type { AuthRequest } from '../middleware/auth'
import Team from '../models/Team'
import User from '../models/User'

export const getTeams = async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const teams = await Team.find().populate('members', '-password').populate('createdBy', 'name')
    res.json(teams)
  } catch (error) {
    console.error('Get teams error:', error)
    res.status(500).json({ message: 'Server error' })
  }
}

export const getTeamById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const team = await Team.findById(req.params.id)
      .populate('members', '-password')
      .populate('createdBy', 'name')

    if (!team) {
      res.status(404).json({ message: 'Team not found' })
      return
    }
    res.json(team)
  } catch (error) {
    console.error('Get team error:', error)
    res.status(500).json({ message: 'Server error' })
  }
}

export const createTeam = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name, description, members } = req.body

    const team = await Team.create({
      name,
      description,
      members: members || [],
      createdBy: req.user?._id,
    })

    if (members?.length) {
      await User.updateMany({ _id: { $in: members } }, { teamId: team._id })
    }

    const populated = await Team.findById(team._id)
      .populate('members', '-password')
      .populate('createdBy', 'name')

    res.status(201).json(populated)
  } catch (error) {
    console.error('Create team error:', error)
    res.status(500).json({ message: 'Server error' })
  }
}

export const updateTeam = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name, description } = req.body
    const team = await Team.findById(req.params.id)

    if (!team) {
      res.status(404).json({ message: 'Team not found' })
      return
    }

    team.name = name || team.name
    team.description = description !== undefined ? description : team.description

    await team.save()

    const populated = await Team.findById(team._id)
      .populate('members', '-password')
      .populate('createdBy', 'name')

    res.json(populated)
  } catch (error) {
    console.error('Update team error:', error)
    res.status(500).json({ message: 'Server error' })
  }
}

export const deleteTeam = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const team = await Team.findById(req.params.id)
    if (!team) {
      res.status(404).json({ message: 'Team not found' })
      return
    }

    await User.updateMany({ teamId: team._id }, { $unset: { teamId: 1 } })
    await team.deleteOne()

    res.json({ message: 'Team deleted' })
  } catch (error) {
    console.error('Delete team error:', error)
    res.status(500).json({ message: 'Server error' })
  }
}

export const addTeamMember = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { userId } = req.body
    const team = await Team.findById(req.params.id)

    if (!team) {
      res.status(404).json({ message: 'Team not found' })
      return
    }

    const user = await User.findById(userId)
    if (!user) {
      res.status(404).json({ message: 'User not found' })
      return
    }

    if (user.role !== 'team') {
      res.status(400).json({ message: 'Only team members can be added to teams' })
      return
    }

    if (!team.members.includes(userId)) {
      team.members.push(userId)
      await team.save()
    }

    user.teamId = team._id
    await user.save()

    const populated = await Team.findById(team._id)
      .populate('members', '-password')
      .populate('createdBy', 'name')

    res.json(populated)
  } catch (error) {
    console.error('Add team member error:', error)
    res.status(500).json({ message: 'Server error' })
  }
}

export const removeTeamMember = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { userId } = req.params
    const team = await Team.findById(req.params.id)

    if (!team) {
      res.status(404).json({ message: 'Team not found' })
      return
    }

    team.members = team.members.filter(m => m.toString() !== userId)
    await team.save()

    await User.findByIdAndUpdate(userId, { $unset: { teamId: 1 } })

    const populated = await Team.findById(team._id)
      .populate('members', '-password')
      .populate('createdBy', 'name')

    res.json(populated)
  } catch (error) {
    console.error('Remove team member error:', error)
    res.status(500).json({ message: 'Server error' })
  }
}
