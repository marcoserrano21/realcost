"use client";

import { useEffect, useMemo, useState, Fragment } from "react";
import Link from "next/link";
import { formatHours, formatMoney } from "@/lib/calc";
import type { Units } from "@/lib/calc";
import {
  deleteComparisonEntry,
  getComparisonLog,
  getPersonalization,
  getUnits,
  updateComparisonEntry,
  DEFAULT_PERSONALIZATION,
} from "@/lib/storage";
import type { ComparisonEntry } from "@/lib/storage";
import { getFeedEmptyCopy } from "@/lib/copy";
import { encodeComparison, shareText } from "@/lib/sharing";
import { shareLink } from "@/lib/nativeShare";
import { track } from "@/lib/analytics";
import PageEnter from "@/components/PageEnter";
import ScreenHeader from "@/components/ScreenHeader";
import TappableExpandCard from "@/components/TappableExpandCard";
import ConfirmDialog from "@/components/ConfirmDialog";
import BounceLoader from "@/components/BounceLoader";
import { TrashIcon } from "@/components/icons";

const HONESTY_KEY = "realcost:reaction_honesty_seen";
const PAGE_SIZE = 10;

type SharedSectionKey = "waiting" | "seen" | "received";

const SECTION_META: Record<SharedSectionKey, { title: string; emptyHint?: string }> = {
  waiting: { title: "Challenge pending", emptyHint: "Nothing waiting. Challenge a friend from Home." },
  seen: { title: "Seen / replied", emptyHint: "No replies yet." },
  received: { title: "Received" },
};

