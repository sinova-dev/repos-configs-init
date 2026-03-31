import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import merge from 'lodash.merge';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';

import { PRETTIER_PRESET } from './index.mjs';
import { runWhenMain } from '../helpers/run-when-main.mjs';
import { appendCommentedOutContent } from '../helpers/comment-out-content.mjs';
import { removeOtherConfigs } from '../helpers/remove-other-configs.mjs';
import { resolveStack } from '../helpers/project-stack.mjs';
import { PRETTIER_CONFIG_FILENAMES } from './constants/config-filenames.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const packageJsonPath = path.join(__dirname, '../package.json');
const packageJson = JSON.parse(await fs.readFile(packageJsonPath, 'utf-8'));

const projectRoot = process.cwd();

const PRETTIER_CONFIG_FILENAME = '.prettierrc.mjs';
const PRETTIER_IGNORE_FILENAME = '.prettierignore';

const SCRIPT_FORMAT = 'format';
const FORMAT_SCRIPT_WRITE = 'prettier . --write --log-level=warn';
const SCRIPT_FORMAT_CHECK = 'format:check';
const FORMAT_SCRIPT_CHECK = 'prettier . --check --log-level=warn';

const prettierConfigPath = path.join(projectRoot, PRETTIER_CONFIG_FILENAME);
const prettierIgnorePath = path.join(projectRoot, PRETTIER_IGNORE_FILENAME);

/**
 * @param {{ packageName: string, preset: string, existingConfig?: string | null }} options
 */
function generateConfigContent({ packageName, preset, existingConfig = null }) {
  const baseConfig = `import { resolveConfig } from '${packageName}/prettier-config';

export default resolveConfig({
  preset: '${preset}',
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

export async function setupPrettier(options = {}) {
  console.log(`🧼 Setting up Prettier with ${packageJson.name} config...`);

  const { stack: stackHint } = options;

  const { preset } = await yargs(hideBin(process.argv))
    .option('preset', {
      type: 'string',
      choices: Object.values(PRETTIER_PRESET),
      description: 'Prettier preset to install',
    })
    .parse();

  const selectedPreset = preset ?? stackHint ?? (await resolveStack());

  try {
    await removeOtherConfigs(prettierConfigPath, PRETTIER_CONFIG_FILENAMES, projectRoot);

    let existingConfig;
    try {
      existingConfig = await fs.readFile(prettierConfigPath, 'utf-8');
    } catch (error) {
      if (error.code === 'ENOENT') existingConfig = null;
      else throw error;
    }

    const configContent = generateConfigContent({
      packageName: packageJson.name,
      preset: selectedPreset,
      existingConfig,
    });
    await fs.writeFile(prettierConfigPath, configContent);
    console.info(
      existingConfig
        ? `✅ ${PRETTIER_CONFIG_FILENAME} updated with new config (previous config commented out).`
        : `✅ ${PRETTIER_CONFIG_FILENAME} created.`,
    );
  } catch (err) {
    handleError('Error handling config file', err);
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
