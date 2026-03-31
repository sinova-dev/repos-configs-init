import fs from 'fs/promises';
import { execSync } from 'child_process';
import path from 'path';
import merge from 'lodash.merge';
import { runWhenMain } from '../helpers/run-when-main.mjs';
import { PRETTIER_CONFIG_FILENAMES } from '../prettier/constants/config-filenames.mjs';
import { ESLINT_CONFIG_FILENAMES } from '../eslint/constants/config-filenames.mjs';

const HUSKY_DIR = '.husky';
const PRE_COMMIT_HOOK_FILENAME = 'pre-commit';
const SCRIPT_PRE_COMMIT = 'pre-commit';
const PRE_COMMIT_SCRIPT_CMD =
  'pnpm install && git add pnpm-lock.yaml && pnpm lint-staged --allow-empty && tsc --noEmit';
const LINT_STAGED_CONFIG_FILENAME = '.lintstagedrc.json';
const LINT_STAGED_PRETTIER_GLOB = '**/*';
const LINT_STAGED_PRETTIER_CMD = 'prettier --write --ignore-unknown';
const LINT_STAGED_ESLINT_GLOB = '**/*.{js,jsx,ts,tsx,mjs,cjs}';
const LINT_STAGED_ESLINT_CMD = 'eslint';

const requiredDependencies = ['husky', 'lint-staged'];

const projectRoot = process.cwd();

async function fileExists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

function hasDependency(pkgJson, depName) {
  return Boolean(pkgJson.dependencies?.[depName] || pkgJson.devDependencies?.[depName]);
}

async function isPrettierConfigured(pkgJson) {
  if (hasDependency(pkgJson, 'prettier') || pkgJson.prettier !== undefined) return true;
  for (const filename of PRETTIER_CONFIG_FILENAMES) {
    if (await fileExists(path.join(projectRoot, filename))) return true;
  }
  return false;
}

async function isEslintConfigured(pkgJson) {
  if (hasDependency(pkgJson, 'eslint') || pkgJson.eslintConfig !== undefined) return true;
  for (const filename of ESLINT_CONFIG_FILENAMES) {
    if (await fileExists(path.join(projectRoot, filename))) return true;
  }
  return false;
}

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
  } catch (err) {
    handleError('Failed to install Husky or run husky init', err);
  }

  try {
    const huskyDir = path.join(projectRoot, HUSKY_DIR);
    const preCommitHookPath = path.join(huskyDir, PRE_COMMIT_HOOK_FILENAME);
    const preCommitContent = `pnpm run ${SCRIPT_PRE_COMMIT}`;

    await fs.writeFile(preCommitHookPath, preCommitContent);
    console.info('✅ Pre-commit hook updated');
  } catch (err) {
    handleError('Error writing pre-commit hook file', err);
  }

  const targetPackageJsonPath = path.join(projectRoot, 'package.json');

  try {
    const targetPackageJson = JSON.parse(await fs.readFile(targetPackageJsonPath, 'utf-8'));

    const huskyScripts = {
      [SCRIPT_PRE_COMMIT]: PRE_COMMIT_SCRIPT_CMD,
    };

    if (!targetPackageJson.scripts) {
      targetPackageJson.scripts = {};
    }

    targetPackageJson.scripts = merge({}, targetPackageJson.scripts, huskyScripts);

    await fs.writeFile(targetPackageJsonPath, JSON.stringify(targetPackageJson, null, 2) + '\n');
    console.info('✅ Pre-commit script added to package.json');

    const hasPrettier = await isPrettierConfigured(targetPackageJson);
    const hasEslint = await isEslintConfigured(targetPackageJson);

    const lintStagedConfig = {};
    if (hasPrettier) {
      lintStagedConfig[LINT_STAGED_PRETTIER_GLOB] = LINT_STAGED_PRETTIER_CMD;
      console.info('  ✅ Prettier detected — adding to lint-staged');
    } else {
      console.info('  ⏭️  Prettier not detected — skipping lint-staged entry');
    }
    if (hasEslint) {
      lintStagedConfig[LINT_STAGED_ESLINT_GLOB] = LINT_STAGED_ESLINT_CMD;
      console.info('  ✅ ESLint detected — adding to lint-staged');
    } else {
      console.info('  ⏭️  ESLint not detected — skipping lint-staged entry');
    }

    if (!hasPrettier && !hasEslint) {
      console.warn('  ⚠️  Neither Prettier nor ESLint detected — lint-staged will have no entries');
    }

    const lintStagedConfigPath = path.join(projectRoot, LINT_STAGED_CONFIG_FILENAME);
    let existingLintStagedConfig = {};
    if (await fileExists(lintStagedConfigPath)) {
      existingLintStagedConfig = JSON.parse(await fs.readFile(lintStagedConfigPath, 'utf-8'));
    }

    const mergedLintStagedConfig = merge({}, lintStagedConfig, existingLintStagedConfig);
    await fs.writeFile(lintStagedConfigPath, JSON.stringify(mergedLintStagedConfig, null, 2) + '\n');
    console.info(`✅ lint-staged config written to ${LINT_STAGED_CONFIG_FILENAME}`);
  } catch (err) {
    handleError('Error updating package.json scripts', err);
  }
}

runWhenMain(import.meta.url, setupHusky);
