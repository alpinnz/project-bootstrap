#!/usr/bin/env node
/**
 * project-bootstrap CLI.
 *
 * Commands:
 *   create   — create a new project with the foundation
 *   init     — add the foundation to an existing project
 *   inspect  — understand a repository
 *   doctor   — validate repository health
 *   sync     — update managed artifacts
 *   roles    — list agent roles
 *   gates    — evaluate quality gates for a change
 *   context  — show the context plan for a level
 *   adapters — generate AI adapter context
 */
import { createRequire } from 'node:module';
import { Command } from 'commander';
import { FileSystem } from '../infrastructure/filesystem.js';
import {
  createProject,
  initializeProject,
  inspectProject,
  runDoctor,
  syncProject,
  generateAgentsMd,
  runQualityGates,
  renderGateChecklist,
  generateAdapterContext,
  writeAdapterContext,
  readMcpConfig,
  renderMcpPosture,
  renderCatalog,
  inspectSpecKit,
  analyzeProject,
  runDepcheck,
  renderDepcheck,
  suggestImprovements,
  renderSuggestions,
  addCapability,
} from '../application/index.js';
import { renderValidation } from '../domain/validation-result.js';
import { AGENT_ROLES, type AgentRole } from '../domain/agent-role.js';
import { renderContextPlan, type ContextLevel } from '../domain/context-level.js';
import type { TriggerTopic } from '../domain/quality-gate.js';
import type { AiAdapterId } from '../adapters/registry.js';
import type { ProjectContext } from '../domain/project-context.js';

const fs = new FileSystem();
const program = new Command();

// Read the package version at runtime so `--version` always matches the
// installed package, rather than a hardcoded value that drifts across releases.
const require = createRequire(import.meta.url);
const packageJson = require('../../package.json') as { version: string };

program
  .name('project-bootstrap')
  .description('Software Project Operating Foundation')
  .version(packageJson.version);

program
  .command('create')
  .description('Create a new project with the foundation')
  .argument('[dir]', 'target directory', '.')
  .option('--dry-run', 'show the plan without applying it')
  .option('--capabilities <ids>', 'comma-separated capability ids to enable (mcp,testing,speckit)')
  .action(async (dir: string, opts: { dryRun?: boolean; capabilities?: string }) => {
    const targetDir = dir;
    const caps = opts.capabilities
      ? opts.capabilities.split(',').map((s) => s.trim()).filter(Boolean)
      : undefined;
    const result = await createProject({ targetDir, dryRun: opts.dryRun, capabilities: caps });
    console.log(result.planText);
    if (result.dryRun) {
      console.log('Dry run — nothing was applied.');
      return;
    }
    const report = result.report!;
    console.log(`Created: ${report.created.length}  Updated: ${report.updated.length}`);
  });

program
  .command('init')
  .description('Add the foundation to an existing project')
  .argument('[dir]', 'project root', '.')
  .option('--dry-run', 'show the plan without applying it')
  .option('--force', 'overwrite existing files with templates (safe default skips)')
  .option('--capabilities <ids>', 'comma-separated capability ids to enable (mcp,testing,speckit)')
  .action(async (dir: string, opts: { dryRun?: boolean; force?: boolean; capabilities?: string }) => {
    const caps = opts.capabilities
      ? opts.capabilities.split(',').map((s) => s.trim()).filter(Boolean)
      : undefined;
    const result = await initializeProject({
      root: dir,
      dryRun: opts.dryRun,
      force: opts.force,
      capabilities: caps,
    });
    console.log(result.planText);
    if (result.dryRun) {
      console.log('Dry run — nothing was applied.');
      return;
    }
    const report = result.report!;
    console.log(
      `Applied: ${report.applied}  Created: ${report.created.length}  Updated: ${report.updated.length}  Skipped: ${report.skipped}  Conflicts: ${report.conflicted}`,
    );
  });

program
  .command('inspect')
  .description('Understand a repository')
  .argument('[dir]', 'project root', '.')
  .action(async (dir: string) => {
    const project = await inspectProject({ root: dir, fs });
    printInspect(project);
  });

