import path from 'node:path';

import globals from 'globals';
import tseslint from 'typescript-eslint';

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
 * Creates shared ESLint flat config parts for both frontend and backend projects.
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
export function createCoreConfig(configDir, options = {}) {
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
