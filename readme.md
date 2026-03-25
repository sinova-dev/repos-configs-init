# Sinova Development Repos Configs

Configurations for Sinova Development projects.

## Installation

```bash
pnpm add -D @sinova-development/repos-configs
```

## Quick Setup

For basic setup of all tools (Prettier, ESLint, Husky, and tsconfig), run:

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

Flat configs for frontend (React, Next.js) and backend (Node/TS, NestJS) projects.

**Includes:**

- Shared **core** rules (TypeScript strict + stylistic, imports, Unicorn, JSDoc, erasable-syntax-only, etc.)
- **Frontend** preset: generic browser/JSX (core + browser globals, no React/Next)
- **React** preset: extends Frontend + React, React Hooks, Playwright, i18next, check-file, JSX a11y. Optional **Storybook** plugin and rules via `storybook: true` (default: false)
- **Next.js** preset: extends React + `@next/eslint-plugin-next`, App Router conventions. Optional Storybook via `storybook: true` (default: false). (_eslint-plugin-tailwindcss disabled: TODO re-enable when it supports Tailwind CSS v4_)
- **Backend** preset: generic Node/TS backend (core only, no framework plugins). Optional **Prisma** ORM rules via `orm: 'prisma'`
- **NestJS** preset: extends Backend + `@darraghor/eslint-plugin-nestjs-typed`. Optional **Prisma** ORM rules via `orm: 'prisma'`

**Install ESLint only:**

```bash
npx sinova-eslint-init
```

When run interactively, you choose frontend/backend, then preset (Next.js, React, Frontend, NestJS, Backend). For React or Next.js you can optionally include Storybook rules (or use `--storybook` with `--react`/`--nextjs`). For backend or NestJS you can optionally choose Prisma to add `@v2nic/eslint-plugin-prisma` rules (schema + TypeScript).

**Install ESLint only (choose preset):**

```bash
npx sinova-eslint-init --nextjs
```

```bash
npx sinova-eslint-init --nextjs --storybook
```

```bash
npx sinova-eslint-init --react
```

```bash
npx sinova-eslint-init --react --storybook
```

```bash
npx sinova-eslint-init --frontend
```

```bash
npx sinova-eslint-init --backend
```

```bash
npx sinova-eslint-init --nestjs
```

**Use config directly (Next.js):**

```javascript
// eslint.config.js
import { createConfig } from '@sinova-development/repos-configs/eslint-config/nextjs';

export default [...createConfig(process.cwd())];
```

**Use config directly (Next.js with Storybook):**

```javascript
// eslint.config.js
import { createConfig } from '@sinova-development/repos-configs/eslint-config/nextjs';

export default [...createConfig(process.cwd(), { storybook: true })];
```

**Use config directly (React):**

```javascript
// eslint.config.js
import { createConfig } from '@sinova-development/repos-configs/eslint-config/react';

export default [...createConfig(process.cwd())];
```

**Use config directly (React with Storybook):**

```javascript
// eslint.config.js
import { createConfig } from '@sinova-development/repos-configs/eslint-config/react';

export default [...createConfig(process.cwd(), { storybook: true })];
```

**Use config directly (frontend):**

```javascript
// eslint.config.js
import { createConfig } from '@sinova-development/repos-configs/eslint-config/frontend';

export default [...createConfig(process.cwd())];
```

**Use config directly (backend):**

```javascript
// eslint.config.mjs
import { createConfig } from '@sinova-development/repos-configs/eslint-config/backend';

export default [...createConfig(process.cwd())];
```

**Use config directly (backend with Prisma):**

```javascript
// eslint.config.mjs
import { createConfig } from '@sinova-development/repos-configs/eslint-config/backend';

export default [...createConfig(process.cwd(), { orm: 'prisma' })];
```

**Use config directly (NestJS):**

```javascript
// eslint.config.mjs
import { createConfig } from '@sinova-development/repos-configs/eslint-config/nestjs';

export default [...createConfig(process.cwd())];
```

**Use config directly (NestJS with Prisma):**

```javascript
// eslint.config.mjs
import { createConfig } from '@sinova-development/repos-configs/eslint-config/nestjs';

export default [...createConfig(process.cwd(), { orm: 'prisma' })];
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
    "**/*.{js,jsx,ts,tsx,mjs,cjs}": "eslint"
  }
}
```

> When using `sinova-eslint-init`, the ESLint lint-staged rule is added automatically.

### TypeScript Configuration (tsconfig)

Shared tsconfig presets for backend and frontend projects, intended to be used with `extends`.

**Available presets:**

- `backend` - Node.js/NestJS defaults (`module: NodeNext`, `moduleResolution: NodeNext`, `types: ["node"]`)
- `frontend` - React/Vite defaults (`moduleResolution: Bundler`, `jsx: react-jsx`, DOM libs)
- `next` - extends frontend and adds TypeScript Next plugin (`"plugins": [{ "name": "next" }]`)

**Install tsconfig only:**

```bash
npx sinova-tsconfig-init
```

```bash
npx sinova-tsconfig-init --backend
```

```bash
npx sinova-tsconfig-init --frontend
```

```bash
npx sinova-tsconfig-init --next
```

This setup installs `typescript`, writes `tsconfig.json` with an `extends`, and adds:

- `type-check` → `tsc --noEmit`
- `type-check:watch` → `tsc --noEmit --watch`

**Use backend preset directly (tsconfig.json):**

```json
{
  "extends": "@sinova-development/repos-configs/tsconfig/backend/index.json"
}
```

**Use frontend preset directly (tsconfig.json):**

```json
{
  "extends": "@sinova-development/repos-configs/tsconfig/frontend/index.json"
}
```

**Use Next.js frontend preset directly (tsconfig.json):**

```json
{
  "extends": "@sinova-development/repos-configs/tsconfig/frontend/next.json"
}
```

## Scripts

When using `sinova-eslint-init`, the following are added or updated in `package.json`:

- **Lint scripts:** `lint` and `lint:fix` (e.g. `eslint . --max-warnings=0 --cache` and same with `--fix`)
- **Lint-staged:** `**/*.{js,jsx,ts,tsx,mjs,cjs}` → `eslint`
- **Type-check scripts:** `type-check` and `type-check:watch` (from `sinova-tsconfig-init`)

Other scripts (e.g. `format`, `format:check`, `pre-commit`) come from the general setup or your project.
