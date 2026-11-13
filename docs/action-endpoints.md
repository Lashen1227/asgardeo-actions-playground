# Action endpoint contract

Each endpoint accepts `POST /actions/<slug>` with a JSON body containing the configured `actionType` and an `event` object. Send the endpoint's generated token as `Authorization: Bearer <token>`.

The action type must match the endpoint configuration. Requests with a mismatched type or missing event receive HTTP 400. Missing or invalid Bearer tokens receive HTTP 401. The runtime rejects request bodies larger than 1 MB.

## Response modes

- **Success** returns HTTP 200 with `actionStatus: SUCCESS` and a request ID.
- **Failed** returns HTTP 200 with `actionStatus: FAILED`, `failureReason`, and `failureDescription`.
- **Error** returns HTTP 500 with `actionStatus: ERROR`, `errorMessage`, and `errorDescription`.
- **Custom** returns the configured JSON object and HTTP status.

Conditional rules compare a dot-separated request field with a configured value. Rules are evaluated from top to bottom, and the first enabled match determines the response. An empty field path matches every request.
