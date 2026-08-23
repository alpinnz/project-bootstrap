import { promises as fs } from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { FileSystem } from '../infrastructure/filesystem.js';
import { inspectSpecKit } from './spec-kit.js';

describe('inspectSpecKit', () => {
  let dir: string;
  let fsImpl: FileSystem;

  beforeEach(async () => {
    dir = await fs.mkdtemp(path.join(os.tmpdir(), 'pb-spec-'));
    fsImpl = new FileSystem();
  });

  afterEach(async () => {
    await fs.rm(dir, { recursive: true, force: true });
  });

  it('reports not enabled when there is no rule', async () => {
    const report = await inspectSpecKit({ root: dir, fs: fsImpl });
    expect(report.enabled).toBe(false);
  });

  it('reports enabled when the rule is present', async () => {
    await fs.mkdir(path.join(dir, '.project-bootstrap', 'rules'), { recursive: true });
    await fs.writeFile(path.join(dir, '.project-bootstrap', 'rules', 'spec-kit.md'), '# Spec Kit\n');
    const report = await inspectSpecKit({ root: dir, fs: fsImpl });
    expect(report.enabled).toBe(true);
    expect(report.summary).toContain('enabled');
  });
});
