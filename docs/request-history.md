# Request history and sensitive data

Request history is kept locally in `server/data/platform.json` and contains at most 200 records. The dashboard can inspect the redacted request and response, refresh the list, or clear all records or the selected endpoint's records.

Before saving a history record, the runtime replaces any property named `value`, `updatingValue`, `password`, `secret`, or `token` with `[REDACTED]`, including array values. Endpoint credentials and configured endpoint responses remain in the local platform configuration file so the service can use them.

Protect the data directory and its backups as identity data. This local JSON store has no encryption at rest or automatic expiration policy.
