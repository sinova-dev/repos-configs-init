#!/usr/bin/env node
import fs from 'fs/promises';
import { execSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';
import merge from 'lodash.merge';

import { requiredPlugins } from './eslint-config.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const packageJsonPath = path.join(__dirname, 'package.json');
const packageJson = JSON.parse(await fs.readFile(packageJsonPath, 'utf-8'));

const projectRoot = process.cwd();
const eslintConfigPath = path.join(projectRoot, 'eslint.config.mjs');
const eslintIgnorePath = path.join(projectRoot, '.eslintignore');

function generateConfigContent(packageName, existingConfig = null) {
  const baseConfig = `import { resolveConfig } from '${packageName}/eslint-config';

/**
 * Defaults to the base TypeScript config.
 * To use framework presets, import them from the same path:
 *   import { frontendConfig, backendConfig } from '${packageName}/eslint-config';
 *   export default resolveConfig(frontendConfig);
 */

export default resolveConfig();
`;

  if (existingConfig) {
    return `${baseConfig}

// Previous configuration (commented out):
${existingConfig
  .split('\n')
  .map((line) => `// ${line}`)
  .join('\n')}`;
  }

  return baseConfig;
}

function handleError(message, err) {
  console.error(`❌ ${message}:`, err.message);
  process.exit(1);
}

export async function setupEslint() {
  console.log(`🔍 Setting up ESLint with ${packageJson.name} config...`);

  try {
    const installCmd = `pnpm add -D ${requiredPlugins.join(' ')}`;
    console.log(`📦 Running: ${installCmd}`);
    execSync(installCmd, { stdio: 'inherit' });
  } catch (err) {
    handleError('Failed to install plugins', err);
  }

  try {
    const existingConfig = await fs.readFile(eslintConfigPath, 'utf-8');
    const configContent = generateConfigContent(packageJson.name, existingConfig);
    await fs.writeFile(eslintConfigPath, configContent);
    console.info('✅ eslint.config.mjs updated with new config (previous config commented out).');
  } catch (err) {
    if (err.code === 'ENOENT') {
      // Check for legacy .eslintrc files
      const legacyPaths = [
        path.join(projectRoot, '.eslintrc.mjs'),
        path.join(projectRoot, '.eslintrc.js'),
        path.join(projectRoot, '.eslintrc.json'),
        path.join(projectRoot, '.eslintrc'),
      ];
      
      let legacyFound = false;
      for (const legacyPath of legacyPaths) {
        try {
          await fs.access(legacyPath);
          console.warn(`⚠️  Found legacy ESLint config at ${path.basename(legacyPath)}. Please migrate to flat config format (eslint.config.mjs).`);
          legacyFound = true;
          break;
        } catch {
          // Continue checking
        }
      }
      
      const configContent = generateConfigContent(packageJson.name);
      await fs.writeFile(eslintConfigPath, configContent);
      console.info('✅ eslint.config.mjs created.');
    } else {
      handleError('Error handling config file', err);
    }
  }

  const targetPackageJsonPath = path.join(projectRoot, 'package.json');

  try {
    const targetPackageJson = JSON.parse(await fs.readFile(targetPackageJsonPath, 'utf-8'));

    const lintScripts = {
      lint: 'eslint .',
      'lint:fix': 'eslint . --fix',
    };

    if (!targetPackageJson.scripts) {
      targetPackageJson.scripts = {};
    }

    targetPackageJson.scripts = merge({}, targetPackageJson.scripts, lintScripts);

    await fs.writeFile(targetPackageJsonPath, JSON.stringify(targetPackageJson, null, 2) + '\n');
    console.info('✅ Lint scripts added to package.json');
  } catch (err) {
    handleError('Error updating package.json scripts', err);
  }

  try {
    await fs.access(eslintIgnorePath);
    console.info('✅ .eslintignore already exists');
  } catch (err) {
    if (err.code === 'ENOENT') {
      const eslintIgnoreContent = `.git

node_modules

dist

build

coverage

*.min.js
`;
      await fs.writeFile(eslintIgnorePath, eslintIgnoreContent);
      console.info('✅ .eslintignore created');
    } else {
      handleError('Error checking .eslintignore', err);
    }
  }
}

