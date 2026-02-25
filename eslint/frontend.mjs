import { defineConfig } from 'eslint/config';

import { createCoreRecommendedConfigs, createCoreRulesConfig, createTailConfigs } from './core.mjs';

const frontendIgnores = ['global.d.ts', 'tailwind.config.ts', 'playwright.config.ts', 'out/**'];

/**
 * Frontend base config (no Prettier/ignores tail). Used by React/Next.js so they can add the tail last.
 *
 * @param {string} configDir - The directory of the config file (project root)
 * @returns {import('eslint').Linter.Config[]}
 */
export const createFrontendBaseConfig = (configDir) => {
  return defineConfig(
    ...createCoreRecommendedConfigs(),

    ...createCoreRulesConfig(configDir, {
      includeBrowserGlobals: true,
      enableJsx: true,
    }),
  );
};

/**
 * Creates the ESLint flat config for generic frontend (browser/JSX) projects.
 * Core + browser globals + JSX parsing. No React/Next.js plugins.
 * For React or Next.js, use the react or nextjs config instead.
 *
 * @param {string} configDir - The directory of the config file (project root)
 * @returns {import('eslint').Linter.Config[]}
 */
export const createConfig = (configDir) => {
  return defineConfig(
    ...createFrontendBaseConfig(configDir),

    ...createTailConfigs({ extraIgnores: frontendIgnores }),
  );
};
