/** Shared stroke-based SVG icons, 24x24 viewBox, no emoji per design system rules. */
import type { Choice } from "@/lib/storage";

type IconProps = { className?: string };

export function BoughtIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <circle cx="12" cy="12" r="9.25" stroke="currentColor" strokeWidth="1.5" />
      <path d="M8 12.5l2.6 2.6L16.5 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function ThinkingIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <circle cx="12" cy="12" r="9.25" stroke="currentColor" strokeWidth="1.5" />
      <path d="M12 7.5v5l3.2 1.9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function SkippedIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <circle cx="12" cy="12" r="9.25" stroke="currentColor" strokeWidth="1.5" />
      <path d="M9.5 8.25v7.5M14.5 8.25v7.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  );
}

export const CHOICE_ICONS: Record<Choice, (props: IconProps) => React.ReactElement> = {
  bought: BoughtIcon,
  thinking: ThinkingIcon,
  skipped: SkippedIcon,
};

export function HomeIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path d="M4.5 11.25 12 4.5l7.5 6.75" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M6.25 9.75V19a.75.75 0 0 0 .75.75h3.25v-4.5a1.75 1.75 0 0 1 3.5 0v4.5H17a.75.75 0 0 0 .75-.75V9.75" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function FeedIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path d="M7 8.5a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" stroke="currentColor" strokeWidth="1.6" />
      <path d="M17 15.5a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" stroke="currentColor" strokeWidth="1.6" />
      <path d="M9.5 6.75h2.75a3 3 0 0 1 3 3V10M14.5 17.25h-2.75a3 3 0 0 1-3-3v-.25" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <path d="m13.5 8 1.75 1.75L13.5 11.5M10.5 16l-1.75-1.75L10.5 12.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function HistoryIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path d="M4.5 12a7.5 7.5 0 1 0 2.4-5.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M4.25 4.75v3.5h3.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M12 8.25V12l2.75 1.65" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function SettingsIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <circle cx="12" cy="12" r="2.75" stroke="currentColor" strokeWidth="1.6" />
      <path
        d="M19.4 13.4a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V19.5a2 2 0 1 1-4 0v-.09a1.65 1.65 0 0 0-1.08-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H4.5a2 2 0 1 1 0-4h.09a1.65 1.65 0 0 0 1.51-1.08 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H10.5a1.65 1.65 0 0 0 1-1.51V4.5a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V10.5a1.65 1.65 0 0 0 1.51 1H19.5a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function TrashIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path d="M5.5 7.5h13" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M9.25 7.5V6.25A1.25 1.25 0 0 1 10.5 5h3a1.25 1.25 0 0 1 1.25 1.25V7.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <path
        d="M8.25 7.5h7.5v10.25a1.5 1.5 0 0 1-1.5 1.5h-4.5a1.5 1.5 0 0 1-1.5-1.5V7.5Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path d="M10.25 10.5v5M13.75 10.5v5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

export function ShareIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <circle cx="6.5" cy="12" r="2.25" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="17.5" cy="6.5" r="2.25" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="17.5" cy="17.5" r="2.25" stroke="currentColor" strokeWidth="1.6" />
      <path d="M8.5 11.1 15.5 7.4M8.5 12.9l7 4.7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

/** Tag / recategorize — stroke only, matches icon system. */
export function TagIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path
        d="M3.75 12.5V5.75A1.5 1.5 0 0 1 5.25 4.25h6.75c.4 0 .78.16 1.06.44l6.5 6.5a1.5 1.5 0 0 1 0 2.12l-5.75 5.75a1.5 1.5 0 0 1-2.12 0l-6.5-6.5a1.5 1.5 0 0 1-.44-1.06Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <circle cx="8.25" cy="8.25" r="1.15" fill="currentColor" />
    </svg>
  );
}

export function FlameIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path
        d="M12 3.5c1.8 2.2 3.1 3.9 3.1 6.2 0 1.1-.3 2-.9 2.7.9-.2 1.8-1 2.3-2.1.4 2.6-.5 5.4-2.9 7.1-1 .7-2.1 1.1-3.6 1.1-3.2 0-5.5-2.4-5.5-5.6 0-2.6 1.4-4.5 3.2-6.4.4 1.6 1.2 2.7 2.3 3.3C10.5 7.8 11.1 5.8 12 3.5Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </svg>
  );
}
