"use client";

import { useEffect, useRef, useState } from "react";
import { formatHours, formatMoney } from "@/lib/calc";
import { downloadShareImage } from "@/lib/shareImage";
import { downloadShareVideo, shouldExportShareVideo } from "@/lib/shareVideo";
import { aspectClassForFormat, type ShareCardFormat } from "@/lib/shareFormats";
import { track } from "@/lib/analytics";
import LifeSpanGloss from "@/components/LifeSpanGloss";

/** Viral share poster — hours lead; optional friend-challenge dual readout. */
export default function ShareCard({
  price,
  hours,
  label,
  compareHours,
  compareLabel,
  variant = "standard",
}: {
  price: number;
  hours: number;
  label?: string;
  compareHours?: number;
  compareLabel?: string;
  variant?: "standard" | "hoursKept";
}) {
  const cardRef = useRef<HTMLElement>(null);
  const [saving, setSaving] = useState(false);
  const [savingVideo, setSavingVideo] = useState(false);
  const [videoAvailable, setVideoAvailable] = useState(false);
  const challenge = variant !== "hoursKept" && typeof compareHours === "number" && compareHours > 0;
  const [format, setFormat] = useState<ShareCardFormat>(() => (challenge ? "dual" : "poster45"));
  const activeFormat: ShareCardFormat = challenge || variant === "hoursKept" ? (challenge ? "dual" : "poster45") : format;
  const ofWork = label ? `of ${label}'s life` : "of my life";
  const dualTitle = `Same ${formatMoney(price)}. Different lives.`;
  const thumbIndex = activeFormat === "story916" ? 1 : 0;

  useEffect(() => {
    setVideoAvailable(
      shouldExportShareVideo({
        price,
        hours,
        label,
        compareHours,
        compareLabel,
        format: activeFormat,
        variant,
      })
    );
  }, [price, hours, label, compareHours, compareLabel, activeFormat, variant]);

  const saveImage = async () => {
    setSaving(true);
    track("share_image_started", { challenge, format: activeFormat, variant });
    try {
      const ok = await downloadShareImage({
        price,
        hours,
        label,
        compareHours,
        compareLabel,
        format: activeFormat,
        variant,
      });
      if (ok) track("share_image_completed", { challenge, format: activeFormat, variant });
    } finally {
      setSaving(false);
    }
  };

  const saveVideo = async () => {
    setSavingVideo(true);
    track("share_video_started", { challenge, format: activeFormat, variant });
    try {
      const ok = await downloadShareVideo({
        price,
        hours,
        label,
        compareHours,
        compareLabel,
        format: activeFormat,
        variant,
      });
      if (ok) track("share_video_completed", { challenge, format: activeFormat, variant });
    } finally {
      setSavingVideo(false);
    }
  };

  return (
    <div className="share-poster-wrap w-full max-w-sm">
      {!challenge && variant !== "hoursKept" ? (
        <div className="share-format-pill" role="radiogroup" aria-label="Share image format">
          <span
            className="share-format-pill-thumb"
            style={{ transform: `translateX(${thumbIndex * 100}%)` }}
            aria-hidden="true"
          />
          <button
            type="button"
            role="radio"
            aria-checked={format === "poster45"}
            className={`share-format-pill-option pressable${format === "poster45" ? " is-active" : ""}`}
            onClick={() => setFormat("poster45")}
          >
            Post
          </button>
          <button
            type="button"
            role="radio"
            aria-checked={format === "story916"}
            className={`share-format-pill-option pressable${format === "story916" ? " is-active" : ""}`}
            onClick={() => setFormat("story916")}
          >
            Story
          </button>
        </div>
      ) : null}
      <article
        ref={cardRef}
        className={`share-card ${aspectClassForFormat(activeFormat)}${challenge ? " share-card-challenge" : ""}${
          variant === "hoursKept" ? " share-card-hours-kept" : ""
        }`}
        aria-label="Shareable RealCost card"
      >
        <div className="share-card-glow" aria-hidden="true" />
        <div className="share-card-grain" aria-hidden="true" />

        <header className="share-card-top">
          <p className="share-card-brand">RealCost</p>
          {variant === "hoursKept" ? (
            price > 0 ? <p className="share-card-price">skipped {formatMoney(price)}</p> : <span />
          ) : (
            <p className="share-card-price">{formatMoney(price)}</p>
          )}
        </header>

        {variant === "hoursKept" ? (
          <div className="share-card-hero">
            <p className="share-card-hours">{formatHours(hours)}</p>
            <p className="share-card-of-work">kept this week</p>
            <LifeSpanGloss hours={hours} className="share-card-life-span" />
            <div className="share-card-rule" aria-hidden="true" />
          </div>
        ) : challenge ? (
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
            <LifeSpanGloss hours={hours} className="share-card-life-span" />
            <div className="share-card-rule" aria-hidden="true" />
          </div>
        )}

        <footer className="share-card-foot">
          {variant === "hoursKept" ? (
            <p className="share-card-tagline">I almost bought it.</p>
          ) : (
            <p className="share-card-tagline">
              Same dollars.
              <br />
              Different life.
            </p>
          )}
          <p className="share-card-cta">What does it cost you?</p>
        </footer>
      </article>
      <button type="button" className="secondary-action pressable share-save-image" onClick={() => void saveImage()} disabled={saving || savingVideo}>
        {saving ? "Preparing…" : "Save / share image"}
      </button>
      {videoAvailable ? (
        <button
          type="button"
          className="secondary-action pressable share-save-image"
          onClick={() => void saveVideo()}
          disabled={saving || savingVideo}
        >
          {savingVideo ? "Recording…" : "Save / share video"}
        </button>
      ) : null}
    </div>
  );
}
