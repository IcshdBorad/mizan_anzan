# MIZAN ANZAN — Final Stability Release 2026-08-20

## Critical fixes
- Centralized database connection; no real password is stored in source.
- Genius registration no longer assumes `anzan_profiles.genius_code` exists.
- Genius registration uses canonical ISO country selection and stores canonical country identity.
- Coach / Parent / Entity registration remains on the MIZAN account model and no longer depends on the obsolete WordPress registration code.
- Registration schema bootstrap now covers accounts, entities, branches and relationships.
- Role dashboards and relationship linking tolerate legacy profiles without `genius_code` / `age_category` columns.
- Registration UI is initialized after i18n initialization, preventing the old timing-based English/key fallback problem.
- Role registration text now uses the canonical i18n manager rather than a separate three-language dictionary.
- Arabic is protected from accidental English fallback when an Arabic key is missing.
- Registration errors are localized without exposing internal error codes to the user.
- Production cache-busting updated to `20260820-global-final-r1`.
- Sensitive/diagnostic directories are protected with Apache rules.

## Required deployment action
Create `includes/db-config.php` from `includes/db-config.php.example` and enter the NEW database password there. The password is intentionally not included in this release.

## Validation performed
- PHP syntax check: PASS
- JavaScript syntax check: PASS
- Credential/source scan: PASS (no database password in PHP/JS source)
- HTML i18n reference audit: PASS
- External locale structure: 54 locale files, each matching the canonical 236-key locale shape
