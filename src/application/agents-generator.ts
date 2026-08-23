/**
 * AGENTS.md generator: builds the managed agent context file from the project
 * source of truth. AGENTS.md is the managed entry point (Level 0 context).
 */
import type { ProjectContext } from '../domain/project-context.js';

export function generateAgentsMd(project: ProjectContext): string {
  const lines: string[] = [
    '# AGENTS.md',
    '',
    '> Managed by project-bootstrap. The source of truth is `.project-bootstrap/`. Run `project-bootstrap sync` to regenerate.',
    '',
    '## Project',
    '',
    `- Language: ${project.tooling.language}`,
    `- Framework: ${project.tooling.framework}`,
    `- Package manager: ${project.tooling.packageManager}`,
    `- Runtime: ${project.tooling.runtime}`,
  ];

  if (project.tooling.commands.length > 0) {
    lines.push('', '## Commands', '');
    for (const command of project.tooling.commands) {
      lines.push(`- \`${command}\``);
    }
  }

  lines.push(
    '',
    '## Principles',
    '',
    'Follow the constitution in `.project-bootstrap/constitution.md`.',
    '',
    '## Rules',
    '',
    'Follow the engineering rules in `.project-bootstrap/rules/`.',
    '',
    '## Workflow',
    '',
    'Follow the development workflow in `.project-bootstrap/workflows/`.',
    '',
    '## Agent Requirements',
    '',
    '- Understand the code before editing.',
    '- Find the existing source of truth before creating a new abstraction.',
    '- Follow repository conventions.',
    '- Verify claims by actually running commands and tests.',
    '- Make the smallest coherent change.',
    '- Do not make assumptions without evidence.',
    '- Do not weaken validation or security checks.',
    '',
  );

  return lines.join('\n');
}
