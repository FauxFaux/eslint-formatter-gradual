import { validateConfig } from '../lib/files';

describe('config file', () => {
  it('accepts empty', () => {
    validateConfig({});
  });

  it('accepts realistic', () => {
    validateConfig({
      quiet: true,
      softenRule: {
        '@typescript-eslint/explicit-module-boundary-types': 'until-new-file',
        '@typescript-eslint/no-explicit-any': 'until-touched',
      },
    });
  });

  for (const [config, failure] of [
    [
      {
        softenRule: {
          foo: 'bar',
        },
      },
      /softenRule.foo/,
    ],
    [{ pony: 5 }, /unrecognised config keys/],
  ] as const) {
    it(`throws for ${JSON.stringify(config)}`, () => {
      expect(() => validateConfig(config)).toThrow(failure);
    });
  }
});
