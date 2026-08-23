/**
 * Agent roles and execution strategies (plan §27-28).
 *
 * Roles are named responsibilities an agent (or a human reviewer) can take on.
 * Execution strategies describe how roles combine for a task of a given
 * complexity — from a single implementer to a full planner/implementer/
 * tester/reviewer pipeline.
 */

export type AgentRoleId = 'planner' | 'implementer' | 'reviewer' | 'debugger' | 'test-engineer';

export interface AgentRole {
  readonly id: AgentRoleId;
  readonly name: string;
  /** What this role is responsible for. */
  readonly responsibility: string;
  /** What this role must verify / output before done. */
  readonly checks: readonly string[];
}

export const AGENT_ROLES: readonly AgentRole[] = [
  {
    id: 'planner',
    name: 'Planner',
    responsibility:
      'Understand the requirement, identify affected files, and define the approach and risk.',
    checks: ['Approach defined', 'Affected files identified'],
  },
  {
    id: 'implementer',
    name: 'Implementer',
    responsibility: 'Make the smallest coherent change that satisfies the requirement.',
    checks: ['Change implemented', 'Verification run'],
  },
  {
    id: 'reviewer',
    name: 'Reviewer',
    responsibility: 'Review the diff for correctness, security, reliability, and conventions.',
    checks: ['Diff reviewed', 'Findings reported'],
  },
  {
    id: 'debugger',
    name: 'Debugger',
    responsibility: 'Reproduce the problem, collect evidence, find the root cause, and fix it.',
    checks: ['Problem reproduced', 'Root cause identified', 'Fix verified'],
  },
  {
    id: 'test-engineer',
    name: 'Test Engineer',
    responsibility: 'Add/run focused tests and regression coverage for the change.',
    checks: ['Tests added/updated', 'Test suite run'],
  },
];

export function getAgentRole(id: AgentRoleId): AgentRole {
  const role = AGENT_ROLES.find((r) => r.id === id);
  if (!role) throw new Error(`Unknown agent role: ${id}`);
  return role;
}

/** Execution strategy: an ordered pipeline of roles. */
export interface ExecutionStrategy {
  readonly id: string;
  readonly label: string;
  readonly roles: readonly AgentRoleId[];
}

export const EXECUTION_STRATEGIES: readonly ExecutionStrategy[] = [
  { id: 'simple', label: 'Simple', roles: ['implementer'] },
  { id: 'standard', label: 'Standard', roles: ['implementer', 'reviewer'] },
  {
    id: 'complex',
    label: 'Complex',
    roles: ['planner', 'implementer', 'test-engineer', 'reviewer'],
  },
];

export function getStrategyForComplexity(
  level: 'small' | 'standard' | 'high-risk',
): ExecutionStrategy {
  switch (level) {
    case 'small':
      return EXECUTION_STRATEGIES[0];
    case 'standard':
      return EXECUTION_STRATEGIES[1];
    case 'high-risk':
      return EXECUTION_STRATEGIES[2];
  }
}
