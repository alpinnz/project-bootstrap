# Governance Rules

- All commits must follow [Conventional Commits](https://www.conventionalcommits.org): `feat:`, `fix:`, `docs:`, `chore:`, `release:`.
- Staged files are linted and formatted by ESLint and Prettier before commit (`lint-staged`).
- Commit messages are validated by commitlint (`commit-msg` hook).
- `husky` runs the hooks; add new hooks under `.husky/`.

## Activation (one-time)

```bash
npm install     # installs the devDependencies merged by the governance capability
npm run prepare # activates the husky hooks
```
