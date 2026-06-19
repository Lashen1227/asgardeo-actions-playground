# WSO2 Asgardeo Actions Playground

[![CI](https://github.com/Lashen1227/asgardeo-actions-playground/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/Lashen1227/asgardeo-actions-playground/actions/workflows/ci.yml)

WSO2 Identity Platform, previously known as Asgardeo, is a web app for building and testing action handler payloads in the browser. It is hosted at [https://asgardeo-actions-playground.onrender.com](https://asgardeo-actions-playground.onrender.com) and documented at [https://wso2.com/asgardeo/docs](https://wso2.com/asgardeo/docs).

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

### Useful scripts

- `npm run build` - Create a production build
- `npm run preview` - Preview the production build
- `npm run typecheck` - Run TypeScript checks
- `npm run lint` - Run ESLint
- `npm run e2e` - Run Playwright tests
