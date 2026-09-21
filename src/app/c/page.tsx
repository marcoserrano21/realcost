import { Suspense } from "react";
import type { Metadata } from "next";
import CompareClient from "./CompareClient";
import BounceLoader from "@/components/BounceLoader";

export const metadata: Metadata = {
  title: "Same Price. Different Life. | RealCost",
  description: "See what the same price costs someone else, in hours of their life.",
  openGraph: {
    title: "Same Price. Different Life. | RealCost",
    description: "See what the same price costs someone else.",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Same Price. Different Life. | RealCost",
    description: "See what the same price costs someone else.",
  },
};

export default function ComparePage() {
  return (
    <Suspense
      fallback={
        <main className="screen-shell">
          <BounceLoader label="Loading" />
        </main>
      }
    >
      <CompareClient />
    </Suspense>
  );
}
