# Production Readiness Audit — Restaurant QR Ordering System

**Audit date:** 2026-07-11  
**Scope:** React customer menu and owner dashboard, Node/Express API, MongoDB/Mongoose, Socket.IO, PWA assets, deployment configuration, and static source review.  
**Mode:** Inspection only — no product code was changed for this audit.

## Production Readiness Score

**61 / 100 — NOT APPROVED FOR PUBLIC PRODUCTION RELEASE**

The project builds cleanly and has a workable core ordering flow, but it has a release-blocking real-time authorization issue and cannot truthfully meet its offline/PWA promise. The current environment did not provide a running MongoDB deployment or browser/device automation, so live database persistence, Socket.IO delivery, notification permission, visual breakpoints, and offline behavior were not runtime-proven.

## Verification Performed

| Check | Result | Evidence |
| --- | --- | --- |
| Production build | PASS | `npm run build` completed successfully on 2026-07-11. |
| Server syntax | PASS | All reviewed server modules load/syntax-check cleanly. |
| Production dependency audit | PASS | `npm audit --omit=dev --workspaces --json` reported 0 vulnerabilities. |
| Customer-to-Mongo order flow | NOT PROVEN | No configured/running MongoDB instance was supplied for this audit. |
| Socket delivery, sound, browser notification | NOT PROVEN | Requires an authenticated browser plus live server. |
| Responsive breakpoints (320–1440px) | NOT PROVEN | Static review completed; no browser/device runner is available. |
| Offline/install PWA | FAIL by source inspection | The service worker does not cache built JS/CSS assets and returns the HTML shell for arbitrary failed GETs. |

## Critical Issues

### C-01 — Dashboard Socket.IO room is unauthenticated

- **Problem:** Any browser that connects to the Socket.IO server can emit `dashboard:join` (or `dashboard:authenticate`) and join the `dashboard` room. It will then receive full new-order objects, including seat numbers, item names, prices, and order identifiers.
- **Cause:** `server/src/config/socket.js` joins the room without validating a JWT, session, or server-side user role.
- **Solution:** Require a JWT in the Socket.IO handshake, validate it with the same secret and user lookup as HTTP auth, reject unauthenticated connections, and only join the dashboard room for the admin role. Remove the misleading unauthenticated `dashboard:authenticate` event.
- **Priority:** Critical — release blocker.
- **Estimated time:** 2–4 hours plus live socket regression tests.

## High Priority Issues

### H-01 — PWA offline shell is not functional

- **Problem:** A previously opened app cannot reliably load offline. The worker caches only `/` and `/manifest.json`; Vite’s hashed JS and CSS are not precached. On a failed JS/CSS/image GET, it may return `/` (HTML) instead of the requested asset.
- **Cause:** `client/public/sw.js` uses a generic network-fallback strategy rather than a Vite-aware precache/runtime strategy.
- **Solution:** Use a PWA build integration (for example, Workbox through the Vite PWA plugin) or generate a versioned precache manifest for all build assets. Return the navigation fallback only for `request.mode === 'navigate'`; use cache-first/network-first strategies per asset type.
- **Priority:** High — stated product requirement is not met.
- **Estimated time:** 4–8 hours plus Android/iOS offline validation.

### H-02 — Default client environment enables demo data

- **Problem:** `client/.env.example` declares `VITE_USE_DEMO_DATA=true`. If this file is copied for deployment, customers can see demo menu data and orders will not be persisted or notify the owner.
- **Cause:** The example configuration contradicts the runtime-safe default introduced in `menuService.js`.
- **Solution:** Set the sample value to `false`, document required production variables, and add a startup/deployment check that prevents demo mode outside local development.
- **Priority:** High.
- **Estimated time:** 30–60 minutes.

### H-03 — HTTP API has no endpoint-specific abuse controls

- **Problem:** Login, seat validation, and order creation share one permissive global limit of 200 requests per 15 minutes. Login is susceptible to credential stuffing; seat validation and order creation can be spammed.
- **Cause:** `server/src/app.js` applies only a global limiter; no route-specific limiter or idempotency/rate policy exists.
- **Solution:** Apply stricter IP/account-aware limits to login, modest per-IP limits to seat validation, and order-creation limits with a short idempotency window. Configure reverse-proxy trust deliberately before deploying.
- **Priority:** High.
- **Estimated time:** 2–4 hours.

### H-04 — Admin mutation validation is incomplete

