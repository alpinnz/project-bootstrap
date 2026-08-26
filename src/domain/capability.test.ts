import { describe, expect, it } from 'vitest';
import { applyCapabilitySelection, resolveRequestedCapabilities } from './capability.js';
import type { CapabilityRef } from './project-context.js';

describe('resolveRequestedCapabilities', () => {
  it('returns requested ids in builtin declaration order', () => {
    expect(resolveRequestedCapabilities(['go', 'testing'])).toEqual(['testing', 'go']);
  });

  it('pulls in required dependencies transitively (react implies typescript)', () => {
    expect(resolveRequestedCapabilities(['react'])).toContain('typescript');
  });

  it('keeps explicitly requested ids even when also pulled in as a dependency', () => {
    const resolved = resolveRequestedCapabilities(['react', 'typescript']);
    expect(resolved.filter((id) => id === 'typescript')).toHaveLength(1);
  });

  it('rejects unknown capabilities with the available list', () => {
    expect(() => resolveRequestedCapabilities(['nope'])).toThrow(/Unknown capability "nope". Available:/);
    expect(() => resolveRequestedCapabilities(['testing', 'bogus'])).toThrow(/Unknown capability "bogus"/);
  });

  it('resolves an empty request to an empty set', () => {
    expect(resolveRequestedCapabilities([])).toEqual([]);
  });
});

describe('applyCapabilitySelection', () => {
  it('applies requested capabilities onto the detected set', () => {
    const detected: CapabilityRef[] = [{ id: 'base', enabled: true }];
    const applied = applyCapabilitySelection(detected, ['testing', 'mcp']);
    const ids = applied.map((c) => c.id).sort();
    expect(ids).toEqual(['base', 'mcp', 'testing']);
    expect(applied.find((c) => c.id === 'testing')?.enabled).toBe(true);
  });

  it('does not duplicate already-enabled capabilities', () => {
    const detected: CapabilityRef[] = [
      { id: 'base', enabled: true },
      { id: 'mcp', enabled: true },
    ];
    const applied = applyCapabilitySelection(detected, ['mcp']);
    expect(applied.filter((c) => c.id === 'mcp')).toHaveLength(1);
    expect(applied.find((c) => c.id === 'mcp')?.enabled).toBe(true);
  });

  it('upgrades detected-but-disabled capabilities when requested (regression)', () => {
    // Reproduces the Phase 3 bug: detectEnabledCapabilities always includes
    // every id with enabled:false, so a request must UPGRADE, not just add.
    const detected: CapabilityRef[] = [
      { id: 'base', enabled: false },
      { id: 'mcp', enabled: false },
      { id: 'testing', enabled: false },
    ];
    const applied = applyCapabilitySelection(detected, ['mcp', 'testing']);
    expect(applied.find((c) => c.id === 'mcp')?.enabled).toBe(true);
    expect(applied.find((c) => c.id === 'testing')?.enabled).toBe(true);
    expect(applied.find((c) => c.id === 'base')?.enabled).toBe(false);
  });
});
