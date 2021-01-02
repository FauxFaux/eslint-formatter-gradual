import * as crypto from 'crypto';

import type {
  Allowance,
  ResultWithWarning,
  SoftenUntil,
} from './allow-until-reporter';
import { severityToNumber } from './allow-until-reporter';

// const overrides: Record<string, Until> = {
//   '@typescript-eslint/ban-types': 'until-new-file',
//   'jest/require-top-level-describe': 'until-touched',
// };

export function transformResult(
  result: ResultWithWarning,
  allowance: Allowance,
  softenRule: SoftenUntil,
): void {
  if (0 === result.messages.length || !allowance) {
    return;
  }

  if (!result.source) {
    // TODO: just read it in?
    throw new Error('no source found for ' + result.filePath);
  }

  const oldSeverity = severityToNumber('error');
  const newSeverity = severityToNumber('warn');
  const digest = hash(result.source);

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
          message.severityWarning = 'in this file only';
        }
        break;
      case 'until-touched':
        if (!allowance) {
          break;
        }
        if (allowance.digest === digest) {
          message.severity = newSeverity;
          message.severityWarning = 'disabled until edited';
        } else {
          message.severityWarning = 'was disabled until edited';
        }
        break;
      default:
        throw new Error('invalid condition: ' + mode);
    }
  }
}

function hash(content: string): string {
  const sha512 = crypto.createHash('sha512');
  sha512.update(content);
  return sha512.digest('hex');
}
