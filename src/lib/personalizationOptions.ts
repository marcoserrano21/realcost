import type { PurchaseCategory, SpendingFocus, Tone } from "./storage";

export const SPENDING_FOCUS_OPTIONS: { value: SpendingFocus; label: string }[] = [
  { value: "shopping", label: "Shopping & style" },
  { value: "eating_out", label: "Eating out" },
  { value: "subscriptions", label: "Subscriptions" },
  { value: "big_purchases", label: "Big-ticket items" },
  { value: "impulse", label: "Impulse buys" },
  { value: "unsure", label: "Not sure yet" },
];

export const PURCHASE_CATEGORY_OPTIONS: {
  value: PurchaseCategory;
  label: string;
}[] = [
  { value: "shopping", label: "Shopping" },
  { value: "food", label: "Food & drinks" },
  { value: "subscriptions", label: "Subscriptions" },
  { value: "entertainment", label: "Entertainment" },
  { value: "travel", label: "Travel" },
  { value: "tech", label: "Tech" },
  { value: "others", label: "Others" },
];

/**
 * Tone research notes (behavioral science):
 * - gentle: self-compassion / ACT: awareness without self-criticism
 * - direct: cognitive load reduction: plain facts, no persuasion theater
 * - hype: agency + positive reinforcement: celebrates intentional choice
 * - curious: motivational interviewing: Socratic questions invite reflection
 * - deadpan: internet-native dryness; self-deprecating about the purchase, never the person
 */
export const TONE_OPTIONS: {
  value: Tone;
  label: string;
  hint: string;
  research: string;
}[] = [
  {
    value: "gentle",
    label: "Gently",
    hint: "Warm, no judgment",
    research: "Self-compassion framing reduces defensive reactance after spending decisions.",
  },
  {
    value: "direct",
    label: "Straight up",
    hint: "Just the facts",
    research: "Low-verbosity feedback lowers cognitive load and keeps the number salient.",
  },
  {
    value: "hype",
    label: "Hyped",
    hint: "Cheer me on",
    research: "Agency-forward praise reinforces intentional choice without moral ranking.",
  },
  {
    value: "curious",
    label: "Curious",
    hint: "Ask, don’t tell",
    research: "Motivational-interviewing questions spark reflection without prescribing behavior.",
  },
  {
    value: "deadpan",
    label: "Deadpan",
    hint: "Dry. A little online.",
    research: "Mild self-deprecation about the purchase lowers shame while staying meme-shareable.",
  },
];
