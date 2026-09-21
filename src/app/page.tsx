"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { computeRealCost, formatHours, formatMoney } from "@/lib/calc";
import type { Units, RealCostResult } from "@/lib/calc";
import {
  addComparisonEntry,
  addLogEntry,
  getName,
  getPersonalization,
  getUnits,
  getWeekSummary,
  hasSeenWelcome,
  markWelcomeSeen,
  setUnits,
  DEFAULT_PERSONALIZATION,
} from "@/lib/storage";
import type { Choice, Personalization, PurchaseCategory } from "@/lib/storage";
import { getDecisionCopy } from "@/lib/copy";
import { encodeComparison, newShareId, shareText } from "@/lib/sharing";
import { getSharePrivacy } from "@/lib/sharePrivacy";
import { shareLink } from "@/lib/nativeShare";
import { track } from "@/lib/analytics";
import { triggerHaptic } from "@/lib/haptics";
import { getPausedStreak } from "@/lib/streaks";
import type { PausedStreak } from "@/lib/streaks";
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
import { PURCHASE_CATEGORY_OPTIONS } from "@/lib/personalizationOptions";
import { markA2HSPeak } from "@/lib/storage";
import { isMeaningfulHoursKept } from "@/lib/a2hsGate";

const CLEAR_FADE_MS = 720;
const STACK_VISIBLE_DELAY_MS = 280;

function revealStyle(index: number): CSSProperties {
  return { ["--reveal-i" as string]: index };
}

