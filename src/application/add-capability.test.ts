import { promises as fs } from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { FileSystem } from '../infrastructure/filesystem.js';
import { GitClient } from '../infrastructure/git.js';
import { addCapability } from './add-capability.js';

describe('addCapability', () => {
  let dir: string;

  beforeEach(async () => {
    dir = await fs.mkdtemp(path.join(os.tmpdir(), 'pb-add-'));
  });

  afterEach(async () => {
    await fs.rm(dir, { recursive: true, force: true });
  });

  it('throws for an unknown capability', async () => {
    await expect(
      addCapability({ root: dir, capability: 'nope', fs: new FileSystem(), git: new GitClient() }),
    ).rejects.toThrow(/Unknown capability/);
  });

  it('adds the typescript capability files', async () => {
    const result = await addCapability({
      root: dir,
      capability: 'typescript',
      fs: new FileSystem(),
      git: new GitClient(),
    });
    expect(result.report!.created).toContain('src/index.ts');
    expect(await fs.stat(path.join(dir, 'package.json'))).toBeTruthy();
    expect(await fs.stat(path.join(dir, 'tsconfig.json'))).toBeTruthy();
  });

  it('is conservative: does not overwrite an existing file', async () => {
    await fs.writeFile(path.join(dir, 'package.json'), 'CUSTOM');
    const result = await addCapability({
      root: dir,
      capability: 'typescript',
      fs: new FileSystem(),
      git: new GitClient(),
    });
    expect(result.report!.skipped).toBeGreaterThan(0);
    expect(await fs.readFile(path.join(dir, 'package.json'), 'utf8')).toBe('CUSTOM');
  });

  it('dry-run writes nothing', async () => {
    const result = await addCapability({
      root: dir,
      capability: 'go',
      dryRun: true,
      fs: new FileSystem(),
      git: new GitClient(),
    });
    expect(result.dryRun).toBe(true);
    let exists = true;
    try {
      await fs.access(path.join(dir, 'go.mod'));
    } catch {
      exists = false;
    }
    expect(exists).toBe(false);
  });
});
