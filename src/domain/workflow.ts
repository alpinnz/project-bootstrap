/**
 * Development Workflow describes the sequence of steps a developer or coding
 * agent should follow for a task, scaled by risk/complexity.
 *
 * Plan defines three complexity levels: small, standard, high-risk.
 */
export type WorkflowLevel = 'small' | 'standard' | 'high-risk';

export interface WorkflowStep {
  readonly name: string;
  readonly description: string;
}

export interface Workflow {
  readonly level: WorkflowLevel;
  readonly steps: readonly WorkflowStep[];
}

export const WORKFLOWS: Record<WorkflowLevel, Workflow> = {
  small: {
    level: 'small',
    steps: [
      { name: 'Understand', description: 'Understand the requirement and current code.' },
      { name: 'Implement', description: 'Make the smallest coherent change.' },
      { name: 'Verify', description: 'Run the relevant verification for the change.' },
    ],
  },
  standard: {
    level: 'standard',
    steps: [
      { name: 'Understand', description: 'Understand the requirement and current code.' },
      { name: 'Plan', description: 'Define the approach and affected files.' },
      { name: 'Implement', description: 'Make the smallest coherent change.' },
      { name: 'Verify', description: 'Run the relevant verification for the change.' },
      { name: 'Review', description: 'Review the diff against conventions.' },
    ],
  },
  'high-risk': {
    level: 'high-risk',
    steps: [
      { name: 'Understand', description: 'Understand the requirement and current code.' },
      { name: 'Plan', description: 'Define approach, risks and rollback plan.' },
      { name: 'Implement', description: 'Make the smallest coherent change.' },
      { name: 'Test', description: 'Add/run focused and regression tests.' },
      { name: 'Review', description: 'Review for correctness, security and reliability.' },
      { name: 'Finalize', description: 'Run full verification and finalize.' },
    ],
  },
};
