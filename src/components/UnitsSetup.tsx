"use client";

import { useState } from "react";
import { DEFAULT_UNITS, Units } from "@/lib/calc";
import {
  setName as setStoredName,
  setPersonalization,
} from "@/lib/storage";
import type { SpendingFocus, Tone } from "@/lib/storage";
import PersonalizationFields from "@/components/PersonalizationFields";
import OnboardingCostPreview from "@/components/OnboardingCostPreview";
import { track } from "@/lib/analytics";
import { triggerHaptic } from "@/lib/haptics";

const TOTAL_STEPS = 3;

export default function UnitsSetup({
  onDone,
}: {
  onDone: (units: Units) => void;
}) {
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState<"forward" | "back">("forward");
  const [wage, setWage] = useState("");
  const [name, setName] = useState("");
  const [spendingFocus, setSpendingFocus] = useState<SpendingFocus | null>(null);
  const [tone, setTone] = useState<Tone | null>(null);

  const wageNum = parseFloat(wage);
  const canContinue = wageNum > 0;
  const canOpen = Boolean(name.trim()) && spendingFocus != null && tone != null;
  const progress = `${step + 1} of ${TOTAL_STEPS}`;

  const finish = () => {
    if (!canOpen || spendingFocus == null || tone == null) return;
    setStoredName(name.trim());
    setPersonalization({ spendingFocus, tone });
    triggerHaptic([10, 40, 14]);
    track("onboarding_completed", { tone, focus: spendingFocus });
    onDone({
      hourlyWage: wageNum,
      shiftHours: DEFAULT_UNITS.shiftHours,
      dinnerCost: DEFAULT_UNITS.dinnerCost,
      dinnerLabel: DEFAULT_UNITS.dinnerLabel,
    });
  };

  const goForward = (next: number) => {
    triggerHaptic();
    setDirection("forward");
    setStep(next);
  };

  const goBack = () => {
    triggerHaptic();
    setDirection("back");
    setStep((currentStep) => Math.max(0, currentStep - 1));
  };

  return (
    <section className="onboarding-shell" aria-labelledby="onboarding-title">
      <div className="onboarding-topbar">
        <span className="brand-mark">RealCost</span>
        <span className="step-count" aria-live="polite">
          {progress}
        </span>
      </div>

      <div className="progress-track" aria-hidden="true">
        <span style={{ width: `${((step + 1) / TOTAL_STEPS) * 100}%` }} />
      </div>

      <div className="onboarding-panel">
        <div key={step} className={`onboarding-step-motion dir-${direction}`}>
          {step === 0 && (
            <div className="onboarding-screen onboarding-screen-intro">
              <div className="eyebrow">Same dollars. Different life.</div>
              <OnboardingCostPreview />
              <h1 id="onboarding-title">See the price in your time.</h1>
              <p className="onboarding-copy">
                RealCost turns a price into hours of your life, then asks what it costs someone else.
              </p>
              <button type="button" className="primary-action pressable" onClick={() => goForward(1)}>
                See it differently
              </button>
            </div>
          )}

          {step === 1 && (
            <div className="onboarding-screen">
              <div className="eyebrow">Your private baseline</div>
              <h1 id="onboarding-title">What does one hour of your work bring home?</h1>
              <p className="onboarding-copy">
                Use your take-home rate. It stays on this device and powers every calculation.
              </p>
              <label className="field-label" htmlFor="hourly-wage">
                Take-home hourly rate
              </label>
              <div className="money-field">
                <span aria-hidden="true">$</span>
                <input
                  id="hourly-wage"
                  autoFocus
                  inputMode="decimal"
                  placeholder="15.00"
                  value={wage}
                  onChange={(event) => setWage(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" && canContinue) goForward(2);
                  }}
                  aria-describedby="wage-note"
                />
                <span>/ hr</span>
              </div>
              <p className="field-note" id="wage-note">
                No account. No bank link. No data leaves your browser.
              </p>
              <div className="onboarding-actions">
                <button type="button" className="secondary-action pressable" onClick={goBack}>
                  Back
                </button>
                <button
                  type="button"
                  className="primary-action pressable"
                  disabled={!canContinue}
                  onClick={() => goForward(2)}
                >
                  Continue
                </button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="onboarding-screen">
              <div className="eyebrow">Make it yours</div>
              <h1 id="onboarding-title">Tune the voice. Add your name.</h1>
              <p className="onboarding-copy">
                Personalization stays local. Shift length and dinner cost live in Settings.
              </p>
              <PersonalizationFields
                spendingFocus={spendingFocus}
                tone={tone}
                onFocusChange={setSpendingFocus}
                onToneChange={setTone}
              />
              <label className="field-label" htmlFor="display-name">
                Your name
              </label>
              <input
                id="display-name"
                className="text-field"
                placeholder="e.g. Maya"
                value={name}
                required
                autoComplete="nickname"
                onChange={(event) => setName(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" && canOpen) finish();
                }}
              />
              <div className="privacy-note">
                <span className="privacy-dot" aria-hidden="true" />
                Saved only in this browser
              </div>
              <div className="onboarding-actions">
                <button type="button" className="secondary-action pressable" onClick={goBack}>
                  Back
                </button>
                <button
                  type="button"
                  className="primary-action pressable"
                  disabled={!canOpen}
                  onClick={finish}
                >
                  Open RealCost
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
