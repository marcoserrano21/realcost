"use client";

import { useEffect, useState } from "react";
import HoursOdometer from "@/components/HoursOdometer";
import { NumberReels, prefersReducedMotion } from "@/components/DigitReels";

const MONEY_START = 100;
const MONEY_END = 120;
const HOURS_START = 5;
const HOURS_END = 8;

/** Intro proof: money and hours roll like Home’s odometer. */
export default function OnboardingCostPreview() {
  const [money, setMoney] = useState(MONEY_START);
  const [hours, setHours] = useState(HOURS_START);

  useEffect(() => {
    if (prefersReducedMotion()) {
      setMoney(MONEY_END);
      setHours(HOURS_END);
      return;
    }

    let moneyTimer = 0;
    let hoursTimer = 0;
    const frame = window.requestAnimationFrame(() => {
      moneyTimer = window.setTimeout(() => setMoney(MONEY_END), 60);
      hoursTimer = window.setTimeout(() => setHours(HOURS_END), 280);
    });

    return () => {
      window.cancelAnimationFrame(frame);
      window.clearTimeout(moneyTimer);
      window.clearTimeout(hoursTimer);
    };
  }, []);

  return (
    <div
      className="cost-preview"
      aria-label="A 120 dollar purchase equals eight hours of work"
    >
      <span className="cost-preview-money" aria-hidden="true">
        <span className="cost-preview-currency">$</span>
        <NumberReels value={money} minDigits={3} durationMs={560} />
      </span>
      <span className="preview-arrow" aria-hidden="true">
        =
      </span>
      <strong className="cost-preview-hours" aria-hidden="true">
        <HoursOdometer hours={hours} durationMs={560} />
      </strong>
    </div>
  );
}
