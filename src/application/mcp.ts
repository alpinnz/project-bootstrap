/**
 * MCP use case: read the project's configured MCP servers and the capability
 * catalog, and validate that configured servers are present in the catalog.
 */
import * as path from 'node:path';
import { MCP_CATALOG, MCP_SECURITY_POSTURE } from '../domain/mcp.js';
import type { FileSystem } from '../infrastructure/filesystem.js';

export interface McpServerRecord {
  readonly id: string;
  readonly scope: string;
  readonly access: string;
}

export interface McpProjectConfig {
  readonly servers: readonly McpServerRecord[];
}

export interface McpOptions {
  readonly root: string;
  readonly fs: FileSystem;
}

/** Read the project's MCP server configuration (.project-bootstrap/mcp/servers.json). */
export async function readMcpConfig(options: McpOptions): Promise<McpProjectConfig> {
  const cfg = await options.fs.readJson<McpProjectConfig>(
    path.join(options.root, '.project-bootstrap', 'mcp', 'servers.json'),
  );
  return cfg ?? { servers: [] };
}

export function renderMcpPosture(): string {
  return MCP_SECURITY_POSTURE;
}

export function renderCatalog(): string {
  const lines = ['MCP Capability Catalog', ''];
  for (const capability of MCP_CATALOG) {
    lines.push(
      `${capability.id} [${capability.category}]${capability.safeDefault ? ' (safe read-only)' : ''}`,
    );
    lines.push(`  reads:      ${capability.reads}`);
    if (capability.writes) lines.push(`  writes:     ${capability.writes}`);
    lines.push(`  credentials: ${capability.credentials}`);
    lines.push('');
  }
  return lines.join('\n');
}
