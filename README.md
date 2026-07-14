# Restaurant QR Menu & Dine-in Ordering System

One-restaurant QR menu and dine-in ordering system with:

- Customer PWA
- QR table detection
- Geofenced ordering
- Owner dashboard
- Real-time order updates
- MongoDB data model
- Socket.IO notifications

## Project Structure

- `client/` React app
- `server/` Express API

## Setup

1. Install dependencies:

```bash
npm install
```

2. Create environment files:

```bash
cp server/.env.example server/.env
cp client/.env.example client/.env
```

3. Start both apps:

```bash
npm run dev
```

The server requires these production variables: `PORT`, `NODE_ENV`, `TRUST_PROXY`, `CLIENT_URL`, `MONGODB_URI`, `ADMIN_PASSWORD`, `JWT_SECRET`, `RESTAURANT_NAME`, `RESTAURANT_CURRENCY`, `ORDER_PREFIX`, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, and `SUPABASE_STORAGE_BUCKET`.

Keep MongoDB, dashboard, JWT, and Supabase service-role secrets in `server/.env` or Render only. Never use a `VITE_*` variable for a secret.

## Dashboard authentication

The dashboard is protected by `ADMIN_PASSWORD` and a 64+-character `JWT_SECRET`. The server returns an HS256 JWT after a successful login; the dashboard stores it locally and sends it as a Bearer token on protected API requests.

## Notes

- The customer app uses the configured seat dropdown from `/api/menu`.
- The server seeds sample categories and food items on first run when the database is empty. Upload production images through the dashboard; they are stored in Supabase Storage.
- Image uploads are handled by `POST /api/upload` with Multer and Supabase Storage credentials from server environment variables.
