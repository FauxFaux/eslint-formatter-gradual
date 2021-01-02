import chalk = require('chalk');
import stripAnsi = require('strip-ansi');
import table = require('text-table');

import type { ESLint } from 'eslint';
type LintResult = ESLint.LintResult;

// "inspired by" https://github.com/eslint/eslint/blob/aab1b840f9cffb2a76a5c9fe1852961be71dc184/lib/cli-engine/formatters/stylish.js
export function extendedStylish(results: LintResult[]): string {
  let output = '\n';
  let errorCount = 0;
  let warningCount = 0;
  let fixableErrorCount = 0;
  let fixableWarningCount = 0;
  let summaryColor: 'yellow' | 'red' = 'yellow';

  for (const result of results) {
    const messages = result.messages;

    if (messages.length === 0) {
      continue;
    }

    errorCount += result.errorCount;
    warningCount += result.warningCount;
    fixableErrorCount += result.fixableErrorCount;
    fixableWarningCount += result.fixableWarningCount;

    output += `${chalk.underline(result.filePath)}\n`;

    let newMessages = messages.map((message) => {
      let messageType;

      if (message.fatal || message.severity === 2) {
        messageType = chalk.red('error');
        summaryColor = 'red';
      } else {
        messageType = chalk.yellow('warning');
      }

      return [
        '',
        message.line || 0,
        message.column || 0,
        messageType,
        message.message.replace(/([^ ])\.$/u, '$1'),
        chalk.dim(message.ruleId || ''),
      ];
    });
    output += table(newMessages, {
      align: [null, 'r', 'l'],
      stringLength(str) {
        return stripAnsi(str).length;
      },
    })
      .split('\n')
      .map((el) =>
        el.replace(/(\d+)\s+(\d+)/u, (m, p1, p2) => chalk.dim(`${p1}:${p2}`)),
      )
      .join('\n');

    output += '\n\n';
  }

  const total = errorCount + warningCount;

  if (total > 0) {
    output += chalk[summaryColor].bold(
      [
        '\u2716 ',
        total,
        pluralize(' problem', total),
        ' (',
        errorCount,
        pluralize(' error', errorCount),
        ', ',
        warningCount,
        pluralize(' warning', warningCount),
        ')\n',
      ].join(''),
    );

    if (fixableErrorCount > 0 || fixableWarningCount > 0) {
      output += chalk[summaryColor].bold(
        [
          '  ',
          fixableErrorCount,
          pluralize(' error', fixableErrorCount),
          ' and ',
          fixableWarningCount,
          pluralize(' warning', fixableWarningCount),
          ' potentially fixable with the `--fix` option.\n',
        ].join(''),
      );
    }
  }

  // Resets output color, for prevent change on top level
  return total > 0 ? chalk.reset(output) : '';
}

function pluralize(word: string, count: number): string {
  return count === 1 ? word : `${word}s`;
}
