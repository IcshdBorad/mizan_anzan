# MIZAN Identity Architecture

## 1. Objective

MIZAN uses a role-aware identity architecture designed to support individual learners, families, coaches and organizations without rebuilding the platform when new products are introduced.

## 2. Public codes

| Role | Public code |
|---|---|
| Genius | `MZ-GEN-XXXXXXXX` |
| Parent | `MZ-PAR-XXXXXXXX` |
| Coach | `MZ-COA-XXXXXXXX` |
| Entity | `MZ-ENT-XXXXXXXX` |
| Branch | `MZ-BR-XXXXXXXX` |

Codes are public references, not authorization by themselves.

## 3. Genius identity

The product-facing term is **Genius Code** rather than Student Code.

For backward compatibility, the database may continue to use existing internal fields such as `student_id` while the public interface uses Genius terminology.

A Genius can later participate across multiple MIZAN engines without creating a separate identity for every game.

## 4. Separation of concerns

The system should distinguish:

1. Internal identity
2. Public code
3. Role
4. Relationship
5. Permission
6. Scope

This prevents a code from becoming an accidental master key.

## 5. Future extensibility

The identity model is intended to support Anzan first and additional MIZAN engines later, including multiplication, division, memory, focus, logic and Sudoku.
