import { promises as fs } from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { FileSystem } from '../infrastructure/filesystem.js';
import { GitClient } from '../infrastructure/git.js';
import { initializeProject } from './initialize-project.js';

async function exists(p: string): Promise<boolean> {
  try {
    await fs.access(p);
    return true;
  } catch {
    return false;
  }
}

describe('initializeProject', () => {
  let dir: string;

  beforeEach(async () => {
    dir = await fs.mkdtemp(path.join(os.tmpdir(), 'pb-init-'));
    await fs.writeFile(path.join(dir, 'package.json'), JSON.stringify({ name: 'x' }));
  });

  afterEach(async () => {
    await fs.rm(dir, { recursive: true, force: true });
  });

  it('preserves existing user files by default (safe default)', async () => {
    const userReadme = 'CUSTOM USER CONTENT';
    await fs.writeFile(path.join(dir, 'README.md'), userReadme);

    const result = await initializeProject({
      root: dir,
      fs: new FileSystem(),
      git: new GitClient(),
    });

    expect(result.dryRun).toBe(false);
    // README.md exists and must not be overwritten.
    const readme = await fs.readFile(path.join(dir, 'README.md'), 'utf8');
    expect(readme).toBe(userReadme);
    // Foundation files are created.
    expect(await exists(path.join(dir, 'AGENTS.md'))).toBe(true);
    expect(
      await exists(path.join(dir, '.project-bootstrap', 'constitution.md')),
    ).toBe(true);
  });

  it('dry-run does not write any files', async () => {
    const result = await initializeProject({
      root: dir,
      dryRun: true,
      fs: new FileSystem(),
      git: new GitClient(),
    });
    expect(result.dryRun).toBe(true);
    expect(await exists(path.join(dir, 'AGENTS.md'))).toBe(false);
  });

  it('creates a foundation in a bare npm project', async () => {
    const result = await initializeProject({
      root: dir,
      fs: new FileSystem(),
      git: new GitClient(),
    });
    const report = result.report!;
    expect(report.created.length).toBeGreaterThan(0);
    expect(report.conflicted).toBe(0);
  });
});
