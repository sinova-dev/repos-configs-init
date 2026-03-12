import prisma from '@v2nic/eslint-plugin-prisma';

export const getPrismaConfig = (ruleOverrides = {}) => {
  const configs = [
    {
      files: ['**/*.prisma'],
      plugins: { prisma },
      processor: prisma.processors['.prisma'],
    },
    {
      files: ['**/*.prisma.js'],
      plugins: { prisma },
      rules: {
        'prisma/schema-field-name-style': 'error',
        'prisma/schema-model-name-style': 'error',
        'prisma/schema-enum-name-style': 'error',
        'prisma/schema-enum-value-style': 'error',
        'prisma/db-table-name-style': 'error',
        'prisma/db-column-name-style': 'error',
        'prisma/db-enum-name-style': 'error',
        'prisma/db-enum-value-style': 'error',
      },
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
};
