/**
 * BootstrapPlan is a declarative description of every change project-bootstrap
 * will make to a repository. Every mutation must be represented in a plan
 * (Design requirement: "All changes must have a plan").
 *
 * A plan is predictable, safe, testable and supports dry-run: the plan can be
 * rendered without applying it.
 */

export type PlanAction = 'create' | 'update' | 'skip' | 'conflict';

export interface PlanEntry {
  /** Repository-relative path of the affected file, e.g. "AGENTS.md". */
  readonly path: string;
  /** What will be done. */
  readonly action: PlanAction;
  /** Why this entry exists. */
  readonly reason: string;
  /**
   * For 'create' entries, the content to write. Never populated for
   * 'skip'/'conflict'; may be empty for 'update' (content computed later).
   */
  readonly content?: string;
}

/** Outcome of planning: all entries plus a per-action tally. */
export interface BootstrapPlan {
  readonly entries: readonly PlanEntry[];
}

export interface PlanSummary {
  create: number;
  update: number;
  skip: number;
  conflict: number;
}

export function summarizePlan(plan: BootstrapPlan): PlanSummary {
  const summary: PlanSummary = { create: 0, update: 0, skip: 0, conflict: 0 };
  for (const entry of plan.entries) {
    summary[entry.action] += 1;
  }
  return summary;
}

export function createPlanEntry(
  path: string,
  action: PlanAction,
  reason: string,
  content?: string,
): PlanEntry {
  return { path, action, reason, ...(content !== undefined ? { content } : {}) };
}

/** Render a plan into human-readable text for display and dry-run. */
export function renderPlanText(plan: BootstrapPlan): string {
  const lines = ['Bootstrap Plan', '--------------'];
  for (const entry of plan.entries) {
    lines.push(`${entry.action.toUpperCase().padEnd(9)} ${entry.path}`);
    lines.push(`           ${entry.reason}`);
  }
  const summary = summarizePlan(plan);
  lines.push('--------------');
  lines.push(
    `create: ${summary.create}  update: ${summary.update}  skip: ${summary.skip}  conflict: ${summary.conflict}`,
  );
  return lines.join('\n');
}
