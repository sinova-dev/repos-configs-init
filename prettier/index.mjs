import merge from 'lodash.merge';
import * as tailwindPlugin from 'prettier-plugin-tailwindcss';

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

export const requiredPluginsByPreset = Object.freeze({
  [PRETTIER_PRESET.FRONTEND]: [tailwindPlugin],
  [PRETTIER_PRESET.BACKEND]: [],
});

const VALID_PRESETS = new Set(Object.values(PRETTIER_PRESET));
function isValidPreset(value) {
  return typeof value === 'string' && VALID_PRESETS.has(value);
}

function resolvePreset(explicitPreset) {
  if (isValidPreset(explicitPreset)) {
    return explicitPreset;
  }
  return PRETTIER_PRESET.BACKEND;
}

export function resolveConfig(externalConfig = {}) {
  const { preset: explicitPreset, ...rest } = externalConfig;
  const preset = resolvePreset(explicitPreset);
  const plugins = [...(rest.plugins ?? []), ...requiredPluginsByPreset[preset]];

  return merge({}, baseConfig, rest, { plugins });
}
