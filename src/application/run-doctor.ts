/**
 * RunDoctor use case: validate repository health against the foundation
 * checks described in the plan — foundation files, development commands,
 * agentic context and security posture.
 */
import * as path from 'node:path';
import type { CheckResult, Health, ValidationCategory } from '../domain/validation-result.js';
import { aggregateHealth } from '../domain/validation-result.js';
import type { FileSystem } from '../infrastructure/filesystem.js';
import { detectTooling } from './detect.js';

export interface DoctorOptions {
  readonly root: string;
  readonly fs: FileSystem;
}

export interface DoctorReport {
  readonly categories: readonly ValidationCategory[];
  readonly health: Health;
}

export async function runDoctor(options: DoctorOptions): Promise<DoctorReport> {
  const { root, fs } = options;
  const tooling = await detectTooling({ fs, root });

  const foundation = await checkFoundation(fs, root);
  const development = await checkDevelopment(fs, root, tooling.commands);
  const agentic = checkAgentic();
  const security = await checkSecurity(fs, root);

  const categories: ValidationCategory[] = [foundation, development, agentic, security];
  return { categories, health: aggregateHealth(categories) };
}

async function checkFoundation(fs: FileSystem, root: string): Promise<ValidationCategory> {
  const checks: CheckResult[] = [];
  checks.push(await fileCheck(fs, root, 'AGENTS.md', 'AGENTS.md'));
  checks.push(await fileCheck(fs, root, '.project-bootstrap/constitution.md', 'Constitution'));
  checks.push(await fileCheck(fs, root, '.project-bootstrap/project.yml', 'Project context'));
  return { title: 'Foundation', checks };
}

async function checkDevelopment(
  fs: FileSystem,
  root: string,
  commands: readonly string[],
): Promise<ValidationCategory> {
  const checks: CheckResult[] = [];
  const hasManifest = await fs.exists(path.join(root, 'package.json'));
  checks.push({
    name: 'Project manifest',
    status: hasManifest ? 'pass' : 'warning',
    message: hasManifest ? 'package.json present' : 'No package manifest detected',
  });
  checks.push({
    name: 'Test command',
    status: commands.includes('test') ? 'pass' : 'warning',
    message: commands.includes('test') ? 'npm test available' : 'No test script detected',
  });
  checks.push({
    name: 'Build command',
    status: commands.includes('build') ? 'pass' : 'warning',
    message: commands.includes('build') ? 'npm build available' : 'No build script detected',
  });
  return { title: 'Development', checks };
}

function checkAgentic(): ValidationCategory {
  return {
    title: 'Agentic',
    checks: [
      {
        name: 'AI context',
        status: 'info',
        message: 'Adapter-based; source of truth is .project-bootstrap + AGENTS.md',
      },
    ],
  };
}

async function checkSecurity(fs: FileSystem, root: string): Promise<ValidationCategory> {
  const checks: CheckResult[] = [];
  const gitignore = await fs.read(path.join(root, '.gitignore'));
  const ignoresSecrets =
    gitignore !== null && /\.env\b|\.env\*/.test(gitignore) && /node_modules/.test(gitignore);

  const envPlayground = await fs.exists(path.join(root, '.env'));
  const envExample = await fs.exists(path.join(root, '.env.example'));

  checks.push({
    name: 'Secrets ignored',
    status: ignoresSecrets ? 'pass' : 'warning',
    message: ignoresSecrets
      ? '.gitignore protects env/secrets'
      : '.gitignore may not protect secrets',
  });
  checks.push({
    name: 'No committed secrets',
    status: envPlayground && !envExample ? 'warning' : 'pass',
    message:
      envPlayground && !envExample
        ? '.env present without .env.example'
        : 'No obvious secret file committed',
  });
  return { title: 'Security', checks };
}

async function fileCheck(
  fs: FileSystem,
  root: string,
  rel: string,
  label: string,
): Promise<CheckResult> {
  const exists = await fs.exists(path.join(root, rel));
  return {
    name: label,
    status: exists ? 'pass' : 'fail',
    message: exists ? 'Present' : `Missing ${rel}`,
  };
}
