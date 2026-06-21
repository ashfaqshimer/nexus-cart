import type { Metadata } from "next";
import { Suspense } from "react";

import { CheckoutForm } from "@/components/checkout/checkout-form";

export const metadata: Metadata = {
  title: "Checkout",
  robots: { index: false, follow: false },
};

export default function CheckoutPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <h1 className="font-heading text-3xl font-semibold tracking-tight">
        Checkout
      </h1>
      <p className="mt-2 text-muted-foreground">
        Enter your details to continue to secure payment.
      </p>

      <div className="mt-8">
        {/* CheckoutForm reads useSearchParams, so it must be in a Suspense boundary. */}
        <Suspense>
          <CheckoutForm />
        </Suspense>
      </div>
    </div>
  );
}
