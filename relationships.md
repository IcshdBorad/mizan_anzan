# Relationship Model

## Relationship types

The target architecture supports relationships such as:

- Parent ↔ Genius
- Coach ↔ Genius
- Entity ↔ Coach
- Entity ↔ Genius
- Entity ↔ Branch
- Branch ↔ Coach
- Branch ↔ Genius

## Relationship lifecycle

A relationship may use states such as:

- `pending`
- `active`
- `revoked`

## Example

```text
Entity
 ├── Branch A
 │    ├── Coach A
 │    │    ├── Genius 001
 │    │    └── Genius 002
 │    └── Coach B
 │         └── Genius 003
 └── Branch B
      └── Coach C
           └── Genius 004

Parent A
 ├── Genius 001
 └── Genius 004
```

## Design rule

Relationship records are the source of authorization scope. They should not be replaced by front-end hiding alone.
