# Deploying the frontend to Vercel

This folder is **one npm-workspace repo** containing two Next.js apps:

- `apps/storefront` — customer storefront
- `apps/admin` — admin dashboard

…plus shared source packages `packages/ui` (`@repo/ui`) and `packages/types`
(`@repo/types`), which ship TypeScript source and are transpiled by each app via
`transpilePackages` (no separate build step).

On Vercel you create **two Projects from this one GitHub repo**, each pointed at a
different app directory. Vercel detects the root `package-lock.json` + `workspaces`
and installs the whole workspace, so the `@repo/*` packages resolve correctly.

## 1. Push this folder to GitHub

```bash
# from inside frontend/
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin git@github.com:<you>/nexlor-frontend.git
git push -u origin main
```

`.gitignore` already excludes `.env*`, `node_modules/`, and `.next/`.

## 2. Create the Storefront project

1. Vercel → **Add New… → Project** → import the `nexlor-frontend` repo.
2. **Root Directory:** `apps/storefront` (Edit → select the folder).
   - Keep **"Include source files outside of the Root Directory"** enabled — this
     is what lets the build see the workspace root + `packages/*`.
3. **Framework Preset:** Next.js (auto-detected). Leave Build/Install commands at
   their defaults — Vercel installs from the workspace root automatically.
4. **Environment Variables:**

   | Name | Value |
   | ---- | ----- |
   | `NEXT_PUBLIC_API_URL` | `https://<your-api>.onrender.com/api` |
   | `NEXT_PUBLIC_SITE_URL` | `https://<storefront>.vercel.app` |

   > These are `NEXT_PUBLIC_*`, so they're baked in **at build time** — set them
   > before the first deploy, and redeploy if you change them. After the first
   > deploy you'll know the real `.vercel.app` URL; update `NEXT_PUBLIC_SITE_URL`
   > to match and redeploy.

5. **Deploy.**

## 3. Create the Admin project

Repeat step 2 with a **second** project from the **same repo**:

- **Root Directory:** `apps/admin`
- **Environment Variables:**

  | Name | Value |
  | ---- | ----- |
  | `NEXT_PUBLIC_API_URL` | `https://<your-api>.onrender.com/api` |

## 4. Wire CORS back to the API

After both projects are live, copy their URLs and set them on the Render API
service (no trailing slashes):

```
CORS_ORIGINS=https://<storefront>.vercel.app,https://<admin>.vercel.app
```

The API redeploys and will then accept browser requests from both apps.

## 5. Auth cookie caveat (cross-domain)

Login uses httpOnly cookies set by the API on its `onrender.com` domain. With the
API configured for `SameSite=None; Secure` (see `backend/DEPLOY.md`), this works
in Chrome/Firefox/Edge. **Safari and iOS block third-party cookies**, so login may
fail there until the frontend and API share one parent domain (custom domains on
subdomains of the same site). See `backend/DEPLOY.md` §4 for the custom-domain fix.

## Recommended deploy order

1. Deploy the **API on Render** first → note its `…onrender.com` URL.
2. Deploy **storefront** + **admin** on Vercel with `NEXT_PUBLIC_API_URL` set to that URL.
3. Set **`CORS_ORIGINS`** on Render to the two Vercel URLs → redeploy the API.
4. Seed the database (see `backend/DEPLOY.md` §5) and log in.

## Local development

Unchanged — from the repo root: `npm install` then `npm run dev` runs both apps
(storefront on :3000, admin on :3001) against a local API on :4000.
