import { describe, expect, it } from 'vitest';
import type { ProjectContext } from '../domain/project-context.js';
import { generateAdapterContext } from './adapter-generator.js';

function sampleProject(): ProjectContext {
  return {
    root: '/repo',
    isExisting: true,
    tooling: {
      packageManager: 'npm',
      runtime: 'node',
      language: 'TypeScript',
      framework: 'React',
      commands: ['dev', 'build', 'test'],
    },
    capabilities: [{ id: 'base', enabled: true }],
    managedFiles: ['AGENTS.md'],
  };
}

describe('adapter generator', () => {
  it('targets CLAUDE.md for the claude adapter', async () => {
    const result = await generateAdapterContext({ project: sampleProject(), adapter: 'claude' });
    expect(result.targetFile).toBe('CLAUDE.md');
    expect(result.content).toContain('TypeScript');
    expect(result.content).toContain('React');
  });

  it('targets AGENTS.md for the codex adapter and generates shared managed content', async () => {
    const result = await generateAdapterContext({ project: sampleProject(), adapter: 'codex' });
    expect(result.targetFile).toBe('AGENTS.md');
    expect(result.content).toContain('# AGENTS.md');
    expect(result.content).toContain('Agent Requirements');
  });

  it('targets the cursor rules file for the cursor adapter', async () => {
    const result = await generateAdapterContext({ project: sampleProject(), adapter: 'cursor' });
    expect(result.targetFile).toContain('.cursor');
  });

  it('targets copilot instructions for the copilot adapter', async () => {
    const result = await generateAdapterContext({ project: sampleProject(), adapter: 'copilot' });
    expect(result.targetFile).toContain('copilot-instructions.md');
  });
});
