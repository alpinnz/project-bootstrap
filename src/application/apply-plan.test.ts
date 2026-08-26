import { promises as nodeFs } from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { createPlanEntry } from '../domain/bootstrap-plan.js';
import type { ProjectContext } from '../domain/project-context.js';
import { FileSystem } from '../infrastructure/filesystem.js';
import { MANIFEST_FRAGMENT_PATH, applyPlan } from './apply-plan.js';

describe('applyPlan', () => {
  let dir: string;
  const fs = new FileSystem();

  beforeEach(async () => {
    dir = await nodeFs.mkdtemp(path.join(os.tmpdir(), 'pb-apply-'));
  });

  afterEach(async () => {
    await nodeFs.rm(dir, { recursive: true, force: true });
  });

  it('creates files from template content and reports them', async () => {
    const plan = { entries: [createPlanEntry('AGENTS.md', 'create', 'test', '# Agents')] };
    const report = await applyPlan(plan, dir, fs);
    expect(report.applied).toBe(1);
    expect(report.created).toEqual(['AGENTS.md']);
    expect(await nodeFs.readFile(path.join(dir, 'AGENTS.md'), 'utf8')).toBe('# Agents');
  });

  it('updates an existing file when the action is update', async () => {
    await nodeFs.writeFile(path.join(dir, 'AGENTS.md'), 'old');
    const plan = { entries: [createPlanEntry('AGENTS.md', 'update', 'refresh', 'new')] };
    const report = await applyPlan(plan, dir, fs);
    expect(report.updated).toEqual(['AGENTS.md']);
    expect(await nodeFs.readFile(path.join(dir, 'AGENTS.md'), 'utf8')).toBe('new');
  });

  it('counts skip and conflict entries without touching the filesystem', async () => {
    const existingPath = path.join(dir, 'untouched.txt');
    await nodeFs.writeFile(existingPath, 'keep');
    const plan = {
      entries: [createPlanEntry('skip.txt', 'skip', 'conservative'), createPlanEntry('missing-template.md', 'update', 'no source')],
    };
    const report = await applyPlan(plan, dir, fs);
    expect(report.skipped).toBe(1);
    expect(report.conflicted).toBe(1); // update with no resolvable content
    expect(report.applied).toBe(0);
    expect(await nodeFs.readFile(existingPath, 'utf8')).toBe('keep');
  });

  it('never writes the manifest fragment as a file but merges it (governance enabled)', async () => {
    const project: ProjectContext = {
      root: dir,
      isExisting: false,
      tooling: { language: 'unknown', framework: 'unknown', runtime: 'unknown', packageManager: 'unknown', commands: [] },
      capabilities: [{ id: 'governance', enabled: true }],
      managedFiles: [],
    };
    const plan = { entries: [createPlanEntry(MANIFEST_FRAGMENT_PATH, 'create', 'fragment')] };
    const report = await applyPlan(plan, project, fs);
    expect(
      await nodeFs.access(path.join(dir, MANIFEST_FRAGMENT_PATH)).then(
        () => true,
        () => false,
      ),
    ).toBe(false);
    const manifest = JSON.parse(await nodeFs.readFile(path.join(dir, 'package.json'), 'utf8'));
    expect(manifest.scripts.prepare).toBe('husky');
    expect(report.manifest?.changed).toBe(true);
  });

  it('accepts a plain string root without capability resolution', async () => {
    const plan = { entries: [createPlanEntry('docs/notes.md', 'create', 'inline', 'hello')] };
    const report = await applyPlan(plan, dir, fs);
    expect(report.created).toEqual(['docs/notes.md']);
    expect(await nodeFs.readFile(path.join(dir, 'docs/notes.md'), 'utf8')).toBe('hello');
  });
});
