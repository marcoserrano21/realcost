import Link from "next/link";
import type { ReactNode } from "react";
import ScrollToTopButton from "@/components/ScrollToTopButton";

export default function LegalShell({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <main className="screen-shell pt-10">
      <article className="legal-doc w-full max-w-lg">
        <Link href="/settings" className="link-action legal-back pressable">
          <span className="legal-back-arrow" aria-hidden="true">
            ←
          </span>
          <span>Back to Settings</span>
        </Link>
        <h1 className="brand-wordmark text-xl" style={{ marginTop: 12 }}>
          {title}
        </h1>
        <div className="legal-body">{children}</div>
        <div className="legal-scroll-top-wrap">
          <ScrollToTopButton />
        </div>
      </article>
    </main>
  );
}
