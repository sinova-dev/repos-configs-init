import fs from 'fs/promises';
import { execSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';
import merge from 'lodash.merge';

import { requiredPlugins } from './index.mjs';
import { runWhenMain } from '../helpers/run-when-main.mjs';
import { appendCommentedOutContent } from '../helpers/comment-out-content.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const packageJsonPath = path.join(__dirname, '../package.json');
const packageJson = JSON.parse(await fs.readFile(packageJsonPath, 'utf-8'));

const projectRoot = process.cwd();

const PRETTIER_CONFIG_FILENAME = '.prettierrc.mjs';
const PRETTIER_IGNORE_FILENAME = '.prettierignore';
const SCRIPT_FORMAT = 'format';
const SCRIPT_FORMAT_CHECK = 'format:check';
const FORMAT_SCRIPT_WRITE = 'prettier . --write --log-level=warn';
const FORMAT_SCRIPT_CHECK = 'prettier . --check --log-level=warn';

const prettierConfigPath = path.join(projectRoot, PRETTIER_CONFIG_FILENAME);
const prettierIgnorePath = path.join(projectRoot, PRETTIER_IGNORE_FILENAME);

function generateConfigContent(packageName, existingConfig = null) {
  const baseConfig = `import { resolveConfig } from '${packageName}/prettier-config';

export default resolveConfig({
  // optionally override defaults here
});
`;

  if (existingConfig) {
    return appendCommentedOutContent(baseConfig, existingConfig);
  }

  return baseConfig;
}

function handleError(message, err) {
  console.error(`❌ ${message}:`, err.message);
  process.exit(1);
}

export async function setupPrettier() {
  console.log(`🧼 Setting up Prettier with ${packageJson.name} config...`);

  try {
    const installCmd = `pnpm add -D ${requiredPlugins.join(' ')}`;
    console.log(`📦 Running: ${installCmd}`);
    execSync(installCmd, { stdio: 'inherit' });
  } catch (err) {
    handleError('Failed to install plugins', err);
  }

  try {
    const existingConfig = await fs.readFile(prettierConfigPath, 'utf-8');
    const configContent = generateConfigContent(packageJson.name, existingConfig);
    await fs.writeFile(prettierConfigPath, configContent);
    console.info(`✅ ${PRETTIER_CONFIG_FILENAME} updated with new config (previous config commented out).`);
  } catch (err) {
    if (err.code === 'ENOENT') {
      const configContent = generateConfigContent(packageJson.name);
      await fs.writeFile(prettierConfigPath, configContent);
      console.info(`✅ ${PRETTIER_CONFIG_FILENAME} created.`);
    } else {
      handleError('Error handling config file', err);
    }
  }

  const targetPackageJsonPath = path.join(projectRoot, 'package.json');

  try {
    const targetPackageJson = JSON.parse(await fs.readFile(targetPackageJsonPath, 'utf-8'));

    const formatScripts = {
      [SCRIPT_FORMAT]: FORMAT_SCRIPT_WRITE,
      [SCRIPT_FORMAT_CHECK]: FORMAT_SCRIPT_CHECK,
    };

    if (!targetPackageJson.scripts) {
      targetPackageJson.scripts = {};
    }

    targetPackageJson.scripts = merge({}, targetPackageJson.scripts, formatScripts);

    await fs.writeFile(targetPackageJsonPath, JSON.stringify(targetPackageJson, null, 2) + '\n');
    console.info('✅ Format scripts added to package.json');
  } catch (err) {
    handleError('Error updating package.json scripts', err);
  }

  try {
    await fs.access(prettierIgnorePath);
    console.info(`✅ ${PRETTIER_IGNORE_FILENAME} already exists`);
  } catch (err) {
    if (err.code === 'ENOENT') {
      const prettierIgnoreContent = `.git

node_modules

pnpm-lock.yaml

.idea
`;
      await fs.writeFile(prettierIgnorePath, prettierIgnoreContent);
      console.info(`✅ ${PRETTIER_IGNORE_FILENAME} created`);
    } else {
      handleError(`Error checking ${PRETTIER_IGNORE_FILENAME}`, err);
    }
  }
}

runWhenMain(import.meta.url, setupPrettier);
