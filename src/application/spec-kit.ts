/**
 * Spec Kit integration (plan §42 Phase 3). Spec Kit is not replaced by
 * project-bootstrap; rather, the speckit capability scaffolds a
 * specification-driven workflow that composes with it. This use case reports
 * whether a project has the capability enabled and how it is wired.
 */
import * as path from 'node:path';
import type { FileSystem } from '../infrastructure/filesystem.js';

export interface SpecKitOptions {
  readonly root: string;
  readonly fs: FileSystem;
}

export interface SpecKitReport {
  readonly enabled: boolean;
  readonly specsDir: boolean;
  readonly rulePresent: boolean;
  readonly summary: string;
}

export async function inspectSpecKit(options: SpecKitOptions): Promise<SpecKitReport> {
  const { root, fs } = options;
  const rulePresent = await fs.exists(
    path.join(root, '.project-bootstrap', 'rules', 'spec-kit.md'),
  );
  const specsDir = await fs.exists(path.join(root, 'specs'));
  const enabled = rulePresent;
  return {
    enabled,
    specsDir,
    rulePresent,
    summary: enabled
      ? 'Spec Kit capability enabled: specifications live under specs/'
      : 'Spec Kit capability not detected',
  };
}
