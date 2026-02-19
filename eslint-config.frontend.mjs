import path from 'node:path';

import { FlatCompat } from '@eslint/eslintrc';
import js from '@eslint/js';
import checkFile from 'eslint-plugin-check-file';
import i18next from 'eslint-plugin-i18next';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import playwright from 'eslint-plugin-playwright';
import reactPlugin from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import storybook from 'eslint-plugin-storybook';
// eslint-plugin-tailwindcss does not support Tailwind CSS v4. TODO: Re-enable when the plugin adds v4 support.
// import tailwindcss from 'eslint-plugin-tailwindcss';
import { defineConfig } from 'eslint/config';
import tseslint from 'typescript-eslint';

import { createCoreRecommendedConfigs, createCoreRulesConfig, createTailConfigs } from './eslint-config.core.mjs';

const frontendIgnores = [
  'global.d.ts',
  'next-env.d.ts',
  'src/server/api/trpc.ts',
  'tailwind.config.ts',
  'playwright.config.ts',
  'next.config.js',
  '.next/**',
  'out/**',
];

/**
 * Creates the ESLint flat config for frontend projects.
 * Pass the directory containing eslint.config.js (typically import.meta.dirname).
 *
 * @param {string} configDir - The directory of the config file (project root)
 * @returns {import('eslint').Linter.Config[]}
 */
export const createConfig = (configDir) => {
  const rootDir = path.resolve(configDir);
  const compat = new FlatCompat({
    baseDirectory: rootDir,
    recommendedConfig: js.configs.recommended,
  });

  return defineConfig(
    ...createCoreRecommendedConfigs(),

    reactRefresh.configs.recommended,
    reactPlugin.configs.flat.recommended,
    jsxA11y.flatConfigs.strict,

    storybook.configs['flat/recommended'],
    // tailwindcss.configs['flat/recommended'],
    i18next.configs['flat/recommended'],
    playwright.configs['flat/recommended'],

    // Convert legacy configs using FlatCompat
    ...compat.extends('plugin:@next/next/recommended'),

    ...createCoreRulesConfig(configDir, {
      includeBrowserGlobals: true,
      enableJsx: true,
      settings: {
        react: {
          version: 'detect',
        },
        // tailwindcss: { callees: ['cn'] },
      },
      plugins: {
        'check-file': checkFile,
        'react-hooks': reactHooks,
      },
      rules: {
        'check-file/filename-naming-convention': [
          'error',
          {
            '**/*.{tsx}': 'CAMEL_CASE',
            '**/*.{js,cjs,mjs,ts,json}': 'KEBAB_CASE',
          },
          {
            ignoreMiddleExtensions: true,
          },
        ],
        'check-file/folder-naming-convention': [
          'error',
          {
            '**/!(.)/': 'NEXT_JS_APP_ROUTER_CASE',
          },
        ],

        // 'tailwindcss/classnames-order': 'off',

        'react-refresh/only-export-components': ['warn', { allowExportNames: ['metadata'], allowConstantExport: true }],

        'react/function-component-definition': [
          'warn',
          { namedComponents: 'arrow-function', unnamedComponents: 'arrow-function' },
        ],
        'react/require-default-props': ['error', { functions: 'defaultArguments' }],
        'react/jsx-sort-props': ['error', { reservedFirst: true, noSortAlphabetically: true }],
        'react/jsx-handler-names': ['error', { eventHandlerPrefix: 'on' }],
        'react/no-multi-comp': 'error',
        'react/jsx-filename-extension': ['error', { allow: 'as-needed', extensions: ['.tsx'] }],
        'react/jsx-curly-spacing': [
          'error',
          {
            when: 'never',
            children: { when: 'never', allowMultiline: false },
          },
        ],
        'react/jsx-no-leaked-render': 'off',
        'react/jsx-max-depth': ['error', { max: 5 }],
        'react/jsx-key': [
          'error',
          {
            checkFragmentShorthand: true,
            checkKeyMustBeforeSpread: true,
            warnOnDuplicates: true,
          },
        ],
        'react/display-name': 'warn',
        'react/react-in-jsx-scope': 'off',
        'react/no-array-index-key': 'off',

        'react/jsx-no-useless-fragment': ['error', { allowExpressions: true }],
      },
    }),

    // File-specific overrides (frontend)
    {
      files: ['**/*.stories.*'],
      rules: {
        'react/jsx-key': 'off',
        'i18next/no-literal-string': 'off',
      },
    },
    {
      files: ['**/*.stories.*', '**/*.config.*', '.storybook/**/*'],
      rules: {
        'import/no-extraneous-dependencies': ['error', { devDependencies: true }],
        'import/no-default-export': 'off',
      },
    },
    {
      files: ['src/decorators/*'],
      rules: {
        'react/display-name': 'off',
        'react/destructuring-assignment': 'off',
      },
    },
    {
      files: ['*.js'],
      rules: {
        'global-require': 'off',
      },
    },
    {
      files: [
        'src/app/**/layout.{js,jsx,ts,tsx}',
        'src/app/**/page.{js,jsx,ts,tsx}',
        'src/app/**/error.{js,jsx,ts,tsx}',
        'src/app/**/loading.{js,jsx,ts,tsx}',
        'src/app/**/forbidden.{js,jsx,ts,tsx}',
        'src/app/**/default.{js,jsx,ts,tsx}',
        'src/app/**/not-found.{js,jsx,ts,tsx}',
        'src/app/**/template.{js,jsx,ts,tsx}',
        'src/app/**/unauthorized.{js,jsx,ts,tsx}',
      ],
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
    {
      files: ['.prettierrc.mjs'],
      rules: {
        'import/no-default-export': 'off',
      },
      extends: [tseslint.configs.disableTypeChecked],
    },
    {
      files: ['src/components/ui/**/*.{jsx,tsx}'],
      rules: {
        'react/require-default-props': 'off',
        'react/no-multi-comp': 'off',
        'i18next/no-literal-string': 'off',
        'react/prop-types': 'off',
        'react/no-unknown-property': 'off',
        'react-refresh/only-export-components': 'off',
      },
    },
    {
      files: ['src/lib/db/**/*.{js,ts}'],
      rules: {
        'react/no-is-mounted': 'off',
      },
    },

    // E2E tests configuration
    {
      files: ['e2e/**/*.{ts,tsx}'],
      rules: {
        'playwright/expect-expect': 'off',
      },
    },

    // Disable type checking for JavaScript files
    {
      files: ['**/*.js'],
      extends: [tseslint.configs.disableTypeChecked],
    },

    ...createTailConfigs({ extraIgnores: frontendIgnores }),
  );
};
