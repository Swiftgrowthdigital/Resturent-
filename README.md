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

## Dashboard authentication

The dashboard is protected by the `ADMIN_PASSWORD` and `ADMIN_TOKEN_SECRET` values in the server environment. Set strong, unique values before deployment; no default credentials are seeded.

## Notes

- The customer app uses the configured seat dropdown from `/api/menu`.
- The server seeds sample categories and food items on first run when the database is empty. Upload production images through the dashboard; they are stored in Supabase Storage.
- Image uploads are handled by `POST /api/upload` with Multer and Supabase Storage credentials from server environment variables.
