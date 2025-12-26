# Changelog

## [Unreleased]

### Changed
- Refactored scan, alerts, and billing logic into dedicated services (`services/*`), reducing business logic in API routes.
- Introduced `features/*`, `ui/`, and `layouts/` boundaries for components, starting with pricing, onboarding, scan, and dashboard flows.
- Hardened the Prisma debug endpoint to require a Clerk-authenticated `ADMIN` user in non-production environments.
