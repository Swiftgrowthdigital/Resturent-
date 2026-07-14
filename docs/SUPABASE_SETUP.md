# Supabase production setup

This application continues to use MongoDB Atlas for orders, dashboard data, and customer ordering. Supabase is configured for public menu/category images. The SQL tables are production-ready and intentionally private; they are not a replacement for the existing MongoDB models.

## Step 1: Run SQL

In the Supabase Dashboard, open **SQL Editor**, create a new query, paste the complete contents of `supabase/migrations/001_initial_schema.sql`, and run it once.

It creates UUID-based `categories`, `foods`, and `seats` tables, indexes, timestamps, RLS, the six default categories, 20 default seats, the `restaurant-images` bucket, and all Storage policies.

## Step 2: Create Storage bucket

The migration creates `restaurant-images` automatically. In **Storage**, confirm that the bucket exists and has **Public** enabled. If your project role cannot create Storage buckets from SQL, create it manually with this exact name and Public enabled, then re-run the Storage section of the migration.

The bucket accepts JPEG, PNG, GIF, and WebP files up to 5 MB. Anonymous users can read public image URLs but cannot upload, update, or delete files. The authenticated policies are present for trusted Supabase-authenticated clients; the restaurant backend uses its server-only service-role key and bypasses RLS.

## Step 3: Verify bucket

1. Sign in to the restaurant dashboard.
2. Upload an image while creating or editing a food or category.
3. Confirm the returned URL starts with your Supabase project URL and loads in a private browser window.
4. Save the food/category and verify its image loads on the customer menu.
5. To remove an unused image through the protected backend, send `DELETE /api/upload` with JSON `{ "path": "foods/<stored-file-name>.jpg" }`. The path is the object key, not the public URL.

## Step 4: Copy Render variables

In the Render backend service, set these server-only values, then redeploy:

```dotenv
SUPABASE_URL=https://<project-ref>.supabase.co
SUPABASE_SERVICE_ROLE_KEY=<Supabase service_role key>
SUPABASE_STORAGE_BUCKET=restaurant-images
```

Never add `SUPABASE_SERVICE_ROLE_KEY` to a `VITE_*` variable or the frontend deployment. On production startup the backend verifies that this bucket exists before accepting traffic.
