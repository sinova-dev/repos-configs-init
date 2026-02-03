# Sinova Development Repos Configs

Configurations for Sinova Development projects.

## Installation

```bash
pnpm add -D @sinova-development/repos-configs
```

## Quick Setup

For basic setup of all tools, run:

```bash
npx sinova-general-config-init
```

## Configurations

### Prettier Configuration

**Main settings:**

```javascript
{
  printWidth: 120,
  trailingComma: 'all',
  singleQuote: true,
  singleAttributePerLine: true
}
```

**Required plugins:**

- `prettier-plugin-tailwindcss` - Automatic Tailwind CSS class sorting

**Install Prettier only:**

```bash
npx sinova-prettier-init
```

### ESLint Configuration

Flat config for Next.js, React, TypeScript, Storybook, Playwright, and more.

**Includes:**

- TypeScript (strict + stylistic)
- React, React Hooks, React Refresh
- Next.js
- Tailwind CSS
- Storybook, Playwright
- i18next, Unicorn, JSDoc, check-file
- Import rules, naming conventions

**Install ESLint only:**

```bash
npx sinova-eslint-init
```

**Use config directly:**

```javascript
// eslint.config.mjs
import { createConfig } from '@sinova-development/repos-configs/eslint-config';

export default createConfig(import.meta.dirname);
```

> **Note:** Requires Node.js 20.11+ for `import.meta.dirname`. For older Node, use `path.dirname(fileURLToPath(import.meta.url))` and pass it to `createConfig()`.

### Husky Configuration

**Pre-commit hooks:**

```bash
pnpm run pre-commit
```

**Install Husky only:**

```bash
npx sinova-husky-init
```

### Lint-staged Configuration

**Default settings:**

```json
{
  "lint-staged": {
    "**/*": "prettier --write --ignore-unknown",
    "**/*.{js,jsx,ts,tsx,mjs,cjs}": "eslint --fix"
  }
}
```

> When using `sinova-eslint-init`, the ESLint lint-staged rule is added automatically.

## Scripts

After installation, the following scripts are added to `package.json`:

```json
{
  "scripts": {
    "format": "prettier . --write --log-level=warn",
    "format:check": "prettier . --check --log-level=warn",
    "lint": "eslint . --max-warnings=0 --cache",
    "lint:fix": "eslint . --fix",
    "pre-commit": "pnpm install && git add pnpm-lock.yaml && pnpm lint-staged --allow-empty && tsc --noEmit"
  }
}
```
