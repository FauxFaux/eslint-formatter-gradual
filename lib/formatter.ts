import { extendedStylish } from './extended-stylish';
import { loadAllowances, loadGradualConfig } from './files';
import { mutateResults, ResultWithWarning } from './soften-rule';

export = (results: ResultWithWarning[]): string => {
  const config = loadGradualConfig();
  const allowances = loadAllowances(config);
  mutateResults(config, allowances, results);
  return extendedStylish(results);
};
