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

Flat configs for frontend (Next.js/React) and backend (NestJS) projects.

**Includes:**

- Shared core rules (TypeScript strict + stylistic, imports, Unicorn, JSDoc, etc.)
- Frontend preset: Next.js, React, Tailwind CSS, Storybook, Playwright, i18next, check-file, JSX a11y
- Backend preset: NestJS typed rules (`@darraghor/eslint-plugin-nestjs-typed`)

**Install ESLint only:**

```bash
npx sinova-eslint-init
```

**Install ESLint only (choose preset):**

```bash
npx sinova-eslint-init --frontend
```

```bash
npx sinova-eslint-init --backend
```

**Use config directly (frontend):**

```javascript
// eslint.config.js
import { createFrontendConfig } from '@sinova-development/repos-configs/eslint-config/frontend';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const baseConfig = createFrontendConfig(__dirname);

export default [...baseConfig];
```

**Use config directly (backend / NestJS):**

```javascript
// eslint.config.js
import { createBackendConfig } from '@sinova-development/repos-configs/eslint-config/backend';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const baseConfig = createBackendConfig(__dirname);

export default [...baseConfig];
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
