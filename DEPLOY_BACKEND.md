# Connect the Node.js backend

The GitHub Pages site is a static frontend. Checkout requires this Node.js server running on an HTTPS-capable Node/container host. The server is not deployed by the Pages workflow.

## 1. Deploy the server

Deploy this repository with Node 24:

```sh
npm ci
npm run build
npm start
```

Do not set `VITE_STATIC_PREVIEW` or `VITE_BASE_PATH` for the backend's own build. The server can serve the full React app and API together. `NODE_ENV=production` is also supported.

Set server environment variables:

```text
HOST=0.0.0.0
ALLOWED_ORIGINS=https://gim1203-hue.github.io
DATA_DIR=/your/persistent/disk/market-lane
```

Use the host's `PORT`. `DATA_DIR` should be an existing mounted persistent disk location writable by the server; the app creates the final directory if needed. Without persistent storage, orders can disappear after a host restart or redeployment. Run one instance with this file-based store. No database or payment service is connected.

Verify `https://YOUR-BACKEND/api/health` returns `{"status":"ok"}` and `/api/products` returns JSON. HTTPS is needed for the HTTPS Pages frontend.

## 2. Connect GitHub Pages

In this repository, go to **Settings → Secrets and variables → Actions → Variables**. Create a repository variable named **BACKEND_URL** with the backend origin, for example `https://your-backend.example.com` (no `/api` path).

Then run **Actions → Test and publish portfolio preview → Run workflow**. This builds React with `VITE_API_URL` set to that URL. The app will request products from the Node.js API and enable demo checkout. It will not silently switch to static mode if the server is unavailable: it shows the connection error.

Until BACKEND_URL is set, the Pages site remains a labelled preview with checkout disabled.

## Local setup

Copy root `.env.example` to `.env` if you want custom server settings. Both `npm run dev` and `npm start` read it; hosting environment variables take precedence. For local development, keep `HOST=127.0.0.1`.

If developing against a separate API, copy `client/.env.example` to `client/.env`, set `VITE_API_URL`, and add the local frontend's origin to the backend's `ALLOWED_ORIGINS`.

## Troubleshooting

- **Checkout needs Node.js backend:** the Pages build has no BACKEND_URL configured. Set it and rerun the workflow.
- **Cannot reach the backend:** check HTTPS, health endpoint, and ALLOWED_ORIGINS. The allowed origin is `https://gim1203-hue.github.io`, without the repository path or trailing slash.
- **Web page instead of API JSON:** the URL points to the frontend or an incorrect backend route. Use the Node server's origin without `/api`.
- **Port already in use:** stop the old server or change PORT.
- **Missing production build:** run `npm run build` before `npm start`.
- **Invalid order storage:** restore a valid JSON array from backup; do not overwrite existing orders.

Docker uses the same settings. The supplied Dockerfile serves both parts and runs as a non-root user. It still needs persistent storage for `/app/data`.
