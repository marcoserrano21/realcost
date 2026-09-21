"use client";

import { useEffect, useRef } from "react";
import { PURCHASE_CATEGORY_OPTIONS } from "@/lib/personalizationOptions";
import type { PurchaseCategory } from "@/lib/storage";

export default function CategoryPicker({
  category,
  customLabel,
  onCategoryChange,
  onCustomLabelChange,
}: {
  category: PurchaseCategory | null;
  customLabel: string;
  onCategoryChange: (value: PurchaseCategory | null) => void;
  onCustomLabelChange: (value: string) => void;
}) {
  const otherInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (category !== "others") return;
    const frame = requestAnimationFrame(() => {
      const el = otherInputRef.current;
      if (!el) return;
      el.focus();
      el.select();
    });
    return () => cancelAnimationFrame(frame);
  }, [category]);

  return (
    <div className="w-full max-w-sm flex flex-col gap-2">
      <label className="field-label" id="category-label">
        What is this for?
      </label>
      <div className="chip-grid chip-grid-compact" role="group" aria-labelledby="category-label">
        {PURCHASE_CATEGORY_OPTIONS.map((option) => {
          const selected = category === option.value;
          return (
            <button
              key={option.value}
              type="button"
              className={`chip chip-compact pressable${selected ? " chip-selected" : ""}`}
              aria-pressed={selected}
              onClick={() => {
                if (selected) {
                  onCategoryChange(null);
                  if (option.value === "others") onCustomLabelChange("");
                  return;
                }
                onCategoryChange(option.value);
              }}
            >
              {option.label}
            </button>
          );
        })}
      </div>
      {category === "others" && (
        <input
          ref={otherInputRef}
          className="text-field"
          placeholder="Describe it"
          value={customLabel}
          onChange={(e) => onCustomLabelChange(e.target.value)}
          aria-label="Custom category"
          maxLength={48}
        />
      )}
    </div>
  );
}
