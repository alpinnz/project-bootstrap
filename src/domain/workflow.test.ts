import { describe, expect, it } from 'vitest';
import { WORKFLOWS } from './workflow.js';
import type { Rule } from './rule.js';

describe('workflows', () => {
  it('defines the three complexity levels with increasing rigor', () => {
    const levels = Object.keys(WORKFLOWS);
    expect(levels).toEqual(['small', 'standard', 'high-risk']);
    expect(WORKFLOWS.small.steps.length).toBeLessThan(WORKFLOWS.standard.steps.length);
    expect(WORKFLOWS.standard.steps.length).toBeLessThan(WORKFLOWS['high-risk'].steps.length);
  });

  it('starts with Understand and ends with verification/review in every level', () => {
    for (const workflow of Object.values(WORKFLOWS)) {
      expect(workflow.steps[0].name).toBe('Understand');
      const last = workflow.steps[workflow.steps.length - 1].name;
      expect(['Verify', 'Review', 'Finalize']).toContain(last);
    }
  });
});

describe('rule model', () => {
  it('accepts a well-formed rule across every category', () => {
    const categories = ['code', 'architecture', 'testing', 'security', 'dependencies', 'documentation', 'git', 'agent', 'tools'] as const;
    for (const category of categories) {
      const rule: Rule = { category, title: 'Never hardcode secrets', body: 'Use environment configuration.' };
      expect(rule.category).toBe(category);
    }
  });
});
