import eslintConfigPrettier from 'eslint-config-prettier';
import { defineConfig } from 'eslint/config';
import globals from 'globals';

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

export { backendConfigs, backendConfig };
