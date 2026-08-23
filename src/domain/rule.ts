/**
 * A Rule is a single engineering directive (coding, architecture, testing,
 * security, dependency, documentation, git, agent, tools). Rules are stored as
 * markdown under `.project-bootstrap/rules/` and are the operational layer of
 * the constitution.
 */
export interface Rule {
  /** Rule category slug, e.g. "security". */
  readonly category: RuleCategory;
  /** Short imperative title, e.g. "Never hardcode secrets". */
  readonly title: string;
  /** The directive body (markdown). */
  readonly body: string;
}

export type RuleCategory = 'code' | 'architecture' | 'testing' | 'security' | 'dependencies' | 'documentation' | 'git' | 'agent' | 'tools';
