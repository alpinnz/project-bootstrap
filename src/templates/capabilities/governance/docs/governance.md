# Governance

This governance overlay adds consistent quality tooling: ESLint (flat config,
type-aware via typescript-eslint), Prettier, Husky git hooks, lint-staged, and
commitlint (Conventional Commits). It mirrors the same tooling used in the
project-bootstrap repository itself.

## What you get

| File                                     | Purpose                             |
| ---------------------------------------- | ----------------------------------- |
| `eslint.config.js`                       | ESLint flat config (type-aware)     |
| `.prettierrc.json` / `.prettierignore`   | Prettier options and ignores        |
| `commitlint.config.cjs`                  | Conventional Commits types          |
| `.husky/pre-commit`                      | lint-staged on staged files         |
| `.husky/commit-msg`                      | commitlint gate                     |
| `project-bootstrap.manifest.json`        | deps/scripts fragment (see below)   |
| `.project-bootstrap/rules/governance.md` | governance rule                     |
| `docs/governance.md`                     | this guide                          |

## Manifest merge (additive)

`project-bootstrap.manifest.json` is a fragment, not a full manifest. When the
capability is applied, its `scripts`, `devDependencies`, and `lint-staged`
blocks are merged into your `package.json` **additively**: only keys that do
not exist yet are added — existing user values are never overwritten. The CLI
reports exactly what was added and what was preserved.

## Activation (one-time)

```bash
npm install    # installs the merged devDependencies
npm run prepare # activates the husky hooks
```
