"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { DEFAULT_UNITS } from "@/lib/calc";
import type { Units } from "@/lib/calc";
import {
  clearAllData,
  getName,
  getPersonalization,
  getUnits,
  resetOnboarding,
  setName as setStoredName,
  setPersonalization,
  setUnits,
  DEFAULT_PERSONALIZATION,
} from "@/lib/storage";
import type { SpendingFocus, Tone } from "@/lib/storage";
import PersonalizationFields from "@/components/PersonalizationFields";
import UnitPresetFields from "@/components/UnitPresetFields";
import AppearanceControls from "@/components/AppearanceControls";
import PageEnter from "@/components/PageEnter";
import ScreenHeader from "@/components/ScreenHeader";
import { SettingsAccordion, SettingsSection } from "@/components/SettingsSection";
import ConfirmDialog from "@/components/ConfirmDialog";
import BounceLoader from "@/components/BounceLoader";
import { getSharePrivacy, setSharePrivacy, type SharePrivacy } from "@/lib/sharePrivacy";
import { TONE_OPTIONS, SPENDING_FOCUS_OPTIONS } from "@/lib/personalizationOptions";
import { sanitizeDecimalInput } from "@/lib/numericInput";

type Baseline = {
  wage: string;
  shiftHours: string;
  dinnerCost: string;
  dinnerLabel: string;
  name: string;
  spendingFocus: SpendingFocus;
  tone: Tone;
  sharePrivacy: SharePrivacy;
};

