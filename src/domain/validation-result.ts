/**
 * ValidationResult models the outcome of a doctor check or any rule
 * verification. Results are grouped by category for rendering.
 */

export type CheckStatus = 'pass' | 'fail' | 'warning' | 'info';

export interface CheckResult {
  /** Short label, e.g. "AGENTS.md". */
  readonly name: string;
  readonly status: CheckStatus;
  /** Human explanation of the result. */
  readonly message: string;
}

export interface ValidationCategory {
  readonly title: string;
  readonly checks: readonly CheckResult[];
}

/** Overall health derived from all checks across categories. */
export type Health = 'healthy' | 'attention' | 'unhealthy';

export function aggregateHealth(categories: readonly ValidationCategory[]): Health {
  let fails = 0;
  let warnings = 0;
  let total = 0;
  for (const category of categories) {
    for (const check of category.checks) {
      total += 1;
      if (check.status === 'fail') fails += 1;
      else if (check.status === 'warning') warnings += 1;
    }
  }
  if (total === 0) return 'healthy';
  if (fails > 0) return 'unhealthy';
  if (warnings > 0) return 'attention';
  return 'healthy';
}

export function renderValidation(categories: readonly ValidationCategory[]): string {
  const lines: string[] = ['Project Bootstrap Doctor'];
  for (const category of categories) {
    lines.push('');
    lines.push(category.title);
    for (const check of category.checks) {
      const mark = check.status === 'pass' ? '✓' : check.status === 'fail' ? '✗' : '?';
      lines.push(`${mark} ${check.name}${check.message ? ` — ${check.message}` : ''}`);
    }
  }
  lines.push('');
  lines.push(`Result: ${aggregateHealth(categories)}`);
  return lines.join('\n');
}
