import fs from 'fs/promises';
import { execSync } from 'child_process';
import path from 'path';
import merge from 'lodash.merge';
import { runWhenMain } from '../helpers/run-when-main.mjs';

const HUSKY_DIR = '.husky';
const PRE_COMMIT_HOOK_FILENAME = 'pre-commit';
const SCRIPT_PRE_COMMIT = 'pre-commit';
const PRE_COMMIT_SCRIPT_CMD =
  'pnpm install && git add pnpm-lock.yaml && pnpm lint-staged --allow-empty && tsc --noEmit';
const LINT_STAGED_PRETTIER_GLOB = '**/*';
const LINT_STAGED_PRETTIER_CMD = 'prettier --write --ignore-unknown';

const baseConfig = {
  [LINT_STAGED_PRETTIER_GLOB]: LINT_STAGED_PRETTIER_CMD,
};

const requiredDependencies = ['husky', 'lint-staged'];

const projectRoot = process.cwd();

function handleError(message, err) {
  console.error(`❌ ${message}:`, err.message);
  process.exit(1);
}

export async function setupHusky() {
  console.log('\n🐕 Setting up Husky...');

  try {
    const installCmd = `pnpm add -D ${requiredDependencies.join(' ')}`;
    console.log(`📦 Running: ${installCmd}`);
    execSync(installCmd, { stdio: 'inherit' });

    console.log('🔧 Initializing Husky...');
    execSync('npx husky init', { stdio: 'inherit' });

    const huskyDir = path.join(projectRoot, HUSKY_DIR);
    const preCommitHookPath = path.join(huskyDir, PRE_COMMIT_HOOK_FILENAME);
    const preCommitContent = `pnpm run ${SCRIPT_PRE_COMMIT}`;

    await fs.writeFile(preCommitHookPath, preCommitContent);
    console.info('✅ Pre-commit hook updated');

    const targetPackageJsonPath = path.join(projectRoot, 'package.json');
    const targetPackageJson = JSON.parse(await fs.readFile(targetPackageJsonPath, 'utf-8'));

    const huskyScripts = {
      [SCRIPT_PRE_COMMIT]: PRE_COMMIT_SCRIPT_CMD,
    };

    if (!targetPackageJson.scripts) {
      targetPackageJson.scripts = {};
    }

    targetPackageJson.scripts = merge({}, targetPackageJson.scripts, huskyScripts);

    if (!targetPackageJson['lint-staged']) {
      targetPackageJson['lint-staged'] = {};
    }

    targetPackageJson['lint-staged'] = merge({}, baseConfig, targetPackageJson['lint-staged']);

    await fs.writeFile(targetPackageJsonPath, JSON.stringify(targetPackageJson, null, 2) + '\n');
    console.info('✅ Pre-commit script and lint-staged config added to package.json');
  } catch (err) {
    handleError('Error setting up Husky', err);
  }
}

runWhenMain(import.meta.url, setupHusky);
