import eslintConfigPrettier from 'eslint-config-prettier';
import { defineConfig } from 'eslint/config';
import globals from 'globals';
import eslintNestJs from '@darraghor/eslint-plugin-nestjs-typed';

import { baseConfigs, baseLanguageOptions, sharedIgnores } from './eslint-config.base.js';

const backendConfigs = [
  {
    languageOptions: {
      ...baseLanguageOptions,
      globals: {
        ...globals.node,
        ...globals.es2020,
      },
    },
  },
];

const backendConfig = defineConfig(...baseConfigs, ...backendConfigs, sharedIgnores, eslintConfigPrettier);

const nestjsBackendConfigs = [
  ...backendConfigs,
  eslintNestJs.configs.flatRecommended,
  {
    rules: {
      // Nest controllers/constructors often have many injected params.
      'max-params': ['error', 8],
    },
  },
  {
    files: ['**/*.spec.{js,jsx,ts,tsx}', '**/*.test.{js,jsx,ts,tsx}', '**/__tests__/**/*.{js,jsx,ts,tsx}'],
    languageOptions: {
      globals: {
        ...globals.jest,
      },
    },
  },
];

const nestjsBackendConfig = defineConfig(...baseConfigs, ...nestjsBackendConfigs, sharedIgnores, eslintConfigPrettier);

const nestjsBackendNoSwaggerConfigs = [...nestjsBackendConfigs, eslintNestJs.configs.flatNoSwagger];

const nestjsBackendNoSwaggerConfig = defineConfig(
  ...baseConfigs,
  ...nestjsBackendNoSwaggerConfigs,
  sharedIgnores,
  eslintConfigPrettier,
);

export {
  backendConfigs,
  backendConfig,
  nestjsBackendConfigs,
  nestjsBackendConfig,
  nestjsBackendNoSwaggerConfigs,
  nestjsBackendNoSwaggerConfig,
};
