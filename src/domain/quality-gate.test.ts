import { describe, expect, it } from 'vitest';
import { applicableGates, evaluateGates, getGate } from './quality-gate.js';

describe('quality gates', () => {
  it('always applies the development gate by default', () => {
    expect(applicableGates([]).map((g) => g.id)).toContain('development');
  });

  it('does not apply security gate without a trigger', () => {
    const gates = applicableGates([]);
    expect(gates.map((g) => g.id)).not.toContain('security');
  });

  it('applies security gate when a trigger topic is present', () => {
    const gates = applicableGates(['auth']);
    expect(gates.map((g) => g.id)).toContain('security');
  });

  it('applies security gate on payment / secret / external-input', () => {
    for (const topic of ['payment', 'secret', 'external-input', 'permission'] as const) {
      expect(applicableGates([topic]).map((g) => g.id)).toContain('security');
    }
  });

  it('looks up a gate by id', () => {
    expect(getGate('release').name).toBe('Release Gate');
  });

  it('evaluates gates with reasons', () => {
    const evaluations = evaluateGates(['payment']);
    const securityEval = evaluations.find((e) => e.gate.id === 'security')!;
    expect(securityEval.applied).toBe(true);
    expect(securityEval.reason).toContain('payment');
  });
});
