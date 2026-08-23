/**
 * AI adapter contract. Per Design Decision 2, an adapter is NOT a source of
 * truth — the repository (`.project-bootstrap/` + `AGENTS.md`) is. Adapters
 * translate that source into tool-specific context files.
 */
import type { ProjectContext } from '../domain/project-context.js';

export interface AiAdapter {
  /** Stable adapter id, e.g. "claude". */
  readonly id: AiAdapterId;
  /** Human-readable name. */
  readonly name: string;
  /**
   * Build the adapter-specific context file content from the project source
   * of truth.
   */
  buildContext(project: ProjectContext): Promise<string> | string;
}

export type AiAdapterId = 'claude' | 'codex' | 'cursor' | 'copilot';

/** Map adapter id -> its conventional context file name. */
export const ADAPTER_FILE: Record<AiAdapterId, string> = {
  claude: 'CLAUDE.md',
  codex: 'AGENTS.md',
  cursor: '.cursor/rules/project.mdc',
  copilot: '.github/copilot-instructions.md',
};
