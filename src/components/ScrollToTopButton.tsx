"use client";

/** Smooth ease-out scroll to top (works even when CSS scroll-behavior is forced auto). */
export default function ScrollToTopButton({ label = "Back to top" }: { label?: string }) {
  const scrollSmooth = () => {
    const reduce =
      typeof document !== "undefined" &&
      document.documentElement.getAttribute("data-reduce-motion") === "true";

    if (reduce) {
      window.scrollTo(0, 0);
      return;
    }

    const start = window.scrollY || document.documentElement.scrollTop;
    if (start <= 0) return;

    const duration = Math.min(900, Math.max(420, start * 0.45));
    const t0 = performance.now();

    const tick = (now: number) => {
      const t = Math.min(1, (now - t0) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      window.scrollTo(0, start * (1 - eased));
      if (t < 1) requestAnimationFrame(tick);
    };

    requestAnimationFrame(tick);
  };

  return (
    <button type="button" className="secondary-action pressable legal-scroll-top" onClick={scrollSmooth}>
      {label}
    </button>
  );
}
