# Entities and Branches

## 1. Unified Entity Code

MIZAN should use one universal **Entity Code**:

`MZ-ENT-XXXXXXXX`

The entity type is stored separately.

Examples of entity types:

- School
- Academy
- Training Center
- Institute
- Club
- University
- Federation
- Association
- Organization
- Other

This avoids creating separate code systems for every organization type.

## 2. Branch model

A branch is a subordinate operational unit of an entity.

Example:

```text
MZ-ENT-XXXXXXXX
└── Academy
    ├── MZ-BR-XXXXXXXX — Baghdad
    ├── MZ-BR-XXXXXXXX — Erbil
    └── MZ-BR-XXXXXXXX — Basra
```

A branch code should only be introduced when branch-level management, reporting or permissions require it.

## 3. Scope

A parent entity may have visibility across its branches according to its permissions.

A branch manager should normally be limited to its branch.

A coach should normally see only assigned geniuses.

## 4. Important principle

The entity type is data, not the identity format.

Therefore a future entity type can be added without changing the public code architecture.
