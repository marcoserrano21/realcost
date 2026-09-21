"use client";

import type { ReactNode } from "react";

/** Soft entrance for route shells. Honors data-reduce-motion. */
export default function PageEnter({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={`page-enter ${className}`.trim()}>{children}</div>;
}
