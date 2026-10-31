"use client";

import { useEffect, useRef, useState } from "react";
import { formatHours, formatMoney } from "@/lib/calc";
import { downloadShareImage } from "@/lib/shareImage";
import { downloadShareVideo, shouldExportShareVideo } from "@/lib/shareVideo";
import { aspectClassForFormat, type ShareCardFormat } from "@/lib/shareFormats";
import { sharePosterContent } from "@/lib/sharePosterContent";
import { track } from "@/lib/analytics";

/** Share poster. Standard cards show the price. Hours-kept cards show hours. Never both. */
export default function ShareCard({
  price = 0,
  hours = 0,
  variant = "standard",
}: {
  price?: number;
  hours?: number;
  variant?: "standard" | "hoursKept";
}) {
  const cardRef = useRef<HTMLElement>(null);
  const [saving, setSaving] = useState(false);
  const [savingVideo, setSavingVideo] = useState(false);
  const [videoAvailable, setVideoAvailable] = useState(false);
  const [format, setFormat] = useState<ShareCardFormat>("poster45");
  const activeFormat: ShareCardFormat = variant === "hoursKept" ? "poster45" : format;
  const thumbIndex = activeFormat === "story916" ? 1 : 0;
  const content = sharePosterContent({ price, hours, variant }, { formatMoney, formatHours });

  useEffect(() => {
    setVideoAvailable(
      shouldExportShareVideo({
        price,
        hours,
        format: activeFormat,
        variant,
      })
    );
  }, [price, hours, activeFormat, variant]);

  const saveImage = async () => {
    setSaving(true);
    track("share_image_started", { format: activeFormat, variant });
    try {
      const ok = await downloadShareImage({
        price,
        hours,
        format: activeFormat,
        variant,
      });
      if (ok) track("share_image_completed", { format: activeFormat, variant });
    } finally {
      setSaving(false);
    }
  };

  const saveVideo = async () => {
    setSavingVideo(true);
    track("share_video_started", { format: activeFormat, variant });
    try {
      const ok = await downloadShareVideo({
        price,
        hours,
        format: activeFormat,
        variant,
      });
      if (ok) track("share_video_completed", { format: activeFormat, variant });
    } finally {
      setSavingVideo(false);
    }
  };

  return (
    <div className="share-poster-wrap w-full max-w-sm">
      {variant !== "hoursKept" ? (
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
        className={`share-card ${aspectClassForFormat(activeFormat)}${
          variant === "hoursKept" ? " share-card-hours-kept" : ""
        }`}
        aria-label="Shareable RealCost card"
      >
        <div className="share-card-glow" aria-hidden="true" />
        <div className="share-card-grain" aria-hidden="true" />

        <header className="share-card-top">
          <p className="share-card-brand">{content.brand}</p>
          <span />
        </header>

        <div className="share-card-hero">
          <p className="share-card-hours">{content.hoursLine ?? content.priceLine}</p>
          {content.caption ? <p className="share-card-of-work">{content.caption}</p> : null}
          <div className="share-card-rule" aria-hidden="true" />
        </div>

        <footer className="share-card-foot">
          {variant === "hoursKept" ? (
            <p className="share-card-tagline">{content.tagline[0]}</p>
          ) : (
            <p className="share-card-tagline">
              {content.tagline[0]}
              <br />
              {content.tagline[1]}
            </p>
          )}
          <p className="share-card-cta">{content.cta}</p>
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
