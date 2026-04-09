import { execSync } from 'child_process';

/**
 * Installs development dependencies with pnpm.
 *
 * @param {string[]} dependencies
 */
export function installDevDependencies(dependencies) {
  const uniqueDependencies = [...new Set(dependencies.filter(Boolean))];
  if (uniqueDependencies.length === 0) {
    return;
  }

  const installCmd = `pnpm add -D ${uniqueDependencies.join(' ')}`;
  console.log(`📦 Running: ${installCmd}`);
  execSync(installCmd, { stdio: 'inherit' });
}