export default function Home() {
  const [units, setUnitsState] = useState<Units | null | undefined>(undefined);
  const [price, setPrice] = useState("");
  const [lockedChoice, setLockedChoice] = useState<Choice | null>(null);
  const [copied, setCopied] = useState(false);
  const [name, setNameState] = useState("");
  const [streak, setStreak] = useState<PausedStreak>(() => getPausedStreak());
  const [personalization, setPersonalizationState] = useState<Personalization>(DEFAULT_PERSONALIZATION);
  const [activeDecision, setActiveDecision] = useState<{
    choice: Choice;
    hours: number;
    price: number;
  } | null>(null);
  const [category, setCategory] = useState<PurchaseCategory | null>(null);
  const [customCategory, setCustomCategory] = useState("");
  const [showWelcome, setShowWelcome] = useState(false);
  const [cardEntered, setCardEntered] = useState(false);
  const [stackVisible, setStackVisible] = useState(false);
  const [resultsVisible, setResultsVisible] = useState(false);
  const [resultsLeaving, setResultsLeaving] = useState(false);
  const held = useRef<{ price: number; result: RealCostResult } | null>(null);

  useEffect(() => {
    setUnitsState(getUnits());
    setNameState(getName());
    setStreak(getPausedStreak());
    setPersonalizationState(getPersonalization() ?? DEFAULT_PERSONALIZATION);
    if (getUnits() && !hasSeenWelcome()) {
      setShowWelcome(true);
    }
  }, []);

  const priceNum = parseFloat(price);
  const hasPrice = priceNum > 0;
  const liveResult = units && hasPrice ? computeRealCost(priceNum, units) : null;

  useEffect(() => {
    if (hasPrice && liveResult) {
      held.current = { price: priceNum, result: liveResult };
      setResultsLeaving(false);
      setResultsVisible(true);
      if (!cardEntered) {
        const reduced =
          typeof document !== "undefined" &&
          document.documentElement.getAttribute("data-reduce-motion") === "true";
        const openId = requestAnimationFrame(() => setCardEntered(true));
        const visibleTimer = window.setTimeout(() => {
          setStackVisible(true);
          triggerHaptic([8, 30, 12]);
        }, reduced ? 0 : STACK_VISIBLE_DELAY_MS);
        return () => {
          cancelAnimationFrame(openId);
          window.clearTimeout(visibleTimer);
        };
      }
      if (!stackVisible) setStackVisible(true);
      return;
    }

    if (!hasPrice && resultsVisible) {
      setResultsLeaving(true);
      setCardEntered(false);
      setStackVisible(false);
      const timer = window.setTimeout(() => {
        setResultsVisible(false);
        setResultsLeaving(false);
        held.current = null;
      }, CLEAR_FADE_MS);
      return () => window.clearTimeout(timer);
    }
  }, [hasPrice, liveResult, priceNum, cardEntered, stackVisible, resultsVisible]);

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
            setUnitsState(u);
            setNameState(getName());
            setPersonalizationState(getPersonalization() ?? DEFAULT_PERSONALIZATION);
            window.dispatchEvent(new Event("realcost:units-updated"));
            setShowWelcome(true);
          }}
        />
      </main>
    );
  }

  const displayPrice = hasPrice ? priceNum : held.current?.price ?? 0;
  const displayResult = hasPrice && liveResult ? liveResult : held.current?.result ?? null;
  const slotOpen = cardEntered && !resultsLeaving && Boolean(displayResult);

  const categoryLabel =
    category === "others"
      ? customCategory.trim() || "Other"
      : PURCHASE_CATEGORY_OPTIONS.find((option) => option.value === category)?.label;
  const decisionCommitted = lockedChoice !== null;
  const dinnerLabel = units.dinnerLabel?.trim() || "dinner";

  const handleChoice = (c: Choice) => {
    if (!liveResult || !hasPrice || decisionCommitted) return;
    addLogEntry({
      price: priceNum,
      hours: liveResult.hours,
      choice: c,
      timestamp: Date.now(),
      category: category ?? undefined,
      categoryLabel: categoryLabel,
    });
    setLockedChoice(c);
    setStreak(getPausedStreak());
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

  const handleShare = async (asChallenge = false) => {
    if (!liveResult || !hasPrice) return;
    const privacy = asChallenge ? "exact" : getSharePrivacy();
    const shareId = newShareId();
    track("share_started", { privacy, challenge: asChallenge });
    const shareUrl = encodeComparison(
      window.location.origin,
      { price: priceNum, hours: liveResult.hours },
      { privacy, shareId }
    );

    addComparisonEntry({
      price: priceNum,
      hours: liveResult.hours,
      role: "sent",
      shareId,
      timestamp: Date.now(),
    });

    const text = shareText(formatMoney(priceNum), {
      hoursLabel: formatHours(liveResult.hours),
      privacy,
    });

    const result = await shareLink({
      title: asChallenge ? "Same price. What does it cost you?" : "What does this actually cost you?",
      text,
      url: shareUrl,
    });
    if (result === "shared") {
      track("share_completed", { method: "native", privacy, challenge: asChallenge });
      triggerHaptic([10, 40, 14]);
      markA2HSPeak("share");
      return;
    }
    if (result === "copied") {
      setCopied(true);
      track("share_completed", { method: "clipboard", privacy, challenge: asChallenge });
      triggerHaptic([10, 40, 14]);
      markA2HSPeak("share");
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const dismissWelcome = () => {
    markWelcomeSeen();
    setShowWelcome(false);
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
                }${decisionCommitted ? " is-decided" : ""}`}
              >
                <div className="home-reveal-item" style={revealStyle(0)}>
                  <ResultCard
                    price={displayPrice}
                    result={displayResult}
                    label={name || undefined}
                    categoryLabel={categoryLabel}
                    dinnerLabel={dinnerLabel}
                    animateEnter={false}
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
                            onClick={() => handleChoice(c)}
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
                    <ShareCard price={displayPrice} hours={displayResult.hours} label={name || undefined} />
                  </div>
                </div>

                <div className="home-reveal-item" style={revealStyle(4)}>
                  <div className="flex flex-col gap-2 w-full">
                    <button
                      type="button"
                      onClick={() => void handleShare(false)}
                      className="primary-action pressable w-full"
                      disabled={resultsLeaving || !hasPrice}
                    >
                      {copied ? "Link copied" : "Send this price"}
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
