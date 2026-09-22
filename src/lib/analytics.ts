/**
 * Privacy-first analytics for the MVP hypothesis funnel.
 * Never send wages, names, or raw financial identifiers.
 *
 * Queue lives in localStorage. When NEXT_PUBLIC_ANALYTICS_ENDPOINT is set,
 * events flush via sendBeacon / fetch keepalive. Otherwise they stay local
 * and the /api/analytics sink accepts posts for future wiring.
 */

export type AnalyticsEvent =
  | "calculation_created"
  | "share_started"
  | "share_completed"
  | "comparison_opened"
  | "comparison_updated"
  | "recipient_calculation_completed"
  | "recipient_shared"
  | "decision_bought"
  | "decision_skipped"
  | "decision_thinking"
  | "decision_updated"
  | "decision_deleted"
  | "onboarding_completed"
  | "category_selected"
  | "share_image_started"
  | "share_image_completed"
  | "share_video_started"
  | "share_video_completed"
  | "reaction_sent"
  | "reaction_received"
  | "a2hs_prompt_shown"
  | "a2hs_dismissed"
  | "a2hs_choice";

type EventProps = Record<string, string | number | boolean | undefined>;

type QueueItem = { event: AnalyticsEvent; props?: EventProps; t: number };

const QUEUE_KEY = "realcost:analytics_queue";

function readQueue(): QueueItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(QUEUE_KEY);
    return raw ? (JSON.parse(raw) as QueueItem[]) : [];
  } catch {
    return [];
  }
}

function writeQueue(items: QueueItem[]) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(QUEUE_KEY, JSON.stringify(items.slice(-200)));
  } catch {
    // private mode / quota: ignore
  }
}

function sanitizeProps(props?: EventProps): EventProps | undefined {
  if (!props) return undefined;
  return Object.fromEntries(
    Object.entries(props).filter(([key]) => !/wage|rate|email|name/i.test(key))
  );
}

function endpoint(): string | null {
  const configured = process.env.NEXT_PUBLIC_ANALYTICS_ENDPOINT?.trim();
  if (configured) return configured;
  return "/api/analytics";
}

function flushQueue() {
  if (typeof window === "undefined") return;
  const queue = readQueue();
  if (queue.length === 0) return;

  const url = endpoint();
  if (!url) return;

  const body = JSON.stringify({ events: queue });
  let sent = false;

  try {
    if (navigator.sendBeacon) {
      sent = navigator.sendBeacon(url, new Blob([body], { type: "application/json" }));
    }
  } catch {
    sent = false;
  }

  if (sent) {
    writeQueue([]);
    return;
  }

  void fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body,
    keepalive: true,
  })
    .then((res) => {
      if (res.ok) writeQueue([]);
    })
    .catch(() => {
      // keep queue for retry
    });
}

export function track(event: AnalyticsEvent, props?: EventProps) {
  if (typeof window === "undefined") return;

  const payload: QueueItem = {
    event,
    props: sanitizeProps(props),
    t: Date.now(),
  };

  const queue = readQueue();
  queue.push(payload);
  writeQueue(queue);

  if (process.env.NODE_ENV !== "production") {
    // eslint-disable-next-line no-console
    console.info("[realcost:analytics]", payload.event, payload.props ?? {});
  }

  window.dispatchEvent(new CustomEvent("realcost:analytics", { detail: payload }));

  // Debounced flush: microtask batching keeps typing snappy.
  queueMicrotask(flushQueue);
}
