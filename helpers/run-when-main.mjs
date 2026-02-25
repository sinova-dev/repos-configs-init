import path from 'path';
import { fileURLToPath } from 'url';

/**
 * Runs `fn()` only when this module was executed directly (e.g. node script.mjs or via bin).
 * Does nothing when the module is imported. Use for dual-purpose modules: CLI + importable.
 *
 * @param {string} importMetaUrl - Pass import.meta.url from the calling module
 * @param {() => Promise<void>} fn - Async function to run when executed directly
 */
export function runWhenMain(importMetaUrl, fn) {
  const __filename = fileURLToPath(importMetaUrl);
  if (process.argv[1] && path.resolve(process.argv[1]) === path.resolve(__filename)) {
    fn().catch((err) => {
      console.error(err);
      process.exit(1);
    });
  }
}
