"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { getUnits } from "@/lib/storage";
import { HomeIcon, FeedIcon, HistoryIcon, SettingsIcon } from "@/components/icons";

const TABS = [
  { href: "/", label: "Home", Icon: HomeIcon },
  { href: "/feed", label: "Shared", Icon: FeedIcon },
  { href: "/history", label: "History", Icon: HistoryIcon },
  { href: "/settings", label: "Settings", Icon: SettingsIcon },
];

export default function TabBar() {
  const pathname = usePathname();
  const [onboarded, setOnboarded] = useState(false);

  useEffect(() => {
    const check = () => setOnboarded(getUnits() !== null);
    check();
    window.addEventListener("realcost:units-updated", check);
    return () => window.removeEventListener("realcost:units-updated", check);
  }, [pathname]);

  if (!onboarded || pathname?.startsWith("/c") || pathname?.startsWith("/legal")) return null;

  return (
    <nav className="tab-bar" aria-label="Primary">
      {TABS.map(({ href, label, Icon }) => {
        const active = pathname === href;
        return (
          <Link
            key={href}
            href={href}
            className={`tab-item pressable${active ? " tab-item-active" : ""}`}
            aria-current={active ? "page" : undefined}
          >
            <Icon className="tab-icon" />
            <span>{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
