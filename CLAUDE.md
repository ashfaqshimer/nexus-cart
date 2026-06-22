# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

> The line above is not optional context. **Next.js here is 16.2.x with breaking changes vs. your training data.** Before writing any Next.js code (routing, metadata, server/client components, fetching, config), read the relevant guide under `node_modules/next/dist/docs/` (`01-app`, `03-architecture`, etc.). Do not rely on remembered App Router conventions.

## Commands

Package manager is **pnpm** (see `pnpm-lock.yaml`).

- `pnpm dev` — start the dev server (http://localhost:3000)
- `pnpm build` / `pnpm start` — production build / serve
- `pnpm lint` — ESLint (`eslint-config-next`)

Database (Postgres + Drizzle):

- `docker compose up -d` — start the local Postgres 16 container (`nexus-cart-db`)
- `pnpm db:push` — push schema to the DB without a migration (fast local iteration)
- `pnpm db:generate` — generate a SQL migration from `lib/db/schema.ts` into `drizzle/`
- `pnpm db:migrate` — apply generated migrations
- `pnpm db:studio` — open Drizzle Studio
- `pnpm db:seed` — wipe and repopulate the catalog (`lib/db/seed.ts`)

There is no test runner configured yet.

## Setup

Copy `.env.example` to `.env`. `DATABASE_URL` is consumed by both the app (`lib/db/index.ts`) and `drizzle.config.ts`; the `POSTGRES_*` vars feed `docker-compose.yml`. First run: `docker compose up -d` → `pnpm db:push` → `pnpm db:seed`.

Checkout needs Stripe **test-mode** keys: `STRIPE_SECRET_KEY` and `APP_URL` (base URL for redirect URLs). For webhooks locally, run `stripe listen --forward-to localhost:3000/api/stripe/webhook` and copy its printed `whsec_…` into `STRIPE_WEBHOOK_SECRET`. In production, the webhook secret comes from the dashboard endpoint (Developers → Webhooks), which must subscribe to `checkout.session.completed`.

## Architecture

This is the **NexusCart** e-commerce boilerplate. `SPECIFICATION.md` is the source of truth for intended scope. Built so far: DB foundation, SSR homepage product grid, product detail pages and category browsing (`/categories` index + `/categories/[slug]` with sorting) (Phase 2), the client-side cart (Phase 3), and Stripe guest checkout + order persistence (Phase 4). Still unbuilt: Better Auth (Phase 1).

**Data layer.** `lib/db/index.ts` exports a single `db` Drizzle client built on `postgres-js`. The underlying `postgres` client is memoized on `globalThis` outside production to survive hot reloads without exhausting connections — preserve this pattern. Schema lives in `lib/db/schema.ts`; generated migrations and snapshots live in `drizzle/`.

**Queries live in `lib/queries/`, not in components.** Server components import typed query functions (e.g. `getProducts`) from there. Money is stored as **integer cents** (`products.price`) — never floats; format for display with `formatPrice` from `lib/queries/products.ts`.

**Rendering.** App Router under `app/`. Server components are the default and call query functions directly. `app/page.tsx` sets `export const dynamic = "force-dynamic"` to read the live catalog on every request. SEO is a core goal (see spec): metadata is configured via the Next.js Metadata API in `app/layout.tsx` (title template + description); detail/category pages are expected to follow the same approach.

**Checkout & payments.** Stripe Checkout in **test mode** (hosted page). The Stripe client lives in `lib/stripe.ts` (`import "server-only"`, throws if `STRIPE_SECRET_KEY` is unset — mirror the db pattern; never import it from a client component). Flow: the client form (`components/checkout/checkout-form.tsx`) sends only `{ id, quantity }` to a Server Action (`app/checkout/actions.ts`), which **re-reads price/stock from the DB** (`getProductsByIds`) so client prices can't be tampered with, persists a `pending` order, then `redirect()`s to Stripe (call it **outside** try/catch). The webhook (`app/api/stripe/webhook/route.ts`) must stay a Route Handler on the **Node runtime**: it verifies the signature against the **raw** `request.text()` body (no bodyParser) and flips the order to `paid` idempotently. Order queries live in `lib/queries/orders.ts`. The cart is cleared only on `/checkout/success`, never on cancel.

**UI.** shadcn/ui (`base-nova` style) with components in `components/ui/`, app-level components in `components/`. Built on `@base-ui/react` and Tailwind CSS v4 (config is CSS-first in `app/globals.css`, no `tailwind.config`). Use the `cn` helper from `lib/utils.ts` for class merging and the `@/*` path alias. Icons come from `lucide-react`. Add shadcn components via the CLI rather than hand-writing them; aliases are defined in `components.json`. When a Base UI `Button` renders as a link (`render={<Link …/>}`), pass `nativeButton={false}` — otherwise Base UI warns about lost native-button semantics.

**Remote images** must have their hostname allowlisted in `next.config.ts` `images.remotePatterns` (seed data uses `picsum.photos`).
