import fs from 'fs/promises';
import path from 'path';

/**
 * Removes config files that conflict with the one being kept.
 *
 * @param {string} keepPath - Full path to the config file to keep
 * @param {string[]} configFilenames - List of all known config filenames
 * @param {string} [rootDir=process.cwd()] - Project root directory
 */
export async function removeOtherConfigs(keepPath, configFilenames, rootDir = process.cwd()) {
  const keepFilename = path.basename(keepPath);
  for (const name of configFilenames) {
    if (name === keepFilename) continue;
    const filePath = path.join(rootDir, name);
    try {
      await fs.unlink(filePath);
      console.info(`✅ Removed existing ${name}`);
    } catch (err) {
      if (err.code !== 'ENOENT') throw err;
    }
  }
}