program
  .command('doctor')
  .description('Validate repository health')
  .argument('[dir]', 'project root', '.')
  .action(async (dir: string) => {
    const report = await runDoctor({ root: dir, fs });
    console.log(renderValidation(report.categories));
  });

program
  .command('sync')
  .description('Update managed artifacts')
  .argument('[dir]', 'project root', '.')
  .action(async (dir: string) => {
    const result = await syncProject({ root: dir, fs });
    console.log('Sync');
    for (const file of result.syncedFiles) console.log(`✓ ${file}`);
    for (const file of result.skipped) console.log(`- ${file} (no managed section)`);
  });

program
  .command('generate-agents')
  .description('Generate AGENTS.md content for a project (dev/debugging helper)')
  .argument('[dir]', 'project root', '.')
  .action(async (dir: string) => {
    const project = await inspectProject({ root: dir, fs });
    console.log(generateAgentsMd(project));
  });

program
  .command('roles')
  .description('List agent roles and responsibilities')
  .action(() => {
    printRoles(AGENT_ROLES);
  });

program
  .command('gates')
  .description('Evaluate which quality gates apply to a change')
  .argument('[topics...]', 'comma-separated change topics, e.g. auth,payment')
  .action((topics: string[]) => {
    const flat = topics.flatMap((t) => t.split(','));
    const result = runQualityGates({ topics: flat as TriggerTopic[] });
    console.log(renderGateChecklist(result.evaluations));
    console.log(`\nApplicable gates: ${result.applicable.length}`);
  });

program
  .command('context')
  .description('Show the context plan for a context level (0-4)')
  .argument('[level]', 'context level 0-4', '2')
  .action((level: string) => {
    const parsed = parseInt(level, 10);
    const maxLevel = (Number.isNaN(parsed) ? 2 : Math.min(4, Math.max(0, parsed))) as ContextLevel;
    console.log(renderContextPlan(maxLevel));
  });

program
  .command('adapters')
  .description('Generate AI adapter context files for a project')
  .argument('[dir]', 'project root', '.')
  .option('--adapter <id>', 'only generate a specific adapter (claude|codex|cursor|copilot)')
  .option('--write', 'write the generated file(s) to disk (default prints only)')
  .action(async (dir: string, opts: { adapter?: string; write?: boolean }) => {
    const project = await inspectProject({ root: dir, fs });
    const ids: AiAdapterId[] = ['claude', 'codex', 'cursor', 'copilot'];
    for (const id of ids) {
      if (opts.adapter && opts.adapter !== id) continue;
      const result = await generateAdapterContext({ project, adapter: id });
      if (opts.write) {
        await writeAdapterContext({ project, adapter: id, fs });
        console.log(`✓ Wrote ${result.targetFile}`);
      } else {
        console.log(`--- ${id} (${result.targetFile}) ---`);
        console.log(result.content);
        console.log('');
      }
    }
  });

const mcp = program
  .command('mcp')
  .description('MCP strategy and server configuration');

mcp
  .command('catalog')
  .description('List the recommended MCP capability catalog')
  .action(() => {
    console.log(renderCatalog());
    console.log(renderMcpPosture());
  });

mcp
  .command('status')
  .description('Show the project MCP configuration and posture')
  .argument('[dir]', 'project root', '.')
  .action(async (dir: string) => {
    const config = await readMcpConfig({ root: dir, fs });
    console.log('MCP Posture');
    console.log(renderMcpPosture());
    console.log('');
    console.log('Configured servers:');
    if (config.servers.length === 0) {
      console.log('  (none configured)');
    } else {
      for (const server of config.servers) {
        console.log(`  ${server.id} — access: ${server.access}, scope: ${server.scope}`);
      }
    }
  });

