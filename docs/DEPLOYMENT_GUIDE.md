# Production deployment guide

## Environment variables

### Render backend

| Variable | Required | Notes |
| --- | --- | --- |
| `NODE_ENV` | Yes | `production` |
| `PORT` | Yes | `5000` for this deployment. Render may override it at runtime. |
| `MONGODB_URI` | Yes | Atlas SRV URI with an application-only database user. |
| `CLIENT_URL` | Yes | Exact Vercel HTTPS origin, without a trailing slash. |
| `TRUST_PROXY` | Yes | `true` on Render. |
| `ADMIN_PASSWORD` | Yes | Dashboard password; rotate the temporary production value immediately. |
| `ADMIN_TOKEN_SECRET` | Yes | Random 64+ character secret; rotate to invalidate sessions. |
| `JWT_SECRET` | Yes | Random 64+ character server-only secret. |
| `SUPABASE_URL` | Yes | Project URL. |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes | Server-only secret; never add it to Vercel. |
| `SUPABASE_STORAGE_BUCKET` | Yes | Public image bucket, e.g. `restaurant-images`. |
| `RESTAURANT_NAME` | Yes | `The Chai Theka`. |
| `RESTAURANT_CURRENCY` | Yes | `INR`. |
| `ORDER_PREFIX` | Yes | `RK`. |

### Vercel frontend

| Variable | Required | Notes |
| --- | --- | --- |
| `VITE_API_URL` | Yes | Exact Render HTTPS URL; no trailing slash. |
| `VITE_RESTAURANT_NAME` | Yes | Frontend fallback and build-time PWA name. Restart the Vite server after changing it. |
| `VITE_USE_DEMO_DATA` | Yes | Set to `false`. Production builds reject `true`. |

Never place MongoDB, Supabase service-role, or dashboard secrets in a `VITE_*` variable.

## MongoDB Atlas

1. Create a dedicated production project, cluster, and least-privilege database user.
2. Allow network access from Render (use Render's documented egress/IP option; do not leave `0.0.0.0/0` permanently open).
3. Put the SRV connection string in Render as `MONGODB_URI`.
4. Enable Atlas backups, alerting, and a restore test schedule.

## Supabase Storage

1. Create a `restaurant-images` **public** bucket for published menu/category images.
2. Put `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, and `SUPABASE_STORAGE_BUCKET=restaurant-images` in Render. Copy the service-role key from **Supabase Dashboard → Settings → API → service_role key**.
3. Do not expose the service-role key to the browser. The backend uploads files after MIME and signature checks.
4. Public buckets permit image delivery; direct uploads remain server mediated. Supabase service keys bypass Storage RLS, so treat the key as a production secret. [Supabase Storage access control](https://supabase.com/docs/guides/storage/security/access-control)

If `SUPABASE_SERVICE_ROLE_KEY` is blank in `server/.env`, copy the real value from **Supabase Dashboard → Settings → API → service_role key** before starting the server. The application intentionally exits and names this variable when it is missing.

## Render backend

1. Create a Web Service from this repository.
2. Set root directory to the repository root, build command `npm ci`, and start command `npm run start --workspace server`.
3. Add every backend environment variable above, deploy, then open `/api/health`. Startup fails with a named configuration error if a required production value is missing, pings MongoDB Atlas, and verifies the configured Supabase Storage bucket before accepting traffic.
4. Set `CLIENT_URL` to the final Vercel origin and redeploy whenever that origin changes.
   Set it to `https://restaurant.swiftgrowthdigital.com` for this deployment.

## Vercel frontend

1. Import the repository and set root directory to `client`.
2. Build command: `npm run build`; output directory: `dist`.
3. Set `VITE_API_URL`, `VITE_RESTAURANT_NAME`, and `VITE_USE_DEMO_DATA=false`, then deploy.
   Set it to `https://resturent-server-k521.onrender.com` for this deployment.
4. Add a rewrite so client routes serve `index.html`:

```json
{ "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }] }
```

## Release checklist

- [ ] `npm ci`, `npm run build`, and `npm run dev` complete/start cleanly.
- [ ] Confirm CORS accepts only the deployed Vercel URL.
- [ ] Confirm `GET /api/menu` and `GET /api/brand` return `200`; sign in first, then confirm `GET /api/categories` returns `200`.
- [ ] Confirm the browser Socket.IO connection is established from the deployed frontend origin.
- [ ] Sign in to `/dashboard`, upload a Supabase image, and verify it is publicly visible.
- [ ] Place an order from a QR menu; verify it appears once at the top of Today’s Orders, sounds an alert, then confirm/cancel it.
- [ ] Change a food, category, and seat; verify menu/dashboard refresh without a browser refresh.
- [ ] Install the PWA on Android and desktop; test a previously loaded menu offline and `/offline.html`.
- [ ] Confirm browser console has no errors and test 401/429 responses.
- [ ] Test backup restore, monitoring alerts, a failed MongoDB connection, and rollback to the previous Render/Vercel deployment.

## Production operations checklist

- [ ] Rotate admin/session/Supabase secrets on a defined schedule and after staff changes.
- [ ] Keep Atlas backups and monitoring enabled.
- [ ] Review Render/Vercel error logs and uptime checks for `/api/health`.
- [ ] Keep dependencies current and run `npm audit --omit=dev --workspaces` in CI.
- [ ] Restrict deployment access with provider roles and MFA.
