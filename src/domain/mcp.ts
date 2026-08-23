/**
 * MCP strategy (plan §33-34). MCP is optional; native tools come first.
 * Default posture is READ ONLY, project-scoped, least privilege. Write access
 * requires an explicit requirement. Never store credentials or allow
 * destructive actions by default.
 *
 * This models the capability catalog and per-server posture.
 */

export const MCP_CATEGORIES = [
  'documentation',
  'source-control',
  'design',
  'api',
  'database',
  'observability',
  'cloud',
] as const;
export type McpCategory = (typeof MCP_CATEGORIES)[number];

export type McpAccess = 'read-only' | 'write' | 'read-write';

export interface McpCapability {
  readonly id: string;
  readonly name: string;
  readonly category: McpCategory;
  /** Whether it is project-scoped and read-only by default. */
  readonly safeDefault: boolean;
  /** What it can read. */
  readonly reads: string;
  /** What it can write (empty when read-only). */
  readonly writes: string;
  /** What credentials it can access. */
  readonly credentials: string;
}

/**
 * Recommended-built-in capability catalog. Entries are advisory; the actual
 * server configuration lives in `.project-bootstrap/mcp/servers.json`.
 */
export const MCP_CATALOG: readonly McpCapability[] = [
  {
    id: 'context7',
    name: 'Context7',
    category: 'documentation',
    safeDefault: true,
    reads: 'Third-party library/framework documentation',
    writes: '',
    credentials: 'None (public)',
  },
  {
    id: 'github',
    name: 'GitHub',
    category: 'source-control',
    safeDefault: true,
    reads: 'Issues, PRs, CI, repository metadata',
    writes: 'Nothing by default',
    credentials: 'OAuth / PAT',
  },
  {
    id: 'figma',
    name: 'Figma',
    category: 'design',
    safeDefault: true,
    reads: 'Design context, tokens, components',
    writes: 'Nothing by default',
    credentials: 'OAuth',
  },
  {
    id: 'database',
    name: 'Database (dev)',
    category: 'database',
    safeDefault: false,
    reads: 'Development/staging schema and data',
    writes: 'Nothing by default',
    credentials: 'DB credentials (dev only, least privilege)',
  },
  {
    id: 'sentry',
    name: 'Sentry',
    category: 'observability',
    safeDefault: true,
    reads: 'Production issues, stack traces, traces',
    writes: 'Nothing by default',
    credentials: 'Auth token',
  },
  {
    id: 'atlassian',
    name: 'Atlassian (Jira/Confluence)',
    category: 'documentation',
    safeDefault: true,
    reads: 'Jira issues, Confluence docs, Bitbucket',
    writes: 'Nothing by default',
    credentials: 'OAuth',
  },
];

export function getMcpCapability(id: string): McpCapability | undefined {
  return MCP_CATALOG.find((c) => c.id === id);
}

export function mcpCapabilitiesByCategory(category: McpCategory): McpCapability[] {
  return MCP_CATALOG.filter((c) => c.category === category);
}

export const MCP_SECURITY_POSTURE =
  'MCP defaults to READ ONLY, project-scoped, least privilege. ' +
  'Write access requires an explicit requirement. Never store credentials, ' +
  'expose secrets, or allow destructive actions by default.';
