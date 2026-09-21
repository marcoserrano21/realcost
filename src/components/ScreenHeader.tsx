import type { ReactNode } from "react";

type ScreenHeaderProps = {
  title: string;
  kicker?: string;
  children?: ReactNode;
};

/** Shared tab title block so Home / Shared / History / Settings align. */
export default function ScreenHeader({ title, kicker, children }: ScreenHeaderProps) {
  return (
    <div className="screen-header">
      <h1 className="brand-wordmark">{title}</h1>
      <div className="screen-header-kicker-slot">
        {kicker ? <p className="page-kicker">{kicker}</p> : null}
        {children}
      </div>
    </div>
  );
}
