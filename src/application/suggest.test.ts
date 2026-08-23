import { promises as fs } from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { FileSystem } from '../infrastructure/filesystem.js';
import { suggestImprovements } from './suggest.js';

describe('suggestImprovements', () => {
  let dir: string;
  let fsImpl: FileSystem;

  beforeEach(async () => {
    dir = await fs.mkdtemp(path.join(os.tmpdir(), 'pb-sugg-'));
    fsImpl = new FileSystem();
  });

  afterEach(async () => {
    await fs.rm(dir, { recursive: true, force: true });
  });

  it('suggests foundation for a bare repo', async () => {
    const report = await suggestImprovements({ root: dir, fs: fsImpl });
    expect(report.suggestions.map((s) => s.id)).toContain('foundation');
  });

  it('suggests tests when no test script exists', async () => {
    await fs.writeFile(path.join(dir, 'package.json'), JSON.stringify({ name: 'x' }));
    const report = await suggestImprovements({ root: dir, fs: fsImpl });
    expect(report.suggestions.map((s) => s.id)).toContain('tests');
  });

  it('produces no foundation suggestion for a bootstrapped repo', async () => {
    await fs.mkdir(path.join(dir, '.project-bootstrap'), { recursive: true });
    await fs.writeFile(path.join(dir, '.project-bootstrap', 'constitution.md'), '# Constitution\n');
    await fs.writeFile(path.join(dir, '.project-bootstrap', 'project.yml'), 'proj: {}\n');
    await fs.writeFile(path.join(dir, 'AGENTS.md'), '# Agents\n');
    // Also silence manifest/lockfile/tests suggestions partially.
    await fs.writeFile(
      path.join(dir, 'package.json'),
      JSON.stringify({ name: 'x', scripts: { test: 'vitest', build: 'tsc' } }),
    );
    await fs.writeFile(path.join(dir, 'package-lock.json'), '{}');
    await fs.writeFile(path.join(dir, '.gitignore'), '.env\nnode_modules\n');

    const report = await suggestImprovements({ root: dir, fs: fsImpl });
    expect(report.suggestions.some((s) => s.id === 'foundation')).toBe(false);
    expect(report.suggestions.some((s) => s.id === 'tests')).toBe(false);
  });
});
