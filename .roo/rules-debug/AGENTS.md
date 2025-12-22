# AGENTS.md

This file provides guidance to agents when working with code in this repository.

## Project Debug Rules (Non-Obvious Only)

- Strapi admin panel runs on port 1337 - access at http://localhost:1337/admin
- Frontend runs on port 3000 - access at http://localhost:3000
- Database connection issues: check PostgreSQL container is running via `docker-compose up`
- CORS errors: ensure `FRONTEND_URL` env var matches frontend URL exactly
- Seed data only imports once - clear database to re-run seed script
- Backend logs show in terminal where `npm run develop` is running
- Frontend API calls use `cache: "no-store"` - debugging requires fresh data fetches
- Strapi v4 vs v5 response format differences handled in frontend at `frontend/src/app/page.tsx:34`
- Media upload issues: check file permissions in `backend/public/uploads/`
- TypeScript errors in backend may be due to CommonJS vs ES modules mismatch
- Frontend build failures often due to missing environment variables in `.env.local`