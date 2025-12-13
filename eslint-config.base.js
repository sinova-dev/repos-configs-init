import js from '@eslint/js';
import comments from '@eslint-community/eslint-plugin-eslint-comments/configs';
import checkFile from 'eslint-plugin-check-file';
import erasableSyntaxOnly from 'eslint-plugin-erasable-syntax-only';
import eslintConfigPrettier from 'eslint-config-prettier';
import eslintPluginUnicorn from 'eslint-plugin-unicorn';
import importPlugin from 'eslint-plugin-import';
import jsdoc from 'eslint-plugin-jsdoc';
import { defineConfig } from 'eslint/config';
import globals from 'globals';
import tseslint from 'typescript-eslint';

const baseLanguageOptions = {
  ecmaVersion: 'latest',
  sourceType: 'module',
  parser: tseslint.parser,
  parserOptions: {
    ecmaFeatures: { jsx: true },
    projectService: true,
    tsconfigRootDir: process.cwd(),
  },
  globals: {
    ...globals.browser,
    ...globals.node,
    ...globals.es2020,
  },
};

const baseSettings = {
  'import/resolver': {
    typescript: {
      alwaysTryTypes: true,
      project: './tsconfig.json',
    },
    node: true,
  },
};

const baseRules = {
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
  'unicorn/no-null': 'off', // TODO: enable when null usage is removed
  'unicorn/prevent-abbreviations': 'off', // TODO: enable later
  'unicorn/no-array-sort': 'off',
  'unicorn/no-array-reverse': 'off',
  'jsdoc/tag-lines': 'off',
};

const sharedIgnores = {
  ignores: [
    'global.d.ts',
    'next-env.d.ts',
    'src/server/api/trpc.ts',
    'tailwind.config.ts',
    'playwright.config.ts',
    'next.config.js',
    '**/node_modules/**',
    'dist/**',
    'build/**',
    '.next/**',
    'out/**',
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
  ],
};

const baseConfigs = [
  js.configs.recommended,
  tseslint.configs.strictTypeChecked,
  tseslint.configs.stylisticTypeChecked,
  eslintPluginUnicorn.configs.recommended,
  importPlugin.flatConfigs.recommended,
  comments.recommended,
  erasableSyntaxOnly.configs.recommended,
  jsdoc.configs['flat/recommended-typescript-error'],
  {
    languageOptions: baseLanguageOptions,
    settings: baseSettings,
    plugins: {
      'check-file': checkFile,
    },
    rules: baseRules,
  },
  {
    files: ['.prettierrc.mjs'],
    rules: {
      'import/no-default-export': 'off',
    },
    extends: [tseslint.configs.disableTypeChecked],
  },
  {
    files: ['*.js'],
    rules: {
      'global-require': 'off',
    },
  },
  {
    files: ['**/*.js'],
    extends: [tseslint.configs.disableTypeChecked],
  },
];

const baseConfig = defineConfig(...baseConfigs, sharedIgnores, eslintConfigPrettier);

const requiredPlugins = [
  'eslint',
  '@eslint/js',
  '@eslint/eslintrc',
  'typescript-eslint',
  '@darraghor/eslint-plugin-nestjs-typed',
  'eslint-config-prettier',
  'globals',
  '@eslint-community/eslint-plugin-eslint-comments',
  'eslint-import-resolver-typescript',
  'eslint-plugin-check-file',
  'eslint-plugin-import',
  'eslint-plugin-unicorn',
  'eslint-plugin-erasable-syntax-only',
  'eslint-plugin-jsdoc',
  '@next/eslint-plugin-next',
  'eslint-plugin-react',
  'eslint-plugin-react-hooks',
  'eslint-plugin-react-refresh',
  'eslint-plugin-jsx-a11y',
  'eslint-plugin-storybook',
  'eslint-plugin-tailwindcss',
  'eslint-plugin-i18next',
  'eslint-plugin-playwright',
];

export {
  baseLanguageOptions,
  baseSettings,
  baseRules,
  sharedIgnores,
  baseConfigs,
  baseConfig,
  requiredPlugins,
};
