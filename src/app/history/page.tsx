"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { formatHours, formatLifeSpan, formatMoney } from "@/lib/calc";
import { updateLogChoice, updateLogCategory, deleteLogEntry } from "@/lib/storage";
import type { Choice, LogEntry, PurchaseCategory } from "@/lib/storage";
import { getHistoryEmptyCopy } from "@/lib/copy";
import { CHOICE_ICONS, TrashIcon, TagIcon } from "@/components/icons";
import { PURCHASE_CATEGORY_OPTIONS } from "@/lib/personalizationOptions";
import PageEnter from "@/components/PageEnter";
import ScreenHeader from "@/components/ScreenHeader";
import TappableExpandCard from "@/components/TappableExpandCard";
import CategoryHeatMap from "@/components/CategoryHeatMap";
import ConfirmDialog from "@/components/ConfirmDialog";
import CompactSelect from "@/components/CompactSelect";
import BounceLoader from "@/components/BounceLoader";
import { track } from "@/lib/analytics";
import { sumHistory } from "@/lib/historyTotals";
import { type CategoryHeatMetric } from "@/lib/categoryHeat";
import { useCategoryHeat, useDecisionLog, usePersonalization, useUnits } from "@/lib/useLocalData";

const DECISION_FILTERS: { value: Choice | "all"; label: string }[] = [
  { value: "all", label: "All" },
  { value: "bought", label: "Bought" },
  { value: "thinking", label: "Thinking" },
  { value: "skipped", label: "Skipped" },
];

const EDIT_CHOICES: { value: Choice; label: string }[] = [
  { value: "bought", label: "Bought" },
  { value: "thinking", label: "Thinking" },
  { value: "skipped", label: "Skipped" },
];

const PAGE_SIZE = 10;

type SortMode = "recent" | "oldest" | "amount_high" | "amount_low" | "hours_high" | "hours_low";
type DateRange = "all" | "7d" | "30d" | "90d" | "year";

const SORT_OPTIONS: { value: SortMode; label: string }[] = [
  { value: "recent", label: "Recent" },
  { value: "oldest", label: "Oldest" },
  { value: "amount_high", label: "Highest $" },
  { value: "amount_low", label: "Lowest $" },
  { value: "hours_high", label: "Most hours" },
  { value: "hours_low", label: "Least hours" },
];

const DATE_OPTIONS: { value: DateRange; label: string }[] = [
  { value: "all", label: "Any time" },
  { value: "7d", label: "7 days" },
  { value: "30d", label: "30 days" },
  { value: "90d", label: "90 days" },
  { value: "year", label: "This year" },
];

