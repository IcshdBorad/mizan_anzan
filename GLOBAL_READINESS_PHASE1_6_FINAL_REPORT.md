# MIZAN ANZAN — GLOBAL READINESS PHASE 1.6 FINAL

## Basis
This release is built directly from `MIZAN_ANZAN_GLOBAL_PROFESSIONAL_PHASE1_5_FINAL_20260819.zip`, the exact package used in the latest failed registration test.

## Confirmed findings from the actual package
1. `index.html` still referenced `app.js` and `country_identity.js` with the Phase 1.3 cache key. This could keep an older browser copy active after deployment.
2. `register-account.php` required the registration schema to be present but did not repair a missing schema before the first registration.
3. The browser intentionally collapsed `REGISTRATION_DB_INSERT_FAILED` into the same generic registration message, which hid the exact server-side failure class.
4. The entity registration payload correctly carries the authorized person's name separately; the final API keeps the institution identity separate from the manager identity.

## Final corrections
- Production cache-busting was advanced to a unique Phase 1.6 release key for `i18n.js`, `country_identity.js`, and `app.js`.
- `register-account.php` now performs a minimal, non-destructive registration-schema bootstrap before preflight.
- Missing `mizan_accounts` / `mizan_entities` structures and required registration columns are created/repaired without DROP, DELETE, or TRUNCATE.
- Legacy `role` and `status` ENUM definitions are repaired only when required registration values are absent.
- Country identity remains ISO-based and server-validated.
- Institution name and authorized manager name remain separate data fields.
- Existing database migrations remain included for controlled production deployment.

## Verification performed in this environment
- PHP syntax: `api/register-account.php` — PASS
- PHP syntax: `includes/db.php` — PASS
- PHP syntax: `api/registration-health.php` — PASS
- JavaScript syntax: `assets/js/app.js` — PASS
- Production script cache keys: Phase 1.6 final — PASS

## Important limitation
The live hosting database is not directly executable from this environment, so live account creation on the user's hosting cannot be claimed as tested here. The release is designed to remove the two concrete blockers found in the supplied package: stale production JS caching and missing/legacy registration schema.

## Required acceptance test
After deployment, test one fresh Coach, one fresh Parent/Guardian, and one fresh Institution account. Do not proceed to the next product phase until all three return a real account code and a valid session.
