import path from 'node:path';

import { FlatCompat } from '@eslint/eslintrc';
import js from '@eslint/js';
import { defineConfig } from 'eslint/config';

import { createConfig as createReactConfig } from './react.mjs';
import { createTailConfigs } from './core.mjs';

const nextJsExtraIgnores = ['next-env.d.ts', 'next.config.js', '.next/**', 'src/server/api/trpc.ts'];

const nextJsAppRouterFiles = [
  'src/app/**/layout.{js,jsx,ts,tsx}',
  'src/app/**/page.{js,jsx,ts,tsx}',
  'src/app/**/error.{js,jsx,ts,tsx}',
  'src/app/**/loading.{js,jsx,ts,tsx}',
  'src/app/**/forbidden.{js,jsx,ts,tsx}',
  'src/app/**/default.{js,jsx,ts,tsx}',
  'src/app/**/not-found.{js,jsx,ts,tsx}',
  'src/app/**/template.{js,jsx,ts,tsx}',
  'src/app/**/unauthorized.{js,jsx,ts,tsx}',
];

/**
 * Creates the ESLint flat config for Next.js frontend projects.
 * Extends the React config and adds Next.js plugin and App Router conventions.
 *
 * @param {string} configDir - The directory of the config file (project root)
 * @param {{ storybook?: boolean }} [options] - Options. storybook: include Storybook plugin and rules (default: false)
 * @returns {import('eslint').Linter.Config[]}
 */
export const createConfig = (configDir, options = {}) => {
  const rootDir = path.resolve(configDir);
  const compat = new FlatCompat({
    baseDirectory: rootDir,
    recommendedConfig: js.configs.recommended,
  });

  return defineConfig(
    ...createReactConfig(configDir, options),

    // Next.js recommended rules
    ...compat.extends('plugin:@next/next/recommended'),

    // Next.js-specific rule overrides (App Router folder naming, metadata exports)
    {
      rules: {
        'check-file/folder-naming-convention': [
          'error',
          {
            '**/!(.)/': 'NEXT_JS_APP_ROUTER_CASE',
          },
        ],
        'react-refresh/only-export-components': ['warn', { allowExportNames: ['metadata'], allowConstantExport: true }],
      },
    },

    // Next.js App Router file conventions (default exports allowed)
    {
      files: nextJsAppRouterFiles,
      rules: {
        'import/no-default-export': 'off',
      },
    },
    {
      files: ['**/i18n/*.{js,ts}'],
      rules: {
        'import/no-default-export': 'off',
      },
    },

    // Additional ignores for Next.js projects
    ...createTailConfigs({ extraIgnores: nextJsExtraIgnores }),
  );
};
