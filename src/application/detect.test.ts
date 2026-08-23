import { promises as fs } from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { FileSystem } from '../infrastructure/filesystem.js';
import { detectTooling } from './detect.js';

describe('detectTooling', () => {
  let dir: string;
  let fsImpl: FileSystem;

  beforeEach(async () => {
    dir = await fs.mkdtemp(path.join(os.tmpdir(), 'pb-detect-'));
    fsImpl = new FileSystem();
  });

  afterEach(async () => {
    await fs.rm(dir, { recursive: true, force: true });
  });

  it('detects TypeScript + React + pnpm + scripts', async () => {
    await fs.writeFile(
      path.join(dir, 'package.json'),
      JSON.stringify({
        name: 'app',
        scripts: { dev: 'vite', test: 'vitest', build: 'tsc' },
        dependencies: { react: '^18' },
        devDependencies: { typescript: '^5' },
      }),
    );
    await fs.writeFile(path.join(dir, 'pnpm-lock.yaml'), '# lock');
    await fs.writeFile(path.join(dir, 'tsconfig.json'), '{}');

    const tooling = await detectTooling({ fs: fsImpl, root: dir });
    expect(tooling.language).toBe('TypeScript');
    expect(tooling.framework).toBe('React');
    expect(tooling.packageManager).toBe('pnpm');
    expect(tooling.runtime).toBe('node');
    // Commands are returned in the priority order of detectCommands, not the
    // source object's key order.
    expect(tooling.commands).toEqual(['dev', 'build', 'test']);
  });

  it('detects Go project with no scripts', async () => {
    await fs.writeFile(path.join(dir, 'go.mod'), 'module example.com/x\n');
    const tooling = await detectTooling({ fs: fsImpl, root: dir });
    expect(tooling.language).toBe('Go');
    expect(tooling.runtime).toBe('go');
    expect(tooling.commands).toEqual([]);
  });

  it('returns unknown values for an empty directory', async () => {
    const tooling = await detectTooling({ fs: fsImpl, root: dir });
    expect(tooling.language).toBe('unknown');
    expect(tooling.packageManager).toBe('unknown');
  });

  it('detects package manager from the packageManager field', async () => {
    await fs.writeFile(path.join(dir, 'package.json'), JSON.stringify({ name: 'app', packageManager: 'yarn@1.22' }));
    const tooling = await detectTooling({ fs: fsImpl, root: dir });
    expect(tooling.packageManager).toBe('yarn');
  });
});
