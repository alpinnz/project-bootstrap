/**
 * InitializeProject use case (init): add a foundation to an existing
 * repository. It inspects, builds a plan, and applies it (or dry-runs it).
 */
import { renderPlanText } from '../domain/bootstrap-plan.js';
import { FileSystem } from '../infrastructure/filesystem.js';
import { GitClient } from '../infrastructure/git.js';
import { applyPlan, type ApplyReport } from './apply-plan.js';
import { inspectProject, mergeRequestedCapabilities } from './inspect-project.js';
import { generateBootstrapPlan } from './plan-generator.js';

export interface InitializeOptions {
  readonly root: string;
  readonly dryRun?: boolean;
  /** When false (default), existing files are skipped rather than overwritten. */
  readonly force?: boolean;
  /** Explicit capability ids to enable (e.g. "testing", "mcp"). */
  readonly capabilities?: readonly string[];
  readonly fs?: FileSystem;
  readonly git?: GitClient;
}

export interface InitializeResult {
  readonly planText: string;
  readonly dryRun: boolean;
  readonly report?: ApplyReport;
}

export async function initializeProject(
  options: InitializeOptions,
): Promise<InitializeResult> {
  const fs = options.fs ?? new FileSystem();
  let project = await inspectProject({
    root: options.root,
    fs,
    git: options.git ?? new GitClient(),
  });
  if (options.capabilities) {
    project = { ...project, capabilities: mergeRequestedCapabilities(project.capabilities, options.capabilities) };
  }

  const plan = await generateBootstrapPlan(project, fs, {
    conservative: !(options.force ?? false),
  });

  const planText = renderPlanText(plan);

  if (options.dryRun) {
    return { planText, dryRun: true };
  }

  const report = await applyPlan(plan, project, fs);
  return { planText, dryRun: false, report };
}
