/**
 * ApplyPlan executes a BootstrapPlan against the filesystem: create new files
 * from templates and (in refresh mode) update existing ones. Only create/update
 * entries are applied; skip/conflict entries are reported and left untouched.
 */
import { promises as fs } from 'node:fs';
import * as path from 'node:path';
import type { BootstrapPlan, PlanEntry } from '../domain/bootstrap-plan.js';
import type { ProjectContext } from '../domain/project-context.js';
import type { FileSystem } from '../infrastructure/filesystem.js';
import { readComposedFile } from '../infrastructure/template-loader.js';

export interface ApplyReport {
  applied: number;
  skipped: number;
  conflicted: number;
  created: string[];
  updated: string[];
}

/** Capability ids enabled on a project. */
function enabledCapabilities(project: ProjectContext): string[] {
  return project.capabilities.filter((c) => c.enabled).map((c) => c.id);
}

/**
 * Apply the plan. Each create/update entry maps to a composed template file
 * with the same relative path being written into project.root. Content is
 * resolved from the base + enabled capability overlays.
 */
export async function applyPlan(
  plan: BootstrapPlan,
  project: ProjectContext | string,
  fsImpl: FileSystem,
): Promise<ApplyReport> {
  const root = typeof project === 'string' ? project : project.root;
  const capabilities =
    typeof project === 'string' ? [] : enabledCapabilities(project);

  const report: ApplyReport = {
    applied: 0,
    skipped: 0,
    conflicted: 0,
    created: [],
    updated: [],
  };

  for (const entry of plan.entries) {
    if (entry.action !== 'create' && entry.action !== 'update') {
      if (entry.action === 'skip') report.skipped += 1;
      else if (entry.action === 'conflict') report.conflicted += 1;
      continue;
    }

    const target = path.join(root, entry.path);
    const content = readSource(entry, capabilities);
    if (content === null) {
      report.conflicted += 1;
      continue;
    }

    await fsImpl.ensureDir(path.dirname(target));
    const existed = await fsImpl.exists(target);
    await fs.writeFile(target, content, 'utf8');

    if (existed) {
      report.updated.push(entry.path);
    } else {
      report.created.push(entry.path);
    }
    report.applied += 1;
  }

  return report;
}

function readSource(
  entry: PlanEntry,
  capabilities: readonly string[],
): string | null {
  if (entry.content !== undefined) return entry.content;
  return readComposedFile(entry.path, capabilities);
}
