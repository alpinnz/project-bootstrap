# Governance Rules

- All commits must follow [Conventional Commits](https://www.conventionalcommits.org): `feat:`,

`fix:`, `docs:`, `chore:`, `release:`.
- Staged files are linted and formatted by ESLint and Prettier before commit (`lint-staged`).
- Commit messages are validated by commitlint (`commit-msg` hook).
- `husky` runs the hooks; add new hooks under `.husky/`.

## Setup (manual, one-time)

Install the dev dependencies and scripts that the configs reference:

```bash
npm install -D eslint typescript-eslint @eslint/js eslint-config-prettier prettier lint-staged husky @commitlint/cli @commitlint/config-conventional
npm pkg set scripts.prepare="husky"
npm pkg set scripts.lint="eslint ."
npm pkg set scripts.format="prettier --write ."
npm pkg set scripts.format:check="prettier --check ."
npm run prepare
```

`husky` also creates `.husky/_` scaffolding when `prepare` runs; hook files
are already added here (`pre-commit`, `commit-msg`).

The `package.json` `scripts` and `devDependencies` are NOT managed by the overlay
(manifest merge is unsupported), so they are added by you with the commands above.