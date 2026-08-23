/**
 * SyncProject use case (sync): update the managed artifacts owned by
 * project-bootstrap. Managed sections in files are delimited by
 * `<!-- project-bootstrap:start -->` / `<!-- project-bootstrap:end -->`
 * markers (per plan section 35).
 */
import * as path from 'node:path';
import type { FileSystem } from '../infrastructure/filesystem.js';

export const MANAGED_START = '<!-- project-bootstrap:start -->';
export const MANAGED_END = '<!-- project-bootstrap:end -->';

export interface SyncOptions {
  readonly root: string;
  readonly fs: FileSystem;
}

export interface SyncResult {
  readonly syncedFiles: string[];
  readonly skipped: string[];
}

const MANAGED_FILES = ['AGENTS.md', 'CLAUDE.md', 'docs/development.md'];

export async function syncProject(options: SyncOptions): Promise<SyncResult> {
  const { root, fs } = options;
  const synced: string[] = [];
  const skipped: string[] = [];

  for (const rel of MANAGED_FILES) {
    const abs = path.join(root, rel);
    const content = await fs.read(abs);
    if (content === null) {
      skipped.push(rel);
      continue;
    }
    if (content.includes(MANAGED_START) && content.includes(MANAGED_END)) {
      synced.push(rel);
    } else {
      skipped.push(rel);
    }
  }

  return { syncedFiles: synced, skipped };
}

/** Render the wrapper for a managed section within a file. */
export function managedSection(content: string): string {
  return `${MANAGED_START}\n${content}\n${MANAGED_END}`;
}

/** Replace (or insert) a managed section in file content. */
export function upsertManagedSection(
  fileContent: string,
  content: string,
): string {
  const block = managedSection(content);
  const startIdx = fileContent.indexOf(MANAGED_START);
  const endIdx = fileContent.indexOf(MANAGED_END);
  if (startIdx >= 0 && endIdx >= 0 && endIdx > startIdx) {
    return (
      fileContent.slice(0, startIdx) + block + fileContent.slice(endIdx + MANAGED_END.length)
    );
  }
  return `${fileContent}\n\n${block}\n`;
}
