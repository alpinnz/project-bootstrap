import { describe, expect, it } from 'vitest';
import { greet } from './index.js';

describe('greet', () => {
  it('greets a name', () => {
    expect(greet('world')).toBe('Hello, world!');
  });
});
