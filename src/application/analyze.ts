/**
 * AnalyzeProject use case (plan §42 "architecture analysis"):
 *
 * Build a lightweight architecture view of a repository — top-level structure,
 * detected entry points, module boundaries, and rough size signals. This is
 * intentionally heuristic and read-only; it gives a developer or agent a
 * bearing, not a guarantee.
 */
import * as path from 'node:path';
import type { FileSystem } from '../infrastructure/filesystem.js';
import { detectTooling } from './detect.js';

export interface AnalyzeOptions {
  readonly root: string;
  readonly fs: FileSystem;
}

export interface TopLevelEntry {
  readonly name: string;
  readonly type: 'file' | 'dir';
}

export interface AnalyzeReport {
  readonly root: string;
  readonly tooling: {
    readonly language: string;
    readonly framework: string;
    readonly runtime: string;
    readonly packageManager: string;
  };
  readonly topLevel: readonly TopLevelEntry[];
  /** Suspicious / heavy directories that often concentrate complexity. */
  readonly hotspots: readonly string[];
  /** Detected source entry points (heuristic). */
  readonly entryPoints: readonly string[];
  /** Files that indicate architecture conventions. */
  readonly conventionSignals: readonly string[];
  readonly foundationPresent: boolean;
}

const CONVENTION_SIGNALS = [
  '.project-bootstrap/constitution.md',
  'AGENTS.md',
  'docs/architecture.md',
  'tsconfig.json',
  'go.mod',
  '.github/workflows',
  'Dockerfile',
];

const ENTRY_POINT_HEURISTICS = [
  'src/index.ts',
  'src/index.js',
  'src/main.ts',
  'src/main.js',
  'src/app.ts',
  'src/app.js',
  'main.go',
  'cmd/main.go',
  'src/cli/index.ts',
  'src/server.ts',
];

/** Directories often associated with higher complexity or risk. */
const HOTSPOT_DIRS = ['legacy', 'migrations', 'monolith', 'utils', 'helpers'];

export async function analyzeProject(options: AnalyzeOptions): Promise<AnalyzeReport> {
  const { root, fs } = options;
  const tooling = await detectTooling({ fs, root });

  const topLevel = await readTopLevel(fs, root);
  const hotspots = topLevel
    .filter((e) => e.type === 'dir' && HOTSPOT_DIRS.includes(e.name.toLowerCase()))
    .map((e) => e.name);

  const entryPoints: string[] = [];
  for (const heuristic of ENTRY_POINT_HEURISTICS) {
    if (await fs.exists(path.join(root, heuristic))) {
      entryPoints.push(heuristic);
    }
  }

  const conventionSignals: string[] = [];
  for (const signal of CONVENTION_SIGNALS) {
    if (await fs.exists(path.join(root, signal))) {
      conventionSignals.push(signal);
    }
  }

  const foundationPresent = conventionSignals.includes('.project-bootstrap/constitution.md');

  return {
    root,
    tooling: {
      language: tooling.language,
      framework: tooling.framework,
      runtime: tooling.runtime,
      packageManager: tooling.packageManager,
    },
    topLevel,
    hotspots,
    entryPoints,
    conventionSignals,
    foundationPresent,
  };
}

async function readTopLevel(fs: FileSystem, root: string): Promise<TopLevelEntry[]> {
  const names = await fs.readDir(root);
  const entries: TopLevelEntry[] = [];
  for (const name of names) {
    if (name.startsWith('.') && name !== '.github') continue; // skip hidden
    if (['node_modules', 'dist', 'build', 'out', 'coverage'].includes(name)) continue;
    const isDir = await fs.isFile(path.join(root, name)) === false;
    entries.push({ name, type: isDir ? 'dir' : 'file' });
  }
  // Deterministic ordering.
  return entries.sort((a, b) =>
    a.type === b.type ? a.name.localeCompare(b.name) : a.type === 'dir' ? -1 : 1,
  );
}
