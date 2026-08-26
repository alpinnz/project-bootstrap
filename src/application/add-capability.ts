/**
 * Add capability use case (plan §8 `add` command): add one capability to an
 * existing project. Only the selected capability overlay is applied, and it is
 * conservative by default (existing files are never overwritten).
 */
import { promises as nodeFs } from 'node:fs';
import * as nodePath from 'node:path';
import { BUILTIN_CAPABILITIES } from '../domain/capability.js';
import { renderPlanText, type BootstrapPlan, createPlanEntry } from '../domain/bootstrap-plan.js';
import { FileSystem } from '../infrastructure/filesystem.js';
import { GitClient } from '../infrastructure/git.js';
import { capabilityFiles, readComposedFile } from '../infrastructure/template-loader.js';
import { MANIFEST_FRAGMENT_PATH, type ApplyReport } from './apply-plan.js';
import { mergeManifestFragment } from './manifest-merge.js';

export interface AddCapabilityOptions {
  readonly root: string;
  /** Capability id to add, e.g. "testing", "mcp", "typescript". */
  readonly capability: string;
  readonly dryRun?: boolean;
  readonly force?: boolean;
  readonly fs?: FileSystem;
  readonly git?: GitClient;
}

export interface AddCapabilityResult {
  readonly capability: string;
  readonly planText: string;
  readonly dryRun: boolean;
  readonly report?: ApplyReport;
}

const AVAILABLE = BUILTIN_CAPABILITIES.map((c) => c.id).join(', ');

export async function addCapability(options: AddCapabilityOptions): Promise<AddCapabilityResult> {
  if (!BUILTIN_CAPABILITIES.some((c) => c.id === options.capability)) {
    throw new Error(`Unknown capability "${options.capability}". Available: ${AVAILABLE}.`);
  }

  const fs = options.fs ?? new FileSystem();

  const plan = await buildCapabilityPlan(options.capability, options.root, options.force, fs);
  const planText = renderPlanText(plan);

  if (options.dryRun) {
    return { capability: options.capability, planText, dryRun: true };
  }

  const report = await applyCapabilityPlan(plan, options.capability, options.root, fs);
  return { capability: options.capability, planText, dryRun: false, report };
}

/**
 * Manifest fragments (e.g. the governance overlay's package.json deps/scripts
 * snippet) are merged into package.json by applyCapabilityPlan, never written
 * to disk as standalone project files.
 */
function isManifestFragment(rel: string): boolean {
  return rel === MANIFEST_FRAGMENT_PATH;
}

/** Build a plan for just the files the selected capability overlay provides. */
async function buildCapabilityPlan(capability: string, root: string, force: boolean | undefined, fs: FileSystem): Promise<BootstrapPlan> {
  const entries = [];
  for (const rel of capabilityFiles(capability)) {
    if (isManifestFragment(rel)) continue;
    const target = repoPath(root, rel);
    const exists = await fs.exists(target);
    if (exists) {
      entries.push(
        force ? createPlanEntry(rel, 'update', 'Force refresh capability file') : createPlanEntry(rel, 'skip', 'Already exists (add is conservative)'),
      );
    } else {
      entries.push(createPlanEntry(rel, 'create', `Add ${capability} capability file`));
    }
  }
  return { entries };
}

/** Apply only the capability overlay files, resolving content from the overlay. */
async function applyCapabilityPlan(plan: BootstrapPlan, capability: string, root: string, fs: FileSystem): Promise<ApplyReport> {
  const report: ApplyReport = { applied: 0, skipped: 0, conflicted: 0, created: [], updated: [] };

  for (const entry of plan.entries) {
    if (entry.action === 'skip') {
      report.skipped += 1;
      continue;
    }
    if (entry.action !== 'create' && entry.action !== 'update') {
      report.conflicted += 1;
      continue;
    }

    const content = readComposedFile(entry.path, [capability]);
    if (content === null) {
      report.conflicted += 1;
      continue;
    }

    const target = repoPath(root, entry.path);
    await fs.ensureDir(nodePath.dirname(target));
    const existed = await fs.exists(target);
    await nodeFs.writeFile(target, content, 'utf8');
    if (existed) report.updated.push(entry.path);
    else report.created.push(entry.path);
    report.applied += 1;
  }

  // Merge the capability's manifest fragment additively into package.json
  // (never written as a standalone file; existing user keys are preserved).
  const fragmentRaw = readComposedFile(MANIFEST_FRAGMENT_PATH, [capability]);
  if (fragmentRaw !== null) {
    report.manifest = await mergeManifestFragment({ root, fs, fragmentRaw });
  }
  return report;
}

function repoPath(root: string, rel: string): string {
  return nodePath.join(root, rel);
}
