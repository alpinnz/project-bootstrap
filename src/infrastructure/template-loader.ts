/**
 * TemplateLoader resolves the embedded foundation templates with capability
 * composition (plan §30-31): Base + Language + Framework + Capability.
 *
 * Layout:
 *   templates/base/                    — always included (core foundation)
 *   templates/capabilities/<id>/       — optional overlay per enabled capability
 *
 * Overlay files shadow base files with the same relative path, so a capability
 * can add new files or refine existing ones. This keeps templates composable
 * rather than a single giant template.
 *
 * In dev (tsx) templates live in `src/templates`; after `tsc` they are copied
 * to `dist/templates`. We probe both layouts.
 */
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import * as path from 'node:path';
import * as url from 'node:url';

const here = path.dirname(url.fileURLToPath(import.meta.url));

/** Absolute templates root dir, or null when not found. */
function templatesRoot(): string | null {
  const roots: string[] = [
    path.resolve(here, '..'), // dist/infrastructure -> dist/templates
    path.resolve(here, '..', '..', 'src'), // src/infrastructure -> src/templates
    path.resolve(here, '..', '..'), // <root>/templates
  ];
  for (const root of roots) {
    if (existsSync(path.join(root, 'templates'))) {
      return path.join(root, 'templates');
    }
  }
  return null;
}

export function baseDir(): string {
  return path.join(templatesRoot() ?? path.resolve(here, '..', 'templates'), 'base');
}

export function capabilityDir(id: string): string {
  const root = templatesRoot() ?? path.resolve(here, '..', 'templates');
  return path.join(root, 'capabilities', id);
}

/**
 * List files in a directory recursively, relative to that directory with
 * forward-slash separators. Repo-relative template paths are always normalized
 * to forward slashes so they are stable across platforms.
 */
function listRelative(dir: string): string[] {
  if (!existsSync(dir)) return [];
  const out: string[] = [];
  const walk = (current: string) => {
    for (const entry of readdirSync(current, { withFileTypes: true })) {
      const full = path.join(current, entry.name);
      if (entry.isDirectory()) walk(full);
      else out.push(path.relative(dir, full).split(path.sep).join('/'));
    }
  };
  walk(dir);
  return out;
}

/**
 * List the file paths that a specific capability overlay provides, relative
 * to that overlay directory.
 */
export function capabilityFiles(id: string): string[] {
  return listRelative(capabilityDir(id));
}

/**
 * Resolve the *composed* template list for a set of enabled capability ids.
 * Returns repository-relative paths (e.g. "AGENTS.md").
 *
 * Overlay order: base first, then capabilities in the given order; later
 * entries write the same path.
 */
export function composedTemplateFiles(capabilityIds: readonly string[] = []): string[] {
  const seen = new Set<string>();
  const order: string[] = [];

  const collect = (rel: string) => {
    if (!seen.has(rel)) {
      seen.add(rel);
      order.push(rel);
    }
  };

  for (const rel of listRelative(baseDir())) collect(rel);
  for (const id of capabilityIds) {
    for (const rel of listRelative(capabilityDir(id))) collect(rel);
  }

  return order;
}

/**
 * Resolve the composed template dir that owns a given relative path for a set
 * of capabilities (the last overlay that provides it wins).
 */
export function ownerDirFor(
  rel: string,
  capabilityIds: readonly string[] = [],
): string {
  let owner = baseDir();
  for (const id of capabilityIds) {
    const dir = capabilityDir(id);
    if (existsSync(path.join(dir, rel))) owner = dir;
  }
  return owner;
}

/** Read resolved template content for a relative path under a capability set. */
export function readComposedFile(
  rel: string,
  capabilityIds?: readonly string[],
): string | null {
  const owner = ownerDirFor(rel, capabilityIds);
  const file = path.join(owner, rel);
  try {
    return readFileSync(file, 'utf8');
  } catch {
    return null;
  }
}

/** True if any template exists for the given capabilities. */
export function hasTemplates(capabilityIds?: readonly string[]): boolean {
  return composedTemplateFiles(capabilityIds).length > 0;
}
