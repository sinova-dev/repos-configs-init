import eslintNestJs from '@darraghor/eslint-plugin-nestjs-typed';
import comments from '@eslint-community/eslint-plugin-eslint-comments/configs';
import js from '@eslint/js';
import erasableSyntaxOnly from 'eslint-plugin-erasable-syntax-only';
import importPlugin from 'eslint-plugin-import';
import jsdoc from 'eslint-plugin-jsdoc';
import eslintPluginUnicorn from 'eslint-plugin-unicorn';
import eslintConfigPrettier from 'eslint-config-prettier';
import { defineConfig } from 'eslint/config';
import tseslint from 'typescript-eslint';

import { coreIgnores, createCoreConfig } from './eslint-config.core.mjs';

const backendIgnores = [];

/**
 * Creates the ESLint flat config for backend (NestJS) projects.
 * Pass the directory containing eslint.config.js (typically import.meta.dirname).
 *
 * @param {string} configDir - The directory of the config file (project root)
 * @returns {import('eslint').Linter.Config[]}
 */
export function createBackendConfig(configDir) {
  return defineConfig(
    js.configs.recommended,
    tseslint.configs.strictTypeChecked,
    tseslint.configs.stylisticTypeChecked,
    eslintPluginUnicorn.configs.recommended,
    importPlugin.flatConfigs.recommended,
    comments.recommended,
    erasableSyntaxOnly.configs.recommended,
    jsdoc.configs['flat/recommended-typescript-error'],

    // NestJS typed ruleset (flat config)
    eslintNestJs.configs.flatRecommended,

    ...createCoreConfig(configDir),

    // Put eslint-config-prettier last to override other configs
    eslintConfigPrettier,

    {
      ignores: [...coreIgnores, ...backendIgnores],
    },
  );
}
