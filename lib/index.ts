import * as fs from 'fs';

import { transformResult } from './allow-until';
import { extendedStylish } from './extended-stylish';
import {
  Allowance,
  Config,
  reDoCounts,
  ResultWithWarning,
  stripPrefix,
} from './allow-until-reporter';

export = (results: ResultWithWarning[]): string => {
  const root = process.cwd() + '/';
  const allowances: Record<string, Allowance> = JSON.parse(
    fs.readFileSync('.eslint-allowances.json').toString('utf-8'),
  );

  const config: Config = JSON.parse(
    fs.readFileSync('.eslint-gradual.json').toString('utf-8'),
  );

  for (const result of results) {
    const path = stripPrefix(root, result.filePath);
    const allowance = allowances[path];
    if (!allowance) {
      continue;
    }
    transformResult(result, allowance, config.softenRule);
  }

  reDoCounts(results);

  return extendedStylish(results);
};
