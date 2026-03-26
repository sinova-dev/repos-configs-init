import fs from 'fs/promises';
import { execSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';
import merge from 'lodash.merge';
import inquirer from 'inquirer';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';

import { runWhenMain } from '../helpers/run-when-main.mjs';
import { appendCommentedOutContent } from '../helpers/comment-out-content.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const packageJsonPath = path.join(__dirname, '../package.json');
const packageJson = JSON.parse(await fs.readFile(packageJsonPath, 'utf-8'));

const projectRoot = process.cwd();

const PRESET = Object.freeze({
  BACKEND: 'backend',
  FRONTEND: 'frontend',
  NEXT: 'next',
});

const PRESET_CHOICES = Object.freeze([
  { name: 'Backend', value: PRESET.BACKEND },
  { name: 'Basic Frontend', value: PRESET.FRONTEND },
  { name: 'Next.js', value: PRESET.NEXT },
]);

const SCRIPT_TYPE_CHECK = 'type-check';
const SCRIPT_TYPE_CHECK_WATCH = 'type-check:watch';
const TYPE_CHECK_SCRIPT_CMD = 'tsc --noEmit';
const TYPE_CHECK_WATCH_SCRIPT_CMD = 'tsc --noEmit --watch';

const BASE_CONFIG_TEMPLATE = (extendsPath) => `{
  "extends": "${extendsPath}",
  "compilerOptions": {
    // optionally override shared compiler options here
  }
}
`;

const NEXT_CONFIG_TEMPLATE = (extendsPath) => `{
  "extends": "${extendsPath}",
  "compilerOptions": {
    "plugins": [{ "name": "next" }]
    // optionally override shared compiler options here
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
`;

const TSCONFIG_FILENAME = 'tsconfig.json';
const tsconfigPath = path.join(projectRoot, TSCONFIG_FILENAME);
const requiredDependencies = [packageJson.name, 'typescript'];

function getExtendsPath(packageName, preset) {
  const extendsPathMap = {
    [PRESET.BACKEND]: `${packageName}/tsconfig/backend/index.json`,
    [PRESET.FRONTEND]: `${packageName}/tsconfig/frontend/index.json`,
    [PRESET.NEXT]: `${packageName}/tsconfig/frontend/index.json`,
  };
  return extendsPathMap[preset] ?? extendsPathMap[PRESET.BACKEND];
}

/**
 * @param {{ packageName: string, preset: string, existingConfig?: string | null }} options
 */
function generateConfigContent({ packageName, preset, existingConfig = null }) {
  const extendsPath = getExtendsPath(packageName, preset);
  let baseConfig;

  switch (preset) {
    case PRESET.NEXT:
      baseConfig = NEXT_CONFIG_TEMPLATE(extendsPath);
      break;
    default:
      baseConfig = BASE_CONFIG_TEMPLATE(extendsPath);
      break;
  }

  if (existingConfig) {
    return appendCommentedOutContent(baseConfig, existingConfig, 'Previous tsconfig (commented out):');
  }

  return baseConfig;
}

function parseCliArgs() {
  const argv = yargs(hideBin(process.argv))
    .option('backend', {
      type: 'boolean',
      describe: 'Use backend tsconfig preset',
    })
    .option('frontend', {
      type: 'boolean',
      describe: 'Use frontend tsconfig preset',
    })
    .option('next', {
      type: 'boolean',
      describe: 'Use frontend Next.js tsconfig preset',
    })
    .option('nextjs', {
      type: 'boolean',
      describe: 'Alias for --next',
    })
    .conflicts('backend', ['frontend', 'next', 'nextjs'])
    .conflicts('frontend', ['next', 'nextjs'])
    .help()
    .parse();

  const preset =
    (argv.backend && PRESET.BACKEND) ||
    (argv.frontend && PRESET.FRONTEND) ||
    ((argv.next || argv.nextjs) && PRESET.NEXT) ||
    null;

  return { preset };
}

function handleError(message, err) {
  console.error(`❌ ${message}:`, err.message);
  process.exit(1);
}

export async function setupTsconfig() {
  console.log(`\n🧩 Setting up TypeScript config with ${packageJson.name} presets...`);

  const { preset: presetFromCli } = parseCliArgs();
  let preset = presetFromCli;

  if (!preset) {
    const { preset: selectedPreset } = await inquirer.prompt([
      {
        type: 'list',
        name: 'preset',
        message: 'Which tsconfig preset would you like to use?',
        choices: PRESET_CHOICES,
        default: PRESET.BACKEND,
      },
    ]);
    preset = selectedPreset;
  }

  try {
    const installCmd = `pnpm add -D ${requiredDependencies.join(' ')}`;
    console.log(`📦 Running: ${installCmd}`);
    execSync(installCmd, { stdio: 'inherit' });
  } catch (err) {
    handleError('Failed to install config package and TypeScript', err);
  }

  try {
    let existingConfig;
    try {
      existingConfig = await fs.readFile(tsconfigPath, 'utf-8');
    } catch (error) {
      if (error.code === 'ENOENT') existingConfig = null;
      else throw error;
    }

    const configContent = generateConfigContent({
      packageName: packageJson.name,
      preset,
      existingConfig,
    });
    await fs.writeFile(tsconfigPath, configContent);

    console.info(
      existingConfig
        ? `✅ ${TSCONFIG_FILENAME} updated with new preset (previous config commented out).`
        : `✅ ${TSCONFIG_FILENAME} created.`,
    );
  } catch (err) {
    handleError('Error handling tsconfig file', err);
  }

  const targetPackageJsonPath = path.join(projectRoot, 'package.json');

  try {
    const targetPackageJson = JSON.parse(await fs.readFile(targetPackageJsonPath, 'utf-8'));

    const typeCheckScripts = {
      [SCRIPT_TYPE_CHECK]: TYPE_CHECK_SCRIPT_CMD,
      [SCRIPT_TYPE_CHECK_WATCH]: TYPE_CHECK_WATCH_SCRIPT_CMD,
    };

    if (!targetPackageJson.scripts) {
      targetPackageJson.scripts = {};
    }

    targetPackageJson.scripts = merge({}, targetPackageJson.scripts, typeCheckScripts);

    await fs.writeFile(targetPackageJsonPath, JSON.stringify(targetPackageJson, null, 2) + '\n');
    console.info('✅ Type-check scripts added to package.json');
  } catch (err) {
    handleError('Error updating package.json scripts', err);
  }
}

runWhenMain(import.meta.url, setupTsconfig);