export default function SettingsPage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [wage, setWage] = useState("");
  const [shiftHours, setShiftHours] = useState(String(DEFAULT_UNITS.shiftHours));
  const [dinnerCost, setDinnerCost] = useState(String(DEFAULT_UNITS.dinnerCost));
  const [dinnerLabel, setDinnerLabel] = useState(DEFAULT_UNITS.dinnerLabel ?? "dinner out");
  const [name, setName] = useState("");
  const [spendingFocus, setSpendingFocus] = useState<SpendingFocus>(DEFAULT_PERSONALIZATION.spendingFocus);
  const [tone, setTone] = useState<Tone>(DEFAULT_PERSONALIZATION.tone);
  const [sharePrivacy, setSharePrivacyState] = useState<SharePrivacy>("private");
  const [saved, setSaved] = useState(false);
  const [unitsOpen, setUnitsOpen] = useState(false);
  const [voiceOpen, setVoiceOpen] = useState(false);
  const [baseline, setBaseline] = useState<Baseline | null>(null);
  const [confirmAction, setConfirmAction] = useState<"reset" | "replay" | "exact" | null>(null);

  useEffect(() => {
    const units: Units | null = getUnits();
    const nextWage = units ? String(units.hourlyWage) : "";
    const nextShift = units ? String(units.shiftHours) : String(DEFAULT_UNITS.shiftHours);
    const nextDinner = units ? String(units.dinnerCost) : String(DEFAULT_UNITS.dinnerCost);
    const nextDinnerLabel = units?.dinnerLabel?.trim() || DEFAULT_UNITS.dinnerLabel || "dinner out";
    const nextName = getName();
    const personalization = getPersonalization() ?? DEFAULT_PERSONALIZATION;
    const nextPrivacy = getSharePrivacy();

    setWage(nextWage);
    setShiftHours(nextShift);
    setDinnerCost(nextDinner);
    setDinnerLabel(nextDinnerLabel);
    setName(nextName);
    setSpendingFocus(personalization.spendingFocus);
    setTone(personalization.tone);
    setSharePrivacyState(nextPrivacy);
    setBaseline({
      wage: nextWage,
      shiftHours: nextShift,
      dinnerCost: nextDinner,
      dinnerLabel: nextDinnerLabel,
      name: nextName,
      spendingFocus: personalization.spendingFocus,
      tone: personalization.tone,
      sharePrivacy: nextPrivacy,
    });
    setReady(true);
  }, []);

  if (!ready || !baseline) {
    return (
      <main className="screen-shell">
        <BounceLoader label="Loading Settings" />
      </main>
    );
  }

  const wageNum = parseFloat(wage);
  const dirty =
    wage !== baseline.wage ||
    shiftHours !== baseline.shiftHours ||
    dinnerCost !== baseline.dinnerCost ||
    dinnerLabel !== baseline.dinnerLabel ||
    name !== baseline.name ||
    spendingFocus !== baseline.spendingFocus ||
    tone !== baseline.tone ||
    sharePrivacy !== baseline.sharePrivacy;
  const canSave = wageNum > 0 && dirty;
  const toneLabel = TONE_OPTIONS.find((o) => o.value === tone)?.label ?? "Gently";
  const focusLabel = SPENDING_FOCUS_OPTIONS.find((o) => o.value === spendingFocus)?.label ?? "Not sure";
  const dinnerName = dinnerLabel.trim() || "dinner out";

  const handleSave = () => {
    if (!canSave) return;
    const next: Baseline = {
      wage: String(wageNum),
      shiftHours: String(parseFloat(shiftHours) || DEFAULT_UNITS.shiftHours),
      dinnerCost: String(parseFloat(dinnerCost) || DEFAULT_UNITS.dinnerCost),
      dinnerLabel: dinnerLabel.trim() || DEFAULT_UNITS.dinnerLabel || "dinner out",
      name,
      spendingFocus,
      tone,
      sharePrivacy,
    };
    setUnits({
      hourlyWage: wageNum,
      shiftHours: parseFloat(next.shiftHours),
      dinnerCost: parseFloat(next.dinnerCost),
      dinnerLabel: next.dinnerLabel,
    });
    setStoredName(name);
    setPersonalization({ spendingFocus, tone });
    setSharePrivacy(sharePrivacy);
    setWage(next.wage);
    setShiftHours(next.shiftHours);
    setDinnerCost(next.dinnerCost);
    setDinnerLabel(next.dinnerLabel);
    setBaseline(next);
    window.dispatchEvent(new Event("realcost:units-updated"));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleReset = () => setConfirmAction("reset");

  const handleRedoOnboarding = () => setConfirmAction("replay");

  const runConfirmAction = () => {
    if (confirmAction === "exact") {
      setSharePrivacyState("exact");
      setConfirmAction(null);
      return;
    }
    if (confirmAction === "reset") {
      clearAllData();
      window.dispatchEvent(new Event("realcost:units-updated"));
      setConfirmAction(null);
      router.replace("/");
      return;
    }
    if (confirmAction === "replay") {
      resetOnboarding();
      window.dispatchEvent(new Event("realcost:units-updated"));
      setConfirmAction(null);
      router.replace("/");
    }
  };

  return (
    <main className="screen-shell settings-shell">
      <PageEnter className="w-full max-w-sm flex flex-col gap-4 items-center">
        <ScreenHeader title="Settings" />

        <SettingsSection title="Your rate" description="Powers every RealCost calculation on this device. Edit your exact hourly rate anytime.">
          <label className="field-label" htmlFor="settings-wage">
            Take-home hourly
          </label>
          <div className="money-field money-field-compact">
            <span aria-hidden="true">$</span>
            <input
              id="settings-wage"
              inputMode="decimal"
              pattern="[0-9]*[.]?[0-9]*"
              value={wage}
              onChange={(e) => setWage(sanitizeDecimalInput(e.target.value))}
            />
            <span>/ hr</span>
          </div>
          <label className="field-label" htmlFor="settings-name">
            Name <span style={{ color: "var(--subtle)", fontWeight: 400 }}>(optional)</span>
          </label>
          <input
            id="settings-name"
            className="text-field text-field-compact"
            placeholder="e.g. Maya"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </SettingsSection>

        <SettingsSection title="References">
          <SettingsAccordion
            title="Shift & spend units"
            summary={`${shiftHours}h shift · $${dinnerCost || "0"} ${dinnerName}`}
            open={unitsOpen}
            onToggle={() => setUnitsOpen((v) => !v)}
          >
            <UnitPresetFields
              shiftHours={shiftHours}
              dinnerCost={dinnerCost}
              dinnerLabel={dinnerLabel}
              onShiftChange={(v) => setShiftHours(sanitizeDecimalInput(v))}
              onDinnerChange={(v) => setDinnerCost(sanitizeDecimalInput(v))}
              onDinnerLabelChange={setDinnerLabel}
            />
          </SettingsAccordion>
        </SettingsSection>

        <SettingsSection title="Look & feel" description="Theme and motion apply instantly.">
          <AppearanceControls />
        </SettingsSection>

        <SettingsSection title="Sharing" description="Private links share price only so wage cannot be reverse-engineered.">
          <div className="segmented segmented-wide" role="radiogroup" aria-label="Share privacy">
            <button
              type="button"
              role="radio"
              aria-checked={sharePrivacy === "private"}
              className={`segmented-item pressable${sharePrivacy === "private" ? " is-active" : ""}`}
              onClick={() => setSharePrivacyState("private")}
            >
              Private
            </button>
            <button
              type="button"
              role="radio"
              aria-checked={sharePrivacy === "exact"}
              className={`segmented-item pressable${sharePrivacy === "exact" ? " is-active" : ""}`}
              onClick={() => {
                if (sharePrivacy === "exact") return;
                setConfirmAction("exact");
              }}
            >
              Include hours
            </button>
          </div>
          <p className="settings-inline-note">
            {sharePrivacy === "private"
              ? "Recommended for posts and group chats."
              : "Only for people you trust. Hours can reveal approximate take-home rate."}
          </p>
        </SettingsSection>

        <SettingsSection title="Voice">
          <SettingsAccordion
            title="Personalization"
            summary={`${focusLabel} · ${toneLabel}`}
            open={voiceOpen}
            onToggle={() => setVoiceOpen((v) => !v)}
          >
            <PersonalizationFields
              compact
              spendingFocus={spendingFocus}
              tone={tone}
              onFocusChange={setSpendingFocus}
              onToneChange={setTone}
            />
          </SettingsAccordion>
        </SettingsSection>

        <div
          className={`settings-save-float${dirty || saved ? " is-visible" : ""}`}
          aria-hidden={!(dirty || saved)}
        >
          <button
            type="button"
            className="primary-action pressable w-full"
            disabled={!canSave && !saved}
            onClick={handleSave}
          >
            {saved ? "Saved" : "Save changes"}
          </button>
        </div>

        <SettingsSection title="Legal & trust">
          <nav className="settings-link-list" aria-label="Legal">
            <Link href="/legal/terms" className="settings-link-row pressable">
              <span>Terms of Use</span>
              <span aria-hidden="true">›</span>
            </Link>
            <Link href="/legal/privacy" className="settings-link-row pressable">
              <span>Privacy Notice</span>
              <span aria-hidden="true">›</span>
            </Link>
          </nav>
          <p className="settings-inline-note">
            Your wage stays in this browser. Default shares never include your rate or name.
          </p>
        </SettingsSection>

        <SettingsSection title="Device">
          <button type="button" className="secondary-action pressable w-full" onClick={handleRedoOnboarding}>
            Replay onboarding
          </button>
          <button type="button" className="destructive-action pressable w-full" onClick={handleReset}>
            Reset RealCost
          </button>
        </SettingsSection>
      </PageEnter>
      <ConfirmDialog
        open={confirmAction === "exact"}
        title="Include hours in shares?"
        body="Anyone with the link can see the hours. With the price, they can estimate your take-home rate. Only use this with people you trust."
        confirmLabel="Include hours"
        destructive={false}
        onConfirm={runConfirmAction}
        onCancel={() => setConfirmAction(null)}
      />
      <ConfirmDialog
        open={confirmAction === "reset"}
        title="Reset RealCost?"
        body="This clears your rate, history, and comparisons from this device. You can’t undo it."
        confirmLabel="Reset everything"
        onConfirm={runConfirmAction}
        onCancel={() => setConfirmAction(null)}
      />
      <ConfirmDialog
        open={confirmAction === "replay"}
        title="Replay onboarding?"
        body="Your history stays. You’ll set your rate and voice again."
        confirmLabel="Replay"
        destructive={false}
        onConfirm={runConfirmAction}
        onCancel={() => setConfirmAction(null)}
      />
    </main>
  );
}
