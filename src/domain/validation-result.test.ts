import { describe, expect, it } from 'vitest';
import {
  aggregateHealth,
  renderValidation,
  type ValidationCategory,
} from './validation-result.js';

describe('validation result', () => {
  it('aggregates to healthy when all pass', () => {
    const categories: ValidationCategory[] = [
      { title: 'A', checks: [{ name: '1', status: 'pass', message: 'ok' }] },
    ];
    expect(aggregateHealth(categories)).toBe('healthy');
  });

  it('aggregates to unhealthy when any check fails', () => {
    const categories: ValidationCategory[] = [
      {
        title: 'A',
        checks: [
          { name: '1', status: 'pass', message: 'ok' },
          { name: '2', status: 'fail', message: 'bad' },
        ],
      },
    ];
    expect(aggregateHealth(categories)).toBe('unhealthy');
  });

  it('aggregates to attention on only warnings', () => {
    const categories: ValidationCategory[] = [
      { title: 'A', checks: [{ name: '1', status: 'warning', message: 'warn' }] },
    ];
    expect(aggregateHealth(categories)).toBe('attention');
  });

  it('renders pass/fail markers', () => {
    const categories: ValidationCategory[] = [
      {
        title: 'Foundation',
        checks: [
          { name: 'AGENTS.md', status: 'pass', message: 'Present' },
          { name: 'Constitution', status: 'fail', message: 'Missing' },
        ],
      },
    ];
    const text = renderValidation(categories);
    expect(text).toContain('✓ AGENTS.md');
    expect(text).toContain('✗ Constitution');
    expect(text).toContain('Result: unhealthy');
  });
});