- **Problem:** Food/category update handlers accept broad request bodies and do not use `runValidators`. Invalid ObjectIds, negative/NaN prices, arbitrary keys, and malformed updates can yield 500 responses or persist unexpected fields depending on schema strictness.
- **Cause:** `updateFood` spreads `req.body`; `updateCategory` has no validation middleware; ID parameters are not validated across several routes.
- **Solution:** Use explicit allow-lists, endpoint validators, `isMongoId` checks, numeric bounds, URL/image validation, and `{ runValidators: true }`. Return consistent 400/404 responses.
- **Priority:** High.
- **Estimated time:** 4–6 hours plus API tests.

### H-05 — Duplicate restaurant configuration stores conflicting sources of truth

- **Problem:** `Restaurant` and legacy `RestaurantSettings` overlap, while seats live in both `Seat` documents and `RestaurantSettings.availableSeats`. The menu reads `Restaurant`; the dashboard settings editor reads/writes the legacy document and replaces all seat documents.
- **Cause:** Incremental migration without a completed cutover.
- **Solution:** Select one canonical restaurant and seat model, migrate existing records once, update all readers/writers, then remove the legacy model/routes and obsolete geofence fields.
- **Priority:** High.
- **Estimated time:** 1–2 days including migration and regression testing.

## Medium Priority Issues

### M-01 — Order status routes expose removed lifecycle actions

- **Problem:** `/preparing`, `/completed`, and `/cancel` routes remain public to authenticated admins even though the model/controller now permit only Pending and Confirmed; they always return “Invalid status.”
- **Cause:** Old routes were retained after the workflow was narrowed.
- **Solution:** Remove obsolete routes and client remnants, or restore a fully validated lifecycle if product requirements change.
- **Priority:** Medium.
- **Estimated time:** 30 minutes.

### M-02 — Error handler discloses internal error messages

- **Problem:** Unhandled errors are returned verbatim through `err.message`; database/storage implementation details can be exposed.
- **Cause:** `errorMiddleware` uses the original error message for all status codes.
- **Solution:** Log structured error details server-side with a request ID; send stable generic 500 responses and only safe, whitelisted operational messages to clients.
- **Priority:** Medium.
- **Estimated time:** 2–3 hours.

### M-03 — Seat validation responses can race while typing

- **Problem:** A slower response for an earlier seat value can overwrite the state for a later value, falsely enabling or disabling checkout.
- **Cause:** `MenuPage` debounces but does not cancel/sequence in-flight Axios requests.
- **Solution:** Use `AbortController` or a monotonically increasing request token and only apply the latest response.
- **Priority:** Medium.
- **Estimated time:** 1–2 hours.

### M-04 — No automated test suite or API contract coverage

- **Problem:** Core flows (seat validation, price authority, duplicate order, auth, confirm, socket authorization) have no discoverable unit/integration/e2e tests.
- **Cause:** The workspace has build scripts only; no test runner or CI configuration was found.
- **Solution:** Add API integration tests with an isolated MongoDB instance, component tests for customer failures, and Playwright/Cypress smoke coverage for critical responsive paths.
- **Priority:** Medium.
- **Estimated time:** 2–4 days.

### M-05 — Mongo query/index strategy is incomplete for order operations

- **Problem:** `listOrders` filters by `status` and sorts by `createdAt`, but `Order` has no compound `{ status, createdAt }` index. Dashboard aggregation and day queries will degrade as orders grow.
- **Cause:** Schemas rely on unique indexes only.
- **Solution:** Add intentional indexes for order status/date and created-date reporting, then validate query plans against production-like data.
- **Priority:** Medium.
- **Estimated time:** 1–2 hours.

### M-06 — Upload checks trust browser MIME type and have no content policy

- **Problem:** Multer accepts any `image/*` MIME supplied by the client and allows 5 MB buffers in process memory. Uploads have no file-signature verification, transformation, or deletion lifecycle.
- **Cause:** Basic MIME-only upload filter.
- **Solution:** Validate magic bytes, constrain formats/dimensions, transform server-side/Supabase Storage, add operational quotas, and avoid exposing raw provider error text.
- **Priority:** Medium.
- **Estimated time:** 4–8 hours.

## Low Priority Issues

### L-01 — Dead and obsolete customer-flow code remains

- **Problem:** `OrderSuccessPage`, `SearchBar`, `useGeofence`, distance helpers, and `sanitize.js` are not part of the active final flow. `OrderSuccessPage` still describes tracking and old statuses.
- **Cause:** Prior iterations were not removed after the workflow was simplified.
- **Solution:** Remove unused modules/imports after verifying no external route references; keep only current behavior.
- **Priority:** Low.
- **Estimated time:** 1–2 hours.

### L-02 — `useDeferredValue('')` has no effect

- **Problem:** Menu filtering retains an always-empty deferred search value after search UI removal.
- **Cause:** Partial cleanup.
- **Solution:** Remove the unused deferred value and search branch.
- **Priority:** Low.
- **Estimated time:** 15 minutes.

