# project-bootstrap

## Master Plan & Feature Specification

Version: 3.0.0

Owner:

```text
Alpinnz
```

Repository:

```text
project-bootstrap
```

---

# 1. Executive Summary

`project-bootstrap` adalah technology-agnostic project foundation tool yang menyediakan:

1. Base code foundation
2. Engineering workflow foundation
3. Agentic development foundation
4. Repository intelligence
5. Optional tooling integrations

Tujuan:

> Membuat developer dan coding AI bekerja dalam project dengan konteks, aturan, workflow, dan quality standard yang konsisten.

---

# 2. Product Positioning

## Definition

`project-bootstrap` adalah:

> A reusable software project foundation system that creates, configures, validates, and evolves software repositories with consistent engineering practices.

---

# 3. Problem Statement

Saat ini setiap project biasanya memiliki masalah:

## Project Setup

* struktur berbeda antar project
* dokumentasi tidak konsisten
* tooling tidak standar
* setup awal memakan waktu

## Development Process

* developer memiliki cara kerja berbeda
* review quality tidak konsisten
* debugging tidak sistematis
* testing strategy berbeda

## AI Coding

Coding AI sering gagal karena:

* context kurang
* architecture tidak jelas
* tidak tahu convention project
* tidak tahu command validasi
* terlalu banyak asumsi

## Maintenance

* sulit onboarding developer baru
* knowledge hilang
* keputusan architecture tidak terdokumentasi

---

# 4. Goals

## Primary Goals

* Menyediakan project foundation reusable.
* Mempercepat project initialization.
* Membuat repository AI-ready.
* Menstandarkan engineering workflow.
* Mengurangi context switching.
* Meningkatkan kualitas output coding agent.
* Menjaga maintainability.

---

# 5. Non Goals

Tidak bertujuan menjadi:

* AI coding agent
* feature specification framework
* project management system
* CI/CD platform
* package manager
* deployment platform
* application framework
* replacement Spec Kit

---

# 6. Core Concept

`project-bootstrap` terdiri dari:

```text
Project Foundation

+

Development Foundation

+

Agent Foundation

+

Repository Intelligence
```

---

# 7. High Level Architecture

```text
project-bootstrap

                    CORE

        ┌─────────────────────┐
        │ Project Foundation  │
        │ Context Model       │
        │ Bootstrap Plan      │
        │ Validation          │
        └─────────────────────┘


                    LAYERS


Foundation
    |
    ├── Base Code
    ├── Templates
    └── Documentation


Governance
    |
    ├── Constitution
    ├── Rules
    └── Quality Gates


Development
    |
    ├── Workflow
    ├── Debugging
    ├── Refactoring
    └── Review


Intelligence
    |
    ├── Inspect
    ├── Doctor
    └── Sync


Integration
    |
    ├── Claude
    ├── Codex
    ├── Cursor
    ├── Copilot
    └── MCP
```

---

# 8. CLI Specification

Command utama:

```bash
project-bootstrap create

project-bootstrap init

project-bootstrap inspect

project-bootstrap doctor

project-bootstrap sync

project-bootstrap add
```

---

# 9. Feature List

## Core Features

| Feature                 | Status  | Priority |
| ----------------------- | ------- | -------- |
| Create Project          | Planned | P0       |
| Init Existing Project   | Planned | P0       |
| Repository Inspect      | Planned | P0       |
| Doctor Validation       | Planned | P0       |
| Bootstrap Plan          | Planned | P0       |
| Constitution            | Planned | P0       |
| Rules System            | Planned | P0       |
| Development Workflow    | Planned | P0       |
| AGENTS.md Generator     | Planned | P0       |
| Documentation Generator | Planned | P0       |

---

# 10. Create Project

## Purpose

Membuat project baru dengan foundation.

Command:

```bash
project-bootstrap create
```

Flow:

```text
Input

↓

Select Template

↓

Build Project Context

↓

Create Bootstrap Plan

↓

Generate Files

↓

Verify
```

---

Output:

```text
project/

├── source code

├── AGENTS.md

├── .project-bootstrap/

├── docs/

└── tooling files
```

---

# 11. Init Existing Project

## Purpose

Menambahkan foundation ke repository existing.

Command:

```bash
project-bootstrap init
```

Tidak:

* rewrite architecture
* replace dependencies
* delete files

---

Flow:

```text
Inspect

↓

Assessment

↓

Bootstrap Plan

↓

Apply Changes

↓

Verify
```

