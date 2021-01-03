import * as fs from 'fs';
import * as path from 'path';
import sortKeys from 'sort-keys';

export type Until = 'until-new-file' | 'until-touched';

export interface Allowance {
  rules: Record<string, unknown>;
  digest: string;
}

export type Allowances = Record<string, Allowance>;

export type SoftenUntil = { [ruleId: string]: Until };

export interface Config {
  softenRule: SoftenUntil;
  quiet?: boolean;
  // defaults to $(pwd)
  rootDir: string;
}

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export function validateConfig(config: any): asserts config is Config {
  {
    const keys = new Set(Object.keys(config));
    keys.delete('rootDir');
    keys.delete('softenRule');
    keys.delete('quiet');
    if (keys.size) {
      throw new Error(`unrecognised config keys: ${[...keys]}`);
    }
  }

  for (const [key, value] of Object.entries(config.softenRule ?? {})) {
    const allowed: unknown[] = ['until-new-file', 'until-touched'];
    if (!allowed.includes(value)) {
      throw new Error(
        `softenRule.${key} must be one of ${allowed}, not '${value}'`,
      );
    }
  }

  if (!['undefined', 'boolean'].includes(typeof config.quiet)) {
    throw new Error(`quiet must be a boolean, not ${config.quiet}`);
  }

  if (!config.rootDir) {
    config.rootDir = process.cwd();
  }

  config.rootDir = path.resolve(config.rootDir);
}

export function loadGradualConfig(): Config {
  const config: unknown = JSON.parse(
    fs.readFileSync('.eslint-gradual.json').toString('utf-8'),
  );
  validateConfig(config);
  return config;
}


// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export function validateAllowances(
  allowances: Allowances | any,
): asserts allowances is Allowances {
  for (const [key, value] of Object.entries<any>(allowances)) {
    if (!value.digest || !value.rules) {
      throw new Error(`malformed allowances: ${key}`);
    }
  }
}

function allowancePath(config: Pick<Config, 'rootDir'>) {
  return path.join(config.rootDir, '.eslint-allowances.json');
}

export function loadAllowances(config: Pick<Config, 'rootDir'>): Allowances {
  const allowances: unknown = JSON.parse(
    fs.readFileSync(allowancePath(config)).toString('utf-8'),
  );

  validateAllowances(allowances);

  return allowances;
}

export function writeAllowances(
  config: Pick<Config, 'rootDir'>,
  allowances: Allowances,
): void {
  const json = JSON.stringify(sortKeys(allowances), null, 2);
  fs.writeFileSync(allowancePath(config), json);
}
