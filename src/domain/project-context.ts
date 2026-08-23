/**
 * ProjectContext is the single source of truth describing a project that
 * project-bootstrap operates on. It is produced by repository inspection
 * and consumed by plan generation and doctor validation.
 */
export type PackageManager = 'npm' | 'pnpm' | 'yarn' | 'bun' | 'unknown';
export type Runtime = 'node' | 'bun' | 'deno' | 'go' | 'unknown';

export interface DetectedTooling {
  readonly packageManager: PackageManager;
  readonly runtime: Runtime;
  readonly language: string;
  readonly framework: string;
  /** Detected npm scripts / commands, e.g. ["dev", "test", "build", "lint"]. */
  readonly commands: readonly string[];
}

export interface ProjectRecord {
  /** Absolute path to the project root (with the manifest if present). */
  readonly root: string;
  /** Whether the repository already has a git history / manifest. */
  readonly isExisting: boolean;
  readonly tooling: DetectedTooling;
}

/**
 * ProjectContext is created by the inspection use case and stored as
 * `.project-bootstrap/project.yml` for later validation.
 */
export interface ProjectContext extends ProjectRecord {
  readonly capabilities: readonly CapabilityRef[];
  /** Snapshot of files that the foundation owns/creates. */
  readonly managedFiles: readonly string[];
}

/** A light reference to a capability attached to a project context. */
export interface CapabilityRef {
  readonly id: string;
  readonly enabled: boolean;
}
