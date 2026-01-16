# AGENTS.md

This file provides guidance to agents when working with code in this repository.

## Project Structure

This is a dual-stack project with Strapi backend and Next.js frontend:

- **Backend**: Strapi v5.31.3 with TypeScript, PostgreSQL, Docker
- **Frontend**: Next.js 16.0.8 with TypeScript, ESLint

## Critical Commands

### Backend (Strapi)
```bash
cd backend
npm run develop          # Start with auto-reload
npm run start            # Production mode
npm run build            # Build admin panel
npm run seed:example     # Import sample data (runs only once)
```

### Frontend (Next.js)
```bash
cd frontend
npm run dev              # Development server
npm run build            # Production build
npm run start            # Production server
npm run lint             # ESLint check
```

### Docker
```bash
docker-compose up        # Start all services (PostgreSQL, Strapi, Cap)
```

### Cap.js CAPTCHA
- Cap standalone server runs on port 3001
- Access dashboard at http://localhost:3001 to create site keys
- Admin key configured via `CAP_ADMIN_KEY` env var

## Non-Obvious Patterns

### Strapi Content Types
- Content Types can be created via UI OR code (JSON schemas in `src/api/*/content-types/*/schema.json`)
- Components are reusable blocks defined in `src/components/shared/*.json`
- Dynamic zones allow flexible content composition (see `blocks` field in article schema)

### Data Seeding
- Seed script (`backend/scripts/seed.js`) runs only once per database
- Checks `initHasRun` flag in Strapi store to prevent re-import
- Automatically sets public permissions for all content types
- Uploads media files from `backend/data/uploads/` to Strapi's media library

### Frontend API Integration
- Frontend expects Strapi v5 flat response structure but supports v4 nested attributes
- Uses `NEXT_PUBLIC_API_BASE_URL` env var (defaults to localhost:1337)
- API calls use `cache: "no-store"` to ensure fresh content

### TypeScript Configuration
- Backend uses CommonJS modules, ES2019 target, strict mode disabled
- Frontend uses ESNext modules, strict mode enabled, React JSX
- Backend excludes admin files from server compilation

### CORS Configuration
- Backend CORS restricted to `FRONTEND_URL` env var (defaults to localhost:3000)
- CSP headers configured for same origin policy

## Environment Variables

### Backend (.env)
```
HOST=0.0.0.0
PORT=1337
APP_KEYS=<comma-separated-keys>
DATABASE_CLIENT=postgres
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_NAME=strapi
DATABASE_USERNAME=strapi
DATABASE_PASSWORD=strapi
FRONTEND_URL=http://localhost:3000
```

### Frontend (.env.local)
```
NEXT_PUBLIC_API_BASE_URL=http://localhost:1337
NEXT_PUBLIC_CAP_API_ENDPOINT=http://localhost:3001
NEXT_PUBLIC_CAP_SITE_KEY=<your-site-key>
```

### Cap.js Integration
- Frontend uses invisible mode to solve Cap challenges programmatically
- Backend middleware verifies tokens via Cap standalone server's siteverify endpoint
- Middleware located at `backend/src/api/message/middlewares/cap.ts`
- Token field name: `capToken` (sent alongside form data)

## File Organization

- Backend API structure: `src/api/{content-type}/{controllers,routes,services,content-types}`
- Shared components: `src/components/shared/*.json`
- Media uploads: `backend/data/uploads/` (for seeding) and `backend/public/uploads/` (runtime)
- Frontend types: `frontend/src/types/`

## Development Workflow

1. Start PostgreSQL and Strapi: `docker-compose up`
2. Run backend: `cd backend && npm run develop`
3. Run frontend: `cd frontend && npm run dev`
4. Access Strapi admin: http://localhost:1337/admin
5. Access frontend: http://localhost:3000