export type ShareCardFormat = "poster45" | "story916" | "dual";

export function canvasSizeForFormat(format: ShareCardFormat): { width: number; height: number } {
  if (format === "story916") return { width: 1080, height: 1920 };
  return { width: 1080, height: 1350 };
}

export function aspectClassForFormat(format: ShareCardFormat): string {
  return `share-card--${format}`;
}
