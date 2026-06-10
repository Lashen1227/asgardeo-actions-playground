# WSO2 Asgardeo Action Handler - Ballerina Implementation

This Ballerina module provides support for handling WSO2 Asgardeo action handler requests. It allows you to intercept and modify OAuth2/OIDC token issuance events in Asgardeo.

## Features

- **Type-safe models** for Asgardeo action handler requests and responses
- **HTTP service** endpoint to receive action handler callbacks from Asgardeo
- **Helper functions** for modifying access tokens (claims and scopes)
- **Extensible architecture** with support for custom handlers
- **Example handlers** demonstrating common use cases

## Usage

### 1. Start the Service

Run the Ballerina service from the server directory:

```bash
cd server
bal run
```

Or run from the root directory:

```bash
bal run server
```

The service will start on `http://localhost:9090` with the following endpoints:
- `POST /action-handler` - Main endpoint for Asgardeo action handler requests
- `GET /health` - Health check endpoint

### 2. Run the Playground UI (React + TypeScript)

Start the development server:

```bash
cd client
npm install
npm run dev
```

Open **http://localhost:3000** in your browser. The Vite dev server proxies `/api` requests to the Ballerina backend automatically.

Use the **Form Builder** tab to build requests with dynamic claims, or switch to the **JSON Editor** tab for raw JSON input.

### 3. Run Client Examples (Ballerina)

#### Standalone Client

```bash
cd client
bal run client.bal
```

#### HTTP Client

Requires the server to be running:

```bash
cd client
bal run http_client.bal
```

### 4. Configure in Asgardeo

1. Log in to your Asgardeo console
2. Navigate to **Extensions** > **Action Handlers**
3. Create a new action handler
4. Set the endpoint URL to: `http://your-server:9090/action-handler`
5. Select the action types you want to handle (e.g., `PRE_ISSUE_ACCESS_TOKEN`)

### 5. Custom Handlers

You can create custom handlers by implementing the `ActionHandler` function type:

```ballerina
import asgardeo/action-handler;

public function myCustomHandler(ActionHandlerRequest request) returns ActionHandlerResponse|error {
    // Your custom logic here
    // Modify claims, scopes, etc.
    
    return {
        event: request.event,
        requestId: request.requestId
    };
}
```

Then use it in your service:

```ballerina
ActionHandlerResponse|error response = processAction(actionRequest, myCustomHandler);
```

## Available Helper Functions

### Claim Operations

- `addClaim(AccessToken, string, string|string[]|int)` - Add a claim to the access token
- `removeClaim(AccessToken, string)` - Remove a claim from the access token
- `replaceClaim(AccessToken, string, string|string[]|int)` - Replace a claim value

### Scope Operations

- `addScope(AccessToken, string)` - Add a scope to the access token
- `removeScope(AccessToken, string)` - Remove a scope from the access token
- `replaceScope(AccessToken, string, string)` - Replace a scope

## Example Use Cases

### Adding Organization Claims

See `examples.bal` for `customOrganizationHandler` which adds organization-specific claims to the access token.

### Modifying Token Expiration

See `examples.bal` for `customExpirationHandler` which extends the token expiration time.

## Action Types Supported

- `PRE_ISSUE_ACCESS_TOKEN` - Before issuing an access token
- Other action types can be added as needed

## Response Format

The service returns an `ActionHandlerResponse` with the modified event:

```json
{
  "event": {
    "accessToken": {
      "claims": [...],
      "scopes": [...]
    },
    ...
  },
  "requestId": "..."
}
```

## Allowed Operations

The action handler supports the following operations based on `allowedOperations` in the request:

- **add** - Add claims or scopes
- **remove** - Remove claims or scopes
- **replace** - Replace claim values or scopes

## Development

### Building

```bash
bal build
```

### Testing

You can test the service using the sample payload in `new.json`:

```bash
curl -X POST http://localhost:9090/action-handler \
  -H "Content-Type: application/json" \
  -d @new.json
```
