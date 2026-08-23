/**
 * Context management (plan §29).
 *
 * Context is loaded in levels to minimize token waste (Design Decision 3:
 * minimal context over maximum context). Each level adds more detail only when
 * needed for the task at hand.
 *
 *   L0: AGENTS.md
 *   L1: workflow
 *   L2: rules
 *   L3: architecture / ADR / API docs
 *   L4: MCP / external knowledge
 */

export type ContextLevel = 0 | 1 | 2 | 3 | 4;

export interface ContextReference {
  readonly level: ContextLevel;
  /** Stable key, e.g. "AGENTS.md". */
  readonly key: string;
  /** Short description of what this context provides. */
  readonly description: string;
}

export const CONTEXT_LEVELS: ReadonlyArray<{
  readonly level: ContextLevel;
  readonly name: string;
}> = [
  { level: 0, name: 'Foundation' },
  { level: 1, name: 'Workflow' },
  { level: 2, name: 'Rules' },
  { level: 3, name: 'Architecture & Docs' },
  { level: 4, name: 'External & MCP' },
];

export const DEFAULT_CONTEXT_REFERENCES: readonly ContextReference[] = [
  { level: 0, key: 'AGENTS.md', description: 'Agent entry point and project overview.' },
  { level: 0, key: '.project-bootstrap/constitution.md', description: 'Highest project principles.' },
  { level: 1, key: '.project-bootstrap/workflows/development.md', description: 'Task-scaled development workflow.' },
  { level: 2, key: '.project-bootstrap/rules/', description: 'Engineering rules (code, architecture, testing, security, ...).' },
  { level: 3, key: 'docs/architecture.md', description: 'Optional architecture documentation.' },
  { level: 3, key: 'docs/development.md', description: 'Development and verification guide.' },
  { level: 4, key: 'MCP', description: 'External knowledge, loaded only when required.' },
];

/** List references whose level is <= the requested maximum level. */
export function contextForLevel(maxLevel: ContextLevel): readonly ContextReference[] {
  return DEFAULT_CONTEXT_REFERENCES.filter((ref) => ref.level <= maxLevel);
}

export function renderContextPlan(maxLevel: ContextLevel): string {
  const lines: string[] = ['Context Plan'];
  for (const { level, name } of CONTEXT_LEVELS) {
    const selected = level <= maxLevel;
    lines.push(`${selected ? '✓' : '-'} L${level} ${name}`);
  }
  lines.push('');
  lines.push('References loaded:');
  for (const ref of contextForLevel(maxLevel)) {
    lines.push(`  - [L${ref.level}] ${ref.key} — ${ref.description}`);
  }
  return lines.join('\n');
}
