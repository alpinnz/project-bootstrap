import { describe, expect, it } from 'vitest';
import { capabilityFiles, composedTemplateFiles, ownerDirFor, readComposedFile } from './template-loader.js';

describe('template composition', () => {
  it('includes base templates', () => {
    const files = composedTemplateFiles();
    expect(files).toContain('AGENTS.md');
    expect(files).toContain('.project-bootstrap/constitution.md');
  });

  it('adds capability overlay files when the capability is enabled', () => {
    const files = composedTemplateFiles(['testing']);
    expect(files).toContain('.project-bootstrap/rules/testing-policy.md');
  });

  it('does not leak capability files when not enabled', () => {
    const files = composedTemplateFiles();
    expect(files).not.toContain('.project-bootstrap/rules/testing-policy.md');
  });

  it('adds mcp servers config when the mcp capability is enabled', () => {
    const files = composedTemplateFiles(['mcp']);
    expect(files).toContain('.project-bootstrap/mcp/servers.json');
  });

  it('adds speckit templates when the speckit capability is enabled', () => {
    const files = composedTemplateFiles(['speckit']);
    expect(files).toContain('.project-bootstrap/rules/spec-kit.md');
    expect(files).toContain('docs/specs.md');
  });

  it('resolve composed content', () => {
    const content = readComposedFile('.project-bootstrap/rules/testing-policy.md', ['testing']);
    expect(content).toContain('Testing Policy');
  });

  it('resolves owner dir to the capability overlay', () => {
    const owner = ownerDirFor('.project-bootstrap/rules/testing-policy.md', ['testing']);
    expect(owner).toMatch(/capabilities[\\/]testing$/);
  });

  it('provides typescript scaffold files', () => {
    const files = composedTemplateFiles(['typescript']);
    expect(files).toContain('package.json');
    expect(files).toContain('tsconfig.json');
    expect(files).toContain('src/index.ts');
  });

  it('react overlay shadows package.json/tsconfig and adds react entry', () => {
    const files = composedTemplateFiles(['typescript', 'react']);
    expect(files).toContain('src/main.tsx');
    expect(files).toContain('src/App.tsx');
    expect(files).toContain('index.html');
  });

  it('provides go scaffold files', () => {
    const files = composedTemplateFiles(['go']);
    expect(files).toContain('go.mod');
    expect(files).toContain('main.go');
    expect(files).toContain('main_test.go');
  });

  it('lists files for a specific capability overlay', () => {
    const files = capabilityFiles('typescript');
    expect(files).toContain('src/index.ts');
  });
});
