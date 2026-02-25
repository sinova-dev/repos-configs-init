import { defineConfig } from 'eslint/config';

import { createCoreRecommendedConfigs, createCoreRulesConfig, createTailConfigs } from './eslint-config.core.mjs';
import { getPrismaConfig } from './eslint-config.orm-prisma.mjs';

const backendIgnores = [];

/**
 * @typedef {'none' | 'prisma'} OrmOption
 * @typedef {import('eslint').Linter.RulesRecord} OrmRuleOverrides
 * @typedef {{ orm?: OrmOption, ormRuleOverrides?: OrmRuleOverrides }} BackendConfigOptions
 */

/**
 * Creates the ESLint flat config for generic backend (Node/TS) projects.
 * No framework-specific plugins. For NestJS, use the nestjs config instead.
 *
 * @param {string} configDir - The directory of the config file (project root)
 * @param {BackendConfigOptions} [options]
 * @param {OrmOption} [options.orm='none'] - ORM to add rules for ('prisma' uses eslint-config-prisma)
 * @param {OrmRuleOverrides} [options.ormRuleOverrides] - Override ORM rules (e.g. { 'prefer-arrow/prefer-arrow-functions': 'off' })
 * @returns {import('eslint').Linter.Config[]}
 */
export const createConfig = (configDir, options = {}) => {
  const { orm = 'none', ormRuleOverrides = {} } = options;
  const ormConfigs = orm === 'prisma' ? getPrismaConfig(ormRuleOverrides) : [];

  return defineConfig(
    ...createCoreRecommendedConfigs(),

    ...createCoreRulesConfig(configDir),

    ...ormConfigs,

    ...createTailConfigs({ extraIgnores: backendIgnores }),
  );
};
