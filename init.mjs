import inquirer from 'inquirer';

import { resolveStack } from './helpers/project-stack.mjs';
import { setupPrettier } from './prettier/init.mjs';
import { setupEslint } from './eslint/init.mjs';
import { setupTsconfig } from './tsconfig/init.mjs';
import { setupHusky } from './husky/init.mjs';

async function main() {
  console.log('🚀 Initializing development tools...');

  const packageManager = await resolvePackageManager();
  console.log(`📦 Package manager: ${packageManager}`);

  const stack = await resolveStack();
  console.log(`🛠️ Project stack: ${stack}`);

  const { shouldInstallAll } = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'shouldInstallAll',
      message: 'Would you like to install all recommended development tools (Prettier, ESLint, Husky, and tsconfig)?',
      default: true,
    },
  ]);

  if (shouldInstallAll) {
    await setupPrettier({ stack });
    await setupEslint();
    await setupTsconfig();
    await setupHusky();
    console.info('✨ All done!');
    return;
  }

  const { shouldSetupPrettier, shouldSetupEslint, shouldSetupHusky, shouldSetupTsconfig } = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'shouldSetupPrettier',
      message: 'Would you like to configure Prettier for code formatting?',
      default: true,
    },
    {
      type: 'confirm',
      name: 'shouldSetupEslint',
      message: 'Would you like to configure ESLint for linting?',
      default: true,
    },
    {
      type: 'confirm',
      name: 'shouldSetupHusky',
      message: 'Would you like to set up Husky with pre-commit hooks for automated checks?',
      default: true,
    },
    {
      type: 'confirm',
      name: 'shouldSetupTsconfig',
      message: 'Would you like to set up a shared TypeScript config (tsconfig) preset?',
      default: true,
    },
  ]);

  if (shouldSetupPrettier) {
    await setupPrettier({ stack });
  }

  if (shouldSetupEslint) {
    await setupEslint();
  }

  if (shouldSetupTsconfig) {
    await setupTsconfig();
  }

  if (shouldSetupHusky) {
    await setupHusky();
  }

  console.info('✨ All done!');
}

main();
