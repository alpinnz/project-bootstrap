# Development Workflow

Scale the workflow to task complexity.

## Small

```text
Understand → Implement → Verify
```

Use for trivial, low-risk changes.

## Standard

```text
Understand → Plan → Implement → Verify → Review
```

Use for ordinary feature work and bug fixes.

## High Risk

```text
Understand → Plan → Implement → Test → Review → Finalize
```

Use for changes touching auth, payments, permissions, secrets, data integrity, or concurrency.

## Debugging

```text
Problem → Evidence → Root Cause → Fix → Verification
```

Never make random changes until something appears to work.

## Refactoring

```text
Understand Existing Behavior → Identify Improvement → Small Refactor → Verify → Review
```

Preserve behavior unless a behavior change is requested.
