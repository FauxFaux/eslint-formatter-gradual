import { validateConfig } from '../lib/files';

describe('config file', () => {
  it('validates', () => {
    validateConfig({softenRule: {
      'foo': 'bar',
      }});
    validateConfig({});
    validateConfig({ pony: 5 });
  })
})
