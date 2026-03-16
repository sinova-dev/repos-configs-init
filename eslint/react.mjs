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
import { defineConfig } from 'eslint/config';
import tseslint from 'typescript-eslint';

import { createFrontendBaseConfig } from './frontend.mjs';
import { createCoreRulesConfig, createTailConfigs } from './core.mjs';

const reactIgnores = ['global.d.ts', 'tailwind.config.ts', 'playwright.config.ts', 'out/**'];

/**
 * Creates the ESLint flat config for React (non-Next.js) frontend projects.
 * Extends the generic frontend config and adds React, Storybook (optional), i18next, Playwright, check-file.
 *
 * @param {string} configDir - The directory of the config file (project root)
 * @param {{ storybook?: boolean }} [options] - Options. storybook: include Storybook plugin and rules (default: false)
 * @returns {import('eslint').Linter.Config[]}
 */
export const createConfig = (configDir, options = {}) => {
  const { storybook: includeStorybook = false } = options;

  return defineConfig(
    ...createFrontendBaseConfig(configDir),

    reactRefresh.configs.recommended,
    reactPlugin.configs.flat.recommended,
    jsxA11y.flatConfigs.strict,

    ...(includeStorybook ? [storybook.configs['flat/recommended']] : []),
    i18next.configs['flat/recommended'],
    playwright.configs['flat/recommended'],

    ...createCoreRulesConfig(configDir, {
      shouldIncludeBrowserGlobals: true,
      shouldEnableJsx: true,
      settings: {
        react: {
          version: 'detect',
        },
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
            '**/!(.)/': 'KEBAB_CASE',
          },
        ],

        'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],

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

    // File-specific overrides (React)
    ...(includeStorybook
      ? [
          {
            files: ['**/*.stories.*'],
            rules: {
              'react/jsx-key': 'off',
              'i18next/no-literal-string': 'off',
            },
          },
          {
            files: ['**/*.stories.*', '**/*.config.*', '.storybook/**/*', 'src/decorators/**/*'],
            rules: {
              'import/no-extraneous-dependencies': ['error', { devDependencies: true }],
              'import/no-default-export': 'off',
            },
          },
          {
            files: ['**/decorators/**/*', '.storybook/**/*'],
            rules: {
              'react/display-name': 'off',
              'react/destructuring-assignment': 'off',
            },
          },
        ]
      : []),
    {
      files: ['*.js'],
      rules: {
        'global-require': 'off',
      },
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

    ...createTailConfigs({ extraIgnores: reactIgnores }),
  );
};
