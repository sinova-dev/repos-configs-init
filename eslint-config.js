import { defineConfig } from 'eslint/config';

import { baseConfig, requiredPlugins } from './eslint-config.base.js';
import { backendConfig } from './eslint-config.backend.js';
import { frontendConfig } from './eslint-config.frontend.js';

export { baseConfig, frontendConfig, backendConfig, requiredPlugins };

export function resolveConfig(configs = []) {
  const normalized = Array.isArray(configs) ? configs.filter(Boolean) : [configs];

  if (normalized.length === 0) {
    return defineConfig(...baseConfig);
  }

  return defineConfig(...normalized.flat());
}
