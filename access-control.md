# Access Control Principles

## 1. Codes are identifiers, not passwords

Genius, Parent, Coach, Entity and Branch codes should not be treated as sufficient authorization by themselves.

## 2. Authorization

Every protected request should establish:

- authenticated identity
- role
- relationship
- permission
- scope

## 3. Least privilege

Each role receives only the information required for its purpose.

## 4. Sensitive analytics

Professional diagnostics and internal coaching information should not be exposed to a Parent merely because the Parent is linked to the Genius.

## 5. Revocation

Relationships and codes must support deactivation/revocation.

## 6. Auditability

Future institutional deployments should log important authorization changes and relationship events.

## 7. Code generation

Public codes should be generated with cryptographically strong randomness and should not be sequential or predictable.
