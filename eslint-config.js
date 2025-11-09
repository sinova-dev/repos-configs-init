import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { FlatCompat } from '@eslint/eslintrc';
import js from '@eslint/js';
import checkFile from 'eslint-plugin-check-file';
import importPlugin from 'eslint-plugin-import';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import reactPlugin from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import storybook from 'eslint-plugin-storybook';
import tailwindcss from 'eslint-plugin-tailwindcss';
import { defineConfig } from 'eslint/config';
import globals from 'globals';
import tseslint from 'typescript-eslint';
import i18next from 'eslint-plugin-i18next';
import eslintPluginUnicorn from 'eslint-plugin-unicorn';
import eslintConfigPrettier from 'eslint-config-prettier';
import comments from '@eslint-community/eslint-plugin-eslint-comments/configs';
import playwright from 'eslint-plugin-playwright';
import erasableSyntaxOnly from 'eslint-plugin-erasable-syntax-only';
import jsdoc from 'eslint-plugin-jsdoc';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
});

export const baseConfig = defineConfig(
  js.configs.recommended,
  tseslint.configs.strictTypeChecked,
  tseslint.configs.stylisticTypeChecked,
  eslintPluginUnicorn.configs.recommended,
  reactRefresh.configs.recommended,
  reactPlugin.configs.flat.recommended,
  importPlugin.flatConfigs.recommended,
  comments.recommended,
  erasableSyntaxOnly.configs.recommended,
  jsxA11y.flatConfigs.strict,
  storybook.configs['flat/recommended'],
  tailwindcss.configs['flat/recommended'],
  i18next.configs['flat/recommended'],
  playwright.configs['flat/recommended'],
  jsdoc.configs['flat/recommended-typescript-error'],
  ...compat.extends('plugin:@next/next/recommended'),
  {
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      parser: tseslint.parser,
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
        projectService: true,
        tsconfigRootDir: process.cwd(),
      },
      globals: {
        ...globals.browser,
        ...globals.node,
        ...globals.es2020,
      },
    },
    settings: {
      react: {
        version: 'detect',
      },
      tailwindcss: {
        callees: ['cn'],
      },
      'import/resolver': {
        typescript: {
          alwaysTryTypes: true,
          project: './tsconfig.json',
        },
        node: true,
      },
    },
    plugins: {
      'check-file': checkFile,
      'react-hooks': reactHooks,
    },
    rules: {
      'no-console': ['warn', { allow: ['info', 'warn', 'error'] }],
      'max-params': ['error', 3],
      'no-extra-boolean-cast': 'off',
      curly: ['error', 'all'],
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
      'no-void': 'off',
      'tailwindcss/classnames-order': 'off',
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
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['.*'],
              message: 'Relative imports are not allowed.',
            },
            {
              group: ['lodash'],
              message: 'Please install only needed part from lodash.* package.',
            },
          ],
        },
      ],
      'import/consistent-type-specifier-style': ['error', 'prefer-inline'],
      'import/no-duplicates': ['error', { 'prefer-inline': true }],
      'import/prefer-default-export': 'off',
      'import/no-default-export': 'error',
      '@typescript-eslint/consistent-type-exports': 'error',
      '@typescript-eslint/method-signature-style': 'error',
      '@typescript-eslint/no-unnecessary-type-conversion': 'error',
      '@typescript-eslint/consistent-type-definitions': ['error', 'type'],
      '@typescript-eslint/restrict-template-expressions': ['error', { allowNumber: true }],
      '@typescript-eslint/no-unused-vars': ['warn', { ignoreRestSiblings: true, argsIgnorePattern: '^_' }],
      '@typescript-eslint/consistent-indexed-object-style': ['error', 'index-signature'],
      '@typescript-eslint/naming-convention': [
        'error',
        {
          selector: 'variable',
          format: ['camelCase', 'PascalCase', 'UPPER_CASE'],
        },
        {
          selector: 'function',
          format: ['camelCase', 'PascalCase'],
        },
        {
          selector: 'typeLike',
          format: ['PascalCase'],
        },
        {
          selector: 'variable',
          types: ['boolean'],
          format: ['PascalCase'],
          prefix: ['is', 'should', 'has', 'can', 'was', 'did', 'will', 'use', 'with'],
        },
        {
          selector: 'typeAlias',
          format: ['PascalCase'],
          prefix: ['T'],
        },
        {
          selector: 'interface',
          format: ['PascalCase'],
          prefix: ['I'],
        },
      ],
      '@typescript-eslint/consistent-type-imports': [
        'warn',
        {
          prefer: 'type-imports',
          fixStyle: 'inline-type-imports',
        },
      ],
      '@typescript-eslint/require-await': 'off',
      '@typescript-eslint/no-empty-function': 'warn',
      '@typescript-eslint/no-misused-promises': [
        'error',
        {
          checksVoidReturn: {
            attributes: false,
          },
        },
      ],
      'unicorn/expiring-todo-comments': 'off',
      'unicorn/filename-case': 'off',
      'unicorn/no-array-reduce': 'off',
      'unicorn/no-array-for-each': 'off',
      'unicorn/prefer-global-this': 'off',
      'unicorn/prefer-json-parse-buffer': 'off',
      'unicorn/string-content': 'off',
      'unicorn/prefer-ternary': ['error', 'only-single-line'],
      'unicorn/no-useless-undefined': ['error', { checkArguments: false }],
      'unicorn/no-negated-condition': 'off',
      'unicorn/numeric-separators-style': 'off',
      'unicorn/prefer-spread': 'off',
      'unicorn/no-abusive-eslint-disable': 'off',
      'unicorn/no-anonymous-default-export': 'off',
      'unicorn/no-null': 'off',
      'unicorn/prevent-abbreviations': 'off',
      'unicorn/no-array-sort': 'off',
      'unicorn/no-array-reverse': 'off',
      'unicorn/prefer-top-level-await': 'off',
      'unicorn/prefer-event-target': 'off',
      'unicorn/no-empty-file': 'off',
      'jsdoc/tag-lines': 'off',
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
    files: ['src/components/ui/**/*.{jsx,tsx}'],
    rules: {
      'react/require-default-props': 'off',
      'react/no-multi-comp': 'off',
      'i18next/no-literal-string': 'off',
      'react/prop-types': 'off',
      'react/no-unknown-property': 'off',
    },
  },
  {
    files: ['src/lib/db/**/*.{js,ts}'],
    rules: {
      'react/no-is-mounted': 'off',
    },
  },
  {
    files: ['**/*.js'],
    extends: [tseslint.configs.disableTypeChecked],
  },
  eslintConfigPrettier,
  {
    ignores: [
      'global.d.ts',
      'src/server/api/trpc.ts',
      'tailwind.config.ts',
      'playwright.config.ts',
      'next.config.js',
      '**/node_modules/**',
      'dist/**',
      'build/**',
      '*.log',
    ],
  },
);

export const requiredPlugins = [
  'eslint@^9.0.0',
  '@eslint/js@^9.0.0',
  '@eslint/eslintrc',
  '@eslint-community/eslint-plugin-eslint-comments',
  '@next/eslint-plugin-next',
  'eslint-config-prettier',
  'eslint-import-resolver-typescript',
  'eslint-plugin-check-file',
  'eslint-plugin-import',
  'eslint-plugin-jsx-a11y',
  'eslint-plugin-react',
  'eslint-plugin-react-hooks',
  'eslint-plugin-react-refresh',
  'eslint-plugin-storybook',
  'eslint-plugin-tailwindcss',
  'eslint-plugin-i18next',
  'eslint-plugin-unicorn',
  'eslint-plugin-playwright',
  'eslint-plugin-erasable-syntax-only',
  'eslint-plugin-jsdoc',
  'globals',
  'typescript-eslint',
];

export default baseConfig;

export function resolveConfig(externalConfig = []) {
  const externalConfigArray = Array.isArray(externalConfig)
    ? externalConfig
    : externalConfig && Object.keys(externalConfig).length > 0
      ? [externalConfig]
      : [];

  return [...baseConfig, ...externalConfigArray];
}