---

# 12. Repository Inspect

## Purpose

Memahami repository.

Command:

```bash
project-bootstrap inspect
```

Output:

```text
Repository

Language:
TypeScript

Framework:
React

Package Manager:
pnpm

Testing:
Vitest

Commands:

dev
test
build
lint
```

---

Detect:

* language
* framework
* runtime
* package manager
* build tool
* testing
* linting
* formatting
* CI
* container
* AI tools

---

# 13. Doctor

## Purpose

Repository health validation.

Command:

```bash
project-bootstrap doctor
```

---

Checks:

## Foundation

* AGENTS exists
* constitution exists
* documentation exists

## Development

* commands available
* test available
* build available

## Agentic

* AI context valid
* adapter configured

## Security

* secrets ignored
* unsafe configuration detected

---

Example:

```text
Project Bootstrap Doctor

Foundation

✓ AGENTS.md
✓ Constitution
✓ Development workflow


Development

✓ Test command
✓ Build command


Agentic

✓ Claude integration


Result:

Healthy
```

---

# 14. Bootstrap Plan

## Purpose

Semua perubahan harus memiliki plan.

Contoh:

```text
Bootstrap Plan

CREATE

AGENTS.md


CREATE

docs/development.md


UPDATE

.gitignore


SKIP

README.md
```

---

Benefit:

* predictable
* safe
* testable
* dry-run support

---

# 15. Dry Run

Command:

```bash
project-bootstrap init --dry-run
```

Tidak melakukan perubahan.

Hanya menampilkan:

* create
* update
* skip
* conflict

---

# 16. Foundation Structure

Generated:

```text
.project-bootstrap/

├── constitution.md

├── project.yml

├── rules/

├── workflows/

├── gates/

└── mcp/
```

---

# 17. Constitution

## Purpose

Highest project principles.

Karakter:

* stable
* small
* technology independent

---

Principles:

## Correctness First

Correctness lebih penting daripada shortcut.

## Minimal Coherent Change

Solusi terkecil yang maintainable.

## Existing Architecture Authority

Hormati architecture existing.

## Single Source of Truth

Hindari duplicated state.

## Verification Required

Tidak selesai tanpa verification.

## Safe Default

Destructive operation membutuhkan intent.

## Complexity Requires Justification

Tidak menambah complexity tanpa alasan.

## External System Failure

External dependency harus dianggap gagal.

---

# 18. Rules System

Structure:

```text
rules/

code.md

architecture.md

testing.md

security.md

dependencies.md

documentation.md

git.md

agent.md

tools.md
```

---

# 19. Development Rules

Mencakup:

* coding practice
* architecture
* testing
* security
* dependency
* documentation

---

# 20. Agent Rules

Tujuan:

Mengontrol behavior coding AI.

Agent harus:

* memahami sebelum edit
* mencari source of truth
* mengikuti convention
* melakukan verification

Agent tidak boleh:

* membuat asumsi tanpa evidence
* claim test berhasil tanpa menjalankan
* melakukan unrelated refactor
* melemahkan validation

---

# 21. Development Workflow

Workflow standar:

```text
Understand

↓

Scope

↓

Plan

↓

Implement

↓

Verify

↓

Review

↓

Finalize
```

---

# 22. Workflow Complexity

## Small

```text
Understand

Implement

Verify
```

## Standard

```text
Understand

Plan

Implement

Verify

Review
```

## High Risk

```text
Understand

Plan

Implement

Test

Review

Finalize
```

---

# 23. Debugging Workflow

Pattern:

```text
Problem

↓

Evidence

↓

Root Cause

↓

Fix

↓

Verification
```

---

# 24. Refactoring Workflow

Pattern:

```text
Understand Existing Behavior

↓

Identify Improvement

↓

Small Refactor

↓

Verify

↓

Review
```

---

# 25. Review Workflow

Review priority:

1. Correctness
2. Security
3. Reliability
4. Architecture
5. Maintainability
6. Testing
7. Performance
8. Style

---

# 26. Quality Gates

## Development Gate

Required:

* behavior implemented
* verification executed
* diff reviewed

## Security Gate

Triggered:

* auth
* payment
* permission
* secret
* external input

## Release Gate

Optional.

---

# 27. Agent Architecture

Roles:

```text
Planner

Implementer

Reviewer

Debugger

Test Engineer
```

---

