# Self-hosting

Use Node.js 18 or later. Build the React dashboard and start the runtime:

```bash
npm install
npm run build
ACTION_PLATFORM_ADMIN_TOKEN="replace-with-a-long-random-secret" npm start
```

The runtime serves the built dashboard and listens on port 3001 by default. Set `PORT` to change the port. Keep `server/data` on persistent storage so endpoint definitions and request history survive restarts.

Enter the configured admin token in the dashboard to manage endpoints remotely. Without `ACTION_PLATFORM_ADMIN_TOKEN`, the management API only accepts local requests. Each action endpoint uses its own Bearer token. Put the service behind HTTPS before connecting real WSO2 environments.
