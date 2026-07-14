/**
 * Minimal SARIF 2.1.0 builder so findings render in GitHub code scanning / CI.
 */
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { RULES } from './checks.mjs';

const SARIF_LEVEL = { error: 'error', warning: 'warning', info: 'note' };

export function toSarif(issues, dir) {
  const rules = Object.entries(RULES).map(([id, text]) => ({
    id,
    shortDescription: { text },
  }));

  const results = issues.map((i) => ({
    ruleId: i.ruleId,
    level: SARIF_LEVEL[i.level] ?? 'warning',
    message: { text: i.message },
    locations: [
      {
        physicalLocation: {
          artifactLocation: { uri: path.relative(dir, i.file).split(path.sep).join('/') },
          region: { startLine: i.line ?? 1 },
        },
      },
    ],
  }));

  return {
    $schema: 'https://json.schemastore.org/sarif-2.1.0.json',
    version: '2.1.0',
    runs: [
      {
        tool: {
          driver: {
            name: 'naw-analyze',
            informationUri: 'https://github.com/hamzaali81/nestjs-agent-workflow-kit',
            version: '0.1.0',
            rules,
          },
        },
        originalUriBaseIds: { SRCROOT: { uri: pathToFileURL(dir + path.sep).href } },
        results,
      },
    ],
  };
}
