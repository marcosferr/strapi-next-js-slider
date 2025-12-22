# AGENTS.md

This file provides guidance to agents when working with code in this repository.

## Project Documentation Rules (Non-Obvious Only)

- This is a dual-stack project - backend (Strapi) and frontend (Next.js) are separate applications
- Backend manages content and APIs, frontend consumes Strapi's REST API
- Content can be created via Strapi admin UI OR defined in code via JSON schemas
- Components are reusable content blocks defined in `src/components/shared/*.json`
- Dynamic zones (like `blocks` field) allow flexible content composition
- Frontend supports both Strapi v4 (nested) and v5 (flat) API response formats
- Database is PostgreSQL running in Docker container
- Media files have separate locations: seeding (`data/uploads/`) vs runtime (`public/uploads/`)
- Environment variables are split: backend uses `.env`, frontend uses `.env.local`
- CORS is configured to only allow requests from specific frontend URL
- TypeScript configurations differ significantly between backend (CommonJS) and frontend (ESNext)