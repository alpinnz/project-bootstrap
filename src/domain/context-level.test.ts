import { describe, expect, it } from 'vitest';
import { contextForLevel, renderContextPlan } from './context-level.js';

describe('context management', () => {
  it('loads only the foundation at L0', () => {
    const refs = contextForLevel(0);
    expect(refs.every((r) => r.level === 0)).toBe(true);
    expect(refs.length).toBeGreaterThanOrEqual(2);
  });

  it('adds deeper levels monotonically', () => {
    const l2 = contextForLevel(2);
    const l4 = contextForLevel(4);
    expect(l4.length).toBeGreaterThan(l2.length);
  });

  it('includes rules at L2 and docs at L3', () => {
    const l3 = contextForLevel(3);
    expect(l3.some((r) => r.key === '.project-bootstrap/rules/')).toBe(true);
    expect(l3.some((r) => r.key === 'docs/development.md')).toBe(true);
  });

  it('renders a context plan', () => {
    const text = renderContextPlan(2);
    expect(text).toContain('Context Plan');
    expect(text).toContain('✓ L0 Foundation');
    expect(text).toContain('L3');
  });
});