# 28. Agent Execution Strategy

Tidak selalu multi-agent.

---

Simple:

```text
Implementer
```

---

Standard:

```text
Implementer

↓

Reviewer
```

---

Complex:

```text
Planner

↓

Implementer

↓

Test Engineer

↓

Reviewer
```

---

# 29. Context Management

Tujuan:

Mengurangi token waste.

---

Level 0:

```text
AGENTS.md
```

---

Level 1:

```text
workflow
```

---

Level 2:

```text
rules
```

---

Level 3:

```text
architecture docs
ADR
API docs
```

---

Level 4:

```text
MCP
external knowledge
```

---

# 30. Template System

Menggunakan composition.

Bukan giant template.

Format:

```text
Base

+

Language

+

Framework

+

Capability
```

---

Example:

```text
base

+

typescript

+

react

+

testing
```

---

# 31. MVP Templates

Support:

## Generic

Basic repository.

## TypeScript

* Node
* React

## Go

* Service
* CLI

---

# 32. AI Integration

Supported:

```text
Claude

Codex

Cursor

Copilot
```

---

Principle:

Adapter bukan source of truth.

Source:

```text
.project-bootstrap

AGENTS.md
```

---

# 33. MCP Strategy

MCP optional.

Rule:

```text
Native Tools First
```

---

Capabilities:

```text
Documentation

Source Control

Design

API

Database

Observability

Cloud
```

---

# 34. MCP Security

Default:

READ ONLY

Write:

Explicit requirement.

Never:

* store credential
* expose secret
* allow destructive action default

---

# 35. Sync

Command:

```bash
project-bootstrap sync
```

Purpose:

Update managed artifact.

---

Managed section:

```md
<!-- project-bootstrap:start -->

content

<!-- project-bootstrap:end -->
```

---

# 36. File Ownership

| File            | Ownership |
| --------------- | --------- |
| constitution.md | Human     |
| project.yml     | Human     |
| AGENTS.md       | Managed   |
| CLAUDE.md       | Generated |
| architecture.md | Human     |
| workflow        | Managed   |

---

# 37. Internal Architecture

Recommended:

```text
src/

├── domain

├── application

├── infrastructure

└── adapters
```

---

# 38. Domain Layer

Contains:

```text
ProjectContext

BootstrapPlan

Capability

ValidationResult

Rule

Workflow
```

---

# 39. Application Layer

Use cases:

```text
CreateProject

InitializeProject

InspectProject

RunDoctor

SyncProject
```

---

# 40. Infrastructure Layer

Contains:

```text
Filesystem

Git

Process Runner

Template Loader
```

---

# 41. Adapter Layer

Contains:

```text
Claude

Codex

Cursor

Copilot

MCP
```

---

# 42. Roadmap

## Phase 1 — Foundation MVP

Target:

Functional project bootstrap.

Features:

* create
* init
* inspect
* doctor
* bootstrap plan
* constitution
* rules
* workflow
* docs generation

---

## Phase 2 — Agentic Enhancement

Features:

* agent roles
* quality gates
* Claude adapter
* Codex adapter
* dry-run
* managed sections

---

## Phase 3 — Ecosystem Integration

Features:

* MCP
* Spec Kit integration
* more templates
* more adapters

---

## Phase 4 — Intelligence

Features:

* architecture analysis
* repository improvement suggestion
* dependency health
* automatic modernization recommendation

---

# 43. Main Design Decisions

## Decision 1

Repository is source of truth.

---

## Decision 2

AI adapter is not source of truth.

---

## Decision 3

Minimal context over maximum context.

---

## Decision 4

Capability over technology hardcoding.

---

## Decision 5

Automation must be observable.

---

# 44. Final Product Definition

`project-bootstrap` adalah:

```text
Software Project Operating Foundation
```

yang menyediakan:

```text
Base Code

+

Engineering Rules

+

Development Workflow

+

AI Context

+

Repository Intelligence

+

Tool Integration
```

---

# 45. Success Criteria

Project berhasil jika:

* developer baru dapat memahami repository lebih cepat
* AI agent menghasilkan perubahan yang lebih konsisten
* setup project baru lebih cepat
* context AI lebih kecil tetapi lebih relevan
* verification lebih konsisten
* architecture lebih terjaga
* maintenance cost menurun

---

# Final Principle

```text
Strong foundation.

Small context.

Explicit rules.

Safe automation.

Verified delivery.
```
