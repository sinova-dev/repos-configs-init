import eslintNestJs from '@darraghor/eslint-plugin-nestjs-typed';
import { defineConfig } from 'eslint/config';

import { createConfig as createBackendConfig } from './eslint-config.backend.mjs';

/**
 * Creates the ESLint flat config for NestJS backend projects.
 * Extends the generic backend config and adds NestJS-typed rules.
 *
 * @param {string} configDir - The directory of the config file (project root)
 * @returns {import('eslint').Linter.Config[]}
 */
export const createConfig = (configDir) => {
  return defineConfig(
    ...createBackendConfig(configDir),

    eslintNestJs.configs.flatRecommended,

    {
      files: ['**/*.ts'],
      rules: {
        // Crashes when factory functions are used with rest parameters. Can be turned on when the package fixes the issue.
        '@darraghor/nestjs-typed/provided-injected-should-match-factory-parameters': 'off',
        // Throws errors when using parameter property shorthands in constructor, which is very common in NestJS.
        'erasable-syntax-only/parameter-properties': 'off',
      },
    },
  );
};
