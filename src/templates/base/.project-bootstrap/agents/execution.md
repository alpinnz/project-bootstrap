# Agent Execution Strategy

Multi-agent is not always required. Scale the execution pipeline to complexity.

## Simple

```text
Implementer
```

Use for trivial, low-risk changes.

## Standard

```text
Implementer → Reviewer
```

Use for ordinary feature work.

## Complex

```text
Planner → Implementer → Test Engineer → Reviewer
```

Use for high-risk changes touching auth, payments, permissions, data
integrity, or concurrency.

## Principle

Start with the smallest sufficient execution. Add roles only when the task
complexity or risk requires them.
