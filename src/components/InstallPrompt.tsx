"use client";

import { useEffect, useState } from "react";
import {
  decisionCount,
  getA2HSPeak,
  hasDismissedA2HS,
  markA2HSDismissed,
} from "@/lib/storage";
import { shouldShowA2HS } from "@/lib/a2hsGate";
import { track } from "@/lib/analytics";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

function isStandaloneDisplay(): boolean {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    // @ts-expect-error iOS Safari
    window.navigator.standalone === true
  );
}

/** Soft install nudge after share / hours kept peak (legacy: 3 decisions). */
export default function InstallPrompt() {
  const [visible, setVisible] = useState(false);
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const [iosHint, setIosHint] = useState(false);

  useEffect(() => {
    const evaluate = () => {
      if (
        !shouldShowA2HS({
          dismissed: hasDismissedA2HS(),
          standalone: isStandaloneDisplay(),
          peak: getA2HSPeak(),
          decisions: decisionCount(),
        })
      ) {
        return;
      }

      const ua = window.navigator.userAgent;
      const isIOS = /iPad|iPhone|iPod/.test(ua);
      setIosHint(isIOS);
      setVisible((was) => {
        if (!was) track("a2hs_prompt_shown", { ios: isIOS, peak: getA2HSPeak() ?? "legacy" });
        return true;
      });
    };

    evaluate();
    window.addEventListener("realcost:a2hs-peak", evaluate);

    const onBip = (event: Event) => {
      event.preventDefault();
      setDeferred(event as BeforeInstallPromptEvent);
    };
    window.addEventListener("beforeinstallprompt", onBip);
    return () => {
      window.removeEventListener("beforeinstallprompt", onBip);
      window.removeEventListener("realcost:a2hs-peak", evaluate);
    };
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
