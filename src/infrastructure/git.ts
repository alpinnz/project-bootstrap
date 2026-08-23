/**
 * Git infrastructure: minimal read-only Git operations used to detect
 * repository state and (in future phases) structured diffs.
 */
import { promises as fs } from 'node:fs';
import * as path from 'node:path';
import { ProcessRunner } from './process-runner.js';

export interface GitInfo {
  readonly isRepository: boolean;
  readonly hasCommits: boolean;
  readonly branch: string | null;
}

export class GitClient {
  constructor(private readonly runner: ProcessRunner = new ProcessRunner()) {}

  async isRepository(dir: string): Promise<boolean> {
    return await fs
      .access(path.join(dir, '.git'))
      .then(() => true)
      .catch(() => false);
  }

  async info(dir: string): Promise<GitInfo> {
    const isRepository = await this.isRepository(dir);
    if (!isRepository) {
      return { isRepository: false, hasCommits: false, branch: null };
    }
    const branchResult = await this.runner.run('git rev-parse --abbrev-ref HEAD', {
      cwd: dir,
    });
    const branch = branchResult.success ? branchResult.stdout.trim() || null : null;
    const logResult = await this.runner.run('git rev-parse --verify HEAD', {
      cwd: dir,
    });
    return { isRepository, hasCommits: logResult.success, branch };
  }
}
