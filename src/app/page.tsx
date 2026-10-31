"use client";

import { useEffect, useRef, useState, type AnimationEvent, type CSSProperties } from "react";
import { computeRealCost, formatMoney } from "@/lib/calc";
import type { RealCostResult } from "@/lib/calc";
import {
  addComparisonEntry,
  addLogEntry,
  getWeekSummary,
  markWelcomeSeen,
  setUnits,
} from "@/lib/storage";
import type { Choice, PurchaseCategory } from "@/lib/storage";
import { getDecisionCopy } from "@/lib/copy";
import { encodeComparison, newShareId, shareText } from "@/lib/sharing";
import { shareLink } from "@/lib/nativeShare";
import { track } from "@/lib/analytics";
import { triggerHaptic } from "@/lib/haptics";
import {
  useDisplayName,
  usePausedStreak,
  usePersonalization,
  useUnits,
  useWelcomeSeen,
} from "@/lib/useLocalData";
import UnitsSetup from "@/components/UnitsSetup";
import ResultCard from "@/components/ResultCard";
import DecisionSheet from "@/components/DecisionSheet";
import CategoryPicker from "@/components/CategoryPicker";
import ShareCard from "@/components/ShareCard";
import WelcomeModal from "@/components/WelcomeModal";
import CashAmountField from "@/components/CashAmountField";
import WeeklyStreak from "@/components/WeeklyStreak";
import InstallPrompt from "@/components/InstallPrompt";
import ScreenHeader from "@/components/ScreenHeader";
import BounceLoader from "@/components/BounceLoader";
import CopyConfirm from "@/components/CopyConfirm";
import { PURCHASE_CATEGORY_OPTIONS } from "@/lib/personalizationOptions";
import { markA2HSPeak } from "@/lib/storage";
import { isMeaningfulHoursKept } from "@/lib/a2hsGate";

const CLEAR_FADE_MS = 180;
const STACK_VISIBLE_DELAY_MS = 60;
const COLLAPSE_FADE_MS = 160;

function motionReduced(): boolean {
  return (
    typeof document !== "undefined" &&
    document.documentElement.getAttribute("data-reduce-motion") === "true"
  );
}

function revealStyle(index: number): CSSProperties {
  return { ["--reveal-i" as string]: index };
}

