import { describe, expect, it } from 'vitest';
import { managedSection, upsertManagedSection } from './sync-project.js';

describe('sync managed sections', () => {
  it('wraps content in markers', () => {
    const section = managedSection('hello');
    expect(section).toContain('<!-- project-bootstrap:start -->');
    expect(section).toContain('hello');
    expect(section).toContain('<!-- project-bootstrap:end -->');
  });

  it('replaces an existing managed section', () => {
    const original = `# Docs\n\n${managedSection('old')}\n`;
    const next = upsertManagedSection(original, 'new');
    expect(next).toContain('new');
    expect(next).not.toContain('old');
    expect((next.match(/project-bootstrap:start/g) || []).length).toBe(1);
  });

  it('appends a managed section when none exists', () => {
    const next = upsertManagedSection('# Docs', 'content');
    expect(next).toContain('# Docs');
    expect(next).toContain('content');
  });
});
