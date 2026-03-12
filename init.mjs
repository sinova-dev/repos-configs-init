import inquirer from 'inquirer';

import { setupPrettier } from './prettier-init.mjs';
import { setupHusky } from './husky-init.mjs';
import { setupEslint } from './eslint/init.mjs';

async function main() {
  console.log('🚀 Initializing development tools...');

  const { shouldInstallAll } = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'shouldInstallAll',
      message: 'Would you like to install all recommended development tools (Prettier, ESLint, and Husky)?',
      default: true,
    },
  ]);

  if (shouldInstallAll) {
    await setupPrettier();
    await setupEslint();
    await setupHusky();
    console.info('✨ All done!');
    return;
  }

  const { shouldSetupPrettier, shouldSetupEslint, shouldSetupHusky } = await inquirer.prompt([
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
  ]);

  if (shouldSetupPrettier) {
    await setupPrettier();
  }

  if (shouldSetupEslint) {
    await setupEslint();
  }

  if (shouldSetupHusky) {
    await setupHusky();
  }

  console.info('✨ All done!');
}

main();
