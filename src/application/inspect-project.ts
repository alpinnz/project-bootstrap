/**
 * InspectProject use case: produce a ProjectContext for a repository by
 * detecting tooling and inspecting existing foundation files.
 */
import * as path from 'node:path';
import type { ProjectContext, ProjectRecord } from '../domain/project-context.js';
import { GitClient } from '../infrastructure/git.js';
import type { FileSystem } from '../infrastructure/filesystem.js';
import { detectTooling } from './detect.js';

export interface InspectOptions {
  readonly root: string;
  readonly fs: FileSystem;
  readonly git?: GitClient;
}

/**
 * Detect the repository's tooling and whether it already has a foundation.
 */
export async function inspectProject(options: InspectOptions): Promise<ProjectContext> {
  const { root, fs } = options;
  const git = options.git ?? new GitClient();

  const tooling = await detectTooling({ fs, root });
  const gitInfo = await git.info(root);

  const record: ProjectRecord = {
    root,
    isExisting: gitInfo.isRepository && gitInfo.hasCommits,
    tooling,
  };

  const managedFiles = await listManagedFiles(fs, root);
  const capabilities = await detectEnabledCapabilities(fs, root);

  return { ...record, capabilities, managedFiles };
}

async function listManagedFiles(fs: FileSystem, root: string): Promise<string[]> {
  const files: string[] = [];
  const known = [
    'AGENTS.md',
    'CLAUDE.md',
    '.project-bootstrap/constitution.md',
    '.project-bootstrap/project.yml',
  ];
  for (const file of known) {
    if (await fs.exists(path.join(root, file))) files.push(file);
  }
  return files;
}

/**
 * Detect which foundation capabilities are already present. Detection is
 * conservative: a capability is enabled when its defining marker is found.
 * Explicit capability selections (via create/init options) are merged in by
 * the caller.
 */
export async function detectEnabledCapabilities(
  fs: FileSystem,
  root: string,
): Promise<ProjectContext['capabilities']> {
  const candidates = [
    { id: 'base', marker: '.project-bootstrap/constitution.md' },
    { id: 'docs', marker: 'docs' },
    { id: 'mcp', marker: '.project-bootstrap/mcp/servers.json' },
    { id: 'testing', marker: '.project-bootstrap/rules/testing-policy.md' },
    { id: 'speckit', marker: 'specs' },
  ];
  const enabled: Array<{ id: string; enabled: boolean }> = [];
  for (const { id, marker } of candidates) {
    enabled.push({ id, enabled: await fs.exists(path.join(root, marker)) });
  }
  return enabled;
}

/**
 * Merge explicitly requested capabilities into the detected set. Every
 * requested id is forced to enabled=true — both adding new entries and
 * upgrading already-detected-but-disabled ones.
 */
export function mergeRequestedCapabilities(
  detected: ProjectContext['capabilities'],
  requested: readonly string[],
): ProjectContext['capabilities'] {
  const result: Array<{ id: string; enabled: boolean }> = detected.map((c) =>
    requested.includes(c.id) ? { ...c, enabled: true } : c,
  );
  for (const id of requested) {
    if (!result.some((c) => c.id === id)) {
      result.push({ id, enabled: true });
    }
  }
  return result;
}