function relativeTime(timestamp: number): string {
  const diffMs = Date.now() - timestamp;
  const minutes = Math.round(diffMs / 60000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  return `${days}d ago`;
}

function SharedCard({
  entry,
  index,
  isEditing,
  editNote,
  onToggle,
  onEditNote,
  onSave,
  onReshare,
  onDelete,
}: {
  entry: ComparisonEntry;
  index: number;
  isEditing: boolean;
  editNote: string;
  onToggle: () => void;
  onEditNote: (value: string) => void;
  onSave: () => void;
  onReshare: () => void;
  onDelete: () => void;
}) {
  const peerLabel =
    entry.peerName && entry.peerName !== "They" ? entry.peerName : null;

  return (
    <TappableExpandCard
      open={isEditing}
      onToggle={onToggle}
      ariaLabel={`${formatMoney(entry.price)} share. Tap to add a note.`}
      className="feed-item feed-item-tappable feed-item-compact"
      style={{ animationDelay: `${Math.min(index, 8) * 55}ms` }}
    >
      <div className="feed-item-row">
        <span className={`role-badge role-badge-${entry.role}`}>
          {entry.role === "sent" ? "Sent" : "Received"}
        </span>
        <span className="text-xs text-[var(--subtle)]">{relativeTime(entry.timestamp)}</span>
      </div>
      {entry.role === "sent" && entry.seenAt ? (
        <p className="text-xs text-[var(--success)] mt-1">
          Seen
          {entry.peerHours != null ? ` · they said ${formatHours(entry.peerHours)}` : ""}
          {peerLabel ? ` · ${peerLabel}` : ""}
        </p>
      ) : entry.role === "sent" ? (
        <p className="text-xs text-[var(--action)] mt-1">
          Challenge pending{peerLabel ? ` · ${peerLabel}` : ""}
        </p>
      ) : peerLabel ? (
        <p className="text-xs text-[var(--muted)] mt-1">From {peerLabel}</p>
      ) : null}
      <div className="feed-item-row">
        <span className="text-[var(--foreground)] font-medium tabular-nums money-clip">
          {formatMoney(entry.price)}
        </span>
        <span className="text-[var(--muted)] text-sm tabular-nums hours-clip">
          {formatHours(entry.hours)} of work
        </span>
      </div>
      {entry.role === "received" && entry.myRate != null && entry.myRate > 0 ? (
        <p className="text-xs text-[var(--champagne)] mt-1 tabular-nums">
          You entered {formatMoney(entry.myRate)}/hr
        </p>
      ) : null}
      {entry.note ? <p className="text-xs text-[var(--champagne)] mt-1">{entry.note}</p> : null}
      {entry.role === "received" && entry.peerHours !== undefined && (
        <p className="text-xs text-[var(--subtle)] mt-1">
          {peerLabel
            ? `${peerLabel} said ${formatHours(entry.peerHours)}. You said ${formatHours(entry.hours)}.`
            : `They said ${formatHours(entry.peerHours)}. You said ${formatHours(entry.hours)}.`}
        </p>
      )}
      <div
        className={`history-edit-panel${isEditing ? " is-open" : ""}`}
        onClick={(e) => e.stopPropagation()}
        onKeyDown={(e) => e.stopPropagation()}
      >
        <div className="history-edit-inner feed-edit-panel feed-edit-panel-compact">
          {entry.role === "received" && entry.myRate != null && entry.myRate > 0 ? (
            <div className="edit-stagger" style={{ ["--stagger-i" as string]: 0 }}>
              <p className="settings-inline-note" style={{ margin: 0 }}>
                Your rate on this device:{" "}
                <span className="tabular-nums text-[var(--champagne)]">{formatMoney(entry.myRate)}/hr</span>
                . Never shared in links.
              </p>
            </div>
          ) : null}
          <div
            className="edit-stagger"
            style={{
              ["--stagger-i" as string]:
                entry.role === "received" && entry.myRate != null && entry.myRate > 0 ? 1 : 0,
            }}
          >
            <label className="field-label" htmlFor={`edit-note-${entry.id}`}>
              Note <span style={{ color: "var(--subtle)", fontWeight: 400 }}>(optional)</span>
            </label>
            <input
              id={`edit-note-${entry.id}`}
              className="text-field text-field-compact"
              placeholder="e.g. weekend trip"
              value={editNote}
              onChange={(e) => onEditNote(e.target.value)}
              maxLength={80}
            />
          </div>
          <div
            className="edit-stagger feed-edit-actions feed-edit-actions-icons"
            style={{
              ["--stagger-i" as string]:
                entry.role === "received" && entry.myRate != null && entry.myRate > 0 ? 2 : 1,
            }}
          >
            <button type="button" className="primary-action pressable" onClick={onSave}>
              Save
            </button>
            <button type="button" className="secondary-action pressable" onClick={onReshare}>
              Reshare
            </button>
            <button
              type="button"
              className="history-delete-icon pressable"
              aria-label="Delete this share"
              title="Delete"
              onClick={onDelete}
            >
              <TrashIcon />
            </button>
          </div>
        </div>
      </div>
    </TappableExpandCard>
  );
}

export default function FeedPage() {
  const [units, setUnits] = useState<Units | null | undefined>(undefined);
  const [copied, setCopied] = useState(false);
  const [tone, setTone] = useState(DEFAULT_PERSONALIZATION.tone);
  const [log, setLog] = useState<ComparisonEntry[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editNote, setEditNote] = useState("");
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const [showHonesty, setShowHonesty] = useState(false);
  const [page, setPage] = useState(0);

  const refresh = () => setLog(getComparisonLog());

  useEffect(() => {
    setUnits(getUnits());
    setTone((getPersonalization() ?? DEFAULT_PERSONALIZATION).tone);
    refresh();
    if (typeof window !== "undefined") {
      setShowHonesty(window.localStorage.getItem(HONESTY_KEY) !== "1");
    }
  }, []);

  useEffect(() => {
    setPage(0);
  }, [log.length]);

  const dismissHonesty = () => {
    window.localStorage.setItem(HONESTY_KEY, "1");
    setShowHonesty(false);
  };

  const sorted = useMemo(() => [...log].sort((a, b) => b.timestamp - a.timestamp), [log]);
  const waiting = useMemo(
    () => sorted.filter((e) => e.role === "sent" && !e.seenAt),
    [sorted]
  );
  const seen = useMemo(
    () => sorted.filter((e) => e.role === "sent" && Boolean(e.seenAt)),
    [sorted]
  );
  const received = useMemo(() => sorted.filter((e) => e.role === "received"), [sorted]);

  const flat = useMemo(
    () => [
      ...waiting.map((entry) => ({ section: "waiting" as const, entry })),
      ...seen.map((entry) => ({ section: "seen" as const, entry })),
      ...received.map((entry) => ({ section: "received" as const, entry })),
    ],
    [waiting, seen, received]
  );

  const pageCount = Math.max(1, Math.ceil(flat.length / PAGE_SIZE));
  const safePage = Math.min(page, pageCount - 1);

  const pageSections = useMemo(() => {
    const pageItems = flat.slice(safePage * PAGE_SIZE, safePage * PAGE_SIZE + PAGE_SIZE);
    const groups: { key: SharedSectionKey; entries: ComparisonEntry[] }[] = [];
    for (const item of pageItems) {
      const last = groups[groups.length - 1];
      if (last && last.key === item.section) {
        last.entries.push(item.entry);
      } else {
        groups.push({ key: item.section, entries: [item.entry] });
      }
    }
    return groups;
  }, [flat, safePage]);

  if (units === undefined) {
    return (
      <main className="screen-shell">
        <BounceLoader label="Loading Shared" />
      </main>
    );
  }

  if (units === null) {
    return (
      <main className="screen-shell screen-shell-center text-center">
        <p className="text-[var(--muted)] text-sm max-w-xs">
          Finish setting up RealCost first.{" "}
          <Link href="/" className="link-action">
            Go to Home
          </Link>
        </p>
      </main>
    );
  }

  const openEdit = (entry: ComparisonEntry) => {
    if (editingId === entry.id) {
      setEditingId(null);
      return;
    }
    setEditingId(entry.id);
    setEditNote(entry.note ?? "");
  };

  const handleSaveEdit = (entry: ComparisonEntry) => {
    updateComparisonEntry(entry.id, {
      note: editNote.trim() || undefined,
    });
    track("comparison_updated", { role: entry.role });
    setEditingId(null);
    refresh();
  };

  const confirmDelete = () => {
    if (!pendingDeleteId) return;
    deleteComparisonEntry(pendingDeleteId);
    setPendingDeleteId(null);
    setEditingId(null);
    refresh();
  };

  const handleReshare = async (entry: ComparisonEntry) => {
    const shareUrl = encodeComparison(
      window.location.origin,
      { price: entry.price },
      { shareId: entry.shareId }
    );
    const text = shareText(formatMoney(entry.price));
    const result = await shareLink({
      title: "What does this actually cost you?",
      text,
      url: shareUrl,
    });
    if (result === "copied") {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const renderSection = (
    sectionKey: SharedSectionKey,
    entries: ComparisonEntry[],
    options?: { showEmpty?: boolean; countOverride?: number }
  ) => {
    const meta = SECTION_META[sectionKey];
    const showEmpty = Boolean(options?.showEmpty && entries.length === 0 && meta.emptyHint);
    const count = options?.countOverride ?? entries.length;
    return (
      <div className="shared-section w-full flex flex-col gap-3">
        <div className="feed-item-row">
          <h2 className="field-label" style={{ margin: 0 }}>
            {meta.title}
          </h2>
          {count > 0 ? (
            <span className="text-xs text-[var(--subtle)] tabular-nums">{count}</span>
          ) : null}
        </div>
        {showEmpty ? (
          <p className="text-xs text-[var(--subtle)] shared-section-empty">{meta.emptyHint}</p>
        ) : (
          entries.map((entry, index) => (
            <SharedCard
              key={entry.id}
              entry={entry}
              index={index}
              isEditing={editingId === entry.id}
              editNote={editNote}
              onToggle={() => openEdit(entry)}
              onEditNote={setEditNote}
              onSave={() => handleSaveEdit(entry)}
              onReshare={() => void handleReshare(entry)}
              onDelete={() => setPendingDeleteId(entry.id)}
            />
          ))
        )}
      </div>
    );
  };

  return (
    <main className="screen-shell">
      <PageEnter className="w-full max-w-sm flex flex-col gap-5 items-center">
        <ScreenHeader title="Shared" kicker="Prices you sent. Replies that land back here.">
          {copied ? <p className="text-xs text-[var(--success)]">Link copied</p> : null}
        </ScreenHeader>

        {showHonesty ? (
          <div className="shared-honesty surface-card w-full">
            <p>
              Reactions update on this device when you open their reply link. They are not synced to
              a server.
            </p>
            <button type="button" className="link-action" onClick={dismissHonesty}>
              Got it
            </button>
          </div>
        ) : null}

        {sorted.length === 0 ? (
          <div className="w-full flex flex-col gap-3">
            <p className="text-sm text-[var(--muted)] surface-card text-center">{getFeedEmptyCopy(tone)}</p>
            <Link href="/" className="primary-action pressable w-full text-center">
              Send a price from Home
            </Link>
          </div>
        ) : (
          <>
            {safePage === 0 && waiting.length === 0 ? (
              <Fragment key="waiting-empty">
                {renderSection("waiting", [], { showEmpty: true, countOverride: 0 })}
              </Fragment>
            ) : null}
            {safePage === 0 && seen.length === 0 ? (
              <Fragment key="seen-empty">
                {renderSection("seen", [], { showEmpty: true, countOverride: 0 })}
              </Fragment>
            ) : null}
            {pageSections.map((group) => (
              <Fragment key={group.key}>
                {renderSection(group.key, group.entries, {
                  countOverride:
                    group.key === "waiting"
                      ? waiting.length
                      : group.key === "seen"
                        ? seen.length
                        : received.length,
                })}
              </Fragment>
            ))}
            {flat.length > 0 && pageCount > 1 ? (
              <div className="history-pagination" role="navigation" aria-label="Shared pages">
                <button
                  type="button"
                  className="secondary-action pressable"
                  disabled={safePage <= 0}
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
                >
                  Prev
                </button>
                <span className="text-xs text-[var(--subtle)] tabular-nums">
                  {safePage + 1} / {pageCount} · {flat.length} total
                </span>
                <button
                  type="button"
                  className="secondary-action pressable"
                  disabled={safePage >= pageCount - 1}
                  onClick={() => setPage((p) => Math.min(pageCount - 1, p + 1))}
                >
                  Next
                </button>
              </div>
            ) : null}
          </>
        )}
      </PageEnter>
      <ConfirmDialog
        open={pendingDeleteId != null}
        title="Delete this share?"
        body="This removes the share from this device. You can’t undo it."
        confirmLabel="Delete"
        onConfirm={confirmDelete}
        onCancel={() => setPendingDeleteId(null)}
      />
    </main>
  );
}
