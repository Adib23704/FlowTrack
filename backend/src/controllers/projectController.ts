import type { Response } from 'express'
import type { AuthRequest } from '../middleware/auth'
import Activity from '../models/Activity'
import Project, { type ProjectStatus } from '../models/Project'

export const getProjects = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = req.user
    let filter = {}

    if (user?.role === 'team' && user.teamId) {
      filter = { teamId: user.teamId }
    } else if (user?.role === 'client') {
      filter = { clientId: user._id }
    }

    const projects = await Project.find(filter)
      .populate('teamId', 'name')
      .populate('clientId', 'name email')
      .sort({ updatedAt: -1 })

    res.json(projects)
  } catch (error) {
    console.error('Get projects error:', error)
    res.status(500).json({ message: 'Server error' })
  }
}

export const getProjectById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('teamId')
      .populate('clientId', 'name email')

    if (!project) {
      res.status(404).json({ message: 'Project not found' })
      return
    }

    const user = req.user
    if (user?.role === 'team' && user.teamId?.toString() !== project.teamId._id.toString()) {
      res.status(403).json({ message: 'Access denied' })
      return
    }
    if (user?.role === 'client' && user._id.toString() !== project.clientId._id.toString()) {
      res.status(403).json({ message: 'Access denied' })
      return
    }

    res.json(project)
  } catch (error) {
    console.error('Get project error:', error)
    res.status(500).json({ message: 'Server error' })
  }
}

export const createProject = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name, description, timeline, teamId, clientId, status } = req.body

    const project = await Project.create({
      name,
      description,
      timeline,
      teamId,
      clientId,
      status: status || 'planning',
    })

    await Activity.create({
      projectId: project._id,
      type: 'status_change',
      actorId: req.user?._id,
      actorRole: req.user?.role,
      description: `Project "${name}" created`,
      metadata: { status: project.status },
    })

    const populated = await Project.findById(project._id)
      .populate('teamId', 'name')
      .populate('clientId', 'name email')

    res.status(201).json(populated)
  } catch (error) {
    console.error('Create project error:', error)
    res.status(500).json({ message: 'Server error' })
  }
}

export const updateProject = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name, description, timeline, teamId, clientId, status } = req.body
    const project = await Project.findById(req.params.id)

    if (!project) {
      res.status(404).json({ message: 'Project not found' })
      return
    }

    const oldStatus = project.status

    project.name = name || project.name
    project.description = description !== undefined ? description : project.description
    project.timeline = timeline || project.timeline
    project.teamId = teamId || project.teamId
    project.clientId = clientId || project.clientId
    project.status = status || project.status

    await project.save()

    if (status && status !== oldStatus) {
      await Activity.create({
        projectId: project._id,
        type: 'status_change',
        actorId: req.user?._id,
        actorRole: req.user?.role,
        description: `Project status changed from ${oldStatus} to ${status}`,
        metadata: { from: oldStatus, to: status },
      })
    }

    const populated = await Project.findById(project._id)
      .populate('teamId', 'name')
      .populate('clientId', 'name email')

    res.json(populated)
  } catch (error) {
    console.error('Update project error:', error)
    res.status(500).json({ message: 'Server error' })
  }
}

export const deleteProject = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const project = await Project.findById(req.params.id)
    if (!project) {
      res.status(404).json({ message: 'Project not found' })
      return
    }

    await Activity.deleteMany({ projectId: project._id })
    await project.deleteOne()

    res.json({ message: 'Project deleted' })
  } catch (error) {
    console.error('Delete project error:', error)
    res.status(500).json({ message: 'Server error' })
  }
}

export const getProjectActivity = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { limit = 20 } = req.query

    const activities = await Activity.find({ projectId: req.params.id })
      .populate('actorId', 'name')
      .sort({ createdAt: -1 })
      .limit(Number(limit))

    res.json(activities)
  } catch (error) {
    console.error('Get project activity error:', error)
    res.status(500).json({ message: 'Server error' })
  }
}

export const updateProjectStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { status } = req.body as { status: ProjectStatus }
    const project = await Project.findById(req.params.id)

    if (!project) {
      res.status(404).json({ message: 'Project not found' })
      return
    }

    const oldStatus = project.status
    project.status = status
    await project.save()

    await Activity.create({
      projectId: project._id,
      type: 'status_change',
      actorId: req.user?._id,
      actorRole: req.user?.role,
      description: `Project status changed from ${oldStatus} to ${status}`,
      metadata: { from: oldStatus, to: status },
    })

    res.json(project)
  } catch (error) {
    console.error('Update project status error:', error)
    res.status(500).json({ message: 'Server error' })
  }
}
