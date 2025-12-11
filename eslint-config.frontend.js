import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { FlatCompat } from '@eslint/eslintrc';
import js from '@eslint/js';
import i18next from 'eslint-plugin-i18next';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import playwright from 'eslint-plugin-playwright';
import reactPlugin from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import storybook from 'eslint-plugin-storybook';
import tailwindcss from 'eslint-plugin-tailwindcss';
import { defineConfig } from 'eslint/config';
import globals from 'globals';
import eslintConfigPrettier from 'eslint-config-prettier';

import { baseConfigs, baseLanguageOptions, baseSettings, sharedIgnores } from './eslint-config.base.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
});

const frontendConfigs = [
  ...compat.extends('plugin:@next/next/recommended'),
  reactRefresh.configs.recommended,
  reactPlugin.configs.flat.recommended,
  jsxA11y.flatConfigs.strict,
  storybook.configs['flat/recommended'],
  tailwindcss.configs['flat/recommended'],
  i18next.configs['flat/recommended'],
  playwright.configs['flat/recommended'],
  {
    languageOptions: {
      ...baseLanguageOptions,
      globals: {
        ...globals.browser,
        ...globals.node,
        ...globals.es2020,
      },
    },
    settings: {
      ...baseSettings,
      react: { version: 'detect' },
      tailwindcss: { callees: ['cn'] },
    },
    plugins: {
      'react-hooks': reactHooks,
    },
    rules: {
      'check-file/folder-naming-convention': [
        'error',
        {
          '**/!(.)/': 'NEXT_JS_APP_ROUTER_CASE',
        },
      ],
      'tailwindcss/classnames-order': 'off',
      'react-refresh/only-export-components': [
        'warn',
        { allowExportNames: ['metadata'], allowConstantExport: true },
      ],
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
  },
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
];

const frontendConfig = defineConfig(...baseConfigs, ...frontendConfigs, sharedIgnores, eslintConfigPrettier);

export { frontendConfigs, frontendConfig };
