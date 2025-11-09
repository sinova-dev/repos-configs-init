#!/usr/bin/env node
import inquirer from 'inquirer';

import { setupPrettier } from './prettier-init.mjs';
import { setupHusky } from './husky-init.mjs';
import { setupEslint } from './eslint-init.mjs';

async function main() {
  console.log('🚀 Initializing development tools...');

  const { shouldInstallAll } = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'shouldInstallAll',
      message: 'Install all required development tools?',
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
      message: 'Set up Prettier configuration?',
      default: true,
    },
    {
      type: 'confirm',
      name: 'shouldSetupEslint',
      message: 'Set up ESLint configuration?',
      default: true,
    },
    {
      type: 'confirm',
      name: 'shouldSetupHusky',
      message: 'Set up Husky with pre-commit hooks?',
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
