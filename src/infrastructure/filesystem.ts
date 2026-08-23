/**
 * Filesystem infrastructure: safe create/update/read operations over the
 * repository. All writes here are explicit and observable.
 */
import { promises as fs } from 'node:fs';
import * as path from 'node:path';

export interface WriteResult {
  readonly path: string;
  readonly created: boolean;
  /** True when an existing file's content changed. */
  readonly changed: boolean;
}

export class FileSystem {
  async exists(filePath: string): Promise<boolean> {
    try {
      await fs.access(filePath);
      return true;
    } catch {
      return false;
    }
  }

  async isFile(filePath: string): Promise<boolean> {
    try {
      const stat = await fs.stat(filePath);
      return stat.isFile();
    } catch {
      return false;
    }
  }

  async read(filePath: string): Promise<string | null> {
    try {
      return await fs.readFile(filePath, 'utf8');
    } catch {
      return null;
    }
  }

  async readDir(dirPath: string): Promise<string[]> {
    try {
      return await fs.readdir(dirPath);
    } catch {
      return [];
    }
  }

  async ensureDir(dirPath: string): Promise<void> {
    await fs.mkdir(dirPath, { recursive: true });
  }

  /**
   * Write file content, creating parent directories as needed.
   * Returns whether the file was created or changed.
   */
  async writeFile(filePath: string, content: string): Promise<WriteResult> {
    const existed = await this.exists(filePath);
    const previous = existed ? await this.read(filePath) : null;
    await this.ensureDir(path.dirname(filePath));
    await fs.writeFile(filePath, content, 'utf8');
    return {
      path: filePath,
      created: !existed,
      changed: existed && previous !== content,
    };
  }

  /** Read a JSON file, returning null when absent or malformed. */
  async readJson<T>(filePath: string): Promise<T | null> {
    const raw = await this.read(filePath);
    if (raw === null) return null;
    try {
      return JSON.parse(raw) as T;
    } catch {
      return null;
    }
  }
}
