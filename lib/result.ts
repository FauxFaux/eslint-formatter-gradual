import { ESLint, Linter } from 'eslint';
import * as crypto from 'crypto';
import { Config } from './files';

type LintResult = ESLint.LintResult;
type LintMessage = Linter.LintMessage;
type Severity = Linter.Severity;
type Digest = string;

export function stripPrefix(
  config: Pick<Config, 'rootDir'>,
  path: string,
): string {
  // TODO: windows paths

  const root = config.rootDir + '/';
  if (path.startsWith(root)) {
    return path.substring(root.length);
  }
  return path;
}

export function hashSource(result: ESLint.LintResult): Digest {
  if (!result.source) {
    // TODO: just read it in?
    throw new Error('no source found for ' + result.filePath);
  }

  return hash(result.source);
}

function hash(content: string): string {
  const sha = crypto.createHash('sha512-256');
  sha.update(content);
  return sha.digest('hex');
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
