import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

/**
 * Privacy-safe analytics sink.
 * Accepts batched events, strips anything that looks like PII, and returns 204.
 * Wire this to PostHog/Plausible later; for MVP it validates the client path.
 */
export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const events = Array.isArray((body as { events?: unknown })?.events)
    ? ((body as { events: unknown[] }).events)
    : [];

  // Soft validation only. Never log wages/names.
  const accepted = events.filter((item) => {
    if (!item || typeof item !== "object") return false;
    const event = (item as { event?: unknown }).event;
    return typeof event === "string" && event.length > 0 && event.length < 64;
  });

  if (process.env.NODE_ENV !== "production" && accepted.length > 0) {
    // eslint-disable-next-line no-console
    console.info("[realcost:analytics-sink]", accepted.length, "events");
  }

  return new NextResponse(null, { status: 204 });
}

export function GET() {
  return NextResponse.json({ ok: true, sink: "realcost-analytics" });
}
