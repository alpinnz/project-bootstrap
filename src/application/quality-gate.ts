/**
 * Quality gate use case: evaluate which gates apply for a set of change topics
 * and render a checklist the implementer/reviewer must satisfy.
 */
import {
  type GateEvaluation,
  type TriggerTopic,
  applicableGates,
  evaluateGates,
} from '../domain/quality-gate.js';

export interface QualityGateOptions {
  readonly topics: readonly TriggerTopic[];
}

export interface QualityGateResult {
  readonly evaluations: readonly GateEvaluation[];
  /** Gates that apply (must be satisfied). */
  readonly applicable: readonly GateEvaluation[];
}

export function runQualityGates(options: QualityGateOptions): QualityGateResult {
  const evaluations = evaluateGates(options.topics);
  const applicable = evaluations.filter((e) => e.applied);
  return { evaluations, applicable };
}

export function renderGateChecklist(evaluations: readonly GateEvaluation[]): string {
  const lines: string[] = ['Quality Gates'];
  for (const evaluation of evaluations) {
    lines.push(
      `${evaluation.applied ? '✓' : '-'} ${evaluation.gate.name} — ${evaluation.reason}`,
    );
    if (evaluation.applied) {
      for (const check of evaluation.gate.checks) {
        lines.push(`    • ${check}`);
      }
    }
  }
  return lines.join('\n');
}

// Re-export for convenience.
export { applicableGates };
