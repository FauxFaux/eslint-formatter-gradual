import * as fs from 'fs';

import type { ESLint } from 'eslint';
import type { Linter } from 'eslint';
type LintResult = ESLint.LintResult;
type LintMessage = Linter.LintMessage;
type Severity = Linter.Severity;

import { transformResult } from './allow-until';
import { extendedStylish } from './extended-stylish';

export interface ResultWithWarning extends LintResult {
  messages: MessageWithWarning[];
}

export interface MessageWithWarning extends Linter.LintMessage {
  severityWarning?: string;
}

export function stripPrefix(root: string, path: string): string {
  if (path.startsWith(root)) {
    return path.substring(root.length);
  }
  return path;
}

function countSeverity(messages: LintMessage[], severity: Severity) {
  return messages
    .map((message) => (message.severity === severity ? (1 as number) : 0))
    .reduce((a, b) => a + b, 0);
}

export function reDoCounts(results: LintResult[]): void {
  for (const result of results) {
    result.errorCount = countSeverity(
      result.messages,
      severityToNumber('error'),
    );
    result.warningCount = countSeverity(
      result.messages,
      severityToNumber('warn'),
    );
  }
}

export function severityToNumber(name: string): Severity {
  switch (name) {
    case 'off':
      return 0;
    case 'warn':
      return 1;
    case 'error':
      return 2;
  }
  throw new Error('unknown severity: ' + name);
}
