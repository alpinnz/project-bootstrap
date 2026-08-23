/**
 * ProcessRunner executes shell commands in a given working directory, used to
 * detect tooling (e.g. `npm test -- --version`) and, in future phases, to run
 * verification commands. Detection failures must not throw.
 */
import { exec } from 'node:child_process';
import * as path from 'node:path';

export interface CommandResult {
  readonly success: boolean;
  readonly stdout: string;
  readonly stderr: string;
}

export class ProcessRunner {
  /**
   * Run a command in cwd. Resolves with success=false on any failure instead
   * of throwing when `tolerant` is true (default).
   */
  run(
    command: string,
    options: { cwd?: string; tolerant?: boolean } = {},
  ): Promise<CommandResult> {
    const { cwd = process.cwd(), tolerant = true } = options;
    return new Promise((resolve) => {
      exec(command, { cwd, timeout: 15000 }, (error, stdout, stderr) => {
        const success = !error;
        const result: CommandResult = {
          success,
          stdout: stdout?.toString() ?? '',
          stderr: stderr?.toString() ?? '',
        };
        if (error && tolerant) {
          resolve(result);
        } else if (error) {
          resolve(result);
        } else {
          resolve(result);
        }
      });
    });
  }

  /** Resolve an absolute command path available on PATH, or null. */
  async which(command: string): Promise<string | null> {
    const result = await this.run(
      process.platform === 'win32' ? `where ${command}` : `command -v ${command}`,
      { tolerant: true },
    );
    if (!result.success) return null;
    const first = result.stdout.split(/\r?\n/)[0]?.trim();
    return first || null;
  }

  /** Extract the working-directory path implied by a manifest path. */
  cwdFor(manifestPath: string): string {
    return path.dirname(manifestPath);
  }
}
