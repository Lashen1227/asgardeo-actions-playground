# WSO2 Asgardeo Actions Playground

[![CI](https://github.com/Lashen1227/asgardeo-actions-playground/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/Lashen1227/asgardeo-actions-playground/actions/workflows/ci.yml)

This playground implemted for WSO2 Identity Platform (previously known as Asgardeo), is a web app for building and testing action handler payloads in the browser. It is hosted at [https://asgardeo-actions-playground.onrender.com](https://asgardeo-actions-playground.onrender.com) and for more details about Identity Platform refer [https://wso2.com/asgardeo/docs](https://wso2.com/asgardeo/docs).

## Getting started

### Prerequisites

- Node.js 18 or later
- npm

### Install dependencies

From the repository root:

```bash
npm install
```

## Code structure

- `src/`: React + TypeScript app source
- `e2e/`: Playwright end-to-end tests
- `public/`: Static assets

## Development

Run the app in development mode from the repository root:

```bash
npm run dev
```

This starts the Vite dashboard on port `3000` and the local action runtime on port `3001`. In the **Platform** workspace, create an endpoint and use its `/actions/<slug>` URL and generated Bearer token in the matching WSO2 action configuration. The runtime supports success, failed, error, custom JSON responses, and ordered conditional rules. WSO2 requests and generated responses appear in request history.

Endpoint configuration and the latest 200 request records are stored in `server/data/platform.json` (excluded from Git). Request log values named `value`, `updatingValue`, `password`, `secret`, or `token` are redacted. Treat logs as identity data nonetheless, and protect the server's data directory and backups.

For a production deployment, build the dashboard with `npm run build`, set `ACTION_PLATFORM_ADMIN_TOKEN` to a long random secret, and run `npm start` with a persistent disk mounted for `server/data`. The management API requires this token; enter it in the dashboard's Admin token field. Without the environment variable, management APIs accept requests from localhost only. Action URLs require their endpoint-specific Bearer token. Deploy behind HTTPS and appropriate network controls before using real identity flows. This runtime does not include user accounts, multi-tenant isolation, or distributed storage.

### Useful scripts

- `npm run build` - Create a production build
- `npm run preview` - Preview the production build
- `npm run typecheck` - Run TypeScript checks
- `npm run lint` - Run ESLint
- `npm run e2e` - Run Playwright tests
