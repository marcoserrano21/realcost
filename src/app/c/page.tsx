import { Suspense } from "react";
import type { Metadata } from "next";
import CompareClient from "./CompareClient";
import BounceLoader from "@/components/BounceLoader";
import { compareOgCopy } from "@/lib/compareOg";

const og = compareOgCopy();

export const metadata: Metadata = {
  title: og.title,
  description: og.description,
  openGraph: {
    title: og.title,
    description: og.description,
    type: "website",
  },
  twitter: {
    card: "summary",
    title: og.title,
    description: og.description,
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
