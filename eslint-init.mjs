#!/usr/bin/env node
import fs from 'fs/promises';
import { execSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';
import merge from 'lodash.merge';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const packageJsonPath = path.join(__dirname, 'package.json');
const packageJson = JSON.parse(await fs.readFile(packageJsonPath, 'utf-8'));

const projectRoot = process.cwd();
const eslintConfigPath = path.join(projectRoot, 'eslint.config.js');

const requiredEslintPackages = [
  packageJson.name,
  '@eslint/eslintrc',
  '@eslint-community/eslint-plugin-eslint-comments',
  '@eslint/js',
  '@next/eslint-plugin-next',
  'eslint',
  'eslint-config-prettier',
  'eslint-import-resolver-typescript',
  'eslint-plugin-check-file',
  'eslint-plugin-erasable-syntax-only',
  'eslint-plugin-i18next',
  'eslint-plugin-import',
  'eslint-plugin-jsdoc',
  'eslint-plugin-jsx-a11y',
  'eslint-plugin-playwright',
  'eslint-plugin-react',
  'eslint-plugin-react-hooks',
  'eslint-plugin-react-refresh',
  'eslint-plugin-storybook',
  'eslint-plugin-tailwindcss',
  'eslint-plugin-unicorn',
  'globals',
  'typescript-eslint',
];

function generateConfigContent(packageName, existingConfig = null) {
  const baseConfig = `import { createConfig } from '${packageName}/eslint-config';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default createConfig(__dirname);
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

  try {
    const installCmd = `pnpm add -D ${requiredEslintPackages.join(' ')}`;
    console.log(`📦 Running: ${installCmd}`);
    execSync(installCmd, { stdio: 'inherit' });
  } catch (err) {
    handleError('Failed to install ESLint packages', err);
  }

  try {
    const existingConfig = await fs.readFile(eslintConfigPath, 'utf-8');
    const configContent = generateConfigContent(packageJson.name, existingConfig);
    await fs.writeFile(eslintConfigPath, configContent);
    console.info('✅ eslint.config.js updated with new config (previous config commented out).');
  } catch (err) {
    if (err.code === 'ENOENT') {
      const configContent = generateConfigContent(packageJson.name);
      await fs.writeFile(eslintConfigPath, configContent);
      console.info('✅ eslint.config.js created.');
    } else {
      handleError('Error handling config file', err);
    }
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

    // Add ESLint to lint-staged for pre-commit hooks
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
