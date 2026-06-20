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
