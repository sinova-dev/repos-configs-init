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

**ESLint v9.0.0+ with flat config format**

**Main settings:**

- Uses ESLint v9 flat config format (`eslint.config.mjs`)
- Extends `@eslint/js` recommended rules and `typescript-eslint` recommended configs
- Integrates with Prettier via `eslint-config-prettier`
- TypeScript support with `typescript-eslint` package
- Node.js and ES2021 globals configured

**Configs:**

- Base TypeScript (default) via `resolveConfig()`
- Frontend (Next.js + React) via `resolveConfig(frontendConfig)`
- Backend (NestJS) via `resolveConfig(backendConfig)`

**Example:**

```javascript
import { resolveConfig, frontendConfig } from '@sinova-development/repos-configs/eslint-config';

export default resolveConfig(frontendConfig);
```

**Required packages:**

- `eslint@^9`, `@eslint/js`, `@eslint/eslintrc`
- `typescript-eslint`, `eslint-config-prettier`, `globals`
- `@eslint-community/eslint-plugin-eslint-comments`, `@next/eslint-plugin-next`
- `eslint-import-resolver-typescript`, `eslint-plugin-import`, `eslint-plugin-check-file`
- `eslint-plugin-jsx-a11y`, `eslint-plugin-react`, `eslint-plugin-react-hooks`, `eslint-plugin-react-refresh`
- `eslint-plugin-storybook`, `eslint-plugin-tailwindcss`, `eslint-plugin-i18next`
- `eslint-plugin-unicorn`, `eslint-plugin-playwright`, `eslint-plugin-erasable-syntax-only`, `eslint-plugin-jsdoc`

**Install ESLint only:**

```bash
npx sinova-eslint-init
```

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
    "**/*.{js,mjs,ts,tsx}": [
      "eslint --fix",
      "prettier --write --ignore-unknown"
    ],
    "**/*": "prettier --write --ignore-unknown"
  }
}
```

## Scripts

After installation, the following scripts are added to `package.json`:

```json
{
  "scripts": {
    "format": "prettier . --write --log-level=warn",
    "format:check": "prettier . --check --log-level=warn",
    "lint": "eslint .",
    "lint:fix": "eslint . --fix",
    "pre-commit": "pnpm install && git add pnpm-lock.yaml && pnpm lint-staged --allow-empty && pnpm lint && tsc --noEmit"
  }
}
```
