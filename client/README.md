# Asgardeo Action Handler — React Playground UI

A full-featured playground UI for testing and interacting with the **WSO2 Asgardeo Action Handler** Ballerina service. Built with **React**, **TypeScript**, **Vite**, and **Tailwind CSS**.

## Features

- **Form Builder** — Structured form to build action handler requests with dynamic claims management
- **JSON Editor** — Raw JSON editor with Format/Minify, validation, and send
- **Response Viewer** — Collapsible JSON, access token breakdown (scopes chips, claims list, tenant info)
- **Dark/Light Mode** — Toggle with a single click
- **Copy to Clipboard** — One-click copy of response JSON
- **Live Request Preview** — See the exact JSON payload before sending
- **Proxy Support** — Vite proxy routes `/api` to the Ballerina backend on `localhost:9090`
- **Sample Payload** — `new.json` served from `/public` for quick testing

## Project Structure

```
client/
├── public/
│   └── new.json                   # Sample Asgardeo action handler payload
├── src/
│   ├── components/
│   │   ├── ActionHandlerForm.tsx  # Structured form with dynamic fields
│   │   ├── JsonEditor.tsx         # Raw JSON editor
│   │   └── ResponseDisplay.tsx    # Response viewer with token breakdown
│   ├── App.tsx                    # Main layout, tabs, dark mode toggle
│   ├── index.css                  # Tailwind directives
│   ├── main.tsx                   # Entry point
│   ├── types.ts                   # TypeScript types matching Ballerina models
│   └── vite-env.d.ts             # Vite type declarations
├── index.html                     # HTML template
├── package.json                   # Dependencies and scripts
├── postcss.config.js              # PostCSS + Tailwind config
├── tailwind.config.js             # Tailwind theme configuration
├── tsconfig.json                  # TypeScript configuration
├── tsconfig.node.json             # TypeScript config for Vite
└── vite.config.js                 # Vite with React plugin and API proxy
```

## Prerequisites

- **Node.js** v18 or higher
- **npm** or **yarn**
- The **action handler server** running on `http://localhost:9090`

## Quick Start

```bash
cd client
npm install
npm run dev
```

Open **http://localhost:3000** in your browser.

Make sure the Ballerina server is running alongside:

```bash
# In another terminal, from the project root
cd ../server
bal run
```

## Usage

### Form Builder Tab
1. Fill in the structured fields — request details, user info, tenant, access token claims
2. Click **+ Add Claim** to add dynamic claim rows
3. Click **Send Request** to POST to the server
4. View the response on the right panel with the full JSON and token breakdown

### JSON Editor Tab
1. Edit the raw JSON payload directly
2. Use **Format** / **Minify** to tidy up
3. Click **Send Request** to POST to the server

### Dark Mode
Click the sun/moon icon in the top-right corner to toggle.

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start Vite dev server on port 3000 |
| `npm run build` | Production build to `dist/` |
| `npm run preview` | Preview the production build |
| `npm run typecheck` | Run TypeScript type checking |
| `npm run lint` | Run ESLint |

## API Proxy

The Vite dev server proxies `/api/*` requests to `http://localhost:9090`. For example, `POST /api/action-handler` is forwarded to `POST http://localhost:9090/action-handler`.

To call the server directly (without proxy), edit the `API_URL` constant in `src/App.tsx`.

## TypeScript Types

The types in `src/types.ts` mirror the Ballerina record types from the server (`types.bal`):

- `ActionHandlerRequest` / `ActionHandlerResponse`
- `Event`, `AccessToken`, `Claim`, `RequestDetails`
- `User`, `Organization`, `Tenant`
- `FormState` and `buildRequest()` helper

## Troubleshooting

- **CORS errors** — Ensure the Ballerina server is running. The Vite proxy avoids CORS during development.
- **Connection refused** — Verify `bal run` is running in the `server/` directory.
- **Build errors** — Run `npm install` to ensure all dependencies are installed.
