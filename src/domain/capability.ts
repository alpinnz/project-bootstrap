/**
 * Capability represents a reusable, technology-independent building block of
 * the foundation (e.g. "testing", "mcp", "speckit"). Capabilities compose to
 * form a template rather than a technology-hardcoded giant template.
 *
 * This is the core of Design Decision 4: capability over technology hardcoding.
 */
export interface Capability {
  /** Stable identifier, e.g. "base", "typescript", "react", "testing". */
  readonly id: string;
  /** Short human-readable name. */
  readonly name: string;
  /** What the capability provides. */
  readonly description: string;
  /** Optional dependency capability ids required for this capability to work. */
  readonly requires?: readonly string[];
}

/** Built-in capabilities that map to template overlay directories. */
export const BUILTIN_CAPABILITIES: readonly Capability[] = [
  {
    id: 'base',
    name: 'Base',
    description: 'Core foundation: constitution, rules, workflows, gates, agents, context.',
  },
  {
    id: 'testing',
    name: 'Testing',
    description: 'Testing policy overlay.',
  },
  {
    id: 'governance',
    name: 'Governance',
    description: 'Quality governance: ESLint, Prettier, Husky, lint-staged, and commitlint configs for consistent engineering practices.',
  },
  {
    id: 'mcp',
    name: 'MCP',
    description: 'MCP server configuration with read-only, least-privilege defaults.',
  },
  {
    id: 'speckit',
    name: 'Spec Kit',
    description: 'Specification-driven development integration.',
  },
  {
    id: 'typescript',
    name: 'TypeScript (Node)',
    description: 'TypeScript/Node scaffold: tsconfig, tsx entry, vitest.',
    requires: [],
  },
  {
    id: 'react',
    name: 'React',
    description: 'React + Vite scaffold: main.tsx, App, vite.config.',
    requires: ['typescript'],
  },
  {
    id: 'go',
    name: 'Go',
    description: 'Go service/CLI scaffold: go.mod, main.go, test.',
  },
];

export function getBuiltinCapability(id: string): Capability | undefined {
  return BUILTIN_CAPABILITIES.find((c) => c.id === id);
}
