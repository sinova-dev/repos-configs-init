import eslintNestJs from '@darraghor/eslint-plugin-nestjs-typed';
import { defineConfig } from 'eslint/config';

import { createConfig as createBackendConfig } from './index.mjs';

/**
 * @typedef {import('eslint').Linter.RulesRecord} OrmRuleOverrides
 * @typedef {{ orm?: string, ormRuleOverrides?: OrmRuleOverrides }} NestjsConfigOptions
 */

/**
 * Creates the ESLint flat config for NestJS backend projects.
 * Extends the generic backend config and adds NestJS-typed rules.
 *
 * @param {string} configDir - The directory of the config file (project root)
 * @param {NestjsConfigOptions} [options]
 * @param {string} [options.orm='none'] - ORM to add rules for (passed to backend config)
 * @param {OrmRuleOverrides} [options.ormRuleOverrides] - Override ORM rules (passed to backend config)
 * @returns {import('eslint').Linter.Config[]}
 */
export const createConfig = (configDir, options = {}) => {
  return defineConfig(
    ...createBackendConfig(configDir, options),

    eslintNestJs.configs.flatRecommended,

    {
      files: ['**/*.ts'],
      rules: {
        // Crashes when factory functions are used with rest parameters. Can be turned on when the package fixes the issue.
        '@darraghor/nestjs-typed/provided-injected-should-match-factory-parameters': 'off',
        // Throws errors when using parameter property shorthands in constructor, which is very common in NestJS.
        'erasable-syntax-only/parameter-properties': 'off',
        // NestJS relies on classes for DI, decorators, and modules; many look "empty" but are required.
        '@typescript-eslint/no-extraneous-class': 'off',
      },
    },
  );
};
