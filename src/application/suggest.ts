/**
 * Repository improvement suggestions (plan §42 "repository improvement
 * suggestion" and "automatic modernization recommendation").
 *
 * Derives actionable, severity-ranked suggestions from inspection: foundation
 * presence, development commands, dependency hygiene, and architecture
 * signals. Each suggestion is concrete and actionable.
 */
import * as path from 'node:path';
import type { FileSystem } from '../infrastructure/filesystem.js';
import { analyzeProject } from './analyze.js';
import { runDepcheck } from './depcheck.js';
import { detectTooling } from './detect.js';
import { runDoctor } from './run-doctor.js';

export interface SuggestOptions {
  readonly root: string;
  readonly fs: FileSystem;
}

export interface Suggestion {
  readonly id: string;
  readonly severity: 'critical' | 'high' | 'medium' | 'low';
  readonly title: string;
  readonly detail: string;
}

export interface SuggestReport {
  readonly suggestions: readonly Suggestion[];
}

export async function suggestImprovements(options: SuggestOptions): Promise<SuggestReport> {
  const { root, fs } = options;
  const suggestions: Suggestion[] = [];

  const [doctor, depcheck, analyzed, tooling] = await Promise.all([
    runDoctor({ root, fs }),
    runDepcheck({ root, fs }),
    analyzeProject({ root, fs }),
    detectTooling({ fs, root }),
  ]);

  // Foundation.
  const foundationCheck = doctor.categories
    .find((c) => c.title === 'Foundation')?.checks ?? [];
  const missingAgents = foundationCheck.find((c) => c.name === 'AGENTS.md')?.status === 'fail';
  const missingConstitution =
    foundationCheck.find((c) => c.name === 'Constitution')?.status === 'fail';

  if (missingAgents || missingConstitution) {
    suggestions.push({
      id: 'foundation',
      severity: 'high',
      title: 'Add the project-bootstrap foundation',
      detail: `AGENTS.md and/or constitution are missing. Run \`project-bootstrap init\` to add a consistent foundation (existing files are preserved).`,
    });
  }

  // Dependencies.
  if (!depcheck.manifestPresent) {
    suggestions.push({
      id: 'manifest',
      severity: 'medium',
      title: 'Add a package manifest',
      detail: 'No package.json detected; dependency health is not assessable.',
    });
  } else if (!depcheck.lockfilePresent && tooling.packageManager !== 'unknown') {
    suggestions.push({
      id: 'lockfile',
      severity: 'medium',
      title: 'Commit a lockfile',
      detail: `No lockfile detected for ${depcheck.packageManager}. Commit one for reproducible installs.`,
    });
  }
  if (depcheck.flagged.length > 0) {
    suggestions.push({
      id: 'flagged-deps',
      severity: 'high',
      title: 'Review flagged dependencies',
      detail: `${depcheck.flagged.length} dependency(ies) flagged by offline heuristic (typosquat/suspicious names). Confirm or remove them; run npm audit / Socket.`,
    });
  }

  // Development commands.
  if (!tooling.commands.includes('test')) {
    suggestions.push({
      id: 'tests',
      severity: 'medium',
      title: 'Add a test command',
      detail: 'No `test` script detected. Add a test runner and a `test` command for verification.',
    });
  }

  // Security.
  const securityCheck = doctor.categories
    .find((c) => c.title === 'Security')?.checks ?? [];
  const secretsNotIgnored =
    securityCheck.find((c) => c.name === 'Secrets ignored')?.status === 'warning';
  if (secretsNotIgnored || !(await fs.exists(path.join(root, '.gitignore')))) {
    suggestions.push({
      id: 'secrets',
      severity: 'high',
      title: 'Protect secrets in .gitignore',
      detail: 'Ensure .gitignore ignores .env and secret files; never commit credentials.',
    });
  }

  // Architecture signals.
  if (!analyzed.foundationPresent && analyzed.entryPoints.length === 0) {
    suggestions.push({
      id: 'structure',
      severity: 'low',
      title: 'Document repository structure',
      detail: 'No obvious entry point detected. Add a README structure section or architecture doc.',
    });
  }

  return { suggestions };
}

export function renderSuggestions(report: SuggestReport): string {
  if (report.suggestions.length === 0) {
    return 'No actionable suggestions — repository looks healthy.';
  }
  const lines: string[] = ['Repository Suggestions', ''];
  const order = { critical: 0, high: 1, medium: 2, low: 3 } as const;
  const sorted = [...report.suggestions].sort(
    (a, b) => order[a.severity] - order[b.severity],
  );
  for (const suggestion of sorted) {
    lines.push(`[${suggestion.severity.toUpperCase()}] ${suggestion.title}`);
    lines.push(`    ${suggestion.detail}`);
  }
  lines.push('');
  lines.push(`Total: ${report.suggestions.length}`);
  return lines.join('\n');
}
