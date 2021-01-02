import * as fs from 'fs';

import Ajv, { JSONSchemaType } from 'ajv';
import betterAjvErrors from '@stoplight/better-ajv-errors';

export type Until = 'until-new-file' | 'until-touched';

export interface Allowance {
  rules: Record<string, unknown>;
  digest: string;
}

export type SoftenUntil = { [ruleId: string]: Until };

export interface Config {
  softenRule: SoftenUntil;
  quiet?: boolean;
}

export function validateConfig(config: unknown): asserts config is Config {
  const ajv = new Ajv();
  const schema: JSONSchemaType<Config> = {
    type: 'object',
    properties: {
      quiet: { type: 'boolean', nullable: true },
      softenRule: {
        type: 'object',
        required: [],
        patternProperties: {
          '.+': {
            type: 'string',
            enum: ['until-new-file', 'until-touched'],
          },
        },
      },
    },
    required: ['softenRule'],
    additionalProperties: false,
  };
  const validate = ajv.compile(schema);
  const valid = validate(config);
  if (!valid) {
    console.log(
      betterAjvErrors(schema, validate.errors, {
        propertyPath: [],
        targetValue: config,
      }),
    );
    console.log(validate.errors);
    throw new Error('validation error (see above)');
  }
}

export function loadGradualConfig(): Config {
  const config: unknown = JSON.parse(
    fs.readFileSync('.eslint-gradual.json').toString('utf-8'),
  );
  validateConfig(config);
  return config;
}