function formatDate(timestamp: number): string {
  return new Date(timestamp).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

function choiceLabel(choice: Choice): string {
  if (choice === "bought") return "Bought it";
  if (choice === "thinking") return "Still thinking";
  return "Skipped it";
}

function inDateRange(timestamp: number, range: DateRange): boolean {
  if (range === "all") return true;
  const now = Date.now();
  if (range === "year") {
    return new Date(timestamp).getFullYear() === new Date(now).getFullYear();
  }
  const days = range === "7d" ? 7 : range === "30d" ? 30 : 90;
  return timestamp >= now - days * 24 * 60 * 60 * 1000;
}

function sortEntries(entries: LogEntry[], sort: SortMode): LogEntry[] {
  const next = [...entries];
  switch (sort) {
    case "oldest":
      return next.sort((a, b) => a.timestamp - b.timestamp);
    case "amount_high":
      return next.sort((a, b) => b.price - a.price || b.timestamp - a.timestamp);
    case "amount_low":
      return next.sort((a, b) => a.price - b.price || b.timestamp - a.timestamp);
    case "hours_high":
      return next.sort((a, b) => b.hours - a.hours || b.timestamp - a.timestamp);
    case "hours_low":
      return next.sort((a, b) => a.hours - b.hours || b.timestamp - a.timestamp);
    case "recent":
    default:
      return next.sort((a, b) => b.timestamp - a.timestamp);
  }
}

export default function HistoryPage() {
  const units = useUnits();
  const log = useDecisionLog();
  const tone = usePersonalization().tone;
  const [decisionFilter, setDecisionFilter] = useState<Choice | "all">("all");
  const [categoryFilter, setCategoryFilter] = useState<PurchaseCategory | "all">("all");
  const [sort, setSort] = useState<SortMode>("recent");
  const [dateRange, setDateRange] = useState<DateRange>("all");
  const filterKey = `${decisionFilter}|${categoryFilter}|${sort}|${dateRange}`;
  const [paging, setPaging] = useState({ key: filterKey, page: 0 });
  const page = paging.key === filterKey ? paging.page : 0;
  const setPage = (update: number | ((current: number) => number)) => {
    setPaging((prev) => {
      const current = prev.key === filterKey ? prev.page : 0;
      const next = typeof update === "function" ? update(current) : update;
      return { key: filterKey, page: next };
    });
  };
  const [heatMetric, setHeatMetric] = useState<CategoryHeatMetric>("kept");
  const heat = useCategoryHeat(heatMetric);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [categoryPanelId, setCategoryPanelId] = useState<string | null>(null);
  const [customCategory, setCustomCategory] = useState("");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<LogEntry | null>(null);

  const filtered = useMemo(() => {
    const base = log
      .filter((entry) => decisionFilter === "all" || entry.choice === decisionFilter)
      .filter((entry) => categoryFilter === "all" || entry.category === categoryFilter)
      .filter((entry) => inDateRange(entry.timestamp, dateRange));
    return sortEntries(base, sort);
  }, [log, decisionFilter, categoryFilter, sort, dateRange]);

  const sessionTotal = useMemo(() => sumHistory(filtered), [filtered]);
  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, pageCount - 1);
  const pageItems = filtered.slice(safePage * PAGE_SIZE, safePage * PAGE_SIZE + PAGE_SIZE);

  const decisionSummary = DECISION_FILTERS.find((o) => o.value === decisionFilter)?.label ?? "All";
  const categorySummary =
    categoryFilter === "all"
      ? "Any category"
      : PURCHASE_CATEGORY_OPTIONS.find((o) => o.value === categoryFilter)?.label ?? "Category";
  const sortSummary = SORT_OPTIONS.find((o) => o.value === sort)?.label ?? "Recent";
  const filterSummary = `${decisionSummary} · ${categorySummary} · ${sortSummary}`;

  const handleUpdateChoice = (id: string, choice: Choice) => {
    updateLogChoice(id, choice);
    track("decision_updated", { choice });
    setEditingId(null);
    setCategoryPanelId(null);
  };

  const openCategoryPanel = (entry: LogEntry) => {
    if (categoryPanelId === entry.id) {
      setCategoryPanelId(null);
      return;
    }
    setCategoryPanelId(entry.id);
    setCustomCategory(entry.category === "others" ? entry.categoryLabel ?? "" : "");
  };

  const handleUpdateCategory = (
    id: string,
    category: PurchaseCategory | null,
    labelOverride?: string
  ) => {
    if (category === null) {
      updateLogCategory(id, null);
      track("category_selected", { category: "cleared", source: "history" });
      setCategoryPanelId(null);
      setCustomCategory("");
      return;
    }
    if (category === "others") {
      const label = (labelOverride ?? customCategory).trim() || "Others";
      updateLogCategory(id, "others", label);
      track("category_selected", { category: "others", source: "history" });
      return;
    }
    const label = PURCHASE_CATEGORY_OPTIONS.find((o) => o.value === category)?.label;
    updateLogCategory(id, category, label);
    track("category_selected", { category, source: "history" });
    setCategoryPanelId(null);
    setCustomCategory("");
  };

  const handleSaveCustomCategory = (id: string) => {
    updateLogCategory(id, "others", customCategory.trim() || "Others");
    track("category_selected", { category: "others", source: "history" });
    setCategoryPanelId(null);
  };

  const confirmDeleteEntry = () => {
    if (!pendingDelete) return;
    deleteLogEntry(pendingDelete.id);
    track("decision_deleted", { choice: pendingDelete.choice });
    setPendingDelete(null);
    setEditingId(null);
    setCategoryPanelId(null);
  };

  if (units === undefined) {
    return (
      <main className="screen-shell">
        <BounceLoader label="Loading History" />
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

  return (
    <main className="screen-shell">
      <PageEnter className="w-full max-w-sm flex flex-col gap-4 items-center">
        <ScreenHeader title="History" />

        {sessionTotal.count > 0 ? (
          <div className="history-session-total w-full" aria-live="polite">
            <span className="history-session-label">Session total</span>
            <strong className="tabular-nums">{formatMoney(sessionTotal.price)}</strong>
            <span className="text-xs text-[var(--subtle)] tabular-nums">
              {(() => {
                const gloss = formatLifeSpan(sessionTotal.hours);
                return `${formatHours(sessionTotal.hours)}${gloss ? ` · ${gloss}` : ""} · ${sessionTotal.count} decision${
                  sessionTotal.count === 1 ? "" : "s"
                }`;
              })()}
            </span>
          </div>
        ) : null}

        <CategoryHeatMap rows={heat} metric={heatMetric} onMetricChange={setHeatMetric} />

        <div className={`history-filter-card${filtersOpen ? " is-open" : ""}`}>
          <button
            type="button"
            className="history-filter-trigger pressable"
            aria-expanded={filtersOpen}
            onClick={() => setFiltersOpen((v) => !v)}
          >
            <span>
              <strong>Filters & sort</strong>
              <small>{filterSummary}</small>
            </span>
            <span className={`settings-chevron${filtersOpen ? " is-open" : ""}`} aria-hidden="true">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none">
                <path
                  d="M6 9l6 6 6-6"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
          </button>

          <div className={`history-filter-panel${filtersOpen ? " is-open" : ""}`}>
            <div className="history-filter-inner">
              <div className="history-filter-block">
                <span className="field-label">Decision</span>
                <div className="chip-grid chip-grid-compact" role="group" aria-label="Filter by decision">
                  {DECISION_FILTERS.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      className={`chip chip-compact pressable${decisionFilter === option.value ? " chip-selected" : ""}`}
                      aria-pressed={decisionFilter === option.value}
                      onClick={() => setDecisionFilter(option.value)}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="history-filter-block">
                <span className="field-label">Category</span>
                <div className="chip-grid chip-grid-compact" role="group" aria-label="Filter by category">
                  <button
                    type="button"
                    className={`chip chip-compact pressable${categoryFilter === "all" ? " chip-selected" : ""}`}
                    aria-pressed={categoryFilter === "all"}
                    onClick={() => setCategoryFilter("all")}
                  >
                    Any
                  </button>
                  {PURCHASE_CATEGORY_OPTIONS.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      className={`chip chip-compact pressable${categoryFilter === option.value ? " chip-selected" : ""}`}
                      aria-pressed={categoryFilter === option.value}
                      onClick={() => setCategoryFilter(option.value)}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="history-filter-grid">
                <CompactSelect
                  id="history-sort"
                  label="Sort"
                  value={sort}
                  options={SORT_OPTIONS}
                  onChange={setSort}
                />
                <CompactSelect
                  id="history-date"
                  label="Date"
                  value={dateRange}
                  options={DATE_OPTIONS}
                  onChange={setDateRange}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="w-full flex flex-col gap-3">
          {pageItems.length === 0 ? (
            <p className="text-sm text-[var(--muted)] surface-card text-center">{getHistoryEmptyCopy(tone)}</p>
          ) : (
            pageItems.map((entry, index) => {
              const Icon = CHOICE_ICONS[entry.choice];
              const isEditing = editingId === entry.id;
              return (
                <TappableExpandCard
                  key={entry.id}
                  open={isEditing}
                  onToggle={() => {
                    if (isEditing) {
                      setEditingId(null);
                      setCategoryPanelId(null);
                      return;
                    }
                    setEditingId(entry.id);
                    setCategoryPanelId(null);
                    setCustomCategory(entry.category === "others" ? entry.categoryLabel ?? "" : "");
                  }}
                  ariaLabel={`${formatMoney(entry.price)}, ${choiceLabel(entry.choice)}. Tap to change decision.`}
                  className="history-item history-item-tappable"
                  style={{ animationDelay: `${Math.min(index, 8) * 45}ms` }}
                >
                  <div className={`history-icon history-icon-${entry.choice}`} aria-hidden="true">
                    <Icon />
                  </div>
                  <div className="history-item-body">
                    <div className="feed-item-row">
                      <span className="text-[var(--foreground)] font-medium tabular-nums">{formatMoney(entry.price)}</span>
                      <span className="text-xs text-[var(--subtle)]">{formatDate(entry.timestamp)}</span>
                    </div>
                    <p className="text-sm text-[var(--muted)]">
                      {formatHours(entry.hours)} of work · {choiceLabel(entry.choice)}
                    </p>
                    {entry.categoryLabel || entry.category ? (
                      <p className="text-xs text-[var(--champagne)] mt-1">
                        {entry.categoryLabel ??
                          PURCHASE_CATEGORY_OPTIONS.find((o) => o.value === entry.category)?.label}
                      </p>
                    ) : null}

                    <div
                      className={`history-edit-panel${isEditing ? " is-open" : ""}`}
                      onClick={(e) => e.stopPropagation()}
                      onKeyDown={(e) => e.stopPropagation()}
                    >
                      <div className="history-edit-inner" role="group" aria-label="Update decision">
                        <div className="history-edit-choices">
                          {EDIT_CHOICES.map((option, chipIndex) => (
                            <button
                              key={option.value}
                              type="button"
                              className={`chip chip-compact pressable edit-stagger${entry.choice === option.value ? " chip-selected" : ""}`}
                              style={{ ["--stagger-i" as string]: chipIndex }}
                              aria-pressed={entry.choice === option.value}
                              onClick={() => handleUpdateChoice(entry.id, option.value)}
                            >
                              {option.label}
                            </button>
                          ))}
                        </div>

                        {categoryPanelId === entry.id ? (
                          <div
                            className="history-category-panel edit-stagger"
                            style={{ ["--stagger-i" as string]: EDIT_CHOICES.length }}
                          >
                            <span className="field-label" id={`history-cat-${entry.id}`}>
                              Category
                            </span>
                            <div
                              className="chip-grid chip-grid-compact"
                              role="group"
                              aria-labelledby={`history-cat-${entry.id}`}
                            >
                              {PURCHASE_CATEGORY_OPTIONS.map((option) => {
                                const selected = entry.category === option.value;
                                return (
                                  <button
                                    key={option.value}
                                    type="button"
                                    className={`chip chip-compact pressable${selected ? " chip-selected" : ""}`}
                                    aria-pressed={selected}
                                    onClick={() => {
                                      if (selected) {
                                        handleUpdateCategory(entry.id, null);
                                        return;
                                      }
                                      if (option.value === "others") {
                                        const nextLabel = entry.categoryLabel ?? "";
                                        setCustomCategory(nextLabel);
                                        handleUpdateCategory(entry.id, "others", nextLabel || "Others");
                                        return;
                                      }
                                      handleUpdateCategory(entry.id, option.value);
                                    }}
                                  >
                                    {option.label}
                                  </button>
                                );
                              })}
                            </div>
                            {entry.category === "others" ? (
                              <div className="flex flex-col gap-2">
                                <input
                                  className="text-field text-field-compact"
                                  placeholder="Describe it"
                                  value={customCategory}
                                  onChange={(e) => setCustomCategory(e.target.value)}
                                  aria-label="Custom category"
                                  maxLength={48}
                                  onClick={(e) => e.stopPropagation()}
                                />
                                <button
                                  type="button"
                                  className="secondary-action pressable"
                                  onClick={() => handleSaveCustomCategory(entry.id)}
                                >
                                  Save category
                                </button>
                              </div>
                            ) : null}
                          </div>
                        ) : null}

                        <div
                          className="history-row-actions edit-stagger"
                          style={{
                            ["--stagger-i" as string]:
                              categoryPanelId === entry.id ? EDIT_CHOICES.length + 1 : EDIT_CHOICES.length,
                          }}
                        >
                          <button
                            type="button"
                            className={`history-recategorize-icon pressable${
                              categoryPanelId === entry.id ? " is-active" : ""
                            }`}
                            aria-label="Change category"
                            aria-pressed={categoryPanelId === entry.id}
                            title="Category"
                            onClick={() => openCategoryPanel(entry)}
                          >
                            <TagIcon />
                          </button>
                          <button
                            type="button"
                            className="history-delete-icon pressable"
                            aria-label="Delete this decision"
                            title="Delete"
                            onClick={() => setPendingDelete(entry)}
                          >
                            <TrashIcon />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </TappableExpandCard>
              );
            })
          )}
        </div>

        {filtered.length > 0 && pageCount > 1 && (
          <div className="history-pagination" role="navigation" aria-label="History pages">
            <button
              type="button"
              className="secondary-action pressable"
              disabled={safePage <= 0}
              onClick={() => setPage((p) => Math.max(0, p - 1))}
            >
              Prev
            </button>
            <span className="text-xs text-[var(--subtle)] tabular-nums">
              {safePage + 1} / {pageCount} · {filtered.length} total
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
        )}
      </PageEnter>
      <ConfirmDialog
        open={pendingDelete != null}
        title="Delete this decision?"
        body={
          pendingDelete
            ? `Remove ${formatMoney(pendingDelete.price)} · ${choiceLabel(pendingDelete.choice)} from ${formatDate(pendingDelete.timestamp)}. This can’t be undone.`
            : "This can’t be undone."
        }
        confirmLabel="Delete"
        onConfirm={confirmDeleteEntry}
        onCancel={() => setPendingDelete(null)}
      />
    </main>
  );
}
