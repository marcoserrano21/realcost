"use client";

import { useEffect, useState } from "react";
import {
  decisionCount,
  hasDismissedA2HS,
  markA2HSDismissed,
} from "@/lib/storage";
import { track } from "@/lib/analytics";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

/** Soft install nudge after 3 decisions (PWA / Add to Home Screen). */
export default function InstallPrompt() {
  const [visible, setVisible] = useState(false);
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const [iosHint, setIosHint] = useState(false);

  useEffect(() => {
    if (hasDismissedA2HS()) return;
    if (decisionCount() < 3) return;

    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      // @ts-expect-error iOS Safari
      window.navigator.standalone === true;
    if (isStandalone) return;

    const ua = window.navigator.userAgent;
    const isIOS = /iPad|iPhone|iPod/.test(ua);
    setIosHint(isIOS);
    setVisible(true);
    track("a2hs_prompt_shown", { ios: isIOS });

    const onBip = (event: Event) => {
      event.preventDefault();
      setDeferred(event as BeforeInstallPromptEvent);
    };
    window.addEventListener("beforeinstallprompt", onBip);
    return () => window.removeEventListener("beforeinstallprompt", onBip);
  }, []);

  if (!visible) return null;

  const dismiss = () => {
    markA2HSDismissed();
    setVisible(false);
    track("a2hs_dismissed");
  };

  const install = async () => {
    if (deferred) {
      await deferred.prompt();
      const choice = await deferred.userChoice;
      track("a2hs_choice", { outcome: choice.outcome });
      setDeferred(null);
      if (choice.outcome === "accepted") {
        markA2HSDismissed();
        setVisible(false);
      }
      return;
    }
    // iOS / browsers without BIP: keep sheet open with instructions
  };

  return (
    <div className="install-prompt" role="dialog" aria-label="Add RealCost to your home screen">
      <div className="install-prompt-card">
        <p className="install-prompt-title">Keep RealCost one tap away</p>
        <p className="install-prompt-body">
          {iosHint
            ? "On iPhone: Share → Add to Home Screen. Your wage stays on this device."
            : "Add RealCost to your home screen for faster checks. Nothing syncs to a cloud account."}
        </p>
        <div className="install-prompt-actions">
          {deferred ? (
            <button type="button" className="primary-action pressable" onClick={() => void install()}>
              Add to home screen
            </button>
          ) : (
            <button type="button" className="primary-action pressable" onClick={dismiss}>
              Got it
            </button>
          )}
          <button type="button" className="secondary-action pressable" onClick={dismiss}>
            Not now
          </button>
        </div>
      </div>
    </div>
  );
}
