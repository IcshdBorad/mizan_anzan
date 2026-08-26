# MIZAN Identity Registration — Global Model

## Roles

- Genius: receives a Genius Code.
- Coach: may register independently; `entity_id` and `branch_id` remain NULL until an authorized relationship is established.
- Parent: may register independently; access to Genius data exists only through an active relationship.
- Entity: creates an Entity Code and an Entity Manager access code. Branches are created later under the entity.

## Identity principle

An account's code identifies the account. An entity or branch defines organizational scope; it does not replace the person's identity.

## Authorization principle

Registration does not grant access to any Genius profile. A parent, coach, or entity manager can see only active `mizan_relationships` authorized for that account.

## Independent coaches

Independent coaches are first-class platform users. They can later be associated with an entity or branch without changing their Coach Code.

## Operational flow

1. Register role.
2. Store the issued access code securely.
3. Create/approve relationships.
4. Use the role dashboard to list authorized Genius profiles.
5. Open detailed metrics only for an authorized Genius.
