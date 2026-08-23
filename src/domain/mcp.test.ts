import { describe, expect, it } from 'vitest';
import { MCP_CATALOG, MCP_CATEGORIES, getMcpCapability, mcpCapabilitiesByCategory } from './mcp.js';

describe('MCP strategy', () => {
  it('defines the expected categories', () => {
    expect(MCP_CATEGORIES).toEqual(['documentation', 'source-control', 'design', 'api', 'database', 'observability', 'cloud']);
  });

  it('defaults most built-ins to safe read-only', () => {
    const unsafe = MCP_CATALOG.filter((c) => !c.safeDefault);
    // Only infrastructure-heavy entries require explicit opt-in.
    expect(unsafe.map((c) => c.id)).toEqual(['database']);
  });

  it('looks up a capability by id', () => {
    expect(getMcpCapability('github')?.category).toBe('source-control');
    expect(getMcpCapability('nope')).toBeUndefined();
  });

  it('filters by category', () => {
    const docs = mcpCapabilitiesByCategory('documentation');
    expect(docs.length).toBeGreaterThan(0);
    expect(docs.every((c) => c.category === 'documentation')).toBe(true);
  });
});
