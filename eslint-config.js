import { defineConfig } from 'eslint/config';

import { baseConfig, requiredPlugins } from './eslint-config.base.js';
import { backendConfig, nestjsBackendConfig, nestjsBackendNoSwaggerConfig } from './eslint-config.backend.js';

export { baseConfig, backendConfig, nestjsBackendConfig, nestjsBackendNoSwaggerConfig, requiredPlugins };

export function resolveConfig(configs = []) {
  const normalized = Array.isArray(configs) ? configs.filter(Boolean) : [configs];

  if (normalized.length === 0) {
    return defineConfig(...baseConfig);
  }

  return defineConfig(...normalized.flat());
}
