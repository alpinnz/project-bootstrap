# project-bootstrap

[![npm version](https://img.shields.io/npm/v/project-bootstrap)](https://www.npmjs.com/package/project-bootstrap)
[![CI](https://github.com/alpinnz/project-bootstrap/actions/workflows/ci.yml/badge.svg)](https://github.com/alpinnz/project-bootstrap/actions/workflows/ci.yml)

A reusable software project foundation system that creates, configures,
validates, and evolves software repositories with consistent engineering
practices. It combines a **project foundation**, **development foundation**,
**agent foundation**, and **repository intelligence** into a single CLI.

> Strong foundation. Small context. Explicit rules. Safe automation. Verified
> delivery.

## Install

```bash
npm install -g project-bootstrap
# or run without installing
npx project-bootstrap --help
```

## Status

Published to npm (`project-bootstrap`). See `plan.md` for the full
specification and roadmap.

## Commands

```bash
project-bootstrap create [dir]      # create a new project with the foundation
project-bootstrap init [dir]        # add the foundation to an existing project
project-bootstrap inspect [dir]     # understand a repository (language/framework/etc.)
project-bootstrap doctor [dir]      # validate repository health
project-bootstrap sync [dir]        # update managed artifacts
project-bootstrap roles             # list agent roles and responsibilities
project-bootstrap gates <topics...> # evaluate which quality gates apply to a change
project-bootstrap context [level]   # show the context plan for a level (0-4)
project-bootstrap adapters [dir]    # generate AI adapter context (--write to persist)
project-bootstrap mcp catalog       # list the recommended MCP capability catalog
project-bootstrap mcp status [dir]  # show the project MCP configuration and posture
project-bootstrap speckit [dir]     # report Spec Kit integration status
project-bootstrap analyze [dir]     # analyze repository architecture
project-bootstrap depcheck [dir]    # analyze dependency health (offline heuristic)
project-bootstrap suggest [dir]     # suggest repository improvements
project-bootstrap add <cap> [dir]   # add a capability to an existing project
```

Both `create`, `init`, and `add` accept capabilities. `create`/`init` take
`--capabilities <ids>`; `add <cap> [dir]` adds one capability to an existing
project (conservative by default, `--force` to overwrite).

## Template composition

Templates are composed from a base plus capability overlays (plan §30-31):

```
templates/
├── base/                    # core foundation (always included)
└── capabilities/<id>/       # optional overlay per capability
```

An overlay file with the same relative path shadows the base file. Available
capabilities:

| Capability | Provides                                                         |
| ---------- | ---------------------------------------------------------------- |
| testing    | testing-policy rule                                              |
| mcp        | MCP server config (read-only posture)                            |
| speckit    | specification-driven development rule + docs                     |
| typescript | TS/Node scaffold: package.json, tsconfig, src/index, vitest test |
| react      | React + Vite scaffold: main.tsx, App, vite.config, tsconfig-jsx  |
| go         | Go service/CLI scaffold: go.mod, main.go, test                   |

Language capabilities compose, e.g. `base + typescript + react`.

All commands accept a target directory (defaults to the current directory).

### Safety

- `init` is **conservative by default**: existing files are skipped, never
  overwritten. Use `--force` to overwrite with templates.
- `create` refuses to run in a non-empty directory.
- `init --dry-run` prints the plan without applying anything.

## Generated foundation

`create`/`init` generate:

```
.project-bootstrap/
├── constitution.md     # highest project principles (human-owned)
├── project.yml         # project context (human-owned)
├── rules/              # code, architecture, testing, security, dependencies,
│                       # documentation, git, agent, tools
├── workflows/          # development, review
├── gates/              # development, security, release
├── agents/             # agent roles, execution strategy
├── context.md          # context-management levels (L0-L4)
└── mcp/                # MCP strategy notes
AGENTS.md               # managed agent context
CLAUDE.md               # generated from adapter + AGENTS.md (sync)
docs/development.md     # docs scaffold with managed sections
README.md               # scaffold with managed sections
```

### File ownership

| File            | Ownership |
| --------------- | --------- |
| constitution.md | Human     |
| project.yml     | Human     |
| AGENTS.md       | Managed   |
| CLAUDE.md       | Generated |
| workflows       | Managed   |

Managed content is delimited by `<!-- project-bootstrap:start -->` /
`<!-- project-bootstrap:end -->` markers and refreshed with `project-bootstrap sync`.

## Development

```bash
npm install        # install dependencies (also sets up husky hooks)
npm run typecheck  # tsc --noEmit
npm run lint       # eslint
npm run format     # prettier --write
npm run test       # vitest
npm run build      # tsc + copy templates to dist/
```

### Git governance

Git hooks run automatically via [Husky](https://typicode.github.io/husky/):

- `pre-commit`: [`lint-staged`](https://github.com/lint-staged/lint-staged)
  runs ESLint `--fix` and Prettier `--write` on staged files.
- `commit-msg`: [`commitlint`](https://commitlint.js.org/) enforces
  Conventional Commits (e.g. `feat:`, `fix:`, `chore:`, `release:`).

CI runs lint, format check, typecheck, tests, and a build on every push/PR.

## Architecture

```
src/
├── domain/           # ProjectContext, BootstrapPlan, Capability, Rule, Workflow,
│                     # ValidationResult, AgentRole, QualityGate, ContextLevel, Mcp
├── application/      # use cases: create, init, inspect, doctor, sync, gates,
│                     # adapters, analyze, depcheck, suggest, mcp, speckit;
│                     # detect; plan-generator
├── infrastructure/   # FileSystem, Git, ProcessRunner, TemplateLoader
├── adapters/         # AI adapters (Claude, Codex, Cursor, Copilot)
└── cli/              # commander CLI
```

Design decisions (from `plan.md`):

1. Repository is the source of truth.
2. AI adapter is not the source of truth.
3. Minimal context over maximum context.
4. Capability over technology hardcoding.
5. Automation must be observable.
