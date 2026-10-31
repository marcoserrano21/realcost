"use client";

import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type AnimationEvent,
  type ChangeEvent,
  type MouseEvent,
  type PointerEvent,
} from "react";
import {
  caretIndexForDigitCount,
  formatGroupedInput,
  sanitizeDecimalInput,
  sanitizeIntegerInput,
} from "@/lib/numericInput";
import { MAX_PRICE } from "@/lib/limits";
import { triggerHaptic } from "@/lib/haptics";

const HOLD_DELAY_MS = 380;
const HOLD_INTERVAL_START_MS = 120;
const HOLD_INTERVAL_MIN_MS = 42;
const HOLD_ACCEL_EVERY = 6;

/** Apple Cash-style compact amount control with +/- steppers (tap + hold-to-repeat). */
export default function CashAmountField({
  value,
  onChange,
  ariaLabel = "Amount",
  autoFocus = false,
  step = 1,
  min = 0,
  suffix,
  prefix = "$",
  allowDecimal = false,
}: {
  value: string;
  onChange: (next: string) => void;
  ariaLabel?: string;
  autoFocus?: boolean;
  step?: number;
  min?: number;
  suffix?: string;
  prefix?: string;
  allowDecimal?: boolean;
}) {
  const valueRef = useRef(value);
  useEffect(() => {
    valueRef.current = value;
  }, [value]);

  const inputRef = useRef<HTMLInputElement>(null);
  const caretDigitsRef = useRef<number | null>(null);

  const holdRef = useRef<{
    timeoutId: number | null;
    ticks: number;
    direction: 1 | -1;
    pointerId: number | null;
    active: boolean;
  }>({
    timeoutId: null,
    ticks: 0,
    direction: 1,
    pointerId: null,
    active: false,
  });

  const suppressClickRef = useRef(false);
  const atCapRef = useRef(false);
  const [atMax, setAtMax] = useState(false);
  const [maxAnnouncement, setMaxAnnouncement] = useState("");

  const reducedMotion = () =>
    typeof document !== "undefined" && document.documentElement.getAttribute("data-reduce-motion") === "true";

  const noteCapHit = () => {
    if (allowDecimal || atCapRef.current) return;
    atCapRef.current = true;
    setMaxAnnouncement("Max price");
    triggerHaptic(12);
    if (!reducedMotion()) setAtMax(true);
  };

  const releaseCap = () => {
    if (!atCapRef.current) return;
    atCapRef.current = false;
    setMaxAnnouncement("");
  };

  const displayValue = formatGroupedInput(value, allowDecimal);
  const growChars = Math.max(1, (displayValue || "0").length);

  useLayoutEffect(() => {
    const el = inputRef.current;
    const digitCount = caretDigitsRef.current;
    if (!el || digitCount == null) return;
    const pos = caretIndexForDigitCount(displayValue, digitCount);
    el.setSelectionRange(pos, pos);
    caretDigitsRef.current = null;
  }, [displayValue]);

  const bumpBy = (delta: number) => {
    const numeric = parseFloat(valueRef.current);
    const safe = Number.isFinite(numeric) ? numeric : 0;
    const next = Math.max(min, Math.round((safe + delta) * 100) / 100);
    if (!allowDecimal && next > MAX_PRICE) noteCapHit();
    else if (!allowDecimal) releaseCap();
    const capped = Math.min(MAX_PRICE, next);
    const nextStr = capped === 0 ? "" : String(Math.round(capped));
    const changed = nextStr !== valueRef.current;
    valueRef.current = nextStr;
    onChange(nextStr);
    if (changed) triggerHaptic(8);
    return capped;
  };

  const stopHold = () => {
    const state = holdRef.current;
    state.active = false;
    if (state.timeoutId != null) {
      window.clearTimeout(state.timeoutId);
      state.timeoutId = null;
    }
    state.ticks = 0;
    state.pointerId = null;
  };

  useEffect(() => () => stopHold(), []);

  const scheduleTick = (direction: 1 | -1) => {
    const state = holdRef.current;
    const accelSteps = Math.floor(state.ticks / HOLD_ACCEL_EVERY);
    const delay = Math.max(HOLD_INTERVAL_MIN_MS, HOLD_INTERVAL_START_MS - accelSteps * 14);
    const runStep = step * Math.min(50, 1 + accelSteps * 2);

    state.timeoutId = window.setTimeout(() => {
      if (!holdRef.current.active) return;
      holdRef.current.ticks += 1;
      const next = bumpBy(direction * runStep);
      if ((direction < 0 && next <= min) || (direction > 0 && next >= MAX_PRICE)) {
        stopHold();
        return;
      }
      scheduleTick(direction);
    }, delay);
  };

  const startHold = (direction: 1 | -1) => {
    stopHold();
    const state = holdRef.current;
    state.active = true;
    state.direction = direction;
    state.ticks = 0;

    const applied = bumpBy(direction * step);
    if ((direction < 0 && applied <= min) || (direction > 0 && applied >= MAX_PRICE)) {
      stopHold();
      return;
    }

    state.timeoutId = window.setTimeout(() => {
      if (!holdRef.current.active) return;
      scheduleTick(direction);
    }, HOLD_DELAY_MS);
  };

  const onStepperPointerDown = (direction: 1 | -1) => (event: PointerEvent<HTMLButtonElement>) => {
    if (event.button !== 0) return;
    event.preventDefault();
    suppressClickRef.current = true;
    holdRef.current.pointerId = event.pointerId;
    try {
      event.currentTarget.setPointerCapture(event.pointerId);
    } catch {
      // ignore — capture unsupported
    }
    startHold(direction);
  };

  const onStepperPointerUp = (event: PointerEvent<HTMLButtonElement>) => {
    if (holdRef.current.pointerId != null && event.pointerId !== holdRef.current.pointerId) {
      return;
    }
    stopHold();
  };

  const onStepperClick = (direction: 1 | -1) => (event: MouseEvent<HTMLButtonElement>) => {
    if (suppressClickRef.current) {
      suppressClickRef.current = false;
      event.preventDefault();
      return;
    }
    bumpBy(direction * step);
  };

  const numeric = parseFloat(value);
  const safe = Number.isFinite(numeric) ? numeric : 0;

  const onInput = (event: ChangeEvent<HTMLInputElement>) => {
    const el = event.target;
    const caret = el.selectionStart ?? el.value.length;
    caretDigitsRef.current = el.value.slice(0, caret).replace(/\D/g, "").length;
    const next = allowDecimal ? sanitizeDecimalInput(el.value) : sanitizeIntegerInput(el.value);
    if (!allowDecimal) {
      const rawDigits = el.value.replace(/\D/g, "").replace(/^0+/, "");
      const droppedByCap =
        rawDigits !== next && (rawDigits.length > next.length || Number(rawDigits) > Number(next || 0));
      if (droppedByCap) noteCapHit();
      else releaseCap();
    }
    onChange(next);
  };

  return (
    <div
      className="cash-amount"
      role="group"
      aria-label={ariaLabel}
      style={{ ["--cash-chars" as string]: String(growChars) }}
    >
      <button
        type="button"
        className="cash-stepper pressable"
        aria-label={`Decrease ${ariaLabel}`}
        disabled={safe <= min}
        onPointerDown={(event) => onStepperPointerDown(-1)(event)}
        onPointerUp={onStepperPointerUp}
        onPointerCancel={onStepperPointerUp}
        onLostPointerCapture={stopHold}
        onClick={(event) => onStepperClick(-1)(event)}
        onContextMenu={(e) => e.preventDefault()}
      >
        <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
          <path d="M6 12h12" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
        </svg>
      </button>

      <div
        className={`cash-amount-field${atMax ? " is-at-max" : ""}`}
        onAnimationEnd={(event: AnimationEvent<HTMLDivElement>) => {
          if (event.target !== event.currentTarget) return;
          if (event.animationName !== "cash-max-shake") return;
          setAtMax(false);
        }}
      >
        {prefix ? <span className="cash-amount-prefix" aria-hidden="true">{prefix}</span> : null}
        <span className="sr-only" aria-live="polite">
          {maxAnnouncement}
        </span>
        <input
          ref={inputRef}
          autoFocus={autoFocus}
          inputMode={allowDecimal ? "decimal" : "numeric"}
          pattern={allowDecimal ? "[0-9,]*[.]?[0-9]*" : "[0-9,]*"}
          placeholder="0"
          aria-label={ariaLabel}
          value={displayValue}
          size={growChars}
          onChange={onInput}
          onKeyDown={(e) => {
            if (e.key.length === 1 && !/[0-9.]/.test(e.key) && !(allowDecimal && e.key === ".")) {
              if (!e.ctrlKey && !e.metaKey && !e.altKey) e.preventDefault();
            }
            if (!allowDecimal && e.key === ".") e.preventDefault();
          }}
        />
        {suffix ? <span className="cash-amount-suffix" aria-hidden="true">{suffix}</span> : null}
      </div>

      <button
        type="button"
        className="cash-stepper pressable"
        aria-label={`Increase ${ariaLabel}`}
        disabled={safe >= MAX_PRICE}
        onPointerDown={(event) => onStepperPointerDown(1)(event)}
        onPointerUp={onStepperPointerUp}
        onPointerCancel={onStepperPointerUp}
        onLostPointerCapture={stopHold}
        onClick={(event) => onStepperClick(1)(event)}
        onContextMenu={(e) => e.preventDefault()}
      >
        <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
          <path d="M12 6v12M6 12h12" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
        </svg>
      </button>
    </div>
  );
}