### L-03 — Static category/food data maintenance endpoints are inconsistent

- **Problem:** Public category reads, menu category reads, admin food reads, singular/plural aliases, and legacy settings routes create a larger API surface than required.
- **Cause:** Compatibility aliases accumulated during development.
- **Solution:** Publish one versioned API contract and remove aliases after client migration.
- **Priority:** Low.
- **Estimated time:** 2–4 hours.

## Security Issues

| ID | Finding | Priority |
| --- | --- | --- |
| C-01 | Unauthenticated Socket.IO dashboard subscription leaks live order data. | Critical |
| H-03 | No per-route abuse protections for login/order/seat endpoints. | High |
| H-04 | Broad update payloads and missing validation on mutation paths. | High |
| M-02 | Internal error messages may reach clients. | Medium |
| M-06 | Upload validation is MIME-only. | Medium |
| S-01 | `JWT_SECRET=change-this-secret` and seeded credentials are present in the environment example; unsafe if used unchanged. | Medium |

**Positive controls observed:** Helmet is enabled, password comparison uses bcrypt, admin HTTP routes require JWT and role checks, request bodies are size-limited, a Mongo-operator sanitization middleware is installed, `.env` is ignored, and production dependency audit reported zero known vulnerabilities.

## Performance Issues

- Initial JS bundle is **428.47 kB / 142.27 kB gzip**. Code splitting exists for main pages, but the shared entry remains substantial; inspect with a bundle visualizer before launch.
- Dashboard loads dashboard stats, menu, orders, and settings together; this adds request pressure even when the owner only needs orders.
- `getMenu` fetches all foods and categories without cache headers, pagination, or conditional requests.
- Dashboard has no pagination for orders; a busy restaurant will transfer and render an unbounded order list.
- The application has no server compression or explicit cache-control policy in the repository. These may exist at the hosting layer, but they are not proven here.

## UI and Responsive Issues

- Static Tailwind review suggests menu cards, category tabs, and order summary are generally mobile-aware; global horizontal overflow is hidden and food cards have a 390px layout adjustment.
- The owner dashboard search input uses `min-w-[260px]`; it is wrapped in a column on small screens, but actual 320px touch/layout validation remains unproven.
- The dashboard is a large single component (roughly 800 lines), increasing regression risk and making responsive changes harder to validate.
- Customer success is implemented as a modal rather than a dedicated thank-you route; it works conceptually but back/reload behavior is not resilient or independently testable.

## Accessibility Issues

- No automated accessibility scan or manual keyboard/screen-reader test was available; this is a release gap.
- Image alternatives are sometimes empty (`alt=""`) in order-summary item imagery. Decorative use may be valid, but meaningful food imagery should have descriptive alternatives.
- Browser notifications are requested on dashboard load rather than after an explicit user action; browsers can deny or suppress this, and users lack an in-app notification preference.
- Focus management for the customer success modal and expanding order drawer was not proven. Ensure focus moves into the dialog, remains trapped while open, and returns to the trigger.

## Deployment Issues

- No CI workflow, deployment manifest, production process manager, health/readiness check, Mongo backup policy, log aggregation, uptime monitoring, or rollback procedure was found.
- Production environment validation is limited to `MONGODB_URI`; a weak/missing `JWT_SECRET`, invalid client origin, and missing Supabase Storage configuration do not fail fast with an actionable readiness response.
- The Vite proxy is development-only. Production needs an explicit frontend/API origin arrangement, HTTPS/WSS, reverse-proxy `trust proxy`, and Socket.IO upgrade support.
- PWA metadata lacks production-ready 192px/512px raster or maskable icons and iOS-specific install/splash metadata.

## Recommended Release Sequence

1. Resolve C-01 and prove unauthenticated sockets cannot receive or emit dashboard events.
2. Correct PWA caching and validate offline launch/navigation on Android and iPhone.
3. Lock production configuration: non-demo client mode, strong secrets, exact CORS origin, HTTPS/WSS, and readiness checks.
4. Add endpoint validation/rate policies and a consistent safe error contract.
5. Complete the data-model cutover, add indexes, and test migration/rollback.
6. Add automated API, socket, visual responsive, and accessibility smoke tests in CI.
7. Run a live release rehearsal covering Mongo outage, API outage, socket reconnect, duplicate order retries, notification permission denial, and order recovery.

## Release Decision

**Hold release.** The current build is a useful staging candidate, not a production-ready public deployment. Approval should be reconsidered only after the Critical issue and High issues are resolved and the unproven runtime checks are executed against the target environment.
