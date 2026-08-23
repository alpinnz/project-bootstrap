/**
 * Codex, Cursor and Copilot adapters. These are thin adapters: their context
 * file points back to the source of truth (AGENTS.md + .project-bootstrap/)
 * rather than duplicating content, keeping context small (Design Decision 3).
 */
import { generateAgentsMd } from '../application/agents-generator.js';
import type { ProjectContext } from '../domain/project-context.js';
import type { AiAdapter } from './ai-adapter.js';

function buildPointer(project: ProjectContext, mention: string): string {
  return [
    `# ${mention}`,
    '',
    '> Managed by project-bootstrap. The source of truth is `AGENTS.md` and `.project-bootstrap/`. Run `project-bootstrap sync` to refresh.',
    '',
    `- Language: ${project.tooling.language}`,
    `- Framework: ${project.tooling.framework}`,
    `- Package manager: ${project.tooling.packageManager}`,
    '',
    'Follow `.project-bootstrap/rules/` and `.project-bootstrap/workflows/`.',
    '',
  ].join('\n');
}

export class CodexAdapter implements AiAdapter {
  readonly id = 'codex' as const;
  readonly name = 'Codex';
  /**
   * AGENTS.md is the Codex entry point and is the shared managed source. We
   * generate it directly so the adapter produces the same managed content
   * that `project-bootstrap sync` maintains.
   */
  buildContext(project: ProjectContext): string {
    return generateAgentsMd(project);
  }
}

export class CursorAdapter implements AiAdapter {
  readonly id = 'cursor' as const;
  readonly name = 'Cursor';
  buildContext(project: ProjectContext): string {
    return buildPointer(project, 'Cursor project rules');
  }
}

export class CopilotAdapter implements AiAdapter {
  readonly id = 'copilot' as const;
  readonly name = 'Copilot';
  buildContext(project: ProjectContext): string {
    return buildPointer(project, 'Copilot instructions');
  }
}
