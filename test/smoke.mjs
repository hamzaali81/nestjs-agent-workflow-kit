#!/usr/bin/env node
/**
 * Smoke test: install the kit into a temp dir and verify every managed path
 * lands, then confirm `doctor` reports success. No external deps.
 */
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CLI = path.join(__dirname, '..', 'bin', 'install.mjs');
const MANIFEST = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'manifest.json'), 'utf8'));

let failures = 0;
const check = (cond, msg) => {
  console.log(`${cond ? 'ok  ' : 'FAIL'} - ${msg}`);
  if (!cond) failures++;
};

const run = (...args) => execFileSync('node', [CLI, ...args], { encoding: 'utf8' });

const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'nawk-smoke-'));

try {
  // init copies files
  const initOut = run('init', tmp);
  check(/Done\. \d+ file\(s\) written/.test(initOut), 'init reports files written');

  // every managed path exists in the target
  for (const p of MANIFEST.managedPaths) {
    check(fs.existsSync(path.join(tmp, p)), `managed path present: ${p}`);
  }

  // doctor exits 0 when everything is present
  let doctorOk = true;
  try {
    run('doctor', tmp);
  } catch {
    doctorOk = false;
  }
  check(doctorOk, 'doctor exits 0 on a complete install');

  // re-init skips existing files (idempotent)
  const reinit = run('init', tmp);
  check(/skipped/.test(reinit), 're-init skips existing files');

  // list mentions the kit
  check(/nestjs-agent-workflow-kit/.test(run('list')), 'list prints kit name');
} finally {
  fs.rmSync(tmp, { recursive: true, force: true });
}

console.log(failures === 0 ? '\nAll smoke checks passed.' : `\n${failures} check(s) failed.`);
process.exit(failures === 0 ? 0 : 1);
