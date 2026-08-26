/**
 * ManifestMerge applies capability manifest fragments to the project's
 * package.json additively: keys are only ADDED, never overwritten, and
 * existing user values always win over fragment values.
 *
 * Fragments live in capability overlays as `project-bootstrap.manifest.json`.
 * This keeps tooling capabilities (e.g. governance) self-contained
 * (configs + hooks + deps) without ever clobbering the target manifest.
 */
import type { FileSystem } from '../infrastructure/filesystem.js';

export interface ManifestFragment {
  scripts?: Record<string, unknown>;
  devDependencies?: Record<string, unknown>;
  lintStaged?: Record<string, unknown>;
}

/** Parse a manifest fragment, returning null when absent or malformed. */
export function parseManifestFragment(raw: string): ManifestFragment | null {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return null;
  }
  if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) return null;
  const record = parsed as Record<string, unknown>;
  const fragment: ManifestFragment = {};
  if (isStringRecord(record['scripts'])) fragment.scripts = record['scripts'];
  if (isStringRecord(record['devDependencies'])) fragment.devDependencies = record['devDependencies'];
  if (isRecord(record['lint-staged'])) fragment.lintStaged = record['lint-staged'];
  return Object.keys(fragment).length > 0 ? fragment : null;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isStringRecord(value: unknown): value is Record<string, unknown> {
  return isRecord(value);
}

export interface MergeManifestOptions {
  readonly root: string;
  readonly fs: FileSystem;
  /** Raw fragment content from the composed template overlay. */
  readonly fragmentRaw: string;
}

export interface MergeManifestResult {
  /** True when package.json was created or rewritten. */
  changed: boolean;
  /** True when package.json did not exist and was created. */
  created: boolean;
  addedScripts: string[];
  addedDevDependencies: string[];
  /** Existing keys that kept their user values instead of fragment values. */
  preservedKeys: string[];
}

const NO_MERGE_RESULT: MergeManifestResult = {
  changed: false,
  created: false,
  addedScripts: [],
  addedDevDependencies: [],
  preservedKeys: [],
};

/**
 * Merge a manifest fragment into <root>/package.json additively:
 * - missing top-level objects (scripts, devDependencies, lint-staged) are created
 * - missing keys inside them are added with the fragment's values
 * - existing keys are NEVER overwritten (user values win); they are reported
 *   in preservedKeys so callers can surface what was left untouched
 *
 * A malformed target manifest aborts the merge without writing.
 */
export async function mergeManifestFragment(options: MergeManifestOptions): Promise<MergeManifestResult> {
  const { root, fs, fragmentRaw } = options;
  const fragment = parseManifestFragment(fragmentRaw);
  if (!fragment) return NO_MERGE_RESULT;

  const manifestPath = joinPath(root, 'package.json');
  const raw = await fs.read(manifestPath);

  let manifest: Record<string, unknown> = {};
  if (raw !== null) {
    try {
      manifest = JSON.parse(raw) as Record<string, unknown>;
    } catch {
      return NO_MERGE_RESULT; // never risk corrupting an unparseable manifest
    }
    if (!isRecord(manifest)) return NO_MERGE_RESULT;
  }

  const result: MergeManifestResult = {
    changed: false,
    created: raw === null,
    addedScripts: [],
    addedDevDependencies: [],
    preservedKeys: [],
  };

  // --- scripts ---
  if (fragment.scripts) {
    const current = cloneRecord(manifest['scripts']);
    for (const [key, value] of Object.entries(fragment.scripts)) {
      if (key in current) {
        result.preservedKeys.push(`scripts.${key}`);
      } else {
        current[key] = value;
        result.addedScripts.push(key);
        result.changed = true;
      }
    }
    manifest['scripts'] = current;
  }

  // --- devDependencies ---
  if (fragment.devDependencies) {
    const current = cloneRecord(manifest['devDependencies']);
    for (const [key, value] of Object.entries(fragment.devDependencies)) {
      if (key in current) {
        result.preservedKeys.push(`devDependencies.${key}`);
      } else {
        current[key] = value;
        result.addedDevDependencies.push(key);
        result.changed = true;
      }
    }
    manifest['devDependencies'] = current;
  }

  // --- lint-staged config block ---
  if (fragment.lintStaged && Object.keys(fragment.lintStaged).length > 0) {
    if ('lint-staged' in manifest) {
      result.preservedKeys.push('lint-staged');
    } else {
      manifest['lint-staged'] = fragment.lintStaged;
      result.changed = true;
    }
  }

  if (!result.changed) return result;

  await fs.writeFile(joinPath(root, 'package.json'), `${JSON.stringify(manifest, null, 2)}\n`);
  return result;
}

function cloneRecord(value: unknown): Record<string, unknown> {
  return isRecord(value) ? { ...value } : {};
}

function joinPath(root: string, rel: string): string {
  const sep = root.includes('\\') ? '\\' : '/';
  const trimmed = root.replace(/[\\/]+$/, '');
  return `${trimmed}${sep}${rel}`;
}
