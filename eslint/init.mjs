import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import inquirer from 'inquirer';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';

import { runWhenMain } from '../helpers/run-when-main.mjs';
import { appendCommentedOutContent } from '../helpers/comment-out-content.mjs';
import { removeOtherConfigs } from '../helpers/remove-other-configs.mjs';
import { installDevDependencies } from '../helpers/install-dev-dependencies.mjs';
import { ORM, ORM_CHOICES, isOrmSupported } from './orm/orm-registry.mjs';
import { ESLINT_CONFIG_FILENAMES } from './constants/config-filenames.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const packageJsonPath = path.join(__dirname, '../package.json');
const packageJson = JSON.parse(await fs.readFile(packageJsonPath, 'utf-8'));

const projectRoot = process.cwd();

const ESLINT_CONFIG_MJS = 'eslint.config.mjs';

const PRESET = Object.freeze({
  BACKEND: 'backend',
  NESTJS: 'nestjs',
  FRONTEND: 'frontend',
  NEXTJS: 'nextjs',
  REACT: 'react',
});

const PRESETS_WITH_ORM = new Set([PRESET.BACKEND, PRESET.NESTJS]);
const PRESETS_WITH_STORYBOOK = new Set([PRESET.REACT, PRESET.NEXTJS]);

const STACK_PRESET_CONFIG = Object.freeze({
  [PRESET.FRONTEND]: {
    displayName: 'Frontend',
    message: 'Which frontend preset would you like to use for ESLint?',
    choices: [
      { name: 'Basic Frontend', value: PRESET.FRONTEND },
      { name: 'React', value: PRESET.REACT },
      { name: 'Next.js', value: PRESET.NEXTJS },
    ],
    default: PRESET.FRONTEND,
    shouldShowOrmPrompt: false,
  },
  [PRESET.BACKEND]: {
    displayName: 'Backend',
    message: 'Which backend preset would you like to use for ESLint?',
    choices: [
      { name: 'Basic Backend', value: PRESET.BACKEND },
      { name: 'NestJS', value: PRESET.NESTJS },
    ],
    default: PRESET.BACKEND,
    shouldShowOrmPrompt: true,
  },
});

const STACK_CHOICES = Object.entries(STACK_PRESET_CONFIG).map(([value, { displayName }]) => ({
  name: displayName,
  value,
}));

const LINT_SCRIPT_BASE = 'eslint . --max-warnings=0 --cache';
const SCRIPT_LINT = 'lint';
const SCRIPT_LINT_FIX = 'lint:fix';

function getEslintConfigPath() {
  return path.join(projectRoot, ESLINT_CONFIG_MJS);
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

function generateConfigContent({
  packageName,
  preset,
  orm = ORM.NONE,
  storybook: includeStorybook = false,
  existingConfig = null,
}) {
  const configPath = getConfigImportPath(packageName, preset);
  const options = {};
  if (isOrmSupported(orm) && PRESETS_WITH_ORM.has(preset)) {
    options.orm = orm;
  }
  if (PRESETS_WITH_STORYBOOK.has(preset) && includeStorybook) {
    options.storybook = true;
  }
  const configArg = Object.keys(options).length > 0 ? `process.cwd(), ${JSON.stringify(options)}` : 'process.cwd()';

  const baseConfig = `import { createConfig } from '${configPath}';

export default [...createConfig(${configArg})];
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

function parseCliArgs() {
  const argv = yargs(hideBin(process.argv))
    .option('backend', {
      type: 'boolean',
      describe: 'Use backend preset',
    })
    .option('nestjs', {
      type: 'boolean',
      describe: 'Use NestJS preset',
    })
    .option('frontend', {
      type: 'boolean',
      describe: 'Use frontend preset',
    })
    .option('nextjs', {
      type: 'boolean',
      describe: 'Use Next.js preset',
    })
    .option('react', {
      type: 'boolean',
      describe: 'Use React preset',
    })
    .option('orm', {
      type: 'string',
      choices: Object.values(ORM),
      default: ORM.NONE,
      describe: 'ORM to include (backend/nestjs only)',
    })
    .option('storybook', {
      type: 'boolean',
      default: null,
      describe: 'Include Storybook plugin and rules (react/nextjs only). Omit to prompt.',
    })
    .help()
    .parse();

  const preset =
    (argv.backend && PRESET.BACKEND) ||
    (argv.nestjs && PRESET.NESTJS) ||
    (argv.frontend && PRESET.FRONTEND) ||
    (argv.nextjs && PRESET.NEXTJS) ||
    (argv.react && PRESET.REACT) ||
    null;

  return { preset, orm: argv.orm, storybook: argv.storybook };
}

export async function setupEslint() {
  console.log(`\n📐 Setting up ESLint with ${packageJson.name} config...`);

  const { preset: presetFromCli, orm: ormFromCli, storybook: storybookFromCli } = parseCliArgs();
  let preset = presetFromCli;
  let orm = ormFromCli;
  let storybook = storybookFromCli;

  if (!preset) {
    const { stack } = await inquirer.prompt([
      {
        type: 'list',
        name: 'stack',
        message: 'What type of project would you like to configure? (Frontend or Backend)',
        choices: STACK_CHOICES,
        default: PRESET.FRONTEND,
      },
    ]);

    const stackConfig = STACK_PRESET_CONFIG[stack];
    const { preset: chosenPreset } = await inquirer.prompt([
      {
        type: 'list',
        name: 'preset',
        message: stackConfig.message,
        default: stackConfig.default,
        choices: stackConfig.choices,
      },
    ]);
    preset = chosenPreset;

    if (stackConfig.shouldShowOrmPrompt) {
      const { orm: chosenOrm } = await inquirer.prompt([
        {
          type: 'list',
          name: 'orm',
          message: 'Would you like to include an ORM in your ESLint configuration?',
          default: ORM.NONE,
          choices: ORM_CHOICES,
        },
      ]);
      orm = chosenOrm;
    }

    if (PRESETS_WITH_STORYBOOK.has(preset) && storybook === null) {
      const { storybook: chosenStorybook } = await inquirer.prompt([
        {
          type: 'confirm',
          name: 'storybook',
          message: 'Include Storybook ESLint rules?',
          default: false,
        },
      ]);
      storybook = chosenStorybook;
    }
  } else if (PRESETS_WITH_STORYBOOK.has(preset) && storybook === null) {
    storybook = false;
  }

  try {
    installDevDependencies([packageJson.name]);
  } catch (err) {
    handleError('Failed to install config package', err);
  }

  const eslintConfigPath = getEslintConfigPath();
  const configFilename = path.basename(eslintConfigPath);

  try {
    await removeOtherConfigs(eslintConfigPath, ESLINT_CONFIG_FILENAMES, projectRoot);

    let existingConfig;
    try {
      existingConfig = await fs.readFile(eslintConfigPath, 'utf-8');
    } catch (error) {
      if (error.code === 'ENOENT') existingConfig = null;
      else throw error;
    }

    const configContent = generateConfigContent({
      packageName: packageJson.name,
      preset,
      orm,
      storybook: storybook ?? false,
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

    await fs.writeFile(targetPackageJsonPath, JSON.stringify(targetPackageJson, null, 2) + '\n');
    console.info('✅ Lint scripts added to package.json');
  } catch (err) {
    handleError('Error updating package.json scripts', err);
  }
}

runWhenMain(import.meta.url, setupEslint);
