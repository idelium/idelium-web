![Idelium](https://idelium.io/assets/images/idelium.png)

# idelium-web

Idelium Web is the FE SPA (Single Page Application) tool that allows you to manage tests with Idelium.

## Recommended IDE Setup

[VSCode](https://code.visualstudio.com/) + [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (and disable Vetur) + [TypeScript Vue Plugin (Volar)](https://marketplace.visualstudio.com/items?itemName=Vue.vscode-typescript-vue-plugin).

## Customize configuration

See [Vite Configuration Reference](https://vitejs.dev/config/).

## Prerequisite

Node 22.17.0 and npm from the committed lockfile.

## Project Setup

```sh
npm ci
```

### Config environment

To configure the gTag for tracking your website with Google Analytics and enable reCAPTCHA using Idelium ASP, please follow these instructions:

```sh
cp .env.example .env
```


### Compile and Hot-Reload for Development

```sh
npm run dev
```

### Compile and Minify for Production

```sh
npm run build
```

### Lint with [ESLint](https://eslint.org/)

```sh
npm run lint
```

CI uses non-mutating gates:

```sh
npm run lint:check
npm run format:check
npm run audit:dependencies
npm run test:coverage
npm run build
```

See [docs/security/session-storage.md](docs/security/session-storage.md) for the
browser-session threat model and cookie-based authentication design.
## Demo

[https://github.com/idelium/idelium-docker](https://github.com/idelium/idelium-docker)
