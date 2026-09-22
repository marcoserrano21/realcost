"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import {
  benchmarkHoursForPrice,
  computeRealCost,
  formatHours,
  formatMoney,
  US_MEDIAN_HOURLY_WAGE,
} from "@/lib/calc";
import { clampWage } from "@/lib/limits";
import {
  addComparisonEntry,
  applyShareReaction,
  getPersonalization,
  setUnits,
  setName,
  DEFAULT_PERSONALIZATION,
} from "@/lib/storage";
import { getCompareIntroCopy, getCompareRevealCopy } from "@/lib/copy";
import { decodeComparison, encodeComparison, shareText } from "@/lib/sharing";
import { getSharePrivacy } from "@/lib/sharePrivacy";
import { track } from "@/lib/analytics";
import { sanitizeDecimalInput } from "@/lib/numericInput";
import { triggerHaptic } from "@/lib/haptics";
import HoursOdometer from "@/components/HoursOdometer";
import LifeSpanGloss from "@/components/LifeSpanGloss";
import ShareCard from "@/components/ShareCard";
import PageEnter from "@/components/PageEnter";

export default function CompareClient() {
  const params = useSearchParams();
  const decoded = decodeComparison(params);
  const price = decoded?.price ?? 0;
  const theirHours = decoded?.hours;
  const shareId = decoded?.shareId;
  const isReply = Boolean(decoded?.isReply);
  const hasPeerHours = typeof theirHours === "number" && theirHours > 0 && !isReply;
  const [wage, setWage] = useState("");
  const [myName, setMyName] = useState("");
  const [revealed, setRevealed] = useState(false);
  const [copied, setCopied] = useState(false);
  const [reacted, setReacted] = useState(false);
  const [reactionBanner, setReactionBanner] = useState<string | null>(null);
  const [tone, setTone] = useState(DEFAULT_PERSONALIZATION.tone);
  const [showCard, setShowCard] = useState(false);

  useEffect(() => {
    setTone((getPersonalization() ?? DEFAULT_PERSONALIZATION).tone);
    if (price > 0 && !isReply) track("comparison_opened", { has_peer_hours: hasPeerHours });
    if (typeof window !== "undefined" && window.location.search.includes("n=")) {
      const clean = new URL(window.location.href);
      clean.searchParams.delete("n");
      window.history.replaceState({}, "", clean.pathname + clean.search);
    }
  }, [price, hasPeerHours, isReply]);

  useEffect(() => {
    if (!isReply || !shareId) return;
    const updated = applyShareReaction(shareId, theirHours);
    if (updated) {
      track("reaction_received", { has_hours: Boolean(theirHours) });
      setReactionBanner(
        theirHours
          ? `Friend reacted: ${formatHours(theirHours)} for ${formatMoney(price)}.`
          : "Friend opened your RealCost."
      );
    } else {
      setReactionBanner("Reaction noted on this device when the original share exists here.");
    }
  }, [isReply, shareId, theirHours, price]);

  const wageNum = parseFloat(wage);
  const canReveal = wageNum > 0 && price > 0;
  const myResult = canReveal
    ? computeRealCost(price, { hourlyWage: wageNum, shiftHours: 8, dinnerCost: 25 })
    : null;

  useEffect(() => {
    if (!revealed || !(wageNum > 0)) return;
    const safeWage = clampWage(wageNum);
    if (!(safeWage > 0)) return;
    setUnits({ hourlyWage: safeWage, shiftHours: 8, dinnerCost: 25 });
    window.dispatchEvent(new Event("realcost:units-updated"));
  }, [revealed, wageNum]);

  const onWageChange = (raw: string) => setWage(sanitizeDecimalInput(raw));

  const handleReveal = () => {
    if (!myResult) return;
    const safeWage = clampWage(wageNum);
    if (!(safeWage > 0)) return;
    setUnits({ hourlyWage: safeWage, shiftHours: 8, dinnerCost: 25 });
    if (myName) setName(myName);
    addComparisonEntry({
      price,
      hours: myResult.hours,
      role: "received",
      peerHours: hasPeerHours ? theirHours : undefined,
      myRate: safeWage,
      shareId,
      timestamp: Date.now(),
    });
    track("recipient_calculation_completed", { has_peer_hours: hasPeerHours });
    triggerHaptic([8, 30, 12]);
    setRevealed(true);
  };

  const handleReact = async () => {
    if (!myResult || !shareId) return;
    const shareUrl = encodeComparison(
      window.location.origin,
      { price, hours: myResult.hours },
      { shareId, isReply: true }
    );
    const text = shareText(formatMoney(price), {
      hoursLabel: formatHours(myResult.hours),
      isReply: true,
    });
    track("reaction_sent");
    if (navigator.share) {
      try {
        await navigator.share({ title: "I saw your RealCost", text, url: shareUrl });
        setReacted(true);
        triggerHaptic([10, 40, 14]);
        return;
      } catch {
        // fall through
      }
    }
    await navigator.clipboard.writeText(shareUrl);
    setReacted(true);
    setCopied(true);
    triggerHaptic([10, 40, 14]);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShareMine = async () => {
    if (!myResult) return;
    const privacy = getSharePrivacy();
    track("share_started", { source: "recipient", privacy });
    const shareUrl = encodeComparison(
      window.location.origin,
      { price, hours: myResult.hours },
      { privacy }
    );
    const text = shareText(formatMoney(price), {
      hoursLabel: formatHours(myResult.hours),
      privacy,
    });

    if (navigator.share) {
      try {
        await navigator.share({
          title: "Same price. What does it cost you?",
          text,
          url: shareUrl,
        });
        track("recipient_shared", { method: "native", privacy });
        triggerHaptic([10, 40, 14]);
        return;
      } catch {
        // fall through
      }
    }
    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    track("recipient_shared", { method: "clipboard", privacy });
    triggerHaptic([10, 40, 14]);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!decoded) {
    return (
      <main className="screen-shell screen-shell-center">
        <p className="text-[var(--subtle)] text-sm text-center max-w-xs">
          This link looks broken. Ask them to resend it.
        </p>
      </main>
    );
  }

  if (isReply) {
    return (
      <main className="screen-shell screen-shell-center">
        <PageEnter className="w-full max-w-sm flex flex-col items-center gap-4 text-center">
          <h1 className="brand-wordmark text-xl">Reaction received</h1>
          <p className="text-[var(--muted)] text-sm">{reactionBanner ?? "Updating your Shared list…"}</p>
          <Link href="/feed" className="primary-action pressable w-full">
            Open Shared
          </Link>
          <Link href="/" className="link-action">
            Back to Home
          </Link>
        </PageEnter>
      </main>
    );
  }

  return (
    <main className="screen-shell screen-shell-center gap-6">
      <PageEnter className="w-full max-w-sm flex flex-col items-center gap-6 compare-ritual">
        <div className="flex flex-col items-center gap-2 text-center max-w-sm">
          <p className="compare-ritual-price tabular-nums">{formatMoney(price)}</p>
          <p className="text-[var(--muted)] text-sm">
            {hasPeerHours ? (
              <>
                A friend said <span className="tabular-nums font-medium">{formatHours(theirHours)}</span>. What does it cost you?
              </>
            ) : (
              <>What does this cost in hours of your life?</>
            )}
          </p>
          {!revealed ? (
            <>
              <p className="text-[var(--subtle)] text-xs tabular-nums">
                At the US median hourly wage (~${US_MEDIAN_HOURLY_WAGE}/hr), this is{" "}
                <span className="font-medium text-[var(--muted)]">
                  {formatHours(benchmarkHoursForPrice(price))}
                </span>
                .
              </p>
              <p className="text-[var(--subtle)] text-xs">{getCompareIntroCopy(tone)}</p>
            </>
          ) : null}
        </div>

        {!revealed ? (
          <div className="flex flex-col gap-3 w-full max-w-sm">
            <div className="money-field">
              <span aria-hidden="true">$</span>
              <input
                autoFocus
                inputMode="decimal"
                placeholder="your hourly take-home"
                aria-label="Your hourly take-home rate"
                value={wage}
                onChange={(e) => onWageChange(e.target.value)}
              />
              <span>/ hr</span>
            </div>
            <p className="text-[var(--subtle)] text-xs text-center" style={{ margin: 0 }}>
              Enter your rate to personalize. Wage stays on this device — never in the link.
            </p>
            <button type="button" disabled={!canReveal} onClick={handleReveal} className="primary-action pressable w-full">
              See my hours
            </button>
          </div>
        ) : (
          myResult && (
            <>
              <div className="compare-ritual-reveal w-full flex flex-col items-center gap-3">
                <HoursOdometer hours={myResult.hours} />
                <LifeSpanGloss hours={myResult.hours} />
                {hasPeerHours ? (
                  <p className="text-[var(--muted)] text-sm text-center">
                    Them: <span className="tabular-nums">{formatHours(theirHours)}</span>
                  </p>
                ) : null}
                <p className="text-[var(--muted)] text-sm text-center max-w-xs">{getCompareRevealCopy(tone)}</p>
              </div>

              {shareId ? (
                <button type="button" onClick={() => void handleReact()} className="primary-action pressable w-full">
                  {reacted ? (copied ? "Reaction link copied" : "Reaction sent") : "React with my hours"}
                </button>
              ) : (
                <button type="button" onClick={() => void handleShareMine()} className="primary-action pressable w-full">
                  {copied ? "Link copied" : "Send this back"}
                </button>
              )}

              {shareId ? (
                <button type="button" onClick={() => void handleShareMine()} className="link-action">
                  {copied && !reacted ? "Link copied" : "Or share a new challenge"}
                </button>
              ) : null}

              <button type="button" className="link-action" onClick={() => setShowCard((v) => !v)}>
                {showCard ? "Hide card" : "Save dual card"}
              </button>

              {showCard ? (
                <div className="share-motion share-motion-enter w-full">
                  <ShareCard
                    price={price}
                    hours={myResult.hours}
                    label={myName || undefined}
                    compareHours={hasPeerHours ? theirHours : undefined}
                    compareLabel={hasPeerHours ? "Them" : undefined}
                  />
                </div>
              ) : null}

              <details className="w-full text-sm text-[var(--muted)]">
                <summary className="cursor-pointer">Adjust rate or name</summary>
                <div className="flex flex-col gap-2 mt-2">
                  <div className="money-field money-field-compact">
                    <span aria-hidden="true">$</span>
                    <input
                      inputMode="decimal"
                      aria-label="Edit your hourly take-home rate"
                      value={wage}
                      onChange={(e) => onWageChange(e.target.value)}
                    />
                    <span>/ hr</span>
                  </div>
                  <input
                    placeholder="Your name (optional, on-device)"
                    value={myName}
                    onChange={(e) => setMyName(e.target.value)}
                    className="caption-field"
                  />
                </div>
              </details>

              <Link href="/" className="link-action">
                Try your own price
              </Link>
            </>
          )
        )}
      </PageEnter>
    </main>
  );
}
