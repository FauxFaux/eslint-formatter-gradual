import type { ESLint, Linter } from 'eslint';

import type { Allowance, Allowances, Config, SoftenUntil } from './files';
import {
  hashSource,
  reDoCounts,
  severityToNumber,
  stripPrefix,
} from './result';

export interface ResultWithWarning extends ESLint.LintResult {
  messages: MessageWithWarning[];
}

export interface MessageWithWarning extends Linter.LintMessage {
  severityWarning?: string;
}

export function mutateResults(
  config: Config,
  allowances: Allowances,
  results: ResultWithWarning[],
): void {
  for (const result of results) {
    const path = stripPrefix(config, result.filePath);
    const allowance = allowances[path];
    if (!allowance) {
      continue;
    }
    mutateResult(result, allowance, config.softenRule);
  }

  reDoCounts(results);
}

function mutateResult(
  result: ResultWithWarning,
  allowance: Allowance,
  softenRule: SoftenUntil,
): void {
  if (0 === result.messages.length || !allowance) {
    return;
  }

  const oldSeverity = severityToNumber('error');
  const newSeverity = severityToNumber('warn');
  const digest = hashSource(result);

  for (const message of result.messages) {
    if (!message.ruleId) {
      continue;
    }

    const mode = softenRule[message.ruleId];
    if (!mode || message.severity !== oldSeverity) {
      continue;
    }

    switch (mode) {
      case 'until-new-file':
        if (allowance?.rules?.[message.ruleId]) {
          message.severity = newSeverity;
          message.severityWarning = 'ignored for file';
        }
        break;
      case 'until-touched':
        if (!allowance) {
          break;
        }
        if (allowance.digest === digest) {
          message.severity = newSeverity;
          message.severityWarning = 'ignored until touched';
        } else {
          message.severityWarning = 'was ignored until touched';
        }
        break;
      default:
        throw new Error('invalid condition: ' + mode);
    }
  }
}

export function extractAllowances(
  config: Pick<Config, 'rootDir'>,
  results: ESLint.LintResult[],
): Allowances {
  const allowances: Allowances = {};
  for (const result of results) {
    if (!result.errorCount) {
      continue;
    }

    const path = stripPrefix(config, result.filePath);
    const allowance: Allowance = {
      digest: hashSource(result),
      rules: {},
    };

    for (const message of result.messages) {
      if (!message.ruleId) {
        continue;
      }

      if (message.severity !== 2) {
        continue;
      }

      allowance.rules[message.ruleId] = true;
    }

    allowances[path] = allowance;
  }
  return allowances;
}
