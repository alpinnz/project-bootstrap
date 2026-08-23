import { promises as fs } from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { FileSystem } from '../infrastructure/filesystem.js';
import { runDoctor } from './run-doctor.js';

describe('runDoctor', () => {
  let dir: string;
  let fsImpl: FileSystem;

  beforeEach(async () => {
    dir = await fs.mkdtemp(path.join(os.tmpdir(), 'pb-doctor-'));
    fsImpl = new FileSystem();
  });

  afterEach(async () => {
    await fs.rm(dir, { recursive: true, force: true });
  });

  it('flags missing foundation files as failures', async () => {
    await fs.writeFile(path.join(dir, 'package.json'), JSON.stringify({}));
    const report = await runDoctor({ root: dir, fs: fsImpl });
    expect(report.health).toBe('unhealthy');
    const foundation = report.categories.find((c) => c.title === 'Foundation')!;
    expect(foundation.checks.map((c) => c.name)).toContain('AGENTS.md');
  });

  it('reports a not-quite-ready repo as attention (manifest, no scripts)', async () => {
    await fs.writeFile(path.join(dir, 'package.json'), JSON.stringify({ name: 'app' }));
    const report = await runDoctor({ root: dir, fs: fsImpl });
    // Missing AGENTS/constitution -> unhealthy regardless of dev warnings.
    expect(report.health).toBe('unhealthy');
  });

  it('passes security check when secrets are gitignored', async () => {
    await fs.writeFile(
      path.join(dir, 'package.json'),
      JSON.stringify({ name: 'app', scripts: { test: 'vitest', build: 'tsc' } }),
    );
    await fs.writeFile(path.join(dir, '.gitignore'), '.env\nnode_modules\n');
    await fs.mkdir(path.join(dir, '.project-bootstrap'), { recursive: true });
    await fs.writeFile(path.join(dir, 'AGENTS.md'), '# Agents\n');
    await fs.writeFile(path.join(dir, '.project-bootstrap', 'constitution.md'), '# Constitution\n');
    await fs.writeFile(path.join(dir, '.project-bootstrap', 'project.yml'), 'project: {}\n');
    const report = await runDoctor({ root: dir, fs: fsImpl });
    const security = report.categories.find((c) => c.title === 'Security')!;
    const secretsIgnored = security.checks.find((c) => c.name === 'Secrets ignored')!;
    expect(secretsIgnored.status).toBe('pass');
  });
});
