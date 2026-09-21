/** Research-backed reference units for Gen Z / Millennial work + spend patterns. */

export const SHIFT_PRESETS: { value: number; label: string; hint: string }[] = [
  { value: 4, label: "4h", hint: "Half block / short shift" },
  { value: 6, label: "6h", hint: "Common retail / cafe shift" },
  { value: 8, label: "8h", hint: "Standard full day" },
  { value: 10, label: "10h", hint: "Long shift / overtime day" },
  { value: 12, label: "12h", hint: "Hospitality / healthcare" },
];

export const MEAL_PRESETS: { value: number; label: string; hint: string }[] = [
  { value: 8, label: "$8", hint: "Coffee + quick bite" },
  { value: 12, label: "$12", hint: "Casual lunch" },
  { value: 18, label: "$18", hint: "Takeout dinner" },
  { value: 25, label: "$25", hint: "Dinner out" },
  { value: 40, label: "$40", hint: "Date-night meal" },
  { value: 60, label: "$60", hint: "Nicer night out" },
];
