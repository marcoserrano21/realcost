export type SharePrivacy = "private" | "exact";

const SHARE_PRIVACY_KEY = "realcost:share_privacy";

export function getSharePrivacy(): SharePrivacy {
  if (typeof window === "undefined") return "private";
  const raw = window.localStorage.getItem(SHARE_PRIVACY_KEY);
  return raw === "exact" ? "exact" : "private";
}

export function setSharePrivacy(mode: SharePrivacy) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(SHARE_PRIVACY_KEY, mode);
  window.dispatchEvent(new Event("realcost:preferences-updated"));
}
