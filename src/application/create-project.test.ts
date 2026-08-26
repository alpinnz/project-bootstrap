import { promises as nodeFs } from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { FileSystem } from '../infrastructure/filesystem.js';
import { GitClient } from '../infrastructure/git.js';
import { createProject } from './create-project.js';

describe('createProject', () => {
  let parent: string;
  const fs = new FileSystem();

  beforeEach(async () => {
    parent = await nodeFs.mkdtemp(path.join(os.tmpdir(), 'pb-create-'));
  });

  afterEach(async () => {
    await nodeFs.rm(parent, { recursive: true, force: true });
  });

  it('creates the foundation in an empty target directory', async () => {
    const target = path.join(parent, 'app');
    const result = await createProject({ targetDir: target, fs, git: new GitClient() });
    expect(result.dryRun).toBe(false);
    expect(result.report?.created.length).toBeGreaterThan(0);
    expect(
      await nodeFs.access(path.join(target, 'AGENTS.md')).then(
        () => true,
        () => false,
      ),
    ).toBe(true);
    expect(
      await nodeFs.access(path.join(target, '.project-bootstrap/constitution.md')).then(
        () => true,
        () => false,
      ),
    ).toBe(true);
  });

  it('refuses a non-empty target directory', async () => {
    const target = path.join(parent, 'occupied');
    await nodeFs.mkdir(target);
    await nodeFs.writeFile(path.join(target, 'existing.txt'), 'data');
    await expect(createProject({ targetDir: target, fs, git: new GitClient() })).rejects.toThrow(/not empty/);
  });

  it('dry-run writes nothing but renders a plan', async () => {
    const target = path.join(parent, 'dry');
    const result = await createProject({ targetDir: target, dryRun: true, fs, git: new GitClient() });
    expect(result.dryRun).toBe(true);
    expect(result.planText).toContain('Bootstrap Plan');
    expect(result.planText).toContain('AGENTS.md');
    // ensureDir still runs for .project-bootstrap, but no template files land
    expect(await nodeFs.readdir(target)).toEqual(['.project-bootstrap']);
  });
});
