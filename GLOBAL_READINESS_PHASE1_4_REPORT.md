# MIZAN ANZAN — Global Readiness Phase 1.4
## Registration Reliability / Database Alignment

### What was corrected

1. **Central database credential alignment**
   - `includes/db.php` was using a different password from the project's own database diagnostics (`test_db.php`, `tests/db_structure_check.php`, and `api_student.php`).
   - The central PDO connection is now aligned with the credentials used by those existing project files.

2. **Registration API hardening**
   - `api/register-account.php` now performs a preflight check for the identity tables before writing.
   - Missing identity tables return a specific safe error code: `REGISTRATION_SCHEMA_NOT_READY`.
   - Database write failures return `REGISTRATION_DB_INSERT_FAILED` while the real exception is written to the PHP server log.
   - The API remains JSON-only and does not expose SQL credentials or SQL exception details to the browser.

3. **Institution identity separation**
   - Institution name is stored only as the institution identity.
   - Manager / authorized representative / executive is stored as the `entity_manager` account.
   - Manager international name is stored on the manager account, not on the institution.
   - The browser explicitly sends `manager_full_name` and `manager_display_name_en`.

4. **Registration UI diagnostics**
   - The browser handles the server-side registration error codes without exposing sensitive backend details.

5. **Approved country UX preserved**
   - Smart search + official selectable country list + ISO alpha-2 internal value + no free-form country value.

### Files changed

- `includes/db.php`
- `api/register-account.php`
- `assets/js/app.js`
- `GLOBAL_READINESS_PHASE1_4_REPORT.md`

### Static verification

- PHP syntax checks: PASS
- JavaScript syntax check: PASS
- Registration payload fields reviewed: PASS
- Institution identity separation reviewed: PASS

### Deployment gate

Do not proceed to another feature layer until these four end-to-end flows are confirmed on the real deployment:

- Genius
- Coach
- Parent / Guardian
- Institution / Organization

For coach, parent, and institution, the expected result is a real account code, a server session, and a successful dashboard transition.
