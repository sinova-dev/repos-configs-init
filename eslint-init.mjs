#!/usr/bin/env node
import fs from 'fs/promises';
import { execSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';
import merge from 'lodash.merge';
import inquirer from 'inquirer';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const packageJsonPath = path.join(__dirname, 'package.json');
const packageJson = JSON.parse(await fs.readFile(packageJsonPath, 'utf-8'));

const projectRoot = process.cwd();

const BACKEND_PRESETS = new Set(['backend', 'nestjs']);

function getEslintConfigPath(preset) {
  const filename = BACKEND_PRESETS.has(preset) ? 'eslint.config.mjs' : 'eslint.config.js';
  return path.join(projectRoot, filename);
}

const CONFIG_PACKAGE_ONLY = [packageJson.name];

function getConfigImportPath(packageName, preset) {
  const pathMap = {
    frontend: `${packageName}/eslint-config/frontend`,
    backend: `${packageName}/eslint-config/backend`,
    nestjs: `${packageName}/eslint-config/nestjs`,
    react: `${packageName}/eslint-config/react`,
    nextjs: `${packageName}/eslint-config/nextjs`,
  };
  return pathMap[preset] ?? `${packageName}/eslint-config/nextjs`;
}

function generateConfigContent({ packageName, preset, existingConfig = null }) {
  const configPath = getConfigImportPath(packageName, preset);
  const baseConfig = `import { createConfig } from '${configPath}';

export default [...createConfig(process.cwd())];
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
  console.log(`\n📐 Setting up ESLint with ${packageJson.name} config...`);

  const args = new Set(process.argv.slice(2));
  let preset;

  if (args.has('--backend')) {
    preset = 'backend';
  } else if (args.has('--nestjs')) {
    preset = 'nestjs';
  } else if (args.has('--frontend')) {
    preset = 'frontend';
  } else if (args.has('--nextjs')) {
    preset = 'nextjs';
  } else if (args.has('--react')) {
    preset = 'react';
  } else {
    const response = await inquirer.prompt([
      {
        type: 'list',
        name: 'preset',
        message: 'Which ESLint preset do you want to set up?',
        default: 'nextjs',
        choices: [
          { name: 'Next.js', value: 'nextjs' },
          { name: 'React (Vite, CRA, etc.)', value: 'react' },
          { name: 'Frontend (browser/JSX)', value: 'frontend' },
          { name: 'Backend (Node/TS)', value: 'backend' },
          { name: 'NestJS', value: 'nestjs' },
        ],
      },
    ]);
    preset = response.preset;
  }

  try {
    const installCmd = `pnpm add -D ${CONFIG_PACKAGE_ONLY.join(' ')}`;
    console.log(`📦 Installing config package (ESLint and plugins are bundled): ${installCmd}`);
    execSync(installCmd, { stdio: 'inherit' });
  } catch (err) {
    handleError('Failed to install config package', err);
  }

  const eslintConfigPath = getEslintConfigPath(preset);
  const configFilename = path.basename(eslintConfigPath);

  try {
    const existingConfig = await fs.readFile(eslintConfigPath, 'utf-8').catch((err) => {
      if (err.code === 'ENOENT') return null;
      throw err;
    });
    const configContent = generateConfigContent({ packageName: packageJson.name, preset, existingConfig });
    await fs.writeFile(eslintConfigPath, configContent);
    console.info(
      existingConfig
        ? `✅ ${configFilename} updated with new config (previous config commented out).`
        : `✅ ${configFilename} created.`,
    );
  } catch (err) {
    handleError('Error handling config file', err);
  }

  const targetPackageJsonPath = path.join(projectRoot, 'package.json');

  try {
    const targetPackageJson = JSON.parse(await fs.readFile(targetPackageJsonPath, 'utf-8'));

    const lintScripts = {
      lint: 'eslint . --max-warnings=0 --cache',
      'lint:fix': 'eslint . --fix',
    };

    if (!targetPackageJson.scripts) {
      targetPackageJson.scripts = {};
    }

    targetPackageJson.scripts = merge({}, targetPackageJson.scripts, lintScripts);

    if (!targetPackageJson['lint-staged']) {
      targetPackageJson['lint-staged'] = {};
    }
    targetPackageJson['lint-staged'] = merge({}, targetPackageJson['lint-staged'], {
      '**/*.{js,jsx,ts,tsx,mjs,cjs}': 'eslint --fix',
    });

    await fs.writeFile(targetPackageJsonPath, JSON.stringify(targetPackageJson, null, 2) + '\n');
    console.info('✅ Lint scripts and lint-staged ESLint rule added to package.json');
  } catch (err) {
    handleError('Error updating package.json scripts', err);
  }
}

// Run when executed directly (e.g. node eslint-init.mjs or via bin)
const __filename = fileURLToPath(import.meta.url);
if (process.argv[1] && path.resolve(process.argv[1]) === path.resolve(__filename)) {
  setupEslint().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
