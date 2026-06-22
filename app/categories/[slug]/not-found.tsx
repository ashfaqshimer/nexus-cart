import Link from "next/link";

import { Button } from "@/components/ui/button";

export default function CategoryNotFound() {
  return (
    <div className="mx-auto flex max-w-6xl flex-col items-center px-4 py-24 text-center sm:px-6">
      <h1 className="font-heading text-3xl font-semibold tracking-tight sm:text-4xl">
        Category not found
      </h1>
      <p className="mt-3 max-w-md text-muted-foreground">
        We couldn&apos;t find the category you were looking for. It may have
        been removed or the link is incorrect.
      </p>
      <Button
        render={<Link href="/categories">Browse all categories</Link>}
        nativeButton={false}
        className="mt-8"
      />
    </div>
  );
}
