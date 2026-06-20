import "dotenv/config";

import { count } from "drizzle-orm";

import { db } from "./index";
import { categories, products } from "./schema";

const categorySeed = [
  {
    name: "Electronics",
    slug: "electronics",
    description: "Gadgets, audio, and everyday tech.",
  },
  {
    name: "Apparel",
    slug: "apparel",
    description: "Clothing and accessories for every day.",
  },
  {
    name: "Home & Kitchen",
    slug: "home-kitchen",
    description: "Essentials to outfit your space.",
  },
];

type ProductSeed = {
  name: string;
  slug: string;
  description: string;
  price: number; // cents
  stock: number;
  categorySlug: string;
};

const productSeed: ProductSeed[] = [
  {
    name: "Aurora Wireless Headphones",
    slug: "aurora-wireless-headphones",
    description: "Over-ear headphones with active noise cancellation.",
    price: 19999,
    stock: 24,
    categorySlug: "electronics",
  },
  {
    name: "Pulse Smartwatch",
    slug: "pulse-smartwatch",
    description: "Fitness and notifications on your wrist.",
    price: 14999,
    stock: 12,
    categorySlug: "electronics",
  },
  {
    name: "Nimbus Bluetooth Speaker",
    slug: "nimbus-bluetooth-speaker",
    description: "Portable speaker with rich, room-filling sound.",
    price: 7999,
    stock: 0,
    categorySlug: "electronics",
  },
  {
    name: "Vertex Mechanical Keyboard",
    slug: "vertex-mechanical-keyboard",
    description: "Hot-swappable switches and a compact layout.",
    price: 11999,
    stock: 30,
    categorySlug: "electronics",
  },
  {
    name: "Drift Cotton Tee",
    slug: "drift-cotton-tee",
    description: "Soft, breathable everyday t-shirt.",
    price: 2499,
    stock: 80,
    categorySlug: "apparel",
  },
  {
    name: "Summit Hooded Jacket",
    slug: "summit-hooded-jacket",
    description: "Water-resistant shell for changeable weather.",
    price: 8999,
    stock: 18,
    categorySlug: "apparel",
  },
  {
    name: "Trailhead Canvas Backpack",
    slug: "trailhead-canvas-backpack",
    description: "Durable daypack with laptop sleeve.",
    price: 5999,
    stock: 40,
    categorySlug: "apparel",
  },
  {
    name: "Ember Ceramic Mug Set",
    slug: "ember-ceramic-mug-set",
    description: "Set of four hand-glazed stoneware mugs.",
    price: 3499,
    stock: 50,
    categorySlug: "home-kitchen",
  },
  {
    name: "Forge Cast Iron Skillet",
    slug: "forge-cast-iron-skillet",
    description: "Pre-seasoned 12-inch skillet for any stovetop.",
    price: 4599,
    stock: 22,
    categorySlug: "home-kitchen",
  },
  {
    name: "Lumen LED Desk Lamp",
    slug: "lumen-led-desk-lamp",
    description: "Adjustable lamp with warm-to-cool dimming.",
    price: 3999,
    stock: 0,
    categorySlug: "home-kitchen",
  },
];

function imageFor(slug: string): string[] {
  return [`https://picsum.photos/seed/${slug}/600/600`];
}

async function seed() {
  console.log("Seeding categories...");
  await db
    .insert(categories)
    .values(categorySeed)
    .onConflictDoNothing({ target: categories.slug });

  // Re-read to map slug -> id (robust whether rows were just inserted or already existed).
  const existingCategories = await db.select().from(categories);
  const categoryIdBySlug = new Map(
    existingCategories.map((c) => [c.slug, c.id]),
  );

  console.log("Seeding products...");
  const productValues = productSeed.map((p) => ({
    name: p.name,
    slug: p.slug,
    description: p.description,
    price: p.price,
    stock: p.stock,
    images: imageFor(p.slug),
    categoryId: categoryIdBySlug.get(p.categorySlug) ?? null,
  }));

  await db
    .insert(products)
    .values(productValues)
    .onConflictDoNothing({ target: products.slug });

  const [{ value: productCount }] = await db
    .select({ value: count() })
    .from(products);
  console.log(
    `Seed complete. ${existingCategories.length} categories, ${productCount} products present.`,
  );
}

seed()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("Seed failed:", err);
    process.exit(1);
  });
