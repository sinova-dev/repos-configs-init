import { defineConfig } from 'eslint/config';

import { createCoreRecommendedConfigs, createCoreRulesConfig, createTailConfigs } from './eslint-config.core.mjs';

const backendIgnores = [];

/**
 * Creates the ESLint flat config for generic backend (Node/TS) projects.
 * No framework-specific plugins. For NestJS, use the nestjs config instead.
 *
 * @param {string} configDir - The directory of the config file (project root)
 * @returns {import('eslint').Linter.Config[]}
 */
export const createConfig = (configDir) => {
  return defineConfig(
    ...createCoreRecommendedConfigs(),

    ...createCoreRulesConfig(configDir),

    ...createTailConfigs({ extraIgnores: backendIgnores }),
  );
};
