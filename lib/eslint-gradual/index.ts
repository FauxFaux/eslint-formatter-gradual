#!/usr/bin/env node

import { ESLint } from 'eslint';
// @ts-expect-error types (@15) are way out of date (@16)
import { hideBin } from 'yargs/helpers';
import yargs = require('yargs');

import { loadAllowances, loadGradualConfig, writeAllowances } from '../files';
import { extractAllowances, mutateResults } from '../soften-rule';

import 'source-map-support/register';
import * as path from 'path';

(async function main() {
  const argv = yargs(hideBin(process.argv))
    .usage('Usage: $0 GLOBS...')
    .options({
      f: {
        type: 'string',
        default: 'builtin',
        describe: 'formatter (losing warnings)',
      },
      w: {
        type: 'boolean',
        default: false,
        describe: 'write allowances',
      },
    }).argv;

  const config = loadGradualConfig();
  const eslint = new ESLint({});
  const results = await eslint.lintFiles(argv._.map((s) => s.toString()));

  if (argv.w) {
    const allowances = extractAllowances(config, results);
    writeAllowances(config, allowances);
    const files = Object.keys(allowances).length;
    console.log(`Wrote allowances for ${files} file(s).`);
    return;
  }

  {
    const allowances = loadAllowances(config);
    mutateResults(config, allowances, results);
  }

  if (results.some((r) => r.errorCount > 0)) {
    process.exitCode = 1;
  }

  {
    let formatterName = argv.f;
    if ('builtin' === formatterName) {
      formatterName = path.join(__dirname, '../formatter');
    }
    const formatter = await eslint.loadFormatter(formatterName);
    const resultText = formatter.format(results);
    console.log(resultText);
  }
})().catch((error) => {
  process.exitCode = 1;
  console.error(error);
});
