import { formatHours, formatMoney } from "./calc";
import { type ShareCardFormat, canvasSizeForFormat } from "./shareFormats";
import { sharePosterContent } from "./sharePosterContent";

export type ShareImageInput = {
  price: number;
  hours: number;
  label?: string;
  format?: ShareCardFormat;
  /** Skipped “hours kept” card. Hours only, never the dollars skipped. */
  variant?: "standard" | "hoursKept";
};

type SharePosterPalette = {
  bgStops: [string, string, string];
  sheenStops: [string, string, string];
  border: string;
  brand: string;
  price: string;
  hours: string;
  meta: string;
  tagline: string;
  cta: string;
  rule: string;
};

const DARK_PALETTE: SharePosterPalette = {
  bgStops: ["#0c0c14", "#0a1224", "#1a1420"],
  sheenStops: ["rgba(122,162,255,0.22)", "rgba(0,0,0,0)", "rgba(212,180,131,0.16)"],
  border: "rgba(212,180,131,0.35)",
  brand: "#d4b483",
  price: "#a8a8b8",
  hours: "#f4f4f7",
  meta: "#78788a",
  tagline: "#f4f4f7",
  cta: "#7aa2ff",
  rule: "#d4b483",
};

const LIGHT_PALETTE: SharePosterPalette = {
  bgStops: ["#ffffff", "#f7f5f0", "#eef1f8"],
  sheenStops: ["rgba(47,93,232,0.10)", "rgba(0,0,0,0)", "rgba(138,102,53,0.12)"],
  border: "rgba(138,102,53,0.28)",
  brand: "#8a6635",
  price: "#3f4658",
  hours: "#12131a",
  meta: "#5b6478",
  tagline: "#12131a",
  cta: "#2f5de8",
  rule: "#8a6635",
};

function resolveSharePalette(): SharePosterPalette {
  if (typeof document !== "undefined" && document.documentElement.classList.contains("light")) {
    return LIGHT_PALETTE;
  }
  return DARK_PALETTE;
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  const radius = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + w, y, x + w, y + h, radius);
  ctx.arcTo(x + w, y + h, x, y + h, radius);
  ctx.arcTo(x, y + h, x, y, radius);
  ctx.arcTo(x, y, x + w, y, radius);
  ctx.closePath();
}

/** Spread vertical positions for 9:16 story canvas (1080×1920). */
function storyY(base: number, height: number): number {
  const extra = height - 1350;
  if (extra <= 0) return base;
  if (base <= 600) return base + extra * 0.12;
  if (base <= 720) return base + extra * 0.32;
  return base + extra * 0.52;
}

/** Paint a RealCost share poster to a canvas (no third-party deps). */
export function paintSharePoster(input: ShareImageInput): HTMLCanvasElement {
  const format: ShareCardFormat = input.format ?? "poster45";
  const { width, height } = canvasSizeForFormat(format);
  const isStory = format === "story916";
  const y = (base: number) => (isStory ? storyY(base, height) : base);
  const content = sharePosterContent(input, { formatMoney, formatHours });

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) return canvas;

  const palette = resolveSharePalette();

  const bg = ctx.createLinearGradient(0, 0, width, height);
  bg.addColorStop(0, palette.bgStops[0]);
  bg.addColorStop(0.45, palette.bgStops[1]);
  bg.addColorStop(1, palette.bgStops[2]);
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, width, height);

  const sheen = ctx.createLinearGradient(0, 0, width, height * 0.6);
  sheen.addColorStop(0, palette.sheenStops[0]);
  sheen.addColorStop(0.5, palette.sheenStops[1]);
  sheen.addColorStop(1, palette.sheenStops[2]);
  ctx.fillStyle = sheen;
  ctx.fillRect(0, 0, width, height);

  roundRect(ctx, 48, 48, width - 96, height - 96, 64);
  ctx.strokeStyle = palette.border;
  ctx.lineWidth = 3;
  ctx.stroke();

  ctx.fillStyle = palette.brand;
  ctx.font = "700 36px Outfit, system-ui, sans-serif";
  ctx.letterSpacing = "0.16em";
  ctx.fillText("REALCOST", 96, y(160));

  const hoursKept = input.variant === "hoursKept";

  if (hoursKept && content.hoursLine) {
    ctx.fillStyle = palette.hours;
    ctx.font = "650 160px Outfit, system-ui, sans-serif";
    ctx.fillText(content.hoursLine, 96, y(520));

    ctx.fillStyle = palette.meta;
    ctx.font = "500 40px Outfit, system-ui, sans-serif";
    ctx.fillText(content.caption ?? "", 96, y(590));

    ctx.fillStyle = palette.rule;
    roundRect(ctx, 96, y(680), 72, 6, 3);
    ctx.fill();

    ctx.fillStyle = palette.tagline;
    ctx.font = "550 52px Outfit, system-ui, sans-serif";
    ctx.fillText(content.tagline[0] ?? "", 96, y(980));

    ctx.fillStyle = palette.cta;
    ctx.font = "650 40px Outfit, system-ui, sans-serif";
    ctx.fillText(content.cta, 96, y(1160));
    return canvas;
  }

  ctx.fillStyle = palette.hours;
  ctx.font = "650 120px Outfit, system-ui, sans-serif";
  ctx.fillText(content.priceLine ?? "", 96, y(520));

  ctx.fillStyle = palette.rule;
  roundRect(ctx, 96, y(680), 72, 6, 3);
  ctx.fill();

  ctx.fillStyle = palette.tagline;
  ctx.font = "550 52px Outfit, system-ui, sans-serif";
  ctx.fillText(content.tagline[0] ?? "", 96, y(980));
  ctx.fillText(content.tagline[1] ?? "", 96, y(1050));

  ctx.fillStyle = palette.cta;
  ctx.font = "650 40px Outfit, system-ui, sans-serif";
  ctx.fillText(content.cta, 96, y(1160));

  return canvas;
}

export async function downloadShareImage(input: ShareImageInput, filename = "realcost.png") {
  const canvas = paintSharePoster(input);
  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/png"));
  if (!blob) return false;

  const file = new File([blob], filename, { type: "image/png" });
  if (navigator.canShare?.({ files: [file] })) {
    try {
      await navigator.share({
        files: [file],
        title: "RealCost",
        text: "Same dollars. Different life.",
      });
      return true;
    } catch {
      // fall through to download
    }
  }

  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
  return true;
}
