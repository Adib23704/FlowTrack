# FlowTrack

Internal tool for tracking delivery performance and client satisfaction. Teams submit weekly reports, clients give feedback, and admins see everything in one dashboard.

Built for a job assessment but tried to keep it production-ish.

## Tech

- Next.js 14 + Tailwind + shadcn/ui (frontend)
- Express + MongoDB + JWT (backend)
- TypeScript everywhere, Biome for linting

## Getting Started

You'll need MongoDB running locally (or use Atlas).

```bash
# backend
cd backend
cp .env.example .env   # edit if needed
npm i
npm run seed           # creates demo users + sample data
npm run dev            # runs on :3001

# frontend (new terminal)
cd frontend
cp .env.example .env.local
npm i
npm run dev            # runs on :3000
```

Then hit http://localhost:3000

## Test Accounts

```
Admin:  admin@flowtrack.com / admin123
Team:   john@flowtrack.com / team123
Client: client@acme.com / client123
```

## The Gist

Pretty simple workflow:

1. Admin creates projects, assigns teams and clients
2. Every week, team members report their progress (tasks done, blockers, how confident they are about the deadline)
3. Clients rate the delivery (quality, responsiveness, satisfaction)
4. System crunches the numbers and flags problems

## Scoring Logic

Had to come up with formulas for the three main metrics. Here's what I went with:

### Delivery Reliability Score (0-100)

Measures how likely a team is to deliver on time.

```
taskRatio = tasksCompleted / (tasksCompleted + tasksPending)
confidenceScore = onTimeConfidence / 5
blockerPenalty = min(blockersCount * 5, 25)

score = (taskRatio * 40) + (confidenceScore * 60) - blockerPenalty
```

So if a team completed 8/10 tasks, confidence is 4/5, and they have 1 blocker:

- taskRatio = 0.8 → contributes 32 points
- confidence = 0.8 → contributes 48 points
- blocker penalty = 5 points
- Final: 75/100

### Client Happiness Index (0-100)

Weighted avg of client ratings with a penalty for flagged issues.

```
base = (satisfaction * 0.6) + (responsiveness * 0.3) + (quality * 0.1)
normalized = (base / 5) * 100
final = hasProblemFlag ? normalized * 0.7 : normalized
```

Satisfaction matters most (60%), then responsiveness (30%), quality least (10%). If they flag a problem, 30% penalty.

### Team Load Risk

Simple classification:

- **High**: workload is "heavy" OR pending > completed OR blockers >= 3
- **Medium**: workload is "normal" AND has some blockers
- **Low**: everything else

## Env Vars

backend/.env:

```
PORT=3001
MONGODB_URI=mongodb://localhost:27017/flowtrack
JWT_SECRET=change-this-in-prod
JWT_EXPIRES_IN=7d
FRONTEND_URL=http://localhost:3000
```

frontend/.env.local:

```
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

## API Routes

Everything under `/api`, needs Bearer token except auth.

- `POST /auth/login` - get token
- `GET /auth/me` - current user
- `/users` - admin only, user management
- `/teams` - admin only, team CRUD
- `/projects` - admin creates, everyone views their own
- `/reports/team` - team submits weekly reports
- `/reports/client` - clients submit reviews
- `/analytics` - admin dashboard data
- `/activities` - activity feed

## Live Demo

- Main (Frontend): [https://flowtrack-adib.vercel.app](https://flowtrack-adib.vercel.app/)
- Backend: [https://flowtrack-j53a.onrender.com](https://flowtrack-j53a.onrender.com/)

## License

MIT
