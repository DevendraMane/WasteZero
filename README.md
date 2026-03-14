# WasteZero

WasteZero is a full-stack waste pickup and volunteer coordination platform.

## Tech Stack

- Frontend: React + Vite + Tailwind
- Backend: Node.js + Express + MongoDB + Socket.IO
- Auth: JWT + Google OAuth
- Media: Cloudinary

## Repository Structure

```
WasteZero/
	client/
	server/
	README.md
```

## Prerequisites

- Node.js 18+
- npm 9+
- MongoDB (Atlas or self-hosted)

## Environment Variables

### Server: `server/.env`

Use `server/.env.example` as a template.

Required keys:

```
MONGODB_URL=
PORT=
JWT_SECRET_KEY=
CLIENT_URL=
BACKEND_URL=

EMAIL_USER=
EMAIL_PASS=

GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_CALLBACK_URL=

CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

ADMIN_SECRET_CODE=
LOG_LEVEL=
NODE_ENV=
```

Notes:

- `CLIENT_URL` must be the deployed frontend origin.
- `GOOGLE_CALLBACK_URL` must match your backend domain callback endpoint.
- Admin registration is public, but requires a valid `ADMIN_SECRET_CODE`.
- Never commit `.env` files.

### Client: `client/.env`

Use `client/.env.example` as a template.

```
VITE_BACKEND_URL=
```

For separate-domain deployment, this should be your backend origin.

## Local Development

Open two terminals.

### Start backend

```
cd server
npm install
npm start
```

### Start frontend

```
cd client
npm install
npm run dev
```

## Build and Analyze Frontend Bundle

### Production build

```
cd client
npm run build
```

### Bundle analysis report

```
cd client
npm run build:analyze
```

Then open:

```
client/dist/bundle-stats.html
```

This project uses manual chunk splitting in `client/vite.config.js` for:

- charts
- maps
- realtime/socket
- router
- HTTP client
- UI utility libs
- core vendor fallback

## Hosting Notes (Separate Domains)

- Deploy frontend and backend separately.
- Set `CLIENT_URL` on backend to the frontend origin.
- Set `VITE_BACKEND_URL` on frontend to backend origin.
- Configure Google OAuth redirect URI to backend callback URL.
- Ensure HTTPS on both domains in production.

## Security and Operations Checklist

- Set strong `JWT_SECRET_KEY` and `ADMIN_SECRET_CODE`.
- Use production `LOG_LEVEL=warn` (or `error`).
- Rotate compromised secrets immediately.
- Run dependency audits before release:

```
cd server && npm audit
cd client && npm audit
```

## Contribution Workflow

Recommended flow:

```
feature branch -> dev branch -> main
```

- Do not push directly to `main`.
- Open PRs with clear scope and test notes.
  .
