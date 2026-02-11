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

function getEslintConfigPath(preset) {
  const filename = preset === 'backend' ? 'eslint.config.mjs' : 'eslint.config.js';
  return path.join(projectRoot, filename);
}

const coreEslintPackages = [
  packageJson.name,
  '@eslint/eslintrc',
  '@eslint-community/eslint-plugin-eslint-comments',
  '@eslint/js',
  'eslint',
  'eslint-config-prettier',
  'eslint-import-resolver-typescript',
  'eslint-plugin-erasable-syntax-only',
  'eslint-plugin-import',
  'eslint-plugin-jsdoc',
  'eslint-plugin-unicorn',
  'globals',
  'typescript-eslint',
];

const frontendOnlyEslintPackages = [
  '@next/eslint-plugin-next',
  'eslint-plugin-check-file',
  'eslint-plugin-i18next',
  'eslint-plugin-jsx-a11y',
  'eslint-plugin-playwright',
  'eslint-plugin-react',
  'eslint-plugin-react-hooks',
  'eslint-plugin-react-refresh',
  'eslint-plugin-storybook',
  // TODO: Re-enable when eslint-plugin-tailwindcss supports Tailwind CSS v4 (currently only supports v3).
  // 'eslint-plugin-tailwindcss',
];

const backendOnlyEslintPackages = ['@darraghor/eslint-plugin-nestjs-typed'];

function generateConfigContent({ packageName, preset, existingConfig = null }) {
  const importLine =
    preset === 'backend'
      ? `import { createBackendConfig } from '${packageName}/eslint-config/backend';`
      : `import { createFrontendConfig } from '${packageName}/eslint-config/frontend';`;

  const baseConfigLine =
    preset === 'backend'
      ? 'const baseConfig = createBackendConfig(__dirname);'
      : 'const baseConfig = createFrontendConfig(__dirname);';

  const exportLine = `export default [
  ...baseConfig
];`;

  const baseConfig = `${importLine}
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

${baseConfigLine}

${exportLine}
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
  } else if (args.has('--frontend')) {
    preset = 'frontend';
  } else {
    const response = await inquirer.prompt([
      {
        type: 'list',
        name: 'preset',
        message: 'Which ESLint preset do you want to set up?',
        default: 'frontend',
        choices: [
          { name: 'Frontend (Next.js / React)', value: 'frontend' },
          { name: 'Backend (NestJS)', value: 'backend' },
        ],
      },
    ]);
    preset = response.preset;
  }

  const requiredEslintPackages =
    preset === 'backend'
      ? [...coreEslintPackages, ...backendOnlyEslintPackages]
      : [...coreEslintPackages, ...frontendOnlyEslintPackages];

  const peerDeps = packageJson.peerDependencies ?? {};
  const packagesWithVersions = requiredEslintPackages.map((pkg) => {
    const version = peerDeps[pkg];
    return version ? `${pkg}@${version}` : pkg;
  });

  try {
    const installCmd = `pnpm add -D ${packagesWithVersions.join(' ')}`;
    console.log(`📦 Running: ${installCmd}`);
    execSync(installCmd, { stdio: 'inherit' });
  } catch (err) {
    handleError('Failed to install ESLint packages', err);
  }

  const eslintConfigPath = getEslintConfigPath(preset);
  const configFilename = path.basename(eslintConfigPath);

  try {
    const existingConfig = await fs.readFile(eslintConfigPath, 'utf-8');
    const configContent = generateConfigContent({ packageName: packageJson.name, preset, existingConfig });
    await fs.writeFile(eslintConfigPath, configContent);
    console.info(`✅ ${configFilename} updated with new config (previous config commented out).`);
  } catch (err) {
    if (err.code === 'ENOENT') {
      const configContent = generateConfigContent({ packageName: packageJson.name, preset });
      await fs.writeFile(eslintConfigPath, configContent);
      console.info(`✅ ${configFilename} created.`);
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
