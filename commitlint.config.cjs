// Conventional Commits enforcement for git commit messages.
module.exports = {
  extends: ['@commitlint/config-conventional'],
  // Match the commit-rule templates: allow the shorthand "Release X.Y.Z" for
  // version bumps in addition to conventional types.
  rules: {
    'type-enum': [2, 'always', ['feat', 'fix', 'docs', 'style', 'refactor', 'perf', 'test', 'chore', 'build', 'ci', 'release']],
  },
};
