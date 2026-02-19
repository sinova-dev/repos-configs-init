import eslintNestJs from '@darraghor/eslint-plugin-nestjs-typed';
import { defineConfig } from 'eslint/config';

import { createCoreRecommendedConfigs, createCoreRulesConfig, createTailConfigs } from './eslint-config.core.mjs';

const backendIgnores = [];

/**
 * Creates the ESLint flat config for backend projects.
 * Pass the directory containing eslint.config.js (typically import.meta.dirname).
 *
 * @param {string} configDir - The directory of the config file (project root)
 * @returns {import('eslint').Linter.Config[]}
 */
export const createBackendConfig = (configDir) => {
  return defineConfig(
    ...createCoreRecommendedConfigs(),

    eslintNestJs.configs.flatRecommended,

    ...createCoreRulesConfig(configDir),

    {
      files: ['**/*.ts'],
      rules: {
        // Crashes when factory functions are used with rest parameters. Can be turned on when the package fixes the issue.
        '@darraghor/nestjs-typed/provided-injected-should-match-factory-parameters': 'off',
        // Throws errors when using parameter property shorthands in constructor, which is very common in NestJS.
        'erasable-syntax-only/parameter-properties': 'off',
      },
    },

    ...createTailConfigs({ extraIgnores: backendIgnores }),
  );
};
