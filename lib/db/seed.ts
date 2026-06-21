import "dotenv/config";

import { count } from "drizzle-orm";

import { db } from "./index";
import { categories, products } from "./schema";

const categorySeed = [
  {
    name: "Balloons",
    slug: "balloons",
    description: "Latex, foil, and balloon garlands for every celebration.",
  },
  {
    name: "Banners & Backdrops",
    slug: "banners-backdrops",
    description: "Banners, bunting, and photo backdrops.",
  },
  {
    name: "Tableware",
    slug: "tableware",
    description: "Plates, cups, napkins, and table covers.",
  },
  {
    name: "Party Favors & Confetti",
    slug: "favors-confetti",
    description: "Favors, confetti, and finishing touches.",
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
    name: "Rose Gold Balloon Garland Kit",
    slug: "rose-gold-balloon-garland-kit",
    description:
      "120-piece DIY arch kit in blush, rose gold, and ivory with tape strip.",
    price: 3499,
    stock: 35,
    categorySlug: "balloons",
  },
  {
    name: "Metallic Foil Number Balloons (0–9)",
    slug: "metallic-foil-number-balloons",
    description: "40-inch self-sealing foil numbers for milestone birthdays.",
    price: 1299,
    stock: 60,
    categorySlug: "balloons",
  },
  {
    name: "Helium Latex Balloons (50-pack)",
    slug: "helium-latex-balloons-50-pack",
    description: "Assorted-color 12-inch latex balloons for helium or air.",
    price: 999,
    stock: 0,
    categorySlug: "balloons",
  },
  {
    name: "Happy Birthday Foil Banner",
    slug: "happy-birthday-foil-banner",
    description: "Shiny gold cursive lettering that strings up in seconds.",
    price: 899,
    stock: 80,
    categorySlug: "banners-backdrops",
  },
  {
    name: "Shimmer Fringe Photo Backdrop",
    slug: "shimmer-fringe-photo-backdrop",
    description: "6ft metallic tinsel curtain for photo booths and walls.",
    price: 1999,
    stock: 28,
    categorySlug: "banners-backdrops",
  },
  {
    name: "Floral Paper Bunting",
    slug: "floral-paper-bunting",
    description: "15ft pastel floral garland for showers and brunches.",
    price: 799,
    stock: 44,
    categorySlug: "banners-backdrops",
  },
  {
    name: "Gold Dot Paper Plate Set (24)",
    slug: "gold-dot-paper-plate-set",
    description: "Sturdy coated party plates with metallic gold polka dots.",
    price: 1499,
    stock: 50,
    categorySlug: "tableware",
  },
  {
    name: "Striped Party Cups & Napkins Bundle",
    slug: "striped-party-cups-napkins-bundle",
    description: "Coordinated 9oz cups and luncheon napkins, serves 16.",
    price: 1199,
    stock: 38,
    categorySlug: "tableware",
  },
  {
    name: "Biodegradable Confetti Poppers (6)",
    slug: "biodegradable-confetti-poppers",
    description: "Eco-friendly push poppers bursting with tissue confetti.",
    price: 1699,
    stock: 0,
    categorySlug: "favors-confetti",
  },
  {
    name: "Treat Favor Boxes with Ribbon (12)",
    slug: "treat-favor-boxes-with-ribbon",
    description: "Kraft favor boxes with satin ribbon and thank-you tags.",
    price: 1399,
    stock: 65,
    categorySlug: "favors-confetti",
  },
];

function imageFor(slug: string): string[] {
  return [`https://picsum.photos/seed/${slug}/600/600`];
}

async function seed() {
  // Clear existing rows so re-seeding yields a clean catalog (delete products
  // first; products.categoryId is "on delete set null").
  console.log("Clearing existing catalog...");
  await db.delete(products);
  await db.delete(categories);

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
