import { promises as nodeFs } from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { FileSystem } from '../infrastructure/filesystem.js';
import { mergeManifestFragment } from './manifest-merge.js';

describe('mergeManifestFragment', () => {
  let dir: string;
  const fs = new FileSystem();

  beforeEach(async () => {
    dir = await nodeFs.mkdtemp(path.join(os.tmpdir(), 'pb-manifest-'));
  });

  afterEach(async () => {
    await nodeFs.rm(dir, { recursive: true, force: true });
  });

  const fragment = JSON.stringify({
    scripts: { prepare: 'husky', lint: 'eslint .', format: 'prettier --write .' },
    devDependencies: { husky: '^9.0.0', eslint: '^10.0.0' },
    'lint-staged': { 'src/**/*.ts': ['eslint --fix', 'prettier --write'] },
  });

  it('creates package.json when absent', async () => {
    const result = await mergeManifestFragment({ root: dir, fs, fragmentRaw: fragment });
    expect(result.created).toBe(true);
    expect(result.changed).toBe(true);
    const manifest = JSON.parse((await fs.read(path.join(dir, 'package.json')))!);
    expect(manifest.scripts.prepare).toBe('husky');
    expect(manifest.devDependencies.husky).toBe('^9.0.0');
    expect(manifest['lint-staged']['src/**/*.ts']).toEqual(['eslint --fix', 'prettier --write']);
  });

  it('adds missing keys but never overwrites existing user values', async () => {
    await fs.writeFile(
      path.join(dir, 'package.json'),
      JSON.stringify({
        name: 'app',
        version: '1.0.0',
        scripts: { test: 'vitest', lint: 'my-own-lint' },
        devDependencies: { eslint: '9.0.0-user-pinned' },
      }),
    );
    const result = await mergeManifestFragment({ root: dir, fs, fragmentRaw: fragment });
    const manifest = JSON.parse((await fs.read(path.join(dir, 'package.json')))!);
    // existing values win
    expect(manifest.scripts.lint).toBe('my-own-lint');
    expect(manifest.devDependencies.eslint).toBe('9.0.0-user-pinned');
    // missing keys are added
    expect(manifest.scripts.prepare).toBe('husky');
    expect(manifest.scripts.format).toBe('prettier --write .');
    expect(manifest.devDependencies.husky).toBe('^9.0.0');
    // untouched user fields survive
    expect(manifest.name).toBe('app');
    expect(manifest.version).toBe('1.0.0');
    expect(result.addedScripts.sort()).toEqual(['format', 'prepare']);
    expect(result.addedDevDependencies).toEqual(['husky']);
    expect(result.preservedKeys.sort()).toEqual(['devDependencies.eslint', 'scripts.lint']);
  });

  it('does not rewrite when everything already exists (changed=false)', async () => {
    await mergeManifestFragment({ root: dir, fs, fragmentRaw: fragment });
    const afterFirst = await fs.read(path.join(dir, 'package.json'));
    const result = await mergeManifestFragment({ root: dir, fs, fragmentRaw: fragment });
    expect(result.changed).toBe(false);
    expect(await fs.read(path.join(dir, 'package.json'))).toBe(afterFirst);
  });

  it('aborts without writing when the target manifest is malformed', async () => {
    await fs.writeFile(path.join(dir, 'package.json'), '{ not valid json');
    const result = await mergeManifestFragment({ root: dir, fs, fragmentRaw: fragment });
    expect(result.changed).toBe(false);
    expect(await fs.read(path.join(dir, 'package.json'))).toBe('{ not valid json');
  });

  it('ignores a malformed fragment entirely', async () => {
    await fs.writeFile(path.join(dir, 'package.json'), '{"name":"app"}');
    const result = await mergeManifestFragment({ root: dir, fs, fragmentRaw: 'not json' });
    expect(result.changed).toBe(false);
    expect(JSON.parse((await fs.read(path.join(dir, 'package.json')))!)).toEqual({ name: 'app' });
  });
});
