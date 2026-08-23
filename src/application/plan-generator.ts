/**
 * PlanGenerator computes the BootstrapPlan: which foundation files to create,
 * update, skip or flag as conflict for a given project. All changes are
 * represented here; this enables dry-run without applying anything.
 */
import * as path from 'node:path';
import { type BootstrapPlan, createPlanEntry, type PlanEntry } from '../domain/bootstrap-plan.js';
import type { ProjectContext } from '../domain/project-context.js';
import type { FileSystem } from '../infrastructure/filesystem.js';
import { composedTemplateFiles } from '../infrastructure/template-loader.js';

export interface PlanOptions {
  /** When true, existing conflicting content is not overwritten. */
  readonly conservative?: boolean;
}

/** Capability ids enabled on a project (id for entries with enabled=true). */
function enabledCapabilities(project: ProjectContext): string[] {
  return project.capabilities.filter((c) => c.enabled).map((c) => c.id);
}

/**
 * Build the plan that would apply the foundation to a project.
 * Does not touch the filesystem.
 */
export async function generateBootstrapPlan(project: ProjectContext, fs: FileSystem, options: PlanOptions = {}): Promise<BootstrapPlan> {
  const entries: PlanEntry[] = [];
  const capabilities = enabledCapabilities(project);
  const templateList = composedTemplateFiles(capabilities);

  if (templateList.length === 0) {
    entries.push(
      createPlanEntry('.project-bootstrap/', 'conflict', 'No foundation templates found', undefined),
      createPlanEntry('.project-bootstrap/', 'skip', 'Templates unavailable', undefined),
    );
    return { entries };
  }

  for (const rel of templateList) {
    const targetAbs = path.join(project.root, rel);
    const exists = await fs.exists(targetAbs);

    if (!exists) {
      entries.push(createPlanEntry(rel, 'create', 'Add foundation file from template'));
      continue;
    }

    if (options.conservative) {
      entries.push(createPlanEntry(rel, 'skip', 'Already exists (conservative mode)'));
    } else {
      entries.push(createPlanEntry(rel, 'update', 'Refresh managed foundation file'));
    }
  }

  return { entries };
}
