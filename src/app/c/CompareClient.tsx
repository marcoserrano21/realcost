"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { computeRealCost, formatHours, formatMoney } from "@/lib/calc";
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
import ResultCard from "@/components/ResultCard";
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
        return;
      } catch {
        // fall through
      }
    }
    await navigator.clipboard.writeText(shareUrl);
    setReacted(true);
    setCopied(true);
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
          title: "What does this actually cost you?",
          text,
          url: shareUrl,
        });
        track("recipient_shared", { method: "native", privacy });
        return;
      } catch {
        // fall through
      }
    }
    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    track("recipient_shared", { method: "clipboard", privacy });
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
      <PageEnter className="w-full max-w-sm flex flex-col items-center gap-6">
        <div className="flex flex-col items-center gap-1 text-center max-w-sm">
          <span className="text-xs uppercase tracking-widest text-[var(--champagne)]">
            same price, different life
          </span>
          <p className="text-[var(--foreground)] text-lg mt-2">
            {hasPeerHours ? (
              <>
                Someone says this cost them{" "}
                <span className="font-medium tabular-nums">{formatHours(theirHours)}</span> of work.
              </>
            ) : (
              <>
                Someone shared {formatMoney(price)}. What does it cost{" "}
                <span className="font-medium">you</span>?
              </>
            )}
          </p>
          <p className="text-[var(--muted)] text-sm">{getCompareIntroCopy(tone)}</p>
        </div>

        {!revealed ? (
          <div className="flex flex-col gap-4 w-full max-w-sm">
            <div className="money-field">
              <span aria-hidden="true">$</span>
              <input
                autoFocus
                inputMode="decimal"
                placeholder="your hourly rate"
                aria-label="Your hourly take-home rate"
                value={wage}
                onChange={(e) => onWageChange(e.target.value)}
              />
              <span>/ hr</span>
            </div>
            <button type="button" disabled={!canReveal} onClick={handleReveal} className="primary-action pressable w-full">
              Show me
            </button>
          </div>
        ) : (
          myResult && (
            <>
              <ResultCard
                price={price}
                result={myResult}
                label={myName || undefined}
                compareLabel={hasPeerHours ? "Them" : undefined}
                compareHours={hasPeerHours ? theirHours : undefined}
                animateEnter
              />
              <p className="text-[var(--muted)] text-sm text-center max-w-xs">{getCompareRevealCopy(tone)}</p>

              <div className="surface-card surface-card-compact w-full flex flex-col gap-2">
                <p className="field-label" style={{ margin: 0 }}>
                  Adjust your rate
                </p>
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
                <p className="settings-inline-note">
                  Changing the rate updates your hours instantly. It stays on this device.
                </p>
              </div>

              <div className="share-motion share-motion-enter w-full">
                <ShareCard
                  price={price}
                  hours={myResult.hours}
                  label={myName || undefined}
                  compareHours={hasPeerHours ? theirHours : undefined}
                  compareLabel={hasPeerHours ? "Them" : undefined}
                />
              </div>

              <input
                placeholder="Your name (optional, stays on this device)"
                value={myName}
                onChange={(e) => setMyName(e.target.value)}
                className="caption-field"
              />

              {shareId ? (
                <button type="button" onClick={() => void handleReact()} className="primary-action pressable w-full max-w-sm">
                  {reacted ? (copied ? "Reaction link copied" : "Reaction sent") : "React: send your hours back"}
                </button>
              ) : null}

              <button type="button" onClick={handleShareMine} className="secondary-action pressable w-full max-w-sm">
                {copied && !reacted ? "Link copied" : "Ask what it costs them"}
              </button>
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
