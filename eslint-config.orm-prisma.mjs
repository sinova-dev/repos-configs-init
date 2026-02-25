import prisma from '@v2nic/eslint-plugin-prisma';

/**
 * Returns ESLint flat config for @v2nic/eslint-plugin-prisma.
 *
 * - **Schema** (`.prisma`): processor + naming rules on the virtual `*.prisma.js` output
 *   (schema-field-name-style, schema-model-name-style, schema-enum-*, db-table-name-style, etc.).
 * - **TypeScript** (`.ts`/`.tsx`): recommended rules (no-unsafe, require-select) plus
 *   no-snake-case-in-ts. Rule overrides apply in a final block.
 *
 * For VS Code linting of `.prisma` files, add to settings: "eslint.validate": ["javascript", "typescript", "prisma"].
 *
 * @param {import('eslint').Linter.RulesRecord} [ruleOverrides] - Rules to override (applied after the blocks above)
 * @returns {import('eslint').Linter.Config[]}
 */
const PRISMA_SCHEMA_RULES = {
  'prisma/schema-field-name-style': 'error',
  'prisma/schema-model-name-style': 'error',
  'prisma/schema-enum-name-style': 'error',
  'prisma/schema-enum-value-style': 'error',
  'prisma/db-table-name-style': 'error',
  'prisma/db-column-name-style': 'error',
  'prisma/db-enum-name-style': 'error',
  'prisma/db-enum-value-style': 'error',
};

export function getPrismaConfig(ruleOverrides = {}) {
  const configs = [
    {
      files: ['**/*.prisma'],
      plugins: { prisma },
      processor: prisma.processors['.prisma'],
    },
    {
      files: ['**/*.prisma.js'],
      plugins: { prisma },
      rules: PRISMA_SCHEMA_RULES,
    },
    {
      files: ['**/*.ts', '**/*.tsx'],
      plugins: { prisma },
      rules: {
        'prisma/no-unsafe': 'error',
        'prisma/require-select': 'error',
        'prisma/no-snake-case-in-ts': 'error',
      },
    },
  ];

  if (Object.keys(ruleOverrides).length > 0) {
    configs.push({ rules: ruleOverrides });
  }

  return configs;
}
