/**
 * Adapter registry exposes all supported AI adapters.
 */
import type { AiAdapter, AiAdapterId } from './ai-adapter.js';
import { ClaudeAdapter } from './claude.js';
import { CodexAdapter, CopilotAdapter, CursorAdapter } from './others.js';

export const allAdapters: readonly AiAdapter[] = [new ClaudeAdapter(), new CodexAdapter(), new CursorAdapter(), new CopilotAdapter()];

export function getAdapter(id: AiAdapterId): AiAdapter {
  const found = allAdapters.find((adapter) => adapter.id === id);
  if (!found) throw new Error(`Unknown adapter: ${id}`);
  return found;
}

export { ADAPTER_FILE, type AiAdapter, type AiAdapterId } from './ai-adapter.js';
