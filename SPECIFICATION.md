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

---

## 5. Future Extension Points (Non-MVP)

- **Checkout/Payments:** The cart layout must pass data cleanly to a future `/checkout` route where Stripe/Paypal will be integrated.
- **Order Management:** Database tables for `orders` and `order_items` are deferred to post-MVP but will link `userId` to `products`.
