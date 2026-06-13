# AGENTS.md — Asgardeo Actions Playground

## Project Overview

A standalone React + TypeScript playground for WSO2 Asgardeo's Action Handler feature. It simulates the 4 pre-flow action types entirely client-side — no backend needed. Users build payloads via a form or JSON editor and see simulated responses with token/status breakdowns.

## Tech Stack

- **React 18** with functional components and hooks
- **TypeScript 6.0** (strict mode)
- **Vite 5** dev server and build tool
- **Tailwind CSS 3.4** with `class`-based dark mode strategy
- **ESLint** (flat config) with TypeScript and React plugins
- No state management library, no routing library

## Supported Action Types

| Action Type | Event Focus | Response Format |
|---|---|---|
| `PRE_ISSUE_ACCESS_TOKEN` | `accessToken.claims[]`, `accessToken.scopes[]` | `actionStatus: SUCCESS` + modified event |
| `PRE_ISSUE_ID_TOKEN` | `idToken.claims[]` | `actionStatus: SUCCESS` + modified event |
| `PRE_UPDATE_PASSWORD` | `user.updatingCredential` | `actionStatus: SUCCESS` |
| `PRE_UPDATE_PROFILE` | `request.claims[]` with `updatingValue` | `actionStatus: SUCCESS` |

Token actions support `allowedOperations` (add/remove/replace on claim/scope paths). Password and profile actions return only `actionStatus` — no operations.

## Key Types (`src/types.ts`)

- **`ActionHandlerRequest`** — `{ actionType, event, allowedOperations?, requestId? }`
- **`ActionHandlerResponse`** — `{ actionStatus, event?, operations?, requestId?, failureReason?, failureDescription?, errorMessage?, errorDescription? }`
- **`Event`** — Union-like shape covering all 4 types: `request?`, `tenant?`, `organization?`, `user?`, `userStore?`, `accessToken?`, `idToken?`, `refreshToken?`, `initiatorType?`, `action?`
- **`FormState`** — Flat form model consumed by `buildRequest()` to produce an `ActionHandlerRequest`
- **`Claim`** — `{ name: string, value: string | string[] | number }`
- **`ProfileClaim`** — `{ uri: string, value: string | string[], updatingValue?: string | string[] }`
- **`AllowedOperation`** — `{ op: string, paths: string[] }` (JSON pointer-style paths)
- **`Operation`** — `{ op: string, path: string, value?: unknown }` (JSON Patch format for responses)

## Data Flow

1. User fills **Form** or edits **JSON** → `buildRequest(form)` assembles `ActionHandlerRequest`
2. `processRequest(request)` deep-clones the event, applies allowed operations (token actions), returns `ActionHandlerResponse`
3. `ResponseDisplay` renders status badge + type-specific breakdown (token claims/scopes, credential info, profile attributes)

## Processing Logic (`processRequest`)

- **PRE_ISSUE_ACCESS_TOKEN**: Iterates `allowedOperations`, parses paths like `/accessToken/claims/{name}` and `/accessToken/scopes/{scope}`, mutates the access token's claims/scopes arrays
- **PRE_ISSUE_ID_TOKEN**: Same approach on `/idToken/claims/{name}`
- **PRE_UPDATE_PASSWORD**: No operations — returns SUCCESS with the event (simulates validation passing)
- **PRE_UPDATE_PROFILE**: No operations — returns SUCCESS with the event (simulates validation passing)

## Build Request Logic (`buildRequest`)

Each action type has its own builder function that constructs the correct `Event` shape:

- `buildTokenEvent()` — request, tenant, org, user, accessToken (with claims + scopes), allowedOperations for add/remove/replace
- `buildIdTokenEvent()` — same as token but has `idToken.claims` and no `accessToken`
- `buildPasswordEvent()` — tenant, org, user with `updatingCredential`, `initiatorType`, `action` (no request/accessToken)
- `buildProfileEvent()` — request with `claims` (including `updatingValue`), tenant, org, user, `initiatorType`, `action: "UPDATE"`

## Conventions

- **No comments in code** unless absolutely necessary
- **Tailwind classes** for all styling — no separate CSS files (except `index.css` for directives)
- **Dark mode**: `dark` class on wrapper div, Tailwind `dark:` variant for all components
- **Form input styling**: Reusable `inputClass`, `selectClass`, `labelClass`, `sectionClass` variables at top of component
- **SVG icons**: Inline `<svg>` elements, never external icon libraries
- **Type exports**: All types exported from `types.ts`, imported where needed
- **Component props**: Defined as `interface Props` in each component file
- **State management**: `useState` + `useCallback` in App.tsx, props drilled to children

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start Vite dev server on port 3000 |
| `npm run build` | Production build to `dist/` |
| `npm run preview` | Preview the production build |
| `npm run typecheck` | Run TypeScript type checking |
| `npm run lint` | Run ESLint (zero warnings policy) |

## Lint Rules

- Zero warnings allowed (`--max-warnings 0`)
- TypeScript strict mode
- No empty object types (`@typescript-eslint/no-empty-object-type`)

## Testing Approach

No test framework is configured. The playground is tested manually via `npm run dev`. When adding features:
1. Run `npm run typecheck` to verify types
2. Run `npm run lint` to verify lint
3. Run `npm run build` to verify production build
4. Manually test in browser with `npm run dev`

## Common Tasks

### Adding a new property to an action type's event
1. Add the field to the relevant interface in `types.ts`
2. Update the corresponding `build*Event()` function
3. Update `FormState` and `defaultFormState` if the form should expose it
4. Add form UI in `ActionHandlerForm.tsx` (conditional on `form.actionType`)
5. Add display in `ResponseDisplay.tsx` (conditional on detected action type)

### Adding form validation
Validation happens at submit time in `handleSubmit`. Show errors via `setError` in `App.tsx` and display via `ResponseDisplay`.