program
  .command('add')
  .description('Add a capability to an existing project (conservative by default)')
  .argument('<capability>', 'capability id (testing, mcp, speckit, typescript, react, go)')
  .argument('[dir]', 'project root', '.')
  .option('--dry-run', 'show the plan without applying it')
  .option('--force', 'overwrite existing files from the capability overlay')
  .action(
    async (
      capability: string,
      dir: string,
      opts: { dryRun?: boolean; force?: boolean },
    ) => {
      const result = await addCapability({
        root: dir,
        capability,
        dryRun: opts.dryRun,
        force: opts.force,
      });
      console.log(result.planText);
      if (result.dryRun) {
        console.log('Dry run — nothing was applied.');
        return;
      }
      const report = result.report!;
      console.log(
        `Applied: ${report.applied}  Created: ${report.created.length}  Updated: ${report.updated.length}  Skipped: ${report.skipped}  Conflicts: ${report.conflicted}`,
      );
    },
  );

program
  .command('speckit')
  .description('Report Spec Kit integration status')
  .argument('[dir]', 'project root', '.')
  .action(async (dir: string) => {
    const report = await inspectSpecKit({ root: dir, fs });
    console.log('Spec Kit Integration');
    console.log(`${report.enabled ? '✓' : '-'} Capability: ${report.enabled ? 'enabled' : 'not detected'}`);
    console.log(`${report.specsDir ? '✓' : '-'} specs/ directory: ${report.specsDir ? 'present' : 'absent'}`);
    console.log(`  ${report.summary}`);
  });

program
  .command('analyze')
  .description('Analyze repository architecture')
  .argument('[dir]', 'project root', '.')
  .action(async (dir: string) => {
    const report = await analyzeProject({ root: dir, fs });
    console.log('Architecture Analysis');
    console.log(`Language: ${report.tooling.language}   Framework: ${report.tooling.framework}`);
    console.log(`Runtime: ${report.tooling.runtime}   Package manager: ${report.tooling.packageManager}`);
    console.log(`Foundation: ${report.foundationPresent ? 'present' : 'missing'}`);
    console.log('');
    console.log('Top-level structure:');
    for (const entry of report.topLevel) {
      console.log(`  ${entry.type === 'dir' ? '📁' : '📄'} ${entry.name}`);
    }
    if (report.entryPoints.length > 0) {
      console.log('');
      console.log('Entry points:');
      for (const ep of report.entryPoints) console.log(`  ${ep}`);
    }
    if (report.hotspots.length > 0) {
      console.log('');
      console.log('Hotspots (review):');
      for (const h of report.hotspots) console.log(`  ${h}`);
    }
  });

program
  .command('depcheck')
  .description('Analyze dependency health')
  .argument('[dir]', 'project root', '.')
  .action(async (dir: string) => {
    const report = await runDepcheck({ root: dir, fs });
    console.log(renderDepcheck(report));
  });

program
  .command('suggest')
  .description('Suggest repository improvements')
  .argument('[dir]', 'project root', '.')
  .action(async (dir: string) => {
    const report = await suggestImprovements({ root: dir, fs });
    console.log(renderSuggestions(report));
  });

function printRoles(roles: readonly AgentRole[]): void {
  console.log('Agent Roles');
  for (const role of roles) {
    console.log(`\n${role.name} (${role.id})`);
    console.log(`  ${role.responsibility}`);
    for (const check of role.checks) {
      console.log(`  • ${check}`);
    }
  }
}

function printInspect(project: ProjectContext): void {
  console.log('Repository');
  console.log(`Language: ${project.tooling.language}`);
  console.log(`Framework: ${project.tooling.framework}`);
  console.log(`Runtime: ${project.tooling.runtime}`);
  console.log(`Package Manager: ${project.tooling.packageManager}`);
  console.log(`Existing project: ${project.isExisting ? 'yes' : 'no'}`);
  console.log('');
  console.log('Commands:');
  if (project.tooling.commands.length === 0) {
    console.log('  (none detected)');
  } else {
    for (const command of project.tooling.commands) {
      console.log(`  ${command}`);
    }
  }
}

async function main(): Promise<void> {
  await program.parseAsync(process.argv);
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`Error: ${message}`);
  process.exitCode = 1;
});
