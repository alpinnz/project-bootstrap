import { describe, expect, it } from 'vitest';
import {
  AGENT_ROLES,
  EXECUTION_STRATEGIES,
  getAgentRole,
  getStrategyForComplexity,
} from './agent-role.js';

describe('agent roles', () => {
  it('defines the five roles', () => {
    expect(AGENT_ROLES.map((r) => r.id)).toEqual([
      'planner',
      'implementer',
      'reviewer',
      'debugger',
      'test-engineer',
    ]);
  });

  it('looks up a role by id', () => {
    expect(getAgentRole('reviewer').name).toBe('Reviewer');
  });

  it('throws for unknown role', () => {
    // @ts-expect-error intentionally invalid id
    expect(() => getAgentRole('nope')).toThrow();
  });
});

describe('execution strategies', () => {
  it('maps small -> simple (implementer only)', () => {
    expect(getStrategyForComplexity('small').roles).toEqual(['implementer']);
  });

  it('maps standard -> implementer + reviewer', () => {
    expect(getStrategyForComplexity('standard').roles).toEqual(['implementer', 'reviewer']);
  });

  it('maps high-risk -> full pipeline', () => {
    expect(getStrategyForComplexity('high-risk').roles).toEqual([
      'planner',
      'implementer',
      'test-engineer',
      'reviewer',
    ]);
  });

  it('has three strategies', () => {
    expect(EXECUTION_STRATEGIES).toHaveLength(3);
  });
});
