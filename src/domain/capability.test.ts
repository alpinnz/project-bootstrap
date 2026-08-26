import { describe, expect, it } from 'vitest';
import { resolveCapabilities } from './capability.js';

describe('resolveCapabilities', () => {
  it('returns requested ids in builtin declaration order', () => {
    expect(resolveCapabilities(['go', 'testing'])).toEqual(['testing', 'go']);
  });

  it('pulls in required dependencies transitively (react implies typescript)', () => {
    expect(resolveCapabilities(['react'])).toContain('typescript');
  });

  it('keeps explicitly requested ids even when also pulled in as a dependency', () => {
    const resolved = resolveCapabilities(['react', 'typescript']);
    expect(resolved.filter((id) => id === 'typescript')).toHaveLength(1);
  });

  it('rejects unknown capabilities with the available list', () => {
    expect(() => resolveCapabilities(['nope'])).toThrow(/Unknown capability "nope". Available:/);
    expect(() => resolveCapabilities(['testing', 'bogus'])).toThrow(/Unknown capability "bogus"/);
  });

  it('resolves an empty request to an empty set', () => {
    expect(resolveCapabilities([])).toEqual([]);
  });
});
