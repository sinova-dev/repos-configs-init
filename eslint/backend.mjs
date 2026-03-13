import { defineConfig } from 'eslint/config';

import { createCoreRecommendedConfigs, createCoreRulesConfig, createTailConfigs } from './core.mjs';
import { ORM, getOrmConfig } from './orm-registry.mjs';

const backendIgnores = [];

/**
 * @typedef {import('eslint').Linter.RulesRecord} OrmRuleOverrides
 * @typedef {{ orm?: string, ormRuleOverrides?: OrmRuleOverrides }} BackendConfigOptions
 */

/**
 * Creates the ESLint flat config for generic backend (Node/TS) projects.
 * No framework-specific plugins. For NestJS, use the nestjs config instead.
 *
 * @param {string} configDir - The directory of the config file (project root)
 * @param {BackendConfigOptions} [options]
 * @param {string} [options.orm='none'] - ORM to add rules for (e.g. 'prisma', 'drizzle')
 * @param {OrmRuleOverrides} [options.ormRuleOverrides] - Override ORM rules (e.g. { 'prefer-arrow/prefer-arrow-functions': 'off' })
 * @returns {import('eslint').Linter.Config[]}
 */
export const createConfig = (configDir, options = {}) => {
  const { orm = ORM.NONE, ormRuleOverrides = {} } = options;

  const ormConfigs = getOrmConfig(orm, ormRuleOverrides);

  return defineConfig(
    ...createCoreRecommendedConfigs(),

    ...createCoreRulesConfig(configDir),

    ...ormConfigs,

    ...createTailConfigs({ extraIgnores: backendIgnores }),
  );
};
