import type { Metadata } from "next";
import Link from "next/link";

import { SignOutButton } from "@/components/admin/sign-out-button";
import { buttonVariants } from "@/components/ui/button";
import { requireAdmin } from "@/lib/auth-dal";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: {
    default: "Admin",
    template: "%s | Admin | NexusCart",
  },
  robots: { index: false, follow: false },
};

const navLinks = [
  { href: "/admin/products", label: "Products" },
  { href: "/admin/categories", label: "Categories" },
];

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Authoritative security boundary — the proxy is only an optimistic redirect.
  await requireAdmin();

  return (
    <div className="flex min-h-[calc(100vh-4rem)]">
      <aside className="flex w-56 shrink-0 flex-col gap-6 border-r bg-muted/30 px-4 py-6">
        <Link href="/admin" className="px-2">
          <span className="font-heading text-lg font-semibold tracking-tight">
            Nexus<span className="text-muted-foreground">Cart</span>
          </span>
          <span className="mt-0.5 block text-xs text-muted-foreground">
            Admin
          </span>
        </Link>

        <nav className="flex flex-1 flex-col gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                buttonVariants({ variant: "ghost", size: "sm" }),
                "justify-start",
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <SignOutButton />
      </aside>

      <main className="flex-1 px-6 py-8">{children}</main>
    </div>
  );
}
