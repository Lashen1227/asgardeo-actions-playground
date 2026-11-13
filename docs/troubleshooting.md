# Troubleshooting

## Dashboard cannot load endpoints

When running locally, use `npm run dev`; it starts both Vite and the runtime. Check that ports 3000 and 3001 are available. For a remote deployment, set `ACTION_PLATFORM_ADMIN_TOKEN` and enter the same value in the dashboard's Admin token field.

## Action endpoint returns 401

Send the endpoint-specific token as a Bearer token in the `Authorization` header. Rotating an endpoint token immediately invalidates its previous token, so update the WSO2 action configuration after rotation.

## Action endpoint returns 400

Send valid JSON with an `event` object, and make sure the request `actionType` matches the action type configured for the endpoint.

## Endpoint settings disappeared after restart

The runtime stores state in `server/data/platform.json`. Ensure this directory is on persistent storage in your deployment and that the Node process can write to it.
