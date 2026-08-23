/**
 * Dependency health use case (plan §42 "dependency health").
 *
 * Heuristic, offline analysis of a manifest: counts, lockfile presence,
 * and flags for likely-problematic dependency names (typosquat lookalikes,
 * known-unmaintained markers). This is NOT a substitute for a real scanner
 * (Socket, npm audit); it signals where to dig deeper.
 */
import * as path from 'node:path';
import type { FileSystem } from '../infrastructure/filesystem.js';

export interface DepcheckOptions {
  readonly root: string;
  readonly fs: FileSystem;
}

export interface DependencyEntry {
  readonly name: string;
  readonly version: string;
  readonly kind: 'dependency' | 'devDependency';
  readonly flags: readonly string[];
}

export type DependencyHealth = 'healthy' | 'attention' | 'unhealthy';

export interface DepcheckReport {
  readonly manifestPresent: boolean;
  readonly lockfilePresent: boolean;
  readonly packageManager: string;
  readonly runtimeCount: number;
  readonly devCount: number;
  readonly flagged: readonly DependencyEntry[];
  readonly health: DependencyHealth;
  readonly note: string;
}

interface Manifest {
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
  packageManager?: string;
}

/** Heuristic flags for risky dependency names. */
export function flagDependency(name: string): readonly string[] {
  const flags: string[] = [];
  const lower = name.toLowerCase();
  // Typosquat lookalikes of common packages.
  const lookalikes = ['lodahs', 'expresss', 'requst', 'asyncjs', 'socketio'];
  if (lookalikes.some((l) => lower === l)) flags.push('possible-typosquat');
  // Underscores/spaces in unscoped names can indicate questionable packages.
  if (!name.startsWith('@') && /[ _]/.test(name)) flags.push('suspicious-name');
  return flags;
}

export async function runDepcheck(options: DepcheckOptions): Promise<DepcheckReport> {
  const { root, fs } = options;
  const manifest = await fs.readJson<Manifest>(path.join(root, 'package.json'));
  const manifestPresent = manifest !== null;

  const lockCandidates = [
    ['package-lock.json', 'npm'],
    ['pnpm-lock.yaml', 'pnpm'],
    ['yarn.lock', 'yarn'],
    ['bun.lockb', 'bun'],
  ] as const;
  let lockfilePresent = false;
  let packageManager = manifest?.packageManager?.split('@')[0] ?? 'unknown';
  for (const [file, manager] of lockCandidates) {
    if (await fs.exists(path.join(root, file))) {
      lockfilePresent = true;
      packageManager = manager;
      break;
    }
  }

  const entries: DependencyEntry[] = [];
  const deps = manifest?.dependencies ?? {};
  const devDeps = manifest?.devDependencies ?? {};
  for (const [name, version] of Object.entries(deps)) {
    entries.push({ name, version, kind: 'dependency', flags: flagDependency(name) });
  }
  for (const [name, version] of Object.entries(devDeps)) {
    entries.push({ name, version, kind: 'devDependency', flags: flagDependency(name) });
  }

  const flagged = entries.filter((e) => e.flags.length > 0);

  let score = 0;
  if (!manifestPresent) score += 3; // serious: health not assessable
  if (!lockfilePresent && manifestPresent) score += 1;
  if (flagged.length > 0) score += flagged.length;

  const health: DependencyHealth = score === 0 ? 'healthy' : score <= 2 ? 'attention' : 'unhealthy';
  const note = !manifestPresent
    ? 'No package.json detected; dependency health not assessable.'
    : !lockfilePresent
      ? 'No lockfile detected; installs are not reproducible.'
      : flagged.length > 0
        ? `${flagged.length} dependency(ies) flagged for review (offline heuristic).`
        : 'No immediate offline red flags. Run npm audit / Socket for deeper analysis.';

  return {
    manifestPresent,
    lockfilePresent,
    packageManager,
    runtimeCount: Object.keys(deps).length,
    devCount: Object.keys(devDeps).length,
    flagged,
    health,
    note,
  };
}

export function renderDepcheck(report: DepcheckReport): string {
  const lines = [
    'Dependency Health',
    `Manifest: ${report.manifestPresent ? 'present' : 'missing'}`,
    `Lockfile: ${report.lockfilePresent ? 'present' : 'missing'}`,
    `Package manager: ${report.packageManager}`,
    `Runtime deps: ${report.runtimeCount}   Dev deps: ${report.devCount}`,
    '',
  ];
  if (report.flagged.length === 0) {
    lines.push('Flagged dependencies: none');
  } else {
    lines.push(`Flagged dependencies (${report.flagged.length}):`);
    for (const flagged of report.flagged) {
      lines.push(`  - ${flagged.name}@${flagged.version} [${flagged.kind}]`);
      lines.push(`      ${flagged.flags.join(', ')}`);
    }
  }
  lines.push('');
  lines.push(`Health: ${report.health}`);
  lines.push(report.note);
  return lines.join('\n');
}
