import path from 'node:path';

import comments from '@eslint-community/eslint-plugin-eslint-comments/configs';
import js from '@eslint/js';
import erasableSyntaxOnly from 'eslint-plugin-erasable-syntax-only';
import importPlugin from 'eslint-plugin-import';
import jsdoc from 'eslint-plugin-jsdoc';
import eslintConfigPrettier from 'eslint-config-prettier';
import eslintPluginUnicorn from 'eslint-plugin-unicorn';
import globals from 'globals';
import tseslint from 'typescript-eslint';

function toArray(configOrConfigs) {
  return Array.isArray(configOrConfigs) ? configOrConfigs : [configOrConfigs];
}

export const coreIgnores = [
  '**/node_modules/**',
  'dist/**',
  'build/**',
  '*.log',
  '.env*',
  '.git/**',
  '.github/**',
  '.vscode/**',
  '.idea/**',
  'coverage/**',
  '.turbo/**',
  'pnpm-lock.yaml',
  'package-lock.json',
  'yarn.lock',
  '*.min.js',
  '*.min.css',
];

/**
 * Creates the shared "recommended preset stack" for both frontend and backend projects.
 * This keeps the shared ordering in one place.
 *
 * @returns {import('eslint').Linter.Config[]}
 */
export function createCoreRecommendedConfigs() {
  return [
    ...toArray(js.configs.recommended),
    ...toArray(tseslint.configs.strictTypeChecked),
    ...toArray(tseslint.configs.stylisticTypeChecked),
    ...toArray(eslintPluginUnicorn.configs.recommended),
    ...toArray(importPlugin.flatConfigs.recommended),
    ...toArray(comments.recommended),
    ...toArray(erasableSyntaxOnly.configs.recommended),
    ...toArray(jsdoc.configs['flat/recommended-typescript-error']),
  ];
}

/**
 * Creates shared ESLint flat config rules/settings for both frontend and backend projects.
 *
 * @param {string} configDir - The directory of the config file (project root)
 * @param {object} [options]
 * @param {Record<string, boolean>} [options.extraGlobals] - Extra globals to merge in
 * @param {boolean} [options.includeBrowserGlobals]
 * @param {boolean} [options.enableJsx]
 * @param {import('eslint').Linter.Config['settings']} [options.settings]
 * @param {import('eslint').Linter.Config['plugins']} [options.plugins]
 * @param {import('eslint').Linter.Config['rules']} [options.rules]
 * @returns {import('eslint').Linter.Config[]}
 */
export function createCoreRulesConfig(configDir, options = {}) {
  const rootDir = path.resolve(configDir);
  const {
    extraGlobals = {},
    includeBrowserGlobals = false,
    enableJsx = false,
    settings: extraSettings = {},
    plugins: extraPlugins = {},
    rules: extraRules = {},
  } = options;

  const baseImportResolver = {
    typescript: {
      alwaysTryTypes: true,
      project: './tsconfig.json',
    },
    node: true,
  };

  return [
    {
      languageOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        parser: tseslint.parser,
        parserOptions: {
          ...(enableJsx
            ? {
                ecmaFeatures: {
                  jsx: true,
                },
              }
            : {}),
          projectService: true,
          tsconfigRootDir: rootDir,
        },
        globals: {
          ...(includeBrowserGlobals ? globals.browser : {}),
          ...globals.node,
          ...globals.es2020,
          ...extraGlobals,
        },
      },
      settings: {
        ...extraSettings,
        'import/resolver': {
          ...baseImportResolver,
          ...(extraSettings?.['import/resolver'] ?? {}),
          typescript: {
            ...baseImportResolver.typescript,
            ...(extraSettings?.['import/resolver']?.typescript ?? {}),
          },
        },
      },
      plugins: {
        ...extraPlugins,
      },
      rules: {
        'no-console': ['warn', { allow: ['info', 'warn', 'error'] }],
        'max-params': ['error', 3],
        'no-extra-boolean-cast': 'off',
        curly: ['error', 'all'],
        'no-void': 'off',

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
            prefix: ['is', 'should', 'has', 'can', 'are', 'needs', 'was', 'did', 'will', 'use', 'with'],
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

        // Unicorn plugin rules to disable / configure
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

        // JSDoc rules
        'jsdoc/tag-lines': 'off',

        ...extraRules,
      },
    },
  ];
}

/**
 * Creates the shared config tail that should come last:
 * - Prettier overrides (disable formatting rules)
 * - Ignore patterns
 *
 * @param {object} [options]
 * @param {string[]} [options.extraIgnores]
 * @returns {import('eslint').Linter.Config[]}
 */
export const createTailConfigs = (options = {}) => {
  const { extraIgnores = [] } = options;

  return [
    // Put eslint-config-prettier last to override other configs
    eslintConfigPrettier,
    {
      ignores: [...coreIgnores, ...extraIgnores],
    },
  ];
};
