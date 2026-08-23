# Context Management

Load context at the minimum level needed for the task, to minimize token waste.

| Level | Content                              | Loaded when               |
| ----- | ------------------------------------ | ------------------------- |
| L0    | AGENTS.md                            | Always, entry point       |
| L1    | workflow                             | Task needs a workflow     |
| L2    | rules                                | Implementing a change     |
| L3    | architecture docs, ADR, API docs     | Understanding/serving     |
| L4    | MCP / external knowledge             | Only when required        |
