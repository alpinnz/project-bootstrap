import { describe, expect, it } from 'vitest';
import type { ProjectContext } from '../domain/project-context.js';
import { mergeRequestedCapabilities } from './inspect-project.js';

describe('mergeRequestedCapabilities', () => {
  it('merges requested capabilities into the detected set', () => {
    const detected: ProjectContext['capabilities'] = [
      { id: 'base', enabled: true },
    ];
    const merged = mergeRequestedCapabilities(detected, ['testing', 'mcp']);
    const ids = merged.map((c) => c.id).sort();
    expect(ids).toEqual(['base', 'mcp', 'testing']);
    expect(merged.find((c) => c.id === 'testing')?.enabled).toBe(true);
  });

  it('does not duplicate already-enabled capabilities', () => {
    const detected: ProjectContext['capabilities'] = [
      { id: 'base', enabled: true },
      { id: 'mcp', enabled: true },
    ];
    const merged = mergeRequestedCapabilities(detected, ['mcp']);
    expect(merged.filter((c) => c.id === 'mcp')).toHaveLength(1);
    expect(merged.find((c) => c.id === 'mcp')?.enabled).toBe(true);
  });

  it('upgrades detected-but-disabled capabilities when requested (regression)', () => {
    // Reproduces the Phase 3 bug: detectEnabledCapabilities always includes
    // every id with enabled:false, so a request must UPGRADE, not just add.
    const detected: ProjectContext['capabilities'] = [
      { id: 'base', enabled: false },
      { id: 'mcp', enabled: false },
      { id: 'testing', enabled: false },
    ];
    const merged = mergeRequestedCapabilities(detected, ['mcp', 'testing']);
    expect(merged.find((c) => c.id === 'mcp')?.enabled).toBe(true);
    expect(merged.find((c) => c.id === 'testing')?.enabled).toBe(true);
    expect(merged.find((c) => c.id === 'base')?.enabled).toBe(false);
  });
});
