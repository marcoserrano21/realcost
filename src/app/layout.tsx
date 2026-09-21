import type { Metadata, Viewport } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";
import TabBar from "@/components/TabBar";
import { PreferencesProvider } from "@/components/PreferencesProvider";
import { cn } from "@/lib/utils";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap",
});

export const metadata: Metadata = {
  title: "RealCost: what does this actually cost you?",
  description:
    "Turn any price into hours of your life, then ask: what does it cost someone else? No accounts, no bank link, nothing leaves your device.",
  openGraph: {
    title: "RealCost: what does this actually cost you?",
    description: "Same dollars. Different life.",
    type: "website",
  },
};

/** Required for iOS home-indicator safe-area insets on the floating tab bar. */
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#07070b" },
    { media: "(prefers-color-scheme: light)", color: "#f4f4f7" },
  ],
};

const preferenceBootScript = `
(function(){
  try {
    var theme = localStorage.getItem('realcost:theme') || 'system';
    var motion = localStorage.getItem('realcost:motion') || 'system';
    var light = theme === 'light' || (theme !== 'dark' && window.matchMedia('(prefers-color-scheme: light)').matches);
    var dark = !light;
    document.documentElement.classList.toggle('light', light);
    document.documentElement.classList.toggle('dark', dark);
    document.documentElement.style.colorScheme = light ? 'light' : 'dark';
    var reduced = motion === 'reduced' || (motion !== 'full' && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
    document.documentElement.setAttribute('data-reduce-motion', reduced ? 'true' : 'false');
  } catch (e) {}
})();
`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={cn("h-full antialiased dark", outfit.variable)} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: preferenceBootScript }} />
      </head>
      <body className="min-h-full flex flex-col font-sans" style={{ fontFamily: "var(--font-outfit), Outfit, system-ui, sans-serif" }}>
        <PreferencesProvider>
          {children}
          <TabBar />
        </PreferencesProvider>
      </body>
    </html>
  );
}
