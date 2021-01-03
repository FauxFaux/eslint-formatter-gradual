import { spawnSync } from 'child_process';
import escapeStringRegexp from 'escape-string-regexp';

test('e2e (bin)', async () => {
  const out = spawnSync(process.argv0, ['../../dist/eslint-gradual', '*.mjs'], {
    cwd: 'test/e2e',
    stdio: 'pipe',
  });
  if (out.error) {
    throw out.error;
  }
  expect(cleanupStdout(out)).toMatchSnapshot();
  expect(out.status).toBe(1);
});

test('e2e (formatter)', async () => {
  const out = spawnSync(
    process.argv0,
    ['../../node_modules/.bin/eslint', '-f', '../..', '*.mjs'],
    {
      cwd: 'test/e2e',
      stdio: 'pipe',
    },
  );
  if (out.error) {
    throw out.error;
  }
  expect(cleanupStdout(out)).toMatchSnapshot();
  expect(out.status).toBe(1);
});

function cleanupStdout(out: { stdout?: Buffer }) {
  return out.stdout
    ?.toString('utf-8')
    .replace(new RegExp(escapeStringRegexp(process.cwd()), 'g'), '<rootDir>');
}
