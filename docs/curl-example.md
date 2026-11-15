# Send an action request

After creating an endpoint, use its URL and Bearer token to send a sample request. Replace the URL, token, and action type with the values shown in your dashboard.

```bash
curl --request POST \
  --url https://actions.example.com/actions/token-policy \
  --header 'content-type: application/json' \
  --header 'authorization: Bearer <endpoint-token>' \
  --data '{
    "actionType": "PRE_ISSUE_ACCESS_TOKEN",
    "requestId": "local-test-001",
    "event": {
      "request": { "clientId": "demo-client", "grantType": "client_credentials" },
      "accessToken": { "claims": [{ "name": "sub", "value": "demo" }] }
    }
  }'
```

Built-in success, failed, and error modes return their corresponding `actionStatus`. Custom mode returns the configured JSON with `requestId`; it includes `actionStatus` only when that field is present in the configured JSON. Successful requests also appear in the dashboard history with sensitive values redacted.
