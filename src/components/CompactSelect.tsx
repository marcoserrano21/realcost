"use client";

import { useEffect, useId, useRef, useState } from "react";

type Option<T extends string> = { value: T; label: string };

type CompactSelectProps<T extends string> = {
  id?: string;
  label: string;
  value: T;
  options: Option<T>[];
  onChange: (value: T) => void;
};

/** Compact listbox with animated settings-chevron (native select chevrons cannot rotate). */
export default function CompactSelect<T extends string>({
  id,
  label,
  value,
  options,
  onChange,
}: CompactSelectProps<T>) {
  const autoId = useId();
  const triggerId = id ?? autoId;
  const listId = `${triggerId}-list`;
  const rootRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const selected = options.find((o) => o.value === value) ?? options[0];

  useEffect(() => {
    if (!open) return;
    const onPointer = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    // Defer so the opening click does not immediately close.
    const timer = window.setTimeout(() => {
      document.addEventListener("pointerdown", onPointer);
    }, 0);
    document.addEventListener("keydown", onKey);
    return () => {
      window.clearTimeout(timer);
      document.removeEventListener("pointerdown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div className="history-filter-block" ref={rootRef}>
      <span className="field-label" id={`${triggerId}-label`}>
        {label}
      </span>
      <div className={`compact-select${open ? " is-open" : ""}`}>
        <button
          type="button"
          id={triggerId}
          className="compact-select-trigger pressable"
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-controls={listId}
          aria-labelledby={`${triggerId}-label`}
          onClick={(event) => {
            event.stopPropagation();
            setOpen((v) => !v);
          }}
        >
          <span>{selected?.label}</span>
          <span className={`settings-chevron${open ? " is-open" : ""}`} aria-hidden="true">
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
        {open ? (
          <ul id={listId} className="compact-select-menu" role="listbox" aria-labelledby={`${triggerId}-label`}>
            {options.map((option) => {
              const isSelected = option.value === value;
              return (
                <li key={option.value} role="presentation">
                  <button
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    className={`compact-select-option pressable${isSelected ? " is-selected" : ""}`}
                    onClick={(event) => {
                      event.stopPropagation();
                      onChange(option.value);
                      setOpen(false);
                    }}
                  >
                    {option.label}
                  </button>
                </li>
              );
            })}
          </ul>
        ) : null}
      </div>
    </div>
  );
}
