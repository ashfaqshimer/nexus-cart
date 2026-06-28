"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { LogOut } from "lucide-react";

import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";

export function SignOutButton() {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function handleSignOut() {
    setPending(true);
    await authClient.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      className="w-full justify-start"
      disabled={pending}
      onClick={handleSignOut}
    >
      <LogOut className="size-4" />
      {pending ? "Signing out…" : "Sign out"}
    </Button>
  );
}
