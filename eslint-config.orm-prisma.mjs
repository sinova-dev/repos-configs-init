import configPrisma from 'eslint-config-prisma';

const prismaConfigArray = Array.isArray(configPrisma) ? configPrisma : [configPrisma];

/**
 * Returns the Prisma ESLint config. Use this when you need to layer Prisma rules
 * or apply overrides (e.g. to turn off specific rules from eslint-config-prisma).
 *
 * @param {import('eslint').Linter.RulesRecord} [ruleOverrides] - Rules to override (applied after Prisma config)
 * @returns {import('eslint').Linter.Config[]}
 */
export function getPrismaConfig(ruleOverrides = {}) {
  const configs = [...prismaConfigArray];
  if (Object.keys(ruleOverrides).length > 0) {
    configs.push({ rules: ruleOverrides });
  }
  return configs;
}
