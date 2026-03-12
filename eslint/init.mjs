import fs from 'fs/promises';
import { execSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';
import merge from 'lodash.merge';
import inquirer from 'inquirer';

import { runWhenMain } from '../helpers/run-when-main.mjs';
import { ORM } from './backend.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const packageJsonPath = path.join(__dirname, '../package.json');
const packageJson = JSON.parse(await fs.readFile(packageJsonPath, 'utf-8'));

const projectRoot = process.cwd();

const ESLINT_CONFIG_JS = 'eslint.config.js';
const ESLINT_CONFIG_MJS = 'eslint.config.mjs';

const PRESET = Object.freeze({
  BACKEND: 'backend',
  NESTJS: 'nestjs',
  FRONTEND: 'frontend',
  NEXTJS: 'nextjs',
  REACT: 'react',
});

const MJS_CONFIG_PRESETS = new Set([PRESET.BACKEND, PRESET.NESTJS]);

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

const LINT_SCRIPT_BASE = 'eslint . --max-warnings=0 --cache';
const LINT_STAGED_GLOB = '**/*.{js,jsx,ts,tsx,mjs,cjs}';
const SCRIPT_LINT = 'lint';
const SCRIPT_LINT_FIX = 'lint:fix';

function getEslintConfigPath(preset) {
  const filename = MJS_CONFIG_PRESETS.has(preset) ? ESLINT_CONFIG_MJS : ESLINT_CONFIG_JS;
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

function getConfigImportPath(packageName, preset) {
  const pathMap = {
    [PRESET.FRONTEND]: `${packageName}/eslint-config/frontend`,
    [PRESET.BACKEND]: `${packageName}/eslint-config/backend`,
    [PRESET.NESTJS]: `${packageName}/eslint-config/nestjs`,
    [PRESET.REACT]: `${packageName}/eslint-config/react`,
    [PRESET.NEXTJS]: `${packageName}/eslint-config/nextjs`,
  };
  return pathMap[preset] ?? `${packageName}/eslint-config/nextjs`;
}

function generateConfigContent({ packageName, preset, orm = ORM.NONE, existingConfig = null }) {
  const configPath = getConfigImportPath(packageName, preset);
  const useOrmOption = orm === ORM.PRISMA && (preset === PRESET.BACKEND || preset === PRESET.NESTJS);
  const configArg = useOrmOption ? `process.cwd(), { orm: '${ORM.PRISMA}' }` : 'process.cwd()';

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
  let orm = ORM.NONE;

  if (args.has('--backend')) {
    preset = PRESET.BACKEND;
  } else if (args.has('--nestjs')) {
    preset = PRESET.NESTJS;
  } else if (args.has('--frontend')) {
    preset = PRESET.FRONTEND;
  } else if (args.has('--nextjs')) {
    preset = PRESET.NEXTJS;
  } else if (args.has('--react')) {
    preset = PRESET.REACT;
  } else {
    const { stack } = await inquirer.prompt([
      {
        type: 'list',
        name: 'stack',
        message: 'Frontend or Backend?',
        choices: [
          { name: 'Frontend', value: PRESET.FRONTEND },
          { name: 'Backend', value: PRESET.BACKEND },
        ],
      },
    ]);

    const frontendPresets = [
      { name: 'Next.js', value: PRESET.NEXTJS },
      { name: 'React', value: PRESET.REACT },
      { name: 'Basic Frontend', value: PRESET.FRONTEND },
    ];
    const backendPresets = [
      { name: 'NestJS', value: PRESET.NESTJS },
      { name: 'Basic Backend', value: PRESET.BACKEND },
    ];

    const { preset: chosenPreset } = await inquirer.prompt([
      {
        type: 'list',
        name: 'preset',
        message: stack === PRESET.FRONTEND ? 'Which frontend preset?' : 'Which backend preset?',
        default: stack === PRESET.FRONTEND ? PRESET.NEXTJS : PRESET.NESTJS,
        choices: stack === PRESET.FRONTEND ? frontendPresets : backendPresets,
      },
    ]);
    preset = chosenPreset;

    if (stack === PRESET.BACKEND) {
      const { orm: chosenOrm } = await inquirer.prompt([
        {
          type: 'list',
          name: 'orm',
          message: 'Which ORM?',
          default: ORM.NONE,
          choices: [
            { name: 'No ORM', value: ORM.NONE },
            { name: 'Prisma', value: ORM.PRISMA },
          ],
        },
      ]);
      orm = chosenOrm;
    }
  }

  try {
    const installCmd = `pnpm add -D ${packageJson.name}`;
    console.log(`📦 Running: ${installCmd}`);
    execSync(installCmd, { stdio: 'inherit' });
  } catch (err) {
    handleError('Failed to install config package', err);
  }

  const eslintConfigPath = getEslintConfigPath(preset);
  const configFilename = path.basename(eslintConfigPath);

  try {
    await removeOtherEslintConfigs(eslintConfigPath);

    let existingConfig;
    try {
      existingConfig = fs.readFileSync(eslintConfigPath, 'utf-8');
    } catch (error) {
      if (error.code === 'ENOENT') existingConfig = null;
      else throw error;
    }

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

    const lintScripts = {
      [SCRIPT_LINT]: LINT_SCRIPT_BASE,
      [SCRIPT_LINT_FIX]: `${LINT_SCRIPT_BASE} --fix`,
    };

    if (!targetPackageJson.scripts) {
      targetPackageJson.scripts = {};
    }

    const scripts = targetPackageJson.scripts;
    const newScripts = {};
    const hasLint = SCRIPT_LINT in scripts;

    for (const key of Object.keys(scripts)) {
      if (key === SCRIPT_LINT_FIX) continue;
      if (key === SCRIPT_LINT) {
        newScripts[SCRIPT_LINT] = lintScripts[SCRIPT_LINT];
        newScripts[SCRIPT_LINT_FIX] = lintScripts[SCRIPT_LINT_FIX];
        continue;
      }
      newScripts[key] = scripts[key];
    }
    if (!hasLint) {
      newScripts[SCRIPT_LINT] = lintScripts[SCRIPT_LINT];
      newScripts[SCRIPT_LINT_FIX] = lintScripts[SCRIPT_LINT_FIX];
    }

    targetPackageJson.scripts = newScripts;

    if (!targetPackageJson['lint-staged']) {
      targetPackageJson['lint-staged'] = {};
    }
    targetPackageJson['lint-staged'] = merge({}, targetPackageJson['lint-staged'], {
      [LINT_STAGED_GLOB]: 'eslint',
    });

    await fs.writeFile(targetPackageJsonPath, JSON.stringify(targetPackageJson, null, 2) + '\n');
    console.info('✅ Lint scripts and lint-staged ESLint rule added to package.json');
  } catch (err) {
    handleError('Error updating package.json scripts', err);
  }
}

runWhenMain(import.meta.url, setupEslint);
