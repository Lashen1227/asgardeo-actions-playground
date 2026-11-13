# Platform architecture

The project runs as a Vite React dashboard and a small Node.js HTTP runtime. `npm run dev` starts both processes: Vite serves the dashboard on port 3000 and proxies `/api` and `/actions` requests to the runtime on port 3001.

The dashboard manages endpoint configurations through the `/api` management routes. WSO2 sends action requests directly to `/actions/<slug>`. The runtime authenticates the endpoint Bearer token, checks the configured action type, evaluates conditional rules in order, generates the response, and writes a redacted request record to local JSON storage.

The runtime keeps the most recent 200 requests in `server/data/platform.json` alongside endpoint definitions. This file is deliberately ignored by Git. Production hosting needs persistent storage mounted at `server/data`.
