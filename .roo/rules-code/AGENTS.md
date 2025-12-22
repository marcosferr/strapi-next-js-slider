# AGENTS.md

This file provides guidance to agents when working with code in this repository.

## Project Coding Rules (Non-Obvious Only)

- Backend TypeScript uses CommonJS modules, not ES modules (see `backend/tsconfig.json`)
- Backend strict mode is disabled - don't assume strict TypeScript behavior
- Frontend expects Strapi v5 flat response structure but supports v4 nested attributes (see `frontend/src/app/page.tsx:34`)
- API calls must use `cache: "no-store"` to ensure fresh content from Strapi
- Backend excludes admin files from server compilation (`src/admin/` excluded in tsconfig)
- Content Types can be created via UI OR code - check both `src/api/*/content-types/*/schema.json` and admin UI
- Components are reusable blocks defined in `src/components/shared/*.json` - don't duplicate functionality
- Dynamic zones allow flexible content composition (see `blocks` field in article schema)
- Database migrations are handled automatically by Strapi - don't create manual migration files
- Seed script runs only once per database - uses `initHasRun` flag in Strapi store
- CORS is restricted to `FRONTEND_URL` env var - frontend requests will fail if not configured
- Backend controllers/services/routes use factory pattern - don't modify base implementations directly
- Media files for seeding go in `backend/data/uploads/`, runtime uploads go to `backend/public/uploads/`
- Frontend types must support both v4 and v5 Strapi response formats
- Backend uses ES2019 target - avoid modern ES features not supported in that version