import { getPrismaConfig } from './orm-prisma.mjs';

export const ORM = Object.freeze({ NONE: 'none', PRISMA: 'prisma' });

const ORM_CONFIG_GETTERS = Object.freeze({
  [ORM.PRISMA]: getPrismaConfig,
});

export const ORM_CHOICES = Object.freeze([
  { name: 'No ORM', value: ORM.NONE },
  { name: 'Prisma', value: ORM.PRISMA },
]);

export const getOrmConfig = (orm, ruleOverrides = {}) => {
  const getter = ORM_CONFIG_GETTERS[orm];
  return getter ? getter(ruleOverrides) : [];
};

export const isOrmSupported = (orm) => {
  return orm !== ORM.NONE && orm in ORM_CONFIG_GETTERS;
};
