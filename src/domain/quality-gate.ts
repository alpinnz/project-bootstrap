/**
 * Quality gates (plan §26).
 *
 * A gate is a set of required checks (when it applies) plus optional triggers
 * that force the gate to apply. Gates are declarative: they describe what must
 * be true for a change to be considered done, and they can be evaluated by the
 * `validate` command or by an agent.
 */

export type GateId = 'development' | 'security' | 'release';

export type TriggerTopic = 'auth' | 'payment' | 'permission' | 'secret' | 'external-input' | 'data-integrity' | 'concurrency';

export interface QualityGate {
  readonly id: GateId;
  readonly name: string;
  /** Applies to all work by default, or only when triggered. */
  readonly default: boolean;
  /** Topics that force this gate to apply. */
  readonly triggers?: readonly TriggerTopic[];
  /** Required checks. */
  readonly checks: readonly string[];
}

export const QUALITY_GATES: readonly QualityGate[] = [
  {
    id: 'development',
    name: 'Development Gate',
    default: true,
    checks: ['Behavior implemented', 'Verification executed', 'Diff reviewed'],
  },
  {
    id: 'security',
    name: 'Security Gate',
    default: false,
    triggers: ['auth', 'payment', 'permission', 'secret', 'external-input'],
    checks: ['Untrusted input validated', 'No secrets leaked', 'Least privilege / authorization enforced'],
  },
  {
    id: 'release',
    name: 'Release Gate',
    default: false,
    checks: ['Development gate passed', 'Security gate passed when applicable'],
  },
];

export function getGate(id: GateId): QualityGate {
  const gate = QUALITY_GATES.find((g) => g.id === id);
  if (!gate) throw new Error(`Unknown quality gate: ${id}`);
  return gate;
}

/**
 * Given the topics a change touches, return the list of gates that apply.
 * A gate applies if it is default, or if any of its triggers intersect the
 * change topics.
 */
export function applicableGates(topics: readonly TriggerTopic[]): readonly QualityGate[] {
  return QUALITY_GATES.filter((gate) => {
    if (gate.default) return true;
    return (gate.triggers ?? []).some((trigger) => topics.includes(trigger));
  });
}

export interface GateEvaluation {
  readonly gate: QualityGate;
  readonly applied: boolean;
  readonly reason: string;
}

/** Evaluate which gates apply for a set of change topics. */
export function evaluateGates(topics: readonly TriggerTopic[]): readonly GateEvaluation[] {
  return QUALITY_GATES.map((gate) => {
    if (gate.default) {
      return { gate, applied: true, reason: 'Required by default' };
    }
    const matched = (gate.triggers ?? []).filter((trigger) => topics.includes(trigger));
    if (matched.length > 0) {
      return { gate, applied: true, reason: `Triggered by: ${matched.join(', ')}` };
    }
    return { gate, applied: false, reason: 'Not triggered' };
  });
}
