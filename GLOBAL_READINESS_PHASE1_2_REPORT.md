# MIZAN ANZAN — Global Readiness Phase 1.2
## Registration UX + Role Identity + Database Compatibility

Version: 2026-08-19

### Issues corrected

1. Arabic registration no longer exposes missing translation keys such as `register_parent_btn` or `register_entity_btn`.
2. Coach, Parent and Genius name labels are role-aware and localized.
3. Institution registration now explicitly asks for the **Director / Authorized Representative / Executive** name.
4. The institution international name is separate from the authorized person's identity.
5. Institution type options are translated through the existing i18n master keys.
6. The country picker uses the existing smart-search + selectable-results + ISO identity design.
7. Registration submits only the canonical ISO country code.
8. The registration API supports both the new `country_code` schema and a temporary compatibility path when migration 005 has not yet been applied.
9. Migration 005 was rewritten to be idempotent and more compatible with common MySQL/MariaDB hosting.
10. Client-side registration errors are localized instead of displaying raw English server messages.

### Important database note

Migration `database/migrations/005_global_country_identity.sql` should still be applied. The compatibility path prevents the registration form from becoming unusable on a site where 004 exists but 005 has not yet been applied; after 005 is applied, ISO codes are stored in the dedicated `country_code` columns.

### Institution identity model

- Institution official name → `mizan_entities.entity_name`
- Institution international name → `mizan_entities.display_name_en`
- Authorized director / representative / executive → `mizan_accounts.full_name`
- Institution type → `mizan_entities.entity_type`
- Institution country → `country_code`
- Management role → `entity_manager`

### Validation

- JavaScript syntax: validated with Node.js.
- PHP syntax: validated with `php -l` for modified PHP.
- HTML IDs and registration controls: checked for consistency.
- No free-form country submission remains.
