/**
 * Adapter generation use case: produce the adapter-specific context file for a
 * project and (optionally) persist it. Per Design Decision 2, the adapter is
 * generated from the repository source of truth, never the reverse.
 */
import * as path from 'node:path';
import { ADAPTER_FILE, type AiAdapterId, allAdapters, getAdapter } from '../adapters/registry.js';
import type { ProjectContext } from '../domain/project-context.js';
import type { FileSystem } from '../infrastructure/filesystem.js';

export interface AdapterOptions {
  readonly project: ProjectContext;
  readonly adapter: AiAdapterId;
}

export interface AdapterResult {
  readonly adapter: AiAdapterId;
  /** Relative target file path for this adapter's context. */
  readonly targetFile: string;
  /** Generated content. */
  readonly content: string;
}

/** Generate the content for an adapter without writing. */
export async function generateAdapterContext(options: AdapterOptions): Promise<AdapterResult> {
  const adapter = getAdapter(options.adapter);
  const content = await adapter.buildContext(options.project);
  return { adapter: options.adapter, targetFile: ADAPTER_FILE[options.adapter], content };
}

/** Generate and write the adapter context file into the project root. */
export async function writeAdapterContext(options: AdapterOptions & { readonly fs: FileSystem }): Promise<AdapterResult> {
  const result = await generateAdapterContext(options);
  const abs = path.join(options.project.root, result.targetFile);
  await options.fs.ensureDir(path.dirname(abs));
  await options.fs.writeFile(abs, result.content);
  return result;
}

export function listAdapters(): string[] {
  return allAdapters.map((a) => a.id);
}
