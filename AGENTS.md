# AGENTS.md - WSO2 Asgardeo Actions Playground

## Project Overview

A standalone React + TypeScript playground for WSO2 Identity Platform, previously known as Asgardeo. It simulates the four pre-flow action types entirely client-side with a form editor, a JSON editor, and a response viewer.

## Tech Stack

- React 18 with functional components and hooks
- TypeScript 6.0 in strict mode
- Vite 5
- Tailwind CSS 3.4 with class-based dark mode
- ESLint with TypeScript and React plugins

## Supported Action Types

| Action Type | Event Focus | Response |
|---|---|---|
| `PRE_ISSUE_ACCESS_TOKEN` | `accessToken.claims[]`, `accessToken.scopes[]` | `actionStatus: SUCCESS` + modified event |
| `PRE_ISSUE_ID_TOKEN` | `idToken.claims[]` | `actionStatus: SUCCESS` + modified event |
| `PRE_UPDATE_PASSWORD` | `user.updatingCredential` | `actionStatus: SUCCESS` |
| `PRE_UPDATE_PROFILE` | `request.claims[]` with `updatingValue` | `actionStatus: SUCCESS` |

## Key Types

- `ActionHandlerRequest`
- `ActionHandlerResponse`
- `Event`
- `FormState`
- `Claim`
- `ProfileClaim`
- `AllowedOperation`
- `Operation`

## Data Flow

1. Form or JSON input builds an `ActionHandlerRequest`
2. `processRequest(request)` clones and simulates the action
3. `ResponseDisplay` renders the result

## Conventions

- Keep code comments to a minimum
- Use Tailwind classes for styling
- Keep dark mode on the wrapper `dark` class
- Define component props with `interface Props`
- Export all types from `src/types.ts`

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start Vite dev server on port 3000 |
| `npm run build` | Production build to `dist/` |
| `npm run preview` | Preview the production build |
| `npm run typecheck` | Run TypeScript type checking |
| `npm run lint` | Run ESLint |
| `npm run e2e` | Run Playwright tests |

## Testing Approach

When adding features:
1. Run `npm run typecheck`
2. Run `npm run lint`
3. Run `npm run build`
4. Run `npm run e2e`
5. Verify manually with `npm run dev`
