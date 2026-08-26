# MIZAN ANZAN — Documentation

This directory is the official technical and product documentation layer for the MIZAN ANZAN platform.

## Documentation principles

- The platform is built around a shared MIZAN Core.
- Genius, Parent, Coach, Entity and Branch are distinct concepts.
- A public Genius Code is not the same thing as an internal database identity.
- Relationships and permissions determine access; knowing a code alone must not grant unauthorized access.
- Leaderboards are multi-criteria.
- Mizan Genius Index (MGI) is an eligibility-based monthly recognition system, not a single-score award.
- The platform reveals performance data; the coach interprets it and makes the educational decision.

## Planned identity model

- `MZ-GEN-XXXXXXXX` — Genius Code
- `MZ-PAR-XXXXXXXX` — Parent Code
- `MZ-COA-XXXXXXXX` — Coach Code
- `MZ-ENT-XXXXXXXX` — Entity Code
- `MZ-BR-XXXXXXXX` — Branch Code, when branches are required

The exact code-generation implementation remains an implementation concern and must use secure randomness.

## Documentation map

- `architecture/identity.md` — identity architecture
- `architecture/entities-and-branches.md` — entities and branches
- `architecture/roles-and-permissions.md` — role visibility
- `architecture/relationships.md` — relationship model
- `competitions/leaderboard.md` — leaderboard principles
- `competitions/mgi.md` — MGI methodology
- `competitions/monthly-genius.md` — Monthly Genius recognition
- `product/three-audience-model.md` — Genius / Parent / Coach experience
- `security/access-control.md` — access-control principles
- `operations/migration-order.md` — implementation order

> This documentation describes the approved target architecture. It does not claim that every documented capability is already implemented in production.
