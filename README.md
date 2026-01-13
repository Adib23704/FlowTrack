# FlowTrack

A delivery and team performance tracking platform. Managers get visibility into project health, team workload, and client satisfaction through automated scoring and weekly reports.

## Stack

- **Frontend**: Next.js 14, TypeScript, Tailwind, shadcn/ui
- **Backend**: Express, TypeScript, MongoDB, JWT auth
- **Tooling**: Biome

## Quick Start

```bash
# Backend
cd backend
cp .env.example .env    # configure your MongoDB URI
npm install
npm run seed            # populate demo data
npm run dev

# Frontend (new terminal)
cd frontend
cp .env.example .env.local
npm install
npm run dev
```

Open http://localhost:3000 and log in with one of the demo accounts.

## Demo Accounts

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@flowtrack.com | admin123 |
| Team | john@flowtrack.com | team123 |
| Client | client@acme.com | client123 |

## How It Works

**Weekly cycle:**
1. Team members submit progress reports (tasks done, blockers, workload)
2. Clients submit satisfaction reviews (quality, responsiveness, overall rating)
3. System calculates scores automatically

**Two key metrics:**

- **Delivery Reliability Score** — Based on task completion rate, on-time confidence, and blocker count. A team reporting 80% tasks done with high confidence and no blockers scores well.

- **Client Happiness Index** — Weighted average of satisfaction (60%), responsiveness (30%), and quality (10%). Flagging a problem applies a penalty.

**Load Risk** flags teams as High/Medium/Low based on workload level, pending tasks, and active blockers.

## Environment Variables

**backend/.env**
```
PORT=3001
MONGODB_URI=mongodb://localhost:27017/flowtrack
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=7d
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
```

**frontend/.env.local**
```
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

## API Overview

All endpoints are prefixed with `/api`. Authentication uses Bearer tokens.

| Resource | Access | Description |
|----------|--------|-------------|
| `/auth` | Public | Login, get current user |
| `/users` | Admin | User CRUD |
| `/teams` | Admin | Team CRUD, member management |
| `/projects` | Role-based | Project CRUD (admin), view (all) |
| `/reports/team` | Admin, Team | Submit/view team reports |
| `/reports/client` | Admin, Client | Submit/view client reviews |
| `/analytics` | Admin | Unhappy clients, high-load teams |
| `/activities` | Admin | System-wide activity feed |

## Scripts

```bash
# Backend
npm run dev       # development server
npm run build     # compile TypeScript
npm run start     # production server
npm run seed      # seed database
npm run lint      # run biome

# Frontend
npm run dev       # development server
npm run build     # production build
npm run lint      # run biome
```

## License

MIT
