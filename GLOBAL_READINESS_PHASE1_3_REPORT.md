# MIZAN ANZAN — Global Readiness Phase 1.3
## Registration Excellence Fix

### Scope
This release does not add new platform features. It closes the registration failure discovered during real browser testing for:
- Coach
- Parent / Guardian
- Institution / Organization

### Root cause found
`api/register-account.php` required `includes/countries.php`, but that file was absent from the delivered Phase 1.2 package. The request therefore failed before the API could return JSON. The browser consequently displayed the generic registration failure message.

### Fixes
1. Added `includes/countries.php` containing the canonical 249 ISO 3166-1 alpha-2 country allow-list used by the server.
2. Added strict server functions:
   - `mizanNormalizeCountryCode()`
   - `mizanIsValidCountryCode()`
   - `mizanCountryNameEn()`
3. Wrapped registration bootstrap dependencies so database/service boot failures return safe JSON instead of an HTML/PHP fatal response.
4. Preserved the approved UX: smart country search + selectable official list + ISO code internally + no free-form country submission.
5. Corrected institution registration semantics:
   - Institution name = institution identity.
   - Director / authorized representative / executive = management identity.
   - The international-name field shown in the institution form now clearly refers to the authorized manager, not the institution.
6. The institution manager's international name is stored on the `entity_manager` account, while the institution's own `display_name_en` is not incorrectly populated with the manager's name.
7. Added `manager_display_name_en` explicitly to the registration payload for semantic clarity.
8. Bumped registration JavaScript cache versions to Phase 1.3.

### Verification performed
- PHP syntax check: `includes/countries.php` — PASS
- PHP syntax check: `api/register-account.php` — PASS
- JavaScript syntax check: `assets/js/app.js` — PASS
- JavaScript syntax check: `assets/js/country_identity.js` — PASS
- Country allow-list count: 249 — PASS
- Country validation samples (IQ, EG, US, FR; invalid ZZ and free text) — PASS

### Important deployment note
The package fixes the application-side registration failure. The existing database foundation (migration 004) must exist for coach/parent/entity registration tables to be available. Migration 005 remains the canonical database migration for dedicated `country_code` columns. The API keeps a compatibility path for installations that have 004 but have not yet applied 005.

### Release principle
No new feature layer should be considered complete until all four registration paths are verified end-to-end in the real deployment environment:
Genius + Coach + Parent + Institution.
