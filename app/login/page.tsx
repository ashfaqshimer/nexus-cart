import type { Metadata } from "next";
import Link from "next/link";

import { LoginForm } from "@/components/auth/login-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Sign in",
  robots: { index: false, follow: false },
};

export default function LoginPage() {
  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md items-center px-4 py-10 sm:px-6">
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-lg">Sign in</CardTitle>
          <CardDescription>
            Sign in to access the NexusCart admin area.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <LoginForm />
          <p className="text-sm text-muted-foreground">
            Don&apos;t have an account?{" "}
            <Link
              href="/signup"
              className="font-medium text-foreground underline"
            >
              Create one
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
