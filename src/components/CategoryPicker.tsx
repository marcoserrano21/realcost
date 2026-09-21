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
  onCategoryChange: (value: PurchaseCategory) => void;
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
      <div className="chip-grid" role="group" aria-labelledby="category-label">
        {PURCHASE_CATEGORY_OPTIONS.map((option) => (
          <button
            key={option.value}
            type="button"
            className={`chip pressable${category === option.value ? " chip-selected" : ""}`}
            aria-pressed={category === option.value}
            onClick={() => onCategoryChange(option.value)}
          >
            {option.label}
          </button>
        ))}
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
