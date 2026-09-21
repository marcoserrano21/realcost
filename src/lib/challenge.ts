export function isChallengeComplete(entry: { peerHours?: number; hours: number }): boolean {
  return (
    typeof entry.peerHours === "number" &&
    entry.peerHours > 0 &&
    Number.isFinite(entry.hours) &&
    entry.hours > 0
  );
}
