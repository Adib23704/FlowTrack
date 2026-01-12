import dotenv from 'dotenv'
import mongoose from 'mongoose'
import { Activity, ClientReview, Project, Team, TeamReport, User } from './models'

dotenv.config()

const seedDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI as string)
    console.log('Connected to MongoDB')

    await Promise.all([
      User.deleteMany({}),
      Team.deleteMany({}),
      Project.deleteMany({}),
      TeamReport.deleteMany({}),
      ClientReview.deleteMany({}),
      Activity.deleteMany({}),
    ])
    console.log('Cleared existing data')

    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@flowtrack.com',
      password: 'admin123',
      role: 'admin',
    })

    const teamMembers = await User.create([
      { name: 'John Developer', email: 'john@flowtrack.com', password: 'team123', role: 'team' },
      { name: 'Sarah Engineer', email: 'sarah@flowtrack.com', password: 'team123', role: 'team' },
      { name: 'Mike Designer', email: 'mike@flowtrack.com', password: 'team123', role: 'team' },
      { name: 'Emma QA', email: 'emma@flowtrack.com', password: 'team123', role: 'team' },
    ])

    const clients = await User.create([
      { name: 'Acme Corp', email: 'client@acme.com', password: 'client123', role: 'client' },
      {
        name: 'Tech Solutions',
        email: 'client@techsol.com',
        password: 'client123',
        role: 'client',
      },
      { name: 'StartupXYZ', email: 'client@startupxyz.com', password: 'client123', role: 'client' },
    ])

    console.log('Created users')

    const teams = await Team.create([
      {
        name: 'Alpha Team',
        description: 'Frontend specialists',
        members: [teamMembers[0]._id, teamMembers[1]._id],
        createdBy: admin._id,
      },
      {
        name: 'Beta Team',
        description: 'Backend developers',
        members: [teamMembers[2]._id, teamMembers[3]._id],
        createdBy: admin._id,
      },
    ])

    await User.updateMany(
      { _id: { $in: [teamMembers[0]._id, teamMembers[1]._id] } },
      { teamId: teams[0]._id }
    )
    await User.updateMany(
      { _id: { $in: [teamMembers[2]._id, teamMembers[3]._id] } },
      { teamId: teams[1]._id }
    )

    console.log('Created teams')

    const projects = await Project.create([
      {
        name: 'E-commerce Platform',
        description: 'Building a modern e-commerce solution',
        timeline: {
          startDate: new Date('2025-01-01'),
          endDate: new Date('2025-06-30'),
        },
        teamId: teams[0]._id,
        clientId: clients[0]._id,
        status: 'in_progress',
        deliveryReliabilityScore: 75,
        clientHappinessIndex: 80,
        teamLoadRisk: 'medium',
      },
      {
        name: 'Mobile App Redesign',
        description: 'Redesigning the mobile application',
        timeline: {
          startDate: new Date('2025-02-01'),
          endDate: new Date('2025-05-31'),
        },
        teamId: teams[0]._id,
        clientId: clients[1]._id,
        status: 'in_progress',
        deliveryReliabilityScore: 60,
        clientHappinessIndex: 45,
        teamLoadRisk: 'high',
      },
      {
        name: 'API Integration',
        description: 'Third-party API integrations',
        timeline: {
          startDate: new Date('2025-01-15'),
          endDate: new Date('2025-04-15'),
        },
        teamId: teams[1]._id,
        clientId: clients[2]._id,
        status: 'planning',
        deliveryReliabilityScore: 85,
        clientHappinessIndex: 90,
        teamLoadRisk: 'low',
      },
    ])

    console.log('Created projects')

    const currentWeek = getWeekNumber(new Date())
    const currentYear = new Date().getFullYear()

    await TeamReport.create([
      {
        projectId: projects[0]._id,
        submittedBy: teamMembers[0]._id,
        weekNumber: currentWeek - 1,
        year: currentYear,
        tasksCompleted: 8,
        tasksPending: 5,
        workloadLevel: 'normal',
        onTimeConfidence: 4,
        blockers: ['Waiting for design assets'],
      },
      {
        projectId: projects[1]._id,
        submittedBy: teamMembers[1]._id,
        weekNumber: currentWeek - 1,
        year: currentYear,
        tasksCompleted: 3,
        tasksPending: 12,
        workloadLevel: 'heavy',
        onTimeConfidence: 2,
        blockers: ['API delays', 'Scope creep', 'Resource shortage'],
      },
    ])

    await ClientReview.create([
      {
        projectId: projects[0]._id,
        submittedBy: clients[0]._id,
        weekNumber: currentWeek - 1,
        year: currentYear,
        deliveryQuality: 4,
        responsiveness: 5,
        overallSatisfaction: 4,
        comment: 'Good progress overall',
        flaggedProblem: false,
      },
      {
        projectId: projects[1]._id,
        submittedBy: clients[1]._id,
        weekNumber: currentWeek - 1,
        year: currentYear,
        deliveryQuality: 2,
        responsiveness: 3,
        overallSatisfaction: 2,
        comment: 'Concerned about timeline',
        flaggedProblem: true,
      },
    ])

    console.log('Created sample reports and reviews')

    await Activity.create([
      {
        projectId: projects[0]._id,
        type: 'report',
        actorId: teamMembers[0]._id,
        actorRole: 'team',
        description: 'John Developer submitted weekly report',
      },
      {
        projectId: projects[1]._id,
        type: 'flag',
        actorId: clients[1]._id,
        actorRole: 'client',
        description: 'Tech Solutions flagged a problem with the project',
      },
      {
        projectId: projects[0]._id,
        type: 'status_change',
        actorId: admin._id,
        actorRole: 'admin',
        description: 'Project status changed to in_progress',
        metadata: { from: 'planning', to: 'in_progress' },
      },
    ])

    console.log('Created activity logs')

    console.log('\n=== Seed Complete ===')
    console.log('\nDemo Credentials:')
    console.log('Admin: admin@flowtrack.com / admin123')
    console.log('Team: john@flowtrack.com / team123')
    console.log('Client: client@acme.com / client123')

    await mongoose.disconnect()
    process.exit(0)
  } catch (error) {
    console.error('Seed error:', error)
    process.exit(1)
  }
}

function getWeekNumber(date: Date): number {
  const firstDayOfYear = new Date(date.getFullYear(), 0, 1)
  const pastDaysOfYear = (date.getTime() - firstDayOfYear.getTime()) / 86400000
  return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7)
}

seedDatabase()
