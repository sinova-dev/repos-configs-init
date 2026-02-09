import eslintNestJs from '@darraghor/eslint-plugin-nestjs-typed';
import { defineConfig } from 'eslint/config';

import { createCoreFinalConfig, createCoreRecommendedConfigs, createCoreRulesConfig } from './eslint-config.core.mjs';

const backendIgnores = [];

/**
 * Creates the ESLint flat config for backend (NestJS) projects.
 * Pass the directory containing eslint.config.js (typically import.meta.dirname).
 *
 * @param {string} configDir - The directory of the config file (project root)
 * @returns {import('eslint').Linter.Config[]}
 */
export function createBackendConfig(configDir) {
  return defineConfig(
    ...createCoreRecommendedConfigs(),

    // NestJS typed ruleset (flat config)
    eslintNestJs.configs.flatRecommended,

    ...createCoreRulesConfig(configDir),
    ...createCoreFinalConfig({ extraIgnores: backendIgnores }),
  );
}
