/**
 * Appends existing content below base content, with each line commented out.
 * Used when replacing config files to preserve the previous configuration.
 *
 * @param {string} baseContent - The new content to place first
 * @param {string|null} existingContent - The content to append (commented out), or null to skip
 * @param {string} [header='Previous configuration (commented out):'] - Header line above commented content
 * @param {string} [commentPrefix='// '] - Prefix for each commented line
 * @returns {string}
 */
export function appendCommentedOutContent(
  baseContent,
  existingContent,
  header = 'Previous configuration (commented out):',
  commentPrefix = '// ',
) {
  if (!existingContent) return baseContent;
  const commented = existingContent
    .split('\n')
    .map((line) => `${commentPrefix}${line}`)
    .join('\n');
  return `${baseContent}

// ${header}
${commented}`;
}
