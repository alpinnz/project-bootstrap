/**
 * Repository detection: derive language, framework, runtime, package manager,
 * build tool, testing, linting and npm scripts from manifest files. All
 * detection is best-effort and never throws.
 */
import * as path from 'node:path';
import type { DetectedTooling, PackageManager, Runtime } from '../domain/project-context.js';
import type { FileSystem } from '../infrastructure/filesystem.js';

export interface DetectionInput {
  readonly fs: FileSystem;
  readonly root: string;
}

interface PackageManifest {
  name?: string;
  packageManager?: string;
  scripts?: Record<string, string>;
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
}

export async function detectTooling(input: DetectionInput): Promise<DetectedTooling> {
  const { fs, root } = input;
  const manifest = await fs.readJson<PackageManifest>(path.join(root, 'package.json'));
  const hasGoMod = await fs.exists(path.join(root, 'go.mod'));
  const hasCargo = await fs.exists(path.join(root, 'Cargo.toml'));
  const hasPyProject = await fs.exists(path.join(root, 'pyproject.toml'));

  return {
    packageManager: await detectPackageManager(fs, root, manifest),
    runtime: detectRuntime(hasGoMod, await fs.exists(path.join(root, 'bun.lockb')), manifest),
    language: await detectLanguage(fs, root, manifest, hasGoMod, hasCargo, hasPyProject),
    framework: detectFramework(manifest),
    commands: detectCommands(manifest, hasGoMod),
  };
}

async function detectPackageManager(
  fs: FileSystem,
  root: string,
  manifest: PackageManifest | null,
): Promise<PackageManager> {
  const lockfiles: Array<[string, PackageManager]> = [
    ['pnpm-lock.yaml', 'pnpm'],
    ['bun.lockb', 'bun'],
    ['yarn.lock', 'yarn'],
    ['package-lock.json', 'npm'],
  ];
  for (const [file, manager] of lockfiles) {
    if (await fs.isFile(path.join(root, file))) return manager;
  }
  if (manifest?.packageManager) {
    const name = manifest.packageManager.split('@')[0] as PackageManager;
    if (['npm', 'pnpm', 'yarn', 'bun'].includes(name)) return name;
  }
  return 'unknown';
}

function detectRuntime(
  hasGoMod: boolean,
  hasBunLock: boolean,
  manifest: PackageManifest | null,
): Runtime {
  if (hasGoMod) return 'go';
  if (hasBunLock || manifest?.packageManager?.startsWith('bun')) return 'bun';
  if (manifest) return 'node';
  return 'unknown';
}

async function detectLanguage(
  fs: FileSystem,
  root: string,
  manifest: PackageManifest | null,
  hasGoMod: boolean,
  hasCargo: boolean,
  hasPyProject: boolean,
): Promise<string> {
  if (hasGoMod) return 'Go';
  if (hasCargo) return 'Rust';
  if (hasPyProject) return 'Python';
  if (manifest) {
    const deps = { ...manifest.dependencies, ...manifest.devDependencies };
    if (deps?.['typescript']) return 'TypeScript';
  }
  if (await fs.exists(path.join(root, 'tsconfig.json'))) return 'TypeScript';
  if (manifest) return 'JavaScript';
  return 'unknown';
}

function detectFramework(manifest: PackageManifest | null): string {
  if (!manifest) return 'unknown';
  const deps = { ...manifest.dependencies, ...manifest.devDependencies };
  const markers: Array<[string, string]> = [
    ['next', 'Next.js'],
    ['react', 'React'],
    ['vue', 'Vue'],
    ['@angular/core', 'Angular'],
    ['svelte', 'Svelte'],
    ['@nestjs/core', 'NestJS'],
    ['express', 'Express'],
    ['fastify', 'Fastify'],
  ];
  for (const [dep, framework] of markers) {
    if (deps?.[dep]) return framework;
  }
  return 'unknown';
}

function detectCommands(manifest: PackageManifest | null, hasGoMod: boolean): string[] {
  if (manifest?.scripts) {
    const known = ['dev', 'build', 'test', 'lint', 'format', 'typecheck', 'start'];
    return known.filter((name) => name in manifest.scripts!);
  }
  if (hasGoMod) {
    const commands: string[] = [];
    return commands;
  }
  return [];
}
