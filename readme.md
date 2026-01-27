# Sinova Development Repos Configs

Configurations for Sinova Development projects.

## Installation

### From npm registry

```bash
pnpm add -D @sinova-development/repos-configs
```

### From git branch (for testing)

To install from a specific branch (e.g., `eslint` branch):

**How to determine the exact URL:**

1. **Get the repository URL:**
   - Check the git remote: `git remote get-url origin`
   - Or find it on GitHub: `https://github.com/OWNER/REPO`

2. **Convert SSH to HTTPS format (if needed):**
   - SSH: `git@github.com:owner/repo.git` 
   - HTTPS: `https://github.com/owner/repo.git`

3. **Use the format:**
   ```
   @package-name@git+https://github.com/owner/repo.git#branch-name
   ```

**Example for this repository:**

```bash
# Using HTTPS (recommended)
pnpm add -D "@sinova-development/repos-configs@git+https://github.com/sinova-dev/repos-configs-init.git#eslint"
```

Or using SSH:

```bash
pnpm add -D "@sinova-development/repos-configs@git+ssh://git@github.com/sinova-dev/repos-configs-init.git#eslint"
```

**Note:** Use quotes around the package spec to prevent shell interpretation of special characters like `#`.

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
- Backend (Node.js) via `resolveConfig(backendConfig)`
- Backend (NestJS) via `resolveConfig(nestjsBackendConfig)`
- Backend (NestJS without Swagger) via `resolveConfig(nestjsBackendNoSwaggerConfig)`

**Examples:**

Frontend:
```javascript
import { resolveConfig, frontendConfig } from '@sinova-development/repos-configs/eslint-config';

export default resolveConfig(frontendConfig);
```

Backend (basic Node.js):
```javascript
import { resolveConfig, backendConfig } from '@sinova-development/repos-configs/eslint-config';

export default resolveConfig(backendConfig);
```

Backend (NestJS):
```javascript
import { resolveConfig, nestjsBackendConfig } from '@sinova-development/repos-configs/eslint-config';

export default resolveConfig(nestjsBackendConfig);
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

**Setting up Backend Config:**

After installing the package and running the init script, update your `eslint.config.mjs` file:

1. **For basic Node.js backend:**
   ```javascript
   import { resolveConfig, backendConfig } from '@sinova-development/repos-configs/eslint-config';
   
   export default resolveConfig(backendConfig);
   ```

2. **For NestJS backend (with Swagger):**
   ```javascript
   import { resolveConfig, nestjsBackendConfig } from '@sinova-development/repos-configs/eslint-config';
   
   export default resolveConfig(nestjsBackendConfig);
   ```

3. **For NestJS backend (without Swagger):**
   ```javascript
   import { resolveConfig, nestjsBackendNoSwaggerConfig } from '@sinova-development/repos-configs/eslint-config';
   
   export default resolveConfig(nestjsBackendNoSwaggerConfig);
   ```

**What each config includes:**
- `backendConfig`: Basic Node.js backend with ES2020 globals
- `nestjsBackendConfig`: NestJS-specific rules with Swagger support, increased `max-params` limit (8), Jest globals for test files
- `nestjsBackendNoSwaggerConfig`: Same as `nestjsBackendConfig` but without Swagger-related rules

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
