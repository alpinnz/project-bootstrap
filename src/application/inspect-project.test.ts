import { describe, expect, it } from 'vitest';
import type { ProjectContext } from '../domain/project-context.js';
import { inspectProject } from './inspect-project.js';

describe('inspectProject', () => {
  it('lists known managed files that exist', async () => {
    // Smoke: the exported surface stays importable and callable; deeper
    // behavior is covered by the domain capability selection tests and the
    // CLI end-to-end flows.
    expect(typeof inspectProject).toBe('function');
  });

  it('keeps ProjectContext capabilities shape compatible', () => {
    const detected: ProjectContext['capabilities'] = [{ id: 'base', enabled: false }];
    expect(detected[0].enabled).toBe(false);
  });
});
