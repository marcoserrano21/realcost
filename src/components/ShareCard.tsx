"use client";

import { useRef, useState } from "react";
import { formatHours, formatMoney } from "@/lib/calc";
import { downloadShareImage } from "@/lib/shareImage";
import { aspectClassForFormat, type ShareCardFormat } from "@/lib/shareFormats";
import { track } from "@/lib/analytics";

/** Viral share poster — hours lead; optional friend-challenge dual readout. */
export default function ShareCard({
  price,
  hours,
  label,
  compareHours,
  compareLabel,
}: {
  price: number;
  hours: number;
  label?: string;
  compareHours?: number;
  compareLabel?: string;
}) {
  const cardRef = useRef<HTMLElement>(null);
  const [saving, setSaving] = useState(false);
  const challenge = typeof compareHours === "number" && compareHours > 0;
  const [format, setFormat] = useState<ShareCardFormat>(() => (challenge ? "dual" : "poster45"));
  const activeFormat: ShareCardFormat = challenge ? "dual" : format;
  const ofWork = label ? `of ${label}'s life` : "of my life";
  const dualTitle = `Same ${formatMoney(price)}. Different lives.`;

  const saveImage = async () => {
    setSaving(true);
    track("share_image_started", { challenge, format: activeFormat });
    try {
      const ok = await downloadShareImage({
        price,
        hours,
        label,
        compareHours,
        compareLabel,
        format: activeFormat,
      });
      if (ok) track("share_image_completed", { challenge, format: activeFormat });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="share-poster-wrap w-full max-w-sm">
      {!challenge ? (
        <div className="segmented share-format-picker" role="radiogroup" aria-label="Share image format">
          <button
            type="button"
            role="radio"
            aria-checked={format === "poster45"}
            className={`segmented-item pressable${format === "poster45" ? " is-active" : ""}`}
            onClick={() => setFormat("poster45")}
          >
            Post
          </button>
          <button
            type="button"
            role="radio"
            aria-checked={format === "story916"}
            className={`segmented-item pressable${format === "story916" ? " is-active" : ""}`}
            onClick={() => setFormat("story916")}
          >
            Story
          </button>
        </div>
      ) : null}
      <article
        ref={cardRef}
        className={`share-card ${aspectClassForFormat(activeFormat)}${challenge ? " share-card-challenge" : ""}`}
        aria-label="Shareable RealCost card"
      >
        <div className="share-card-glow" aria-hidden="true" />
        <div className="share-card-grain" aria-hidden="true" />

        <header className="share-card-top">
          <p className="share-card-brand">RealCost</p>
          <p className="share-card-price">{formatMoney(price)}</p>
        </header>

        {challenge ? (
          <div className="share-card-hero share-card-challenge-grid">
            <p className="share-card-challenge-title">{dualTitle}</p>
            <div className="share-challenge-cols">
              <div>
                <p className="share-card-of-work">{label?.trim() || "You"}</p>
                <p className="share-card-hours share-card-hours-sm">{formatHours(hours)}</p>
              </div>
              <div>
                <p className="share-card-of-work">{compareLabel?.trim() || "Them"}</p>
                <p className="share-card-hours share-card-hours-sm">{formatHours(compareHours)}</p>
              </div>
            </div>
            <div className="share-card-rule" aria-hidden="true" />
          </div>
        ) : (
          <div className="share-card-hero">
            <p className="share-card-hours">{formatHours(hours)}</p>
            <p className="share-card-of-work">{ofWork}</p>
            <div className="share-card-rule" aria-hidden="true" />
          </div>
        )}

        <footer className="share-card-foot">
          <p className="share-card-tagline">
            Same dollars.
            <br />
            Different life.
          </p>
          <p className="share-card-cta">What does it cost you?</p>
        </footer>
      </article>
      <button type="button" className="secondary-action pressable share-save-image" onClick={() => void saveImage()} disabled={saving}>
        {saving ? "Preparing…" : "Save / share image"}
      </button>
    </div>
  );
}
