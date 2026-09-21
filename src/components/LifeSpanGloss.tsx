import { formatLifeSpan } from "@/lib/calc";

/** Muted calendar caption under hour heroes — null under 24h. */
export default function LifeSpanGloss({
  hours,
  className = "",
}: {
  hours: number;
  className?: string;
}) {
  const gloss = formatLifeSpan(hours);
  if (!gloss) return null;
  return <p className={`life-span-gloss${className ? ` ${className}` : ""}`}>{gloss}</p>;
}
