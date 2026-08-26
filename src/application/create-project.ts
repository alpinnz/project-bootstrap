/**
 * CreateProject use case (create): generate a brand-new project directory with
 * the foundation applied. If the directory already exists as a git repository
 * with content, this is rejected in favor of init.
 */
import { promises as fs } from 'node:fs';
import * as path from 'node:path';
import { renderPlanText } from '../domain/bootstrap-plan.js';
import { FileSystem } from '../infrastructure/filesystem.js';
import { GitClient } from '../infrastructure/git.js';
import { applyPlan, type ApplyReport } from './apply-plan.js';
import { generateBootstrapPlan } from './plan-generator.js';
import { applyCapabilitySelection } from '../domain/capability.js';
import { inspectProject } from './inspect-project.js';

export interface CreateOptions {
  readonly targetDir: string;
  readonly dryRun?: boolean;
  /** Explicit capability ids to enable (e.g. "testing", "mcp"). */
  readonly capabilities?: readonly string[];
  readonly fs?: FileSystem;
  readonly git?: GitClient;
}

export interface CreateResult {
  readonly targetDir: string;
  readonly planText: string;
  readonly dryRun: boolean;
  readonly report?: ApplyReport;
}

export async function createProject(options: CreateOptions): Promise<CreateResult> {
  const fsImpl = options.fs ?? new FileSystem();
  const git = options.git ?? new GitClient();

  // Refuse to overwrite a non-empty existing project.
  const existing = (await fsImpl.readDir(options.targetDir)).filter((name) => name !== '.git' && name !== '.idea');
  if (existing.length > 0) {
    throw new Error(`Target directory "${options.targetDir}" is not empty. Use "init" to add a foundation to an existing project.`);
  }

  await fsImpl.ensureDir(options.targetDir);
  await fs.mkdir(path.join(options.targetDir, '.project-bootstrap'), {
    recursive: true,
  });

  let project = await inspectProject({
    root: options.targetDir,
    fs: fsImpl,
    git,
  });
  if (options.capabilities) {
    project = {
      ...project,
      capabilities: applyCapabilitySelection(project.capabilities, options.capabilities),
    };
  }

  const plan = await generateBootstrapPlan(project, fsImpl, { conservative: true });
  const planText = renderPlanText(plan);

  if (options.dryRun) {
    return { targetDir: options.targetDir, planText, dryRun: true };
  }

  const report = await applyPlan(plan, project, fsImpl);
  return { targetDir: options.targetDir, planText, dryRun: false, report };
}
