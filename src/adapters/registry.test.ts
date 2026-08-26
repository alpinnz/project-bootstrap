import { describe, expect, it } from 'vitest';
import { ADAPTER_FILE, allAdapters, getAdapter } from './registry.js';

describe('adapter registry', () => {
  it('registers the four supported adapters', () => {
    expect(allAdapters.map((a) => a.id)).toEqual(['claude', 'codex', 'cursor', 'copilot']);
  });

  it('resolves adapters by id', () => {
    expect(getAdapter('claude').name).toBe('Claude');
    expect(getAdapter('codex').id).toBe('codex');
  });

  it('throws for unknown adapter ids', () => {
    expect(() => getAdapter('unknown' as never)).toThrow(/Unknown adapter/);
  });

  it('maps every adapter id to a conventional context file', () => {
    for (const id of allAdapters.map((a) => a.id)) {
      expect(ADAPTER_FILE[id]).toBeTruthy();
    }
    expect(ADAPTER_FILE.claude).toBe('CLAUDE.md');
  });
});
