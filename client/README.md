# Asgardeo Actions Playground

A standalone React + TypeScript UI for building, editing, and testing Asgardeo action handler payloads. Processes everything client-side — no backend required.

## Features

- **Form Builder** — Structured form with dynamic claims management
- **JSON Editor** — Raw JSON editor with Format/Minify and validation
- **Response Viewer** — Collapsible JSON, access token breakdown (scopes chips, claims list, tenant info)
- **Dark/Light Mode** — Toggle with a single click
- **Copy to Clipboard** — One-click copy of response JSON
- **Live Request Preview** — See the exact JSON payload before processing

## Quick Start

```bash
cd client
npm install
npm run dev
```

Open **http://localhost:3000**.

## How It Works

The playground simulates the Ballerina server logic locally via `processRequest()` in `src/types.ts`:

1. Deep-clones the input event
2. Applies `allowedOperations` (add/remove claims and scopes based on path rules)
3. Returns the modified event as the response

No fetch calls, no server dependency. The same logic mirrors what the [production Ballerina server](../server) does when called by Asgardeo at token-issuance time.

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start Vite dev server on port 3000 |
| `npm run build` | Production build to `dist/` |
| `npm run preview` | Preview the production build |
| `npm run typecheck` | Run TypeScript type checking |
| `npm run lint` | Run ESLint |

## Project Structure

```
src/
├── components/
│   ├── ActionHandlerForm.tsx   # Form builder with dynamic fields
│   ├── JsonEditor.tsx          # Raw JSON editor
│   └── ResponseDisplay.tsx     # Response viewer with token breakdown
├── App.tsx                     # Layout, tabs, dark mode
├── types.ts                    # Types + processRequest() simulator
└── main.tsx                    # Entry point
```

## Types

Types in `src/types.ts` mirror the Ballerina record types from the server (`server/types.bal`):

- `ActionHandlerRequest` / `ActionHandlerResponse`
- `Event`, `AccessToken`, `Claim`, `RequestDetails`
- `User`, `Organization`, `Tenant`
- `FormState` and `buildRequest()` helper
