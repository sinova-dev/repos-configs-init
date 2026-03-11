import fs from 'fs/promises';
import { execSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';
import merge from 'lodash.merge';
import inquirer from 'inquirer';

import { runWhenMain } from '../helpers/run-when-main.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const packageJsonPath = path.join(__dirname, '../package.json');
const packageJson = JSON.parse(await fs.readFile(packageJsonPath, 'utf-8'));

const projectRoot = process.cwd();

const BACKEND_PRESETS = new Set(['backend', 'nestjs']);

/** All known ESLint config filenames (flat + legacy). Generated config replaces any of these. */
const ESLINT_CONFIG_FILENAMES = [
  'eslint.config.js',
  'eslint.config.mjs',
  'eslint.config.cjs',
  '.eslintrc',
  '.eslintrc.js',
  '.eslintrc.cjs',
  '.eslintrc.yaml',
  '.eslintrc.yml',
  '.eslintrc.json',
];

function getEslintConfigPath(preset) {
  const filename = BACKEND_PRESETS.has(preset) ? 'eslint.config.mjs' : 'eslint.config.js';
  return path.join(projectRoot, filename);
}

async function removeOtherEslintConfigs(keepPath) {
  const keepFilename = path.basename(keepPath);
  for (const name of ESLINT_CONFIG_FILENAMES) {
    if (name === keepFilename) continue;
    const filePath = path.join(projectRoot, name);
    try {
      await fs.unlink(filePath);
      console.info(`✅ Removed existing ${name}`);
    } catch (err) {
      if (err.code !== 'ENOENT') throw err;
    }
  }
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

function generateConfigContent({ packageName, preset, orm = 'none', existingConfig = null }) {
  const configPath = getConfigImportPath(packageName, preset);
  const useOrmOption = orm === 'prisma' && (preset === 'backend' || preset === 'nestjs');
  const configArg = useOrmOption ? "process.cwd(), { orm: 'prisma' }" : 'process.cwd()';

  const baseConfig = `import { createConfig } from '${configPath}';

export default [...createConfig(${configArg})];
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
  let orm = 'none';

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
    const { stack } = await inquirer.prompt([
      {
        type: 'list',
        name: 'stack',
        message: 'Frontend or Backend?',
        choices: [
          { name: 'Frontend', value: 'frontend' },
          { name: 'Backend', value: 'backend' },
        ],
      },
    ]);

    const frontendPresets = [
      { name: 'Next.js', value: 'nextjs' },
      { name: 'React', value: 'react' },
      { name: 'Basic Frontend', value: 'frontend' },
    ];
    const backendPresets = [
      { name: 'NestJS', value: 'nestjs' },
      { name: 'Basic Backend', value: 'backend' },
    ];

    const { preset: chosenPreset } = await inquirer.prompt([
      {
        type: 'list',
        name: 'preset',
        message: stack === 'frontend' ? 'Which frontend preset?' : 'Which backend preset?',
        default: stack === 'frontend' ? 'nextjs' : 'nestjs',
        choices: stack === 'frontend' ? frontendPresets : backendPresets,
      },
    ]);
    preset = chosenPreset;

    if (stack === 'backend') {
      const { orm: chosenOrm } = await inquirer.prompt([
        {
          type: 'list',
          name: 'orm',
          message: 'Which ORM?',
          default: 'none',
          choices: [
            { name: 'No ORM', value: 'none' },
            { name: 'Prisma', value: 'prisma' },
          ],
        },
      ]);
      orm = chosenOrm;
    }
  }

  try {
    const installCmd = `pnpm add -D ${CONFIG_PACKAGE_ONLY.join(' ')}`;
    console.log(`📦 Running: ${installCmd}`);
    execSync(installCmd, { stdio: 'inherit' });
  } catch (err) {
    handleError('Failed to install config package', err);
  }

  const eslintConfigPath = getEslintConfigPath(preset);
  const configFilename = path.basename(eslintConfigPath);

  try {
    await removeOtherEslintConfigs(eslintConfigPath);

    const existingConfig = await fs.readFile(eslintConfigPath, 'utf-8').catch((err) => {
      if (err.code === 'ENOENT') return null;
      throw err;
    });
    const configContent = generateConfigContent({
      packageName: packageJson.name,
      preset,
      orm,
      existingConfig,
    });
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

    const lintCmd = 'eslint . --max-warnings=0 --cache';
    const lintScripts = {
      lint: lintCmd,
      'lint:fix': `${lintCmd} --fix`,
    };

    if (!targetPackageJson.scripts) {
      targetPackageJson.scripts = {};
    }

    const scripts = targetPackageJson.scripts;
    const newScripts = {};
    const hasLint = 'lint' in scripts;

    for (const key of Object.keys(scripts)) {
      if (key === 'lint:fix') continue;
      if (key === 'lint') {
        newScripts.lint = lintScripts.lint;
        newScripts['lint:fix'] = lintScripts['lint:fix'];
        continue;
      }
      newScripts[key] = scripts[key];
    }
    if (!hasLint) {
      newScripts.lint = lintScripts.lint;
      newScripts['lint:fix'] = lintScripts['lint:fix'];
    }

    targetPackageJson.scripts = newScripts;

    if (!targetPackageJson['lint-staged']) {
      targetPackageJson['lint-staged'] = {};
    }
    targetPackageJson['lint-staged'] = merge({}, targetPackageJson['lint-staged'], {
      '**/*.{js,jsx,ts,tsx,mjs,cjs}': 'eslint',
    });

    await fs.writeFile(targetPackageJsonPath, JSON.stringify(targetPackageJson, null, 2) + '\n');
    console.info('✅ Lint scripts and lint-staged ESLint rule added to package.json');
  } catch (err) {
    handleError('Error updating package.json scripts', err);
  }
}

runWhenMain(import.meta.url, setupEslint);
