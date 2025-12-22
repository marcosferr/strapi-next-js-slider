# AGENTS.md

This file provides guidance to agents when working with code in this repository.

## Project Architecture Rules (Non-Obvious Only)

- Dual-stack architecture: Strapi backend (content management) + Next.js frontend (presentation)
- Backend and frontend are completely decoupled - communicate only via REST API
- Strapi auto-generates CRUD endpoints for all content types
- Content types can be defined via UI (admin panel) OR code (JSON schemas)
- Components are reusable content blocks that can be used across multiple content types
- Dynamic zones allow flexible content composition with mixed component types
- Backend uses CommonJS modules, frontend uses ESNext - different module systems
- Database migrations are handled automatically by Strapi
- CORS restrictions enforce separation between backend and frontend
- Media handling split: seeding files vs runtime uploads
- Environment-specific configurations for different deployment scenarios
- Factory pattern used for Strapi controllers, services, and routes