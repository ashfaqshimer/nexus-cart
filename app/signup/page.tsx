import type { Metadata } from "next";
import Link from "next/link";

import { SignupForm } from "@/components/auth/signup-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Create account",
  robots: { index: false, follow: false },
};

export default function SignupPage() {
  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md items-center px-4 py-10 sm:px-6">
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-lg">Create account</CardTitle>
          <CardDescription>Create a NexusCart account.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <SignupForm />
          <p className="text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-medium text-foreground underline"
            >
              Sign in
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
