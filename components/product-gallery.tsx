"use client";

import { useState } from "react";
import Image from "next/image";

import { cn } from "@/lib/utils";

export function ProductGallery({
  images,
  name,
}: {
  images: string[];
  name: string;
}) {
  const [selected, setSelected] = useState(0);
  const activeImage = images[selected];

  return (
    <div className="flex flex-col gap-4">
      <div className="relative aspect-square w-full overflow-hidden rounded-xl bg-muted">
        {activeImage ? (
          <Image
            src={activeImage}
            alt={name}
            fill
            priority
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="object-cover"
          />
        ) : null}
      </div>

      {images.length > 1 ? (
        <div className="grid grid-cols-5 gap-3">
          {images.map((image, index) => (
            <button
              key={image}
              type="button"
              onClick={() => setSelected(index)}
              aria-label={`View image ${index + 1} of ${name}`}
              aria-current={index === selected}
              className={cn(
                "relative aspect-square w-full overflow-hidden rounded-lg bg-muted outline-none ring-offset-background transition-shadow focus-visible:ring-3 focus-visible:ring-ring/50",
                index === selected
                  ? "ring-2 ring-foreground"
                  : "ring-1 ring-border hover:ring-foreground/40",
              )}
            >
              <Image
                src={image}
                alt=""
                fill
                sizes="20vw"
                className="object-cover"
              />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
