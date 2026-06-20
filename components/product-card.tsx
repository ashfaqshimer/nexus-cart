import Image from "next/image";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { formatPrice, type ProductListItem } from "@/lib/queries/products";

export function ProductCard({ product }: { product: ProductListItem }) {
  const outOfStock = product.stock <= 0;
  const image = product.images[0];

  return (
    <Link
      href={`/products/${product.slug}`}
      className="group block rounded-xl outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
    >
      <Card className="h-full pt-0 transition-shadow group-hover:ring-foreground/20">
        <div className="relative aspect-square w-full overflow-hidden bg-muted">
          {image ? (
            <Image
              src={image}
              alt={product.name}
              fill
              sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className="object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : null}
          {outOfStock ? (
            <Badge variant="destructive" className="absolute left-2 top-2">
              Out of stock
            </Badge>
          ) : null}
        </div>
        <CardContent className="flex flex-col gap-1">
          {product.categoryName ? (
            <span className="text-xs text-muted-foreground">
              {product.categoryName}
            </span>
          ) : null}
          <h3 className="font-heading text-sm font-medium leading-snug">
            {product.name}
          </h3>
          <span className="text-sm font-semibold">
            {formatPrice(product.price)}
          </span>
        </CardContent>
      </Card>
    </Link>
  );
}
