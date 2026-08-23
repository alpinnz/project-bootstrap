import { promises as fs } from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { FileSystem } from '../infrastructure/filesystem.js';
import { flagDependency, runDepcheck } from './depcheck.js';

describe('flagDependency', () => {
  it('flags typosquat lookalikes', () => {
    expect(flagDependency('lodahs')).toContain('possible-typosquat');
    expect(flagDependency('lodash')).not.toContain('possible-typosquat');
  });

  it('flags suspicious unscoped names with spaces or underscores', () => {
    expect(flagDependency('my weird pack')).toContain('suspicious-name');
    expect(flagDependency('@scope/normal')).not.toContain('suspicious-name');
  });
});

describe('runDepcheck', () => {
  let dir: string;
  let fsImpl: FileSystem;

  beforeEach(async () => {
    dir = await fs.mkdtemp(path.join(os.tmpdir(), 'pb-dep-'));
    fsImpl = new FileSystem();
  });

  afterEach(async () => {
    await fs.rm(dir, { recursive: true, force: true });
  });

  it('is unhealthy when there is no manifest', async () => {
    const report = await runDepcheck({ root: dir, fs: fsImpl });
    expect(report.manifestPresent).toBe(false);
    expect(report.health).toBe('unhealthy');
  });

  it('flags missing lockfile as attention', async () => {
    await fs.writeFile(
      path.join(dir, 'package.json'),
      JSON.stringify({ name: 'x', dependencies: { express: '^4' } }),
    );
    const report = await runDepcheck({ root: dir, fs: fsImpl });
    expect(report.lockfilePresent).toBe(false);
    expect(report.health).toBe('attention');
  });

  it('is healthy with manifest + lockfile and clean deps', async () => {
    await fs.writeFile(
      path.join(dir, 'package.json'),
      JSON.stringify({ name: 'x', dependencies: { express: '^4' } }),
    );
    await fs.writeFile(path.join(dir, 'package-lock.json'), '{}');
    const report = await runDepcheck({ root: dir, fs: fsImpl });
    expect(report.lockfilePresent).toBe(true);
    expect(report.packageManager).toBe('npm');
    expect(report.health).toBe('healthy');
  });

  it('flags a typosquat dependency as high-signal', async () => {
    await fs.writeFile(
      path.join(dir, 'package.json'),
      JSON.stringify({ name: 'x', dependencies: { lodahs: '1.0.0' } }),
    );
    await fs.writeFile(path.join(dir, 'package-lock.json'), '{}');
    const report = await runDepcheck({ root: dir, fs: fsImpl });
    expect(report.flagged.length).toBe(1);
    expect(report.flagged[0].name).toBe('lodahs');
  });
});
