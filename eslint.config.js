// ESLint 10 flat config. Lints the package's own source (src minus the
// embedded templates, which are generation payloads, not compiled code) plus
// the JS build/commit config files. Type-aware rules come from
// typescript-eslint; Prettier handles formatting, so the prettier preset
// disables style conflicts here.
import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import prettier from 'eslint-config-prettier';
import globals from 'globals';

export default tseslint.config(
  { ignores: ['dist', 'node_modules', 'src/templates', 'coverage'] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  prettier,
  {
    files: ['src/**/*.ts'],
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  {
    // Build/config scripts: plain JS. ESLint core rules only; the Node globals
    // cover `module`, `require`, `process`, `console`, etc.
    files: ['scripts/**/*.mjs'],
    languageOptions: {
      sourceType: 'module',
      globals: globals.node,
    },
  },
  {
    files: ['commitlint.config.cjs', '**/*.cjs'],
    languageOptions: {
      sourceType: 'commonjs',
      globals: globals.node,
    },
  },
);
