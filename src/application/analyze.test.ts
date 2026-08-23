import { promises as fs } from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { FileSystem } from '../infrastructure/filesystem.js';
import { analyzeProject } from './analyze.js';

describe('analyzeProject', () => {
  let dir: string;
  let fsImpl: FileSystem;

  beforeEach(async () => {
    dir = await fs.mkdtemp(path.join(os.tmpdir(), 'pb-an-'));
    fsImpl = new FileSystem();
  });

  afterEach(async () => {
    await fs.rm(dir, { recursive: true, force: true });
  });

  it('detects top-level structure and skips build dirs', async () => {
    await fs.mkdir(path.join(dir, 'src'), { recursive: true });
    await fs.mkdir(path.join(dir, 'node_modules'), { recursive: true });
    await fs.writeFile(path.join(dir, 'src', 'index.ts'), 'export {};');
    await fs.writeFile(path.join(dir, 'README.md'), '# hi');

    const report = await analyzeProject({ root: dir, fs: fsImpl });
    expect(report.topLevel.map((e) => e.name)).toContain('src');
    expect(report.topLevel.map((e) => e.name)).not.toContain('node_modules');
    expect(report.entryPoints).toContain('src/index.ts');
  });

  it('reports missing foundation', async () => {
    const report = await analyzeProject({ root: dir, fs: fsImpl });
    expect(report.foundationPresent).toBe(false);
  });

  it('reports foundation present when constitution exists', async () => {
    await fs.mkdir(path.join(dir, '.project-bootstrap'), { recursive: true });
    await fs.writeFile(
      path.join(dir, '.project-bootstrap', 'constitution.md'),
      '# Constitution\n',
    );
    const report = await analyzeProject({ root: dir, fs: fsImpl });
    expect(report.foundationPresent).toBe(true);
  });
});
