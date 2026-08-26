import { describe, expect, it } from 'vitest';
import type { ProjectContext } from '../domain/project-context.js';
import { ClaudeAdapter } from './claude.js';

function context(overrides: Partial<ProjectContext['tooling']> = {}): ProjectContext {
  return {
    root: '/tmp/project',
    isExisting: true,
    tooling: {
      language: 'TypeScript',
      framework: 'unknown',
      runtime: 'node',
      packageManager: 'npm',
      commands: ['test', 'build'],
      ...overrides,
    },
    capabilities: [{ id: 'base', enabled: true }],
    managedFiles: ['AGENTS.md'],
  };
}

describe('ClaudeAdapter', () => {
  const adapter = new ClaudeAdapter();

  it('builds CLAUDE.md content from the project source of truth', () => {
    const content = adapter.buildContext(context());
    expect(content).toContain('# CLAUDE.md');
    expect(content).toContain('- Language: TypeScript');
    expect(content).toContain('- `test`');
    expect(content).toContain('.project-bootstrap/rules/');
  });

  it('omits the commands section when no commands are detected', () => {
    const content = adapter.buildContext(context({ commands: [] }));
    expect(content).not.toContain('## Commands');
  });
});
