# Project Constitution

Highest-level principles for this repository. Stable, small, technology-independent.

> Owned by humans. Edit freely. `project-bootstrap sync` never overwrites this file.

## 1. Correctness First

Correctness is more important than shortcuts. Verify behavior before declaring completion.

## 2. Minimal Coherent Change

Prefer the smallest solution that is correct, secure, maintainable, and testable. Do not add speculative features or abstractions.

## 3. Existing Architecture Authority

Respect the existing architecture, conventions, and patterns. Search for an existing implementation before creating a new abstraction.

## 4. Single Source of Truth

Avoid duplicated knowledge and state. The repository is the source of truth; AI adapters are not.

## 5. Verification Required

Work is not complete without verification. Never claim a command, test, or build passed unless it was actually run successfully.

## 6. Safe Default

Destructive operations require explicit intent. Prefer read-only and least-privilege defaults.

## 7. Complexity Requires Justification

Do not add complexity without a reason. Boring, explicit, well-understood code is preferred over clever code.

## 8. External System Failure

Treat external dependencies as capable of failing. Handle meaningful failure states; never silently swallow errors.
