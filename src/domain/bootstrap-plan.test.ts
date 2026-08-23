import { describe, expect, it } from 'vitest';
import {
  createPlanEntry,
  renderPlanText,
  summarizePlan,
  type BootstrapPlan,
} from './bootstrap-plan.js';

describe('bootstrap plan', () => {
  it('summarizes entries by action', () => {
    const plan: BootstrapPlan = {
      entries: [
        createPlanEntry('AGENTS.md', 'create', 'Add managed context'),
        createPlanEntry('README.md', 'update', 'Refresh'),
        createPlanEntry('skip.md', 'skip', 'Already present'),
        createPlanEntry('conflict.md', 'conflict', 'Templates unavailable'),
      ],
    };
    expect(summarizePlan(plan)).toEqual({
      create: 1,
      update: 1,
      skip: 1,
      conflict: 1,
    });
  });

  it('renders a human-readable plan text', () => {
    const plan: BootstrapPlan = {
      entries: [createPlanEntry('AGENTS.md', 'create', 'Add managed context')],
    };
    const text = renderPlanText(plan);
    expect(text).toContain('CREATE    AGENTS.md');
    expect(text).toContain('Add managed context');
    expect(text).toContain('create: 1');
  });

  it('stores provided content on an entry', () => {
    const entry = createPlanEntry('x.md', 'create', 'reason', 'content');
    expect(entry.content).toBe('content');
  });
});
