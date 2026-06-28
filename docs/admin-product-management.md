# Admin Product & Category Management — Implementation Plan

Phased plan for building an authenticated `/admin` area to manage the catalog. Each
phase is self-contained so it can be picked up in a fresh session. Check off the
boxes as you go.

## Goal

NexusCart has a public storefront but no way to manage the catalog (products/
categories exist only via `lib/db/seed.ts`). Build an admin area gated by real
auth (Better Auth — this also realizes the project's unbuilt Phase 1) with a
`role` column, providing full CRUD for **products and categories**, with product
images supplied by **both** pasted URLs and file upload.

## Branch

Work on `feat/admin-product-management`.

---

## ⚠️ Verified facts — do not re-derive from memory

These were confirmed against the **installed** packages/docs (not training data):

- **Next.js is 16.2.x.** `middleware.ts` is renamed to **`proxy.ts`** (root file,
  exports `proxy` fn + optional `config.matcher`; defaults to the Node runtime).
  Verified at `node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/proxy.md`.
  Proxy is an **optimistic** gate only — real authorization must also live in the
  admin layout and in **every** Server Action (`authentication.md`).
- **Better Auth is v1.6.22.** Verified import paths from the installed package:
  - `import { betterAuth } from "better-auth"`
  - `import { drizzleAdapter } from "better-auth/adapters/drizzle"` —
    signature `drizzleAdapter(db, { provider: "pg", schema, usePlural?, camelCase? })`.
    `schema` keys are **singular** table names (`user`, `session`, …) matching our style.
  - `import { toNextJsHandler, nextCookies } from "better-auth/next-js"`
  - `import { createAuthClient } from "better-auth/react"`
  - `admin` plugin available at `better-auth/plugins/admin` (NOT used — we use a
    plain `role` field, see Phase 1).
  - Catch-all route: `export const { GET, POST } = toNextJsHandler(auth)`.
  - Server session read: `auth.api.getSession({ headers: await headers() })`.
  - Seeding a user server-side: `auth.api.signUpEmail({ body: { email, password, name } })`.
  - `nextCookies()` must be the **last** plugin so Server Action sign-in/up set cookies.
  - CLI is `@better-auth/cli` (no local bin) — run via `pnpm dlx @better-auth/cli@latest generate`.
- **Tooling present:** `pnpm test` (vitest), `pnpm typecheck` (tsc --noEmit),
  `pnpm lint`, `pnpm format`. Existing tests: `lib/cart/store.test.ts`,
  `lib/queries/products.test.ts`. (CLAUDE.md's "no test runner" note is stale.)
- **Server Action pattern** to mirror: `app/checkout/actions.ts` — `"use server"`,
  `(boundArg, prevState, formData) => Promise<State>`, client uses `useActionState`,
  `redirect()` called **outside** try/catch.
- `cookies()`/`headers()` are async. `revalidatePath(path, type)` needs `type`
  (`'page'`/`'layout'`) for dynamic segments; import from `next/cache`.
- `db` (`lib/db/index.ts`) is `drizzle(client, { schema })` over the full
  `lib/db/schema.ts` namespace, so tables added there are found by the adapter
  automatically (we still pass `schema` to the adapter explicitly for clarity).
- Money is **integer cents** (`products.price`); format with `formatPrice`
  (`lib/format.ts`, re-exported from `lib/queries/products.ts`).
- Remote image hosts must be allowlisted in `next.config.ts` `images.remotePatterns`
  (seed uses `picsum.photos`). Local `/uploads/*` from `public/` needs no entry.

---

## Phase 0 — Deps, env, shadcn components ✅ DONE

- [x] `pnpm add better-auth zod` (better-auth 1.6.22, zod 4.4.3).
- [x] shadcn components added (base-nova / @base-ui, no Radix): `table`, `select`,
      `textarea`, `dialog`, `dropdown-menu`, `checkbox` in `components/ui/`.
      `button.tsx` was preserved (declined overwrite).
- [x] `.env.example` — added `SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD`
      (`BETTER_AUTH_SECRET` / `BETTER_AUTH_URL` already present).
- [ ] Add the same `SEED_ADMIN_*` to your local `.env` (done in Phase 6 / before seeding).

---

## Phase 1 — Better Auth foundation ✅ DONE (this session)

Goal: working auth instance, schema tables, route handler, client, and a
server-side `requireAdmin()` gate. (Does not yet wire any UI.)

- [x] **`lib/auth.ts`** — `betterAuth({ database: drizzleAdapter(db, { provider: "pg", schema: { user, session, account, verification } }), emailAndPassword: { enabled: true }, user: { additionalFields: { role: { type: "string", defaultValue: "user", input: false } } }, plugins: [nextCookies()] })`. `import "server-only"` + reads `BETTER_AUTH_SECRET` from env (mirror `lib/stripe.ts`).
- [x] **`lib/db/schema.ts`** — add `user`/`session`/`account`/`verification` tables
      (generated via `pnpm dlx @better-auth/cli@latest generate`, then merged) with
      `role: text("role").notNull().default("user")` added to `user`.
- [x] **`app/api/auth/[...all]/route.ts`** — `export const { GET, POST } = toNextJsHandler(auth)`.
- [x] **`lib/auth-client.ts`** — `createAuthClient()` exporting `signIn`/`signOut`/`useSession`.
- [x] **`lib/auth-dal.ts`** — `import "server-only"`; `getCurrentSession()` (wrapped in
      React `cache()`) reading `auth.api.getSession({ headers: await headers() })`;
      `requireAdmin()` → `redirect("/login")` if no session, `redirect("/")` if
      `role !== "admin"`, else returns the session.
- [x] **DB push** — `pnpm db:push` (NB: this repo's local `.env` `DATABASE_URL`
      points at a **Neon** cloud DB, not the docker container — push/seed target
      whatever `DATABASE_URL` is set to). Verified the four tables exist and
      `user.role` is `text NOT NULL default 'user'`.
- [x] `pnpm typecheck` + `pnpm lint` clean.

---

## Phase 2 — Admin gating + shell ✅ DONE

- [x] **`proxy.ts`** (repo root, NOT `middleware.ts`) — optimistic check using
      `getSessionCookie(request)` from `better-auth/cookies`. Redirects `/admin/*` →
      `/login` when the cookie is absent; `/login` and `/signup` → `/admin` when present.
      `export const config = { matcher: ["/admin/:path*", "/login", "/signup"] }`.
      Optimistic only — NOT the security boundary.
- [x] **`app/admin/layout.tsx`** — Server Component; `await requireAdmin()` first, then
      renders the admin chrome — a persistent **left sidebar** (NexusCart wordmark, nav
      links to Products/Categories, and `<SignOutButton />` at the bottom) with the page
      content in `<main>`. Sign-out is **`components/admin/sign-out-button.tsx`** (client,
      `authClient.signOut()` → `router.push("/login")`).
- [x] **`app/admin/page.tsx`** — `redirect("/admin/products")`.
- [x] **`app/admin/products/page.tsx`** — placeholder ("coming soon") so the shell is
      navigable; Phase 3 replaces it with the real product list.
- [x] **`app/login/page.tsx`** (centered `Card`, `robots: noindex`) +
      **`components/auth/login-form.tsx`** (`"use client"`, uses
      `authClient.signIn.email({ email, password })`, on success `router.push("/admin")` + `router.refresh()`).
- [x] **`components/site-header.tsx`** — shows an "Admin" link (admins) / "Sign in" link
      (everyone else) based on `getCurrentSession()`.
- [x] **Sign-up UI** (added beyond the original plan) — **`app/signup/page.tsx`** (noindex
      `Card`, links to `/login`) + **`components/auth/signup-form.tsx`** (`"use client"`,
      name/email/password, `authClient.signUp.email(...)`, redirects to `/` on success).
      `/login` links to `/signup`. NB: new accounts are always `role: "user"` (server-side
      `input: false`), so sign-up CANNOT create an admin — promote via `db:studio` or the
      Phase 6 seed.
- [x] Verify: logged-out `/admin` and `/admin/products` 307-redirect to `/login` (proxy);
      `requireAdmin()` in the layout is the real boundary. `pnpm typecheck`, `pnpm lint`,
      and `pnpm test` (23 tests) all clean.

## Phase 3 — Product CRUD ✅ DONE (this session)

- [x] **`lib/slug.ts`** — `slugify(name)` (NFKD + strip diacritics, lowercase, non-alnum→
      dash, collapse, trim) + `slugWithSuffix(base, attempt)` and `isUniqueViolation(err)`
      (Postgres 23505) for the catch-and-retry loop. Pure functions; vitest in
      `lib/slug.test.ts` (10 cases).
- [x] **`lib/validation/admin.ts`** — zod `productInput` (name; optional slug→derived from
      name via `slugify`; description→null when blank; **price dollars→integer cents**;
      stock int ≥0; nullable `categoryId` with ""/"none"→null; `images` string[] trimmed).
      Exports inferred `ProductInput`. (`categoryInput` deferred to Phase 4.)
- [x] **`lib/queries/products.ts`** — added `getAllProductsForAdmin()`, `getProductById(id)`
      (returns full row as `AdminProduct`), `createProduct`, `updateProduct`, `deleteProduct`.
      Slug uniqueness via a retry loop on `isUniqueViolation` (cap `MAX_SLUG_ATTEMPTS`).
- [x] **`app/admin/products/actions.ts`** — `"use server"`; `createProductAction`/
      `updateProductAction(id,…)`/`deleteProductAction(id)`: `await requireAdmin()` first →
      zod-validate `formData` (images via `getAll`) → mutate → `revalidateStorefront()`
      (`/admin/products`, `/`, `/products/[slug]` + `/categories/[slug]` as `'page'`,
      `/categories`) → `redirect("/admin/products")` (outside try/catch). Returns
      `{ error?, fieldErrors? }` (zod `flattenError`, first message per field).
- [x] **`app/admin/products/page.tsx`** — shadcn `Table` (name/price/stock/category/image
      count) with "Add product", per-row Edit link, and delete via
      **`components/admin/delete-product-button.tsx`** (client `Dialog` confirm).
- [x] **`app/admin/products/new/page.tsx`** + **`app/admin/products/[id]/edit/page.tsx`**
      (`await params`; `notFound()` on bad/missing id; both `await requireAdmin()`).
- [x] **`components/admin/product-form.tsx`** — `"use client"`, `useActionState`; Base UI
      `Select` (category, submits via `name`), `Textarea`, price/stock inputs, and an image
      URL manager (add/remove, repeated hidden `images` inputs). Marked `// SWAP POINT
    (Phase 5)` where `image-input.tsx` (file upload) will replace the URL block.
- [x] Verified: `pnpm typecheck`, `pnpm lint`, `pnpm format:check` clean; `pnpm test`
      (33 tests, +10 slug); `pnpm build` compiles all six admin routes as dynamic.
      NB: end-to-end manual CRUD still needs an admin login (promote a user via `db:studio`
      until the Phase 6 seed lands).

## Phase 4 — Category CRUD ⬜ TODO

- [ ] **`lib/queries/categories.ts`** — add `createCategory`, `updateCategory`,
      `deleteCategory`, `getAllCategoriesForAdmin`, `getCategoryById`.
- [ ] **`app/admin/categories/actions.ts`** — same pattern; `revalidatePath("/admin/categories")` + `/categories` + `/`. Deleting a category nulls `products.categoryId` (existing
      `on delete set null`) — surface a `dialog` confirmation in the UI.
- [ ] **`app/admin/categories/page.tsx`**, **`.../new/page.tsx`**, **`.../[id]/edit/page.tsx`**,
      **`components/admin/category-form.tsx`**.

## Phase 5 — Image upload (alongside pasted URLs) ⬜ TODO

- [ ] **`app/api/admin/upload/route.ts`** — `POST`: `await requireAdmin()`,
      `await request.formData()`, validate file type/size, write to
      `public/uploads/<uuid>.<ext>` via `node:fs/promises`, return `{ url: "/uploads/<file>" }`.
      Node runtime. Mark a clear `// SWAP POINT` comment for S3/UploadThing.
- [ ] **`components/admin/image-input.tsx`** — `"use client"`; manages a string[] of image
      URLs: a paste-URL field with "Add", AND a file input that POSTs to the upload route
      and appends the returned URL. Renders the list with remove buttons; serializes to
      repeated hidden `<input name="images">` read via `formData.getAll("images")`.
- [ ] **`.gitignore`** — ignore `public/uploads/*` (keep a `.gitkeep`).
- [ ] Note: pasted **remote** image hosts must be added to `next.config.ts`
      `images.remotePatterns`; local `/uploads/*` needs no entry.

## Phase 6 — Seed admin user + full verification ⬜ TODO

- [ ] **`.env`** — set `SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD`.
- [ ] **`lib/db/seed.ts`** — after catalog seeding, create the admin via
      `auth.api.signUpEmail({ body: { email, password, name } })`, then
      `db.update(user).set({ role: "admin" }).where(eq(user.email, email))`. Do NOT
      hand-hash into `account` (let Better Auth own the hash format).
- [ ] Full verification:
  - `pnpm typecheck`, `pnpm lint`, `pnpm test` (no regressions).
  - `pnpm db:studio`: four auth tables + `role` exist; seeded admin row has `role='admin'`.
  - Gating: logged out → `/admin` redirects to `/login`; admin logs in → `/admin/products`;
    a non-admin user is blocked by `requireAdmin()` in the layout.
  - **Security (critical):** invoking a mutation Server Action while logged out fails at
    the action's `requireAdmin()`, not just the UI.
  - Product CRUD with both a pasted `picsum.photos` URL and an uploaded file (file lands in
    `public/uploads/` and renders); edit; delete; storefront reflects changes.
  - Category CRUD; deleting a category nulls `products.categoryId` and products still list.
