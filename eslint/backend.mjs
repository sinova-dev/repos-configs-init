import { defineConfig } from 'eslint/config';

import { createCoreRecommendedConfigs, createCoreRulesConfig, createTailConfigs } from './core.mjs';
import { getPrismaConfig } from './orm-prisma.mjs';

const backendIgnores = [];

export const ORM = Object.freeze({ NONE: 'none', PRISMA: 'prisma' });

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
  const { orm = ORM.NONE, ormRuleOverrides = {} } = options;

  let ormConfigs = [];

  if (orm === ORM.PRISMA) {
    ormConfigs = getPrismaConfig(ormRuleOverrides);
  }

  return defineConfig(
    ...createCoreRecommendedConfigs(),

    ...createCoreRulesConfig(configDir),

    ...ormConfigs,

    ...createTailConfigs({ extraIgnores: backendIgnores }),
  );
};
