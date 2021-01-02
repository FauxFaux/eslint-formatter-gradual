import { ESLint } from 'eslint';
import yargs = require('yargs');
// @ts-expect-error types (@15) are way out of date (@16)
import { hideBin } from 'yargs/helpers';

(async function main() {
  const argv = yargs(hideBin(process.argv))
    .usage('Usage: $0 GLOBS...')
    .options({
      f: {
        type: 'string',
        default: 'stylish',
        describe: 'formatter (losing warnings)',
      },
    }).argv;

  const eslint = new ESLint({});
  const results = await eslint.lintFiles(argv._.map((s) => s.toString()));
  const formatter = await eslint.loadFormatter(argv.f);
  const resultText = formatter.format(results);

  // 4. Output it.
  console.log(resultText);
})().catch((error) => {
  process.exitCode = 1;
  console.error(error);
});
