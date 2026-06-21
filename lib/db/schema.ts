import {
  index,
  integer,
  pgTable,
  serial,
  text,
  timestamp,
} from "drizzle-orm/pg-core";

export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description"),
});

export const products = pgTable(
  "products",
  {
    id: serial("id").primaryKey(),
    name: text("name").notNull(),
    slug: text("slug").notNull().unique(),
    description: text("description"),
    // Stored in cents to avoid floating-point money bugs.
    price: integer("price").notNull(),
    images: text("images").array().notNull().default([]),
    stock: integer("stock").notNull().default(0),
    categoryId: integer("category_id").references(() => categories.id, {
      onDelete: "set null",
    }),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => [index("products_category_id_idx").on(table.categoryId)],
);

/**
 * A guest checkout order. Created with status "pending" when a Stripe Checkout
 * Session is opened, then flipped to "paid" (and backfilled with the amount and
 * shipping address from the session) by the Stripe webhook. No userId — there is
 * no auth yet; orders are keyed to the guest's email.
 */
export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  // Stripe Checkout Session id. Unique so the webhook can locate and update the
  // matching order idempotently (Stripe may deliver an event more than once).
  stripeSessionId: text("stripe_session_id").notNull().unique(),
  email: text("email").notNull(),
  // Shipping fields are filled by the webhook from Stripe's collected address.
  shippingName: text("shipping_name"),
  shippingLine1: text("shipping_line1"),
  shippingLine2: text("shipping_line2"),
  shippingCity: text("shipping_city"),
  shippingState: text("shipping_state"),
  shippingPostalCode: text("shipping_postal_code"),
  shippingCountry: text("shipping_country"),
  // Total in cents, taken from the session once paid; null while pending.
  amountTotal: integer("amount_total"),
  currency: text("currency").notNull().default("usd"),
  // "pending" | "paid" | "failed".
  status: text("status").notNull().default("pending"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

/**
 * A line item belonging to an order. Name and unit price are snapshotted at
 * purchase time so the order is unaffected by later catalog edits.
 */
export const orderItems = pgTable(
  "order_items",
  {
    id: serial("id").primaryKey(),
    orderId: integer("order_id")
      .notNull()
      .references(() => orders.id, { onDelete: "cascade" }),
    productId: integer("product_id").references(() => products.id, {
      onDelete: "set null",
    }),
    name: text("name").notNull(),
    quantity: integer("quantity").notNull(),
    // Snapshot of the product price in cents at purchase time.
    unitPrice: integer("unit_price").notNull(),
  },
  (table) => [index("order_items_order_id_idx").on(table.orderId)],
);
