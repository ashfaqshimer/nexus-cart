# NexusCart - MVP Technical Specification

## 1. Project Overview

NexusCart is a generic, highly customizable, SEO-optimized e-commerce boilerplate built with Next.js. The goal of this MVP is to establish a rock-solid foundation for product browsing, user authentication, and shopping cart management, designed with clear separation of concerns to allow easy extension (e.g., payment gateways) later.

## 2. Tech Stack

- **Framework:** Next.js (App Router, TypeScript)
- **Styling & UI:** Tailwind CSS + shadcn/ui
- **Database:** PostgreSQL (via Docker Compose)
- **ORM:** Drizzle ORM (optimized for performance and type safety)
- **Authentication:** Better Auth (using the Drizzle database adapter)
- **State Management:** React Context / Zustand (for client-side cart)
- **Payments:** Stripe Checkout (hosted, test mode) — server-side session creation + webhook

---

## 3. Core Database Schema (Drizzle / Postgres)

### Authentication Tables (Required by Better Auth)

- **user:** `id` (PK), `name`, `email`, `emailVerified`, `image`, `createdAt`, `updatedAt`
- **session:** `id` (PK), `expiresAt`, `token`, `createdAt`, `updatedAt`, `userId` (FK -> user)
- **account:** `id` (PK), `accountId`, `providerId`, `userId` (FK -> user), `accessToken`, `refreshToken`, `idToken`, `expiresAt`, `password`
- **verification:** `id` (PK), `identifier`, `value`, `expiresAt`, `createdAt`, `updatedAt`

### E-commerce Tables

- **products:** `id` (PK), `name`, `slug` (indexed for SEO), `description`, `price` (Int/Numeric for cents), `images` (text array), `stock`, `categoryId` (FK -> categories), `createdAt`
- **categories:** `id` (PK), `name`, `slug` (indexed), `description`

### Order Tables

Guest checkout — orders are keyed to an email, not a `userId` (auth is not yet built).

- **orders:** `id` (PK), `stripeSessionId` (unique — links a Stripe Checkout Session to its order), `email`, shipping fields (`shippingName`, `shippingLine1`, `shippingLine2`, `shippingCity`, `shippingState`, `shippingPostalCode`, `shippingCountry`), `amountTotal` (Int cents, filled on payment), `currency`, `status` (`pending` | `paid` | `failed`), `createdAt`
- **order_items:** `id` (PK), `orderId` (FK -> orders, cascade), `productId` (FK -> products, set null), `name` (snapshot), `quantity`, `unitPrice` (Int cents snapshot at purchase)

---

## 4. MVP Feature Scope

### Phase 1: Infrastructure & Auth

- Local PostgreSQL setup via Docker Compose.
- Better Auth integration with Email/Password sign-up and login.
- Basic layout with shadcn/ui navbar, footer, and auth state toggles.

### Phase 2: Product Catalog & SEO

- Landing page featuring a product grid with server-side rendering (SSR) for maximum SEO benefit.
- Dynamic Product Detail Page (`/products/[slug]`) utilizing Next.js Metadata API for OpenGraph and SEO tags.
- Simple Category filtering pages (`/categories/[slug]`).

### Phase 3: Shopping Cart

- Client-side persistent cart (using local storage or cookies).
- Sliding cart drawer (shadcn sheet) accessible from any page.
- Actions: Add to cart, adjust quantity, remove item, display subtotal.

### Phase 4: Checkout & Orders (Built)

- Guest checkout at `/checkout`: a form collects name + email; the cart's `{ id, quantity }` is sent to a Server Action that **re-prices from the DB** (client prices are never trusted) and validates stock.
- The action creates a Stripe Checkout Session (hosted page, test mode), persists a `pending` order + items, then redirects to Stripe. Shipping address is collected by Stripe.
- A webhook (`/api/stripe/webhook`) verifies the signature against the raw body and flips the order to `paid` (backfilling amount + shipping), idempotently.
- `/checkout/success` shows the confirmation, tolerates the webhook race (pending → "processing"), and clears the cart only after a confirmed order.

---

## 5. Future Extension Points (Non-MVP)

- **Authentication:** Phase 1 Better Auth (email/password + Drizzle adapter) and its tables are not yet built. Once added, orders should gain a nullable `userId` to associate guest orders with accounts.
- **Category pages:** `/categories/[slug]` filtering (Phase 2) is not yet built.
- **Inventory:** Stock is validated at checkout but not decremented on payment; reservation/decrement is deferred.
- **Order history / admin:** No customer order-history or admin view reads the order tables yet.
