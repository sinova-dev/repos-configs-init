import merge from 'lodash.merge';

export const baseConfig = {
  printWidth: 120,
  trailingComma: 'all',
  singleQuote: true,
  singleAttributePerLine: true,
};

export const PRETTIER_PRESET = Object.freeze({
  FRONTEND: 'frontend',
  BACKEND: 'backend',
});

const TAILWIND_PLUGIN = 'prettier-plugin-tailwindcss';

export const requiredPluginsByPreset = Object.freeze({
  [PRETTIER_PRESET.FRONTEND]: [TAILWIND_PLUGIN],
  [PRETTIER_PRESET.BACKEND]: [],
});

export function resolveConfig(externalConfig = {}) {
  const plugins = [...(externalConfig?.plugins ?? []), ...requiredPluginsByPreset[PRETTIER_PRESET.FRONTEND]];

  return merge({}, baseConfig, externalConfig, { plugins });
}

export function resolveBackendConfig(externalConfig = {}) {
  const plugins = [...(externalConfig?.plugins ?? []), ...requiredPluginsByPreset[PRETTIER_PRESET.BACKEND]];

  return merge({}, baseConfig, externalConfig, { plugins });
}
