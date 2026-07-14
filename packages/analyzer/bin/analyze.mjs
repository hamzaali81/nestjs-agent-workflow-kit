#!/usr/bin/env node
/**
 * naw-analyze — deterministic NestJS architecture analyzer (v0.2 spike).
 *
 * Usage:
 *   naw-analyze [dir]                 Analyze a directory (default: ./src)
 *   naw-analyze [dir] --sarif out.json  Also write a SARIF report
 *   naw-analyze [dir] --json          Print findings as JSON
 *   naw-analyze [dir] --expect-issues Exit 0 only if issues are found (used by fixtures test)
 *   naw-analyze [dir] --max-warnings N  Fail if warnings exceed N (default: unlimited)
 */
import fs from 'node:fs';
import path from 'node:path';
import { runChecks } from '../src/checks.mjs';
import { toSarif } from '../src/sarif.mjs';

// Weights are transparent and fixed so the score is defensible and stable.
const WEIGHT = { error: 6, warning: 3, info: 1 };
const COLOR = process.stdout.isTTY
  ? { red: (s) => `\x1b[31m${s}\x1b[0m`, yellow: (s) => `\x1b[33m${s}\x1b[0m`, green: (s) => `\x1b[32m${s}\x1b[0m`, dim: (s) => `\x1b[2m${s}\x1b[0m`, bold: (s) => `\x1b[1m${s}\x1b[0m` }
  : { red: (s) => s, yellow: (s) => s, green: (s) => s, dim: (s) => s, bold: (s) => s };

function parse(argv) {
  const opts = { dir: null, sarif: null, json: false, expectIssues: false, maxWarnings: Infinity };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--sarif') opts.sarif = argv[++i];
    else if (a === '--json') opts.json = true;
    else if (a === '--expect-issues') opts.expectIssues = true;
    else if (a === '--max-warnings') opts.maxWarnings = Number(argv[++i]);
    else if (!a.startsWith('-')) opts.dir = a;
  }
  return opts;
}

function score(issues) {
  const penalty = issues.reduce((sum, i) => sum + (WEIGHT[i.level] ?? 0), 0);
  return Math.max(0, 100 - penalty);
}

function main() {
  const opts = parse(process.argv.slice(2));
  const dir = path.resolve(opts.dir ?? 'src');

  if (!fs.existsSync(dir)) {
    console.error(`Directory not found: ${dir}`);
    process.exit(2);
  }

  const { issues, fileCount } = runChecks(dir);
  const errors = issues.filter((i) => i.level === 'error').length;
  const warnings = issues.filter((i) => i.level === 'warning').length;
  const s = score(issues);

  if (opts.sarif) {
    fs.writeFileSync(opts.sarif, JSON.stringify(toSarif(issues, dir), null, 2));
  }

  if (opts.json) {
    console.log(JSON.stringify({ dir, fileCount, score: s, errors, warnings, issues }, null, 2));
  } else {
    console.log(COLOR.bold(`\nnaw analyze — ${dir}`));
    console.log(COLOR.dim(`${fileCount} source file(s) scanned\n`));
    if (issues.length === 0) {
      console.log(COLOR.green('No issues found.'));
    } else {
      for (const i of issues.sort((a, b) => a.file.localeCompare(b.file) || a.line - b.line)) {
        const tag = i.level === 'error' ? COLOR.red('error  ') : COLOR.yellow('warning');
        const loc = `${path.relative(dir, i.file)}:${i.line}`;
        console.log(`  ${tag} ${COLOR.dim(loc)}  [${i.ruleId}]`);
        console.log(`          ${i.message}`);
      }
    }
    const scoreColor = s >= 85 ? COLOR.green : s >= 60 ? COLOR.yellow : COLOR.red;
    console.log(`\n  ${errors} error(s), ${warnings} warning(s)`);
    console.log(`  ${COLOR.bold('Architecture score')} (heuristic): ${scoreColor(s + '/100')}`);
    if (opts.sarif) console.log(COLOR.dim(`  SARIF written to ${opts.sarif}`));
    console.log();
  }

  // Exit codes: for the fixtures self-test we assert issues exist; otherwise
  // fail CI on any error or on exceeding the warning budget.
  if (opts.expectIssues) {
    process.exit(issues.length > 0 ? 0 : 1);
  }
  process.exit(errors > 0 || warnings > opts.maxWarnings ? 1 : 0);
}

main();
