import { promises as nodeFs } from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { FileSystem } from './filesystem.js';
import { applyCapabilitySelection, resolveRequestedCapabilities } from '../domain/capability.js';
import type { ProjectContext } from '../domain/project-context.js';
import { generateBootstrapPlan } from '../application/plan-generator.js';
import { runQualityGates, renderGateChecklist } from '../application/quality-gate.js';

function project(root: string): ProjectContext {
  return {
    root,
    isExisting: false,
    tooling: { language: 'unknown', framework: 'unknown', runtime: 'unknown', packageManager: 'unknown', commands: [] },
    capabilities: [{ id: 'base', enabled: true }],
    managedFiles: [],
  };
}

describe('plan generator + filesystem integration', () => {
  let dir: string;
  const fs = new FileSystem();

  beforeEach(async () => {
    dir = await nodeFs.mkdtemp(path.join(os.tmpdir(), 'pb-plan-'));
  });

  afterEach(async () => {
    await nodeFs.rm(dir, { recursive: true, force: true });
  });

  it('plans create entries for base foundation files in an empty project', async () => {
    const plan = await generateBootstrapPlan(project(dir), fs);
    const paths = plan.entries.map((e) => e.path);
    expect(paths).toContain('AGENTS.md');
    expect(paths).toContain('.project-bootstrap/constitution.md');
    expect(plan.entries.every((e) => e.action === 'create')).toBe(true);
  });

  it('marks existing files as skip in conservative mode and update otherwise', async () => {
    await nodeFs.writeFile(path.join(dir, 'AGENTS.md'), 'user content');
    const conservative = await generateBootstrapPlan(project(dir), fs, { conservative: true });
    expect(conservative.entries.find((e) => e.path === 'AGENTS.md')?.action).toBe('skip');
    const refresh = await generateBootstrapPlan(project(dir), fs, { conservative: false });
    expect(refresh.entries.find((e) => e.path === 'AGENTS.md')?.action).toBe('update');
  });
});

describe('quality gate use case', () => {
  it('applies the development gate by default and renders its checklist', () => {
    const result = runQualityGates({ topics: [] });
    expect(result.applicable.length).toBeGreaterThan(0);
    const rendered = renderGateChecklist(result.evaluations);
    expect(rendered).toContain('Quality Gates');
    expect(rendered).toMatch(/✓/);
  });

  it('triggers the security gate only for security-related topics', () => {
    const without = runQualityGates({ topics: [] });
    expect(without.evaluations.find((e) => e.gate.name === 'Security Gate')?.applied).toBe(false);
    const withSecret = runQualityGates({ topics: ['secret'] });
    expect(withSecret.evaluations.find((e) => e.gate.name === 'Security Gate')?.applied).toBe(true);
  });
});

describe('filesystem primitives', () => {
  let dir: string;
  const fs = new FileSystem();

  beforeEach(async () => {
    dir = await nodeFs.mkdtemp(path.join(os.tmpdir(), 'pb-fs-'));
  });

  afterEach(async () => {
    await nodeFs.rm(dir, { recursive: true, force: true });
  });

  it('writeFile reports created vs changed correctly', async () => {
    const first = await fs.writeFile(path.join(dir, 'nested/file.txt'), 'a');
    expect(first.created).toBe(true);
    expect(first.changed).toBe(false);
    const second = await fs.writeFile(path.join(dir, 'nested/file.txt'), 'b');
    expect(second.created).toBe(false);
    expect(second.changed).toBe(true);
    const same = await fs.writeFile(path.join(dir, 'nested/file.txt'), 'b');
    expect(same.changed).toBe(false);
  });

  it('readJson returns null for absent or malformed files', async () => {
    expect(await fs.readJson(path.join(dir, 'absent.json'))).toBeNull();
    await fs.writeFile(path.join(dir, 'bad.json'), '{oops');
    expect(await fs.readJson(path.join(dir, 'bad.json'))).toBeNull();
  });
});

describe('capability selection re-exports through use cases', () => {
  it('still resolves react to typescript via the domain API', () => {
    expect(resolveRequestedCapabilities(['react'])).toContain('typescript');
  });

  it('upgrades disabled detected capabilities when selected', () => {
    const applied = applyCapabilitySelection([{ id: 'mcp', enabled: false }], ['mcp']);
    expect(applied[0].enabled).toBe(true);
  });
});