export default function Home() {
  const units = useUnits();
  const name = useDisplayName();
  const streak = usePausedStreak();
  const personalization = usePersonalization();
  const welcomeSeen = useWelcomeSeen();
  const [price, setPrice] = useState("");
  const [lockedChoice, setLockedChoice] = useState<Choice | null>(null);
  const [copied, setCopied] = useState(false);
  const [activeDecision, setActiveDecision] = useState<{
    choice: Choice;
    hours: number;
    price: number;
  } | null>(null);
  const [category, setCategory] = useState<PurchaseCategory | null>(null);
  const [customCategory, setCustomCategory] = useState("");
  const [cardEntered, setCardEntered] = useState(false);
  const [stackVisible, setStackVisible] = useState(false);
  const [resultsVisible, setResultsVisible] = useState(false);
  const [resultsLeaving, setResultsLeaving] = useState(false);
  const [revealDone, setRevealDone] = useState(false);
  const [collapseToken, setCollapseToken] = useState(0);
  const [collapsedToken, setCollapsedToken] = useState(-1);
  const [held, setHeld] = useState<{ price: number; result: RealCostResult } | null>(null);
  const sendButtonRef = useRef<HTMLButtonElement>(null);

  const priceNum = parseFloat(price);
  const hasPrice = priceNum > 0;
  const liveResult = units && hasPrice ? computeRealCost(priceNum, units) : null;

  useEffect(() => {
    if (hasPrice && liveResult) {
      const snapshot = { price: priceNum, result: liveResult };
      if (!cardEntered) {
        const reduced = motionReduced();
        const openId = requestAnimationFrame(() => {
          setHeld((prev) =>
            prev && prev.price === snapshot.price && prev.result.hours === snapshot.result.hours ? prev : snapshot
          );
          setResultsLeaving(false);
          setResultsVisible(true);
          setCardEntered(true);
        });
        const visibleTimer = window.setTimeout(() => {
          setStackVisible(true);
          if (reduced) setRevealDone(true);
          triggerHaptic([8, 30, 12]);
        }, reduced ? 0 : STACK_VISIBLE_DELAY_MS);
        return () => {
          cancelAnimationFrame(openId);
          window.clearTimeout(visibleTimer);
        };
      }
      const followId = requestAnimationFrame(() => {
        setHeld((prev) =>
          prev && prev.price === snapshot.price && prev.result.hours === snapshot.result.hours ? prev : snapshot
        );
        setResultsLeaving(false);
        setResultsVisible(true);
        if (!stackVisible) setStackVisible(true);
      });
      return () => cancelAnimationFrame(followId);
    }

    if (!hasPrice && resultsVisible) {
      const reduced = motionReduced();
      const leaveId = requestAnimationFrame(() => {
        setResultsLeaving(true);
        setCardEntered(false);
        setStackVisible(false);
        setRevealDone(false);
      });
      const timer = window.setTimeout(() => {
        setResultsVisible(false);
        setResultsLeaving(false);
        setHeld(null);
      }, reduced ? 0 : CLEAR_FADE_MS);
      return () => {
        cancelAnimationFrame(leaveId);
        window.clearTimeout(timer);
      };
    }
  }, [hasPrice, liveResult, priceNum, cardEntered, stackVisible, resultsVisible]);

  const collapsed = lockedChoice !== null && collapseToken === collapsedToken;

  useEffect(() => {
    if (lockedChoice === null) return;
    const token = collapseToken;
    const timer = window.setTimeout(
      () => setCollapsedToken(token),
      motionReduced() ? 0 : COLLAPSE_FADE_MS
    );
    return () => window.clearTimeout(timer);
  }, [lockedChoice, collapseToken]);

  const beginNewPriceSession = () => {
    setLockedChoice(null);
  };

  if (units === undefined) {
    return (
      <main className="screen-shell">
        <BounceLoader label="Loading RealCost" />
      </main>
    );
  }

  if (units === null) {
    return (
      <main className="screen-shell screen-shell-center">
        <UnitsSetup
          onDone={(u) => {
            setUnits(u);
            window.dispatchEvent(new Event("realcost:units-updated"));
          }}
        />
      </main>
    );
  }

  const displayPrice = hasPrice ? priceNum : held?.price ?? 0;
  const displayResult = hasPrice && liveResult ? liveResult : held?.result ?? null;
  const showWelcome = Boolean(units) && !welcomeSeen;
  const slotOpen = cardEntered && !resultsLeaving && Boolean(displayResult);

  const categoryLabel =
    category === "others"
      ? customCategory.trim() || "Other"
      : PURCHASE_CATEGORY_OPTIONS.find((option) => option.value === category)?.label;
  const decisionCommitted = lockedChoice !== null;
  const dinnerLabel = units.dinnerLabel?.trim() || "dinner";

  const handleChoice = (c: Choice, timestamp: number) => {
    if (!liveResult || !hasPrice || decisionCommitted) return;
    addLogEntry({
      price: priceNum,
      hours: liveResult.hours,
      choice: c,
      timestamp,
      category: category ?? undefined,
      categoryLabel: categoryLabel,
    });
    setLockedChoice(c);
    setRevealDone(true);
    setCollapseToken((token) => token + 1);
    setActiveDecision({ choice: c, hours: liveResult.hours, price: priceNum });
    triggerHaptic(10);
    if (c === "skipped" && isMeaningfulHoursKept(liveResult.hours)) {
      markA2HSPeak("skipped");
    }
    track(
      c === "bought" ? "decision_bought" : c === "skipped" ? "decision_skipped" : "decision_thinking",
      { has_category: Boolean(category) }
    );
  };

  const handleShare = async (asChallenge = false, timestamp = Date.now()) => {
    if (!liveResult || !hasPrice) return;
    const shareId = newShareId();
    track("share_started", { challenge: asChallenge });
    const shareUrl = encodeComparison(window.location.origin, { price: priceNum }, { shareId });

    addComparisonEntry({
      price: priceNum,
      hours: liveResult.hours,
      role: "sent",
      shareId,
      timestamp,
    });

    const text = shareText(formatMoney(priceNum), { challenge: asChallenge });

    const result = await shareLink({
      title: asChallenge ? "Same price. What does it cost you?" : "What does this actually cost you?",
      text,
      url: shareUrl,
    });
    if (result === "shared") {
      track("share_completed", { method: "native", challenge: asChallenge });
      triggerHaptic([10, 40, 14]);
      markA2HSPeak("share");
      return;
    }
    if (result === "copied") {
      setCopied(true);
      track("share_completed", { method: "clipboard", challenge: asChallenge });
      triggerHaptic([10, 40, 14]);
      markA2HSPeak("share");
      setTimeout(() => setCopied(false), 1600);
    }
  };

  const dismissWelcome = () => {
    markWelcomeSeen();
  };

  const onPriceChange = (next: string) => {
    const previous = parseFloat(price);
    setPrice(next);
    beginNewPriceSession();
    const parsed = parseFloat(next);
    if (parsed > 0 && !(previous > 0)) track("calculation_created");
  };

  return (
    <main className="screen-shell">
      <div className="home-stage w-full max-w-sm flex flex-col items-center">
        <div className="home-hero flex flex-col items-center gap-6 w-full">
          <WeeklyStreak streak={streak} compactTop />

          <ScreenHeader title="RealCost" kicker="What are you thinking about buying?" />

          <CashAmountField value={price} onChange={onPriceChange} ariaLabel="Price" autoFocus step={1} />
        </div>

        <div
          className={`home-results-slot${slotOpen ? " is-open" : ""}${resultsLeaving ? " is-leaving" : ""}`}
          aria-hidden={!displayResult}
        >
          <div className="home-results-slot-inner">
            {displayResult ? (
              <div
                className={`home-reveal-stack${stackVisible && !resultsLeaving ? " is-visible" : ""}${
                  resultsLeaving ? " is-leaving" : ""
                }${decisionCommitted ? " is-decided" : ""}${revealDone ? " is-revealed" : ""}${
                  collapsed ? " is-collapsed" : ""
                }`}
              >
                <div className="home-reveal-item" style={revealStyle(0)}>
                  <ResultCard
                    price={displayPrice}
                    result={displayResult}
                    label={name || undefined}
                    categoryLabel={categoryLabel}
                    dinnerLabel={dinnerLabel}
                  />
                </div>

                <div className="home-reveal-item" data-collapse="secondary" style={revealStyle(1)}>
                  <CategoryPicker
                    category={category}
                    customLabel={customCategory}
                    onCategoryChange={(value) => {
                      setCategory(value);
                      if (value) track("category_selected", { category: value });
                    }}
                    onCustomLabelChange={setCustomCategory}
                  />
                </div>

                <div className="home-reveal-item" data-collapse="chips" style={revealStyle(2)}>
                  <div className="flex flex-col gap-2 w-full max-w-sm">
                    <div className="flex gap-2 w-full" role="group" aria-label="Log this decision once">
                      {(["bought", "thinking", "skipped"] as const).map((c) => {
                        const isActive = lockedChoice === c;
                        const isLockedOut = decisionCommitted && !isActive;
                        const emphasizeSkipped =
                          c === "skipped" && !decisionCommitted && (displayResult?.hours ?? 0) >= 4;
                        return (
                          <button
                            key={c}
                            type="button"
                            disabled={decisionCommitted || resultsLeaving}
                            aria-pressed={isActive}
                            aria-disabled={decisionCommitted}
                            onClick={() => handleChoice(c, Date.now())}
                            className={`choice-chip choice-chip-${c} pressable${isActive ? " choice-chip-active" : ""}${
                              isLockedOut ? " choice-chip-locked" : ""
                            }${emphasizeSkipped ? " choice-chip-emphasize" : ""}`}
                          >
                            {c === "bought" ? "Bought it" : c === "thinking" ? "Still thinking" : "Skipped it"}
                          </button>
                        );
                      })}
                    </div>
                    {decisionCommitted ? (
                      <p className="text-xs text-[var(--subtle)] text-center" style={{ margin: 0 }}>
                        Saved to History. Tap a card there to change the decision.
                      </p>
                    ) : null}
                  </div>
                </div>

                <div className="home-reveal-item" data-collapse="secondary" style={revealStyle(3)}>
                  <div className="share-motion w-full">
                    <ShareCard price={displayPrice} />
                  </div>
                </div>

                <div
                  className="home-reveal-item"
                  style={revealStyle(4)}
                  onAnimationEnd={(event: AnimationEvent<HTMLDivElement>) => {
                    if (event.target !== event.currentTarget) return;
                    if (event.animationName !== "reveal-rise") return;
                    setRevealDone(true);
                  }}
                >
                  <div className="flex flex-col gap-2 w-full">
                    <button
                      ref={sendButtonRef}
                      type="button"
                      onClick={() => void handleShare(false)}
                      className="primary-action pressable w-full"
                      disabled={resultsLeaving || !hasPrice}
                    >
                      <CopyConfirm label={copied ? "Link copied" : "Send this price"} labels={["Send this price", "Link copied"]} />
                    </button>
                    <button
                      type="button"
                      onClick={() => void handleShare(true)}
                      className="secondary-action pressable w-full"
                      disabled={resultsLeaving || !hasPrice}
                    >
                      Challenge a friend
                    </button>
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>

      {showWelcome && <WelcomeModal name={name} onClose={dismissWelcome} />}

      <InstallPrompt />

      {activeDecision && (
        <DecisionSheet
          choice={activeDecision.choice}
          returnFocusRef={sendButtonRef}
          onClose={() => setActiveDecision(null)}
          secondaryLabel="Send this price"
          onSecondary={() => {
            void handleShare();
          }}
          {...getDecisionCopy(
            activeDecision.choice,
            personalization.tone,
            activeDecision.hours,
            activeDecision.price,
            getWeekSummary().skippedHours
          )}
        />
      )}
    </main>
  );
}
