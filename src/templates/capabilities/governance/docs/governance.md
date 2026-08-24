# Governance

This governance overlay adds consistent quality tooling: ESLint (flat config,
type-aware via typescript-eslint), Prettier, Husky git hooks, lint-staged, and
commitlint (Conventional Commits). It mirrors the same tooling used in the
project-bootstrap repository itself.

## What you get

| File                         | Purpose                        |
| ---------------------------- | ------------------------------- |
| `eslint.config.js`              | ESLint flat config (type-aware)    |
| `.prettierrc.json`            | Prettier options                     |
| `.prettierignore`              | Prettier ignores                  |
| `commitlint.config.cjs`         | Conventional Commits types            |
| `.husky/pre-commit`         | lint-staged on staged files        |
| `.husky/commit-msg`         | commitlint gate                  |
| `.project-bootstrap/rules/governance.md` | governance rule            |
| `docs/governance.md`            | setup guide                       |

## Setup (one-time)

The overlay intentionally does **not** include a `package.json` merge — adding
the config files would overwrite the target project manifest. Install the
dev dependencies and register the scripts yourself:

```bash
npm i -D eslint husky lint-staged prettier eslint-config-prettier @commitlint/cli @commitlint/config-conventional
npm pkg set scripts.prepare="husky"
npm pkg set scripts.lint="eslint ."
npm pkg set scripts.format="prettier --write ."
npm pkg set "scripts.format:check"="prettier --check ."
npm run prepare
```

After `husky prepare`, `.husky/_` scaffolding is created and the hooks here
(`pre-commit`, `commit-msg`) take over.

## Options

- **Dependencies**: none — the overlay works for TS and non-TS projects (the flat
  ESLint config lints `.mjs`/`.cjs` too, so it does not depend on a TS project).