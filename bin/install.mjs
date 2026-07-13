#!/usr/bin/env node
/**
 * nestjs-agent-workflow-kit CLI — install shared AGENTS.md, docs/standards, and .agents/skills.
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const KIT_ROOT = path.resolve(__dirname, '..');

const HELP = `nestjs-agent-workflow-kit — shared agent standards and skills for NestJS

Usage:
  nestjs-awkit init [directory]     Copy managed files into a project (default: cwd)
  nestjs-awkit update [directory]   Refresh managed files from the kit
  nestjs-awkit list                 List standards and skills in this kit
  nestjs-awkit doctor [directory]   Verify managed paths exist in a project

Options:
  --force, -f   Overwrite existing files (init skips by default; update overwrites by default)
  --help, -h    Show this help

Examples:
  npx github:hamzaali81/nestjs-agent-workflow-kit init
  npx nestjs-agent-workflow-kit init ./my-nest-app
  npx nestjs-agent-workflow-kit update --no-force
`;

function parseArgs(argv) {
  const args = [...argv];
  const flags = new Set();
  const positional = [];

  for (const arg of args) {
    if (arg === '--force' || arg === '-f') {
      flags.add('force');
    } else if (arg === '--no-force') {
      flags.add('no-force');
    } else if (arg === '--help' || arg === '-h') {
      flags.add('help');
    } else if (arg.startsWith('-')) {
      throw new Error(`Unknown option: ${arg}`);
    } else {
      positional.push(arg);
    }
  }

  return { flags, positional };
}

async function loadManifest() {
  const manifestPath = path.join(KIT_ROOT, 'manifest.json');
  const raw = await fs.readFile(manifestPath, 'utf8');
  return JSON.parse(raw);
}

async function pathExists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function copyEntry(src, dest, { force }) {
  const stat = await fs.stat(src);

  if (stat.isDirectory()) {
    await fs.mkdir(dest, { recursive: true });
    const entries = await fs.readdir(src, { withFileTypes: true });
    let copied = 0;
    let skipped = 0;

    for (const entry of entries) {
      const result = await copyEntry(
        path.join(src, entry.name),
        path.join(dest, entry.name),
        { force },
      );
      copied += result.copied;
      skipped += result.skipped;
    }

    return { copied, skipped };
  }

  const destExists = await pathExists(dest);
  if (destExists && !force) {
    console.log(`  skip (exists): ${path.relative(process.cwd(), dest)}`);
    return { copied: 0, skipped: 1 };
  }

  await fs.mkdir(path.dirname(dest), { recursive: true });
  await fs.copyFile(src, dest);
  console.log(`  ${destExists ? 'updated' : 'wrote'}: ${path.relative(process.cwd(), dest)}`);
  return { copied: 1, skipped: 0 };
}

async function installManaged(targetDir, { force, label }) {
  const manifest = await loadManifest();
  const prevCwd = process.cwd();

  try {
    process.chdir(targetDir);
    console.log(`${label} nestjs-agent-workflow-kit v${manifest.version} → ${path.resolve(targetDir)}\n`);

    let totalCopied = 0;
    let totalSkipped = 0;

    for (const managed of manifest.managedPaths) {
      const src = path.join(KIT_ROOT, managed);
      const dest = path.join(targetDir, managed);

      if (!(await pathExists(src))) {
        console.warn(`  warn: missing in kit: ${managed}`);
        continue;
      }

      const srcStat = await fs.stat(src);
      console.log(managed + (srcStat.isDirectory() ? '/' : ''));
      const { copied, skipped } = await copyEntry(src, dest, { force });
      totalCopied += copied;
      totalSkipped += skipped;
    }

    console.log(`\nDone. ${totalCopied} file(s) written, ${totalSkipped} skipped.`);
    if (totalSkipped > 0 && !force) {
      console.log('Re-run with --force to overwrite existing files.');
    }
    console.log(
      '\nTip: add AGENTS.local.md for project-specific overrides (not managed by the kit).',
    );
  } finally {
    process.chdir(prevCwd);
  }
}

async function cmdInit(targetDir, { force }) {
  await installManaged(targetDir, { force, label: 'Installing' });
}

async function cmdUpdate(targetDir, { force }) {
  await installManaged(targetDir, { force, label: 'Updating' });
}

async function walkFiles(dir, base = dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await walkFiles(full, base)));
    } else {
      files.push(path.relative(base, full));
    }
  }

  return files.sort();
}

async function cmdList() {
  const manifest = await loadManifest();
  console.log(`nestjs-agent-workflow-kit v${manifest.version}\n`);
  console.log('Managed paths (copied on init/update):');
  for (const p of manifest.managedPaths) {
    console.log(`  - ${p}`);
  }

  const standardsDir = path.join(KIT_ROOT, 'docs/standards');
  if (await pathExists(standardsDir)) {
    console.log('\nStandards (docs/standards/):');
    for (const file of await walkFiles(standardsDir)) {
      console.log(`  - ${file}`);
    }
  }

  const skillsDir = path.join(KIT_ROOT, '.agents/skills');
  if (await pathExists(skillsDir)) {
    const skills = await fs.readdir(skillsDir, { withFileTypes: true });
    console.log('\nSkills (.agents/skills/):');
    for (const skill of skills.filter((e) => e.isDirectory()).sort((a, b) => a.name.localeCompare(b.name))) {
      const skillMd = path.join(skillsDir, skill.name, 'SKILL.md');
      const hasSkill = await pathExists(skillMd);
      console.log(`  - ${skill.name}${hasSkill ? '' : ' (no SKILL.md)'}`);
    }
  }
}

async function cmdDoctor(targetDir) {
  const manifest = await loadManifest();
  const resolved = path.resolve(targetDir);
  console.log(`Checking ${resolved} (kit v${manifest.version})\n`);

  let ok = true;

  for (const managed of manifest.managedPaths) {
    const dest = path.join(resolved, managed);
    const exists = await pathExists(dest);

    if (!exists) {
      console.log(`  missing: ${managed}`);
      ok = false;
      continue;
    }

    const stat = await fs.stat(dest);
    if (managed.endsWith('.md')) {
      console.log(`  ok: ${managed} (file)`);
    } else if (stat.isDirectory()) {
      const count = (await walkFiles(dest)).length;
      console.log(`  ok: ${managed}/ (${count} file(s))`);
    } else {
      console.log(`  ok: ${managed}`);
    }
  }

  const localAgents = path.join(resolved, 'AGENTS.local.md');
  if (await pathExists(localAgents)) {
    console.log(`  optional: AGENTS.local.md present`);
  } else {
    console.log(`  optional: AGENTS.local.md not found (create for project overrides)`);
  }

  console.log(ok ? '\nAll managed paths present.' : '\nSome managed paths are missing. Run: init');
  process.exitCode = ok ? 0 : 1;
}

async function main() {
  const argv = process.argv.slice(2);

  if (argv.length === 0 || argv.includes('--help') || argv.includes('-h')) {
    console.log(HELP);
    return;
  }

  const [command, ...rest] = argv;
  const { flags, positional } = parseArgs(rest);

  const targetDir = path.resolve(positional[0] ?? process.cwd());
  const force = flags.has('force');
  const noForce = flags.has('no-force');

  switch (command) {
    case 'init':
      await cmdInit(targetDir, { force });
      break;
    case 'update':
      await cmdUpdate(targetDir, { force: noForce ? false : true });
      break;
    case 'list':
      await cmdList();
      break;
    case 'doctor':
      await cmdDoctor(targetDir);
      break;
    default:
      console.error(`Unknown command: ${command}\n`);
      console.log(HELP);
      process.exitCode = 1;
  }
}

main().catch((err) => {
  console.error(err.message ?? err);
  process.exitCode = 1;
});
