# MIZAN ANZAN — Global Professional Phase 1.5 Final

## Registration Gate

This release stops treating all registration failures as the same technical problem.

### Fixed
- Registration API is PHP 7.4-compatible: removed `: never` from registration/dashboard endpoints.
- Registration schema preflight checks the exact tables and columns used by the INSERT statements.
- PDO schema errors are classified safely instead of being silently flattened.
- Added `database/migrations/006_registration_schema_hardening.sql` to repair legacy/incomplete identity schemas.
- Added `api/registration-health.php` for a safe server-side readiness check.
- Institution registration keeps institution identity separate from the authorized manager identity.
- ISO country identity remains `country_code` with no free-form country registration.

## Required deployment step

Run Migration 006 once against the same database configured in `includes/db.php`, then open:

`/api/registration-health.php`

It must return `success: true` and show no missing columns for `mizan_accounts` and `mizan_entities`.

Only after that should the three registration paths be tested:

1. Coach
2. Parent
3. Institution + authorized manager

Do not proceed to later platform phases until all three pass.
