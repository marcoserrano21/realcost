import fs from "fs";
import path from "path";

const file = "src/app/globals.css";
const lines = fs.readFileSync(file, "utf8").split(/\r?\n/);

function extract(start, end) {
  return lines.slice(start - 1, end).join("\n").trimEnd() + "\n";
}

function classify(selector) {
  const s = selector;
  if (/data-reduce-motion|prefers-reduced-motion/.test(s)) return "reduce-motion.css";
  if (/html\.light|html\.dark\s*\{/.test(s)) return "theme-light.css";
  if (/@keyframes/.test(s)) return "motion.css";
  if (/\.tab-bar|\.tab-item/.test(s)) return "tab-bar.css";
  if (/\.decision-|\.confirm-|\.welcome-|\.install-/.test(s)) return "overlays.css";
  if (/\.share-card|\.share-poster|\.share-save|\.share-motion|\.share-privacy/.test(s)) return "share.css";
  if (/\.history-|\.category-heat/.test(s)) return "history.css";
  if (/\.feed-|\.weekly-streak|\.badge-role/.test(s)) return "feed-shared.css";
  if (/\.settings-|\.segmented|\.appearance-/.test(s)) return "settings.css";
  if (
    /\.home-stage|\.home-results|\.home-reveal|\.home-stack|\.choice-chip|\.cash-amount|\.hours-clip|\.result-card(?!-enter)/.test(
      s
    )
  ) {
    return "home.css";
  }
  if (
    /\.money-field|\.text-field|\.select-field|\.inline-field|\.field-|\.cash-|\.unit-compact|\.unit-preset|\.unit-hint|\.chip-grid|\.chip\b|\.caption-field/.test(
      s
    )
  ) {
    return "forms.css";
  }
  if (
    /\.surface-card|\.tappable-|\.onboarding|\.brand-|\.progress-|\.eyebrow|\.cost-preview|\.preview-|\.privacy-note|\.page-kicker|\.step-count/.test(
      s
    )
  ) {
    return "surfaces.css";
  }
  if (/\.digit-reel|\.hours-odometer|\.result-card-enter|\.share-motion-enter|\.page-enter|\.edit-stagger/.test(s)) {
    return "motion.css";
  }
  if (/\.pressable|\.screen-shell|\.primary-action|\.secondary-action|\.destructive-action|\.link-action/.test(s)) {
    return "primitives.css";
  }
  return "primitives.css";
}

const content = lines.join("\n");
const pressIdx = content.indexOf("/* Press feedback");
if (pressIdx < 0) throw new Error("Press feedback marker not found");
const rest = content.slice(pressIdx);

const blocks = [];
let i = 0;
while (i < rest.length) {
  while (i < rest.length && /\s/.test(rest[i])) i++;
  if (i >= rest.length) break;

  if (rest.startsWith("/*", i)) {
    const end = rest.indexOf("*/", i);
    if (end < 0) throw new Error("Unclosed comment");
    blocks.push({ type: "comment", text: rest.slice(i, end + 2) });
    i = end + 2;
    continue;
  }

  const selStart = i;
  const brace = rest.indexOf("{", i);
  if (brace < 0) {
    const trailing = rest.slice(i).trim();
    if (trailing) blocks.push({ type: "comment", text: trailing });
    break;
  }

  let depth = 0;
  let k = brace;
  for (; k < rest.length; k++) {
    if (rest[k] === "{") depth++;
    else if (rest[k] === "}") {
      depth--;
      if (depth === 0) {
        k++;
        break;
      }
    }
  }
  const text = rest.slice(selStart, k);
  const selector = rest.slice(selStart, brace).trim();
  blocks.push({ type: "rule", text, selector });
  i = k;
}

const out = {};
let pendingComments = [];
for (const b of blocks) {
  if (b.type === "comment") {
    pendingComments.push(b.text);
    continue;
  }
  const name = classify(b.selector);
  if (!out[name]) out[name] = [];
  const prefix = pendingComments.length ? pendingComments.join("\n") + "\n" : "";
  pendingComments = [];
  out[name].push(prefix + b.text);
}
if (pendingComments.length) {
  if (!out["primitives.css"]) out["primitives.css"] = [];
  out["primitives.css"].push(pendingComments.join("\n"));
}

const dir = "src/app/styles";
fs.mkdirSync(dir, { recursive: true });

fs.writeFileSync(
  path.join(dir, "tokens.css"),
  `/* RealCost tokens: ink / cobalt / champagne */\n${extract(8, 102)}`
);
fs.writeFileSync(path.join(dir, "base.css"), extract(104, 142));

for (const [name, parts] of Object.entries(out)) {
  fs.writeFileSync(path.join(dir, name), parts.join("\n\n") + "\n");
  console.log(name, parts.length, "blocks");
}

const entry = `@import "tailwindcss";
@import "tw-animate-css";
@import "shadcn/tailwind.css";

@custom-variant dark (&:is(.dark *));

@import "./styles/tokens.css";
@import "./styles/base.css";
@import "./styles/primitives.css";
@import "./styles/surfaces.css";
@import "./styles/forms.css";
@import "./styles/home.css";
@import "./styles/history.css";
@import "./styles/feed-shared.css";
@import "./styles/settings.css";
@import "./styles/overlays.css";
@import "./styles/share.css";
@import "./styles/tab-bar.css";
@import "./styles/motion.css";
@import "./styles/theme-light.css";
@import "./styles/reduce-motion.css";
`;

fs.writeFileSync(file, entry);
console.log("Wrote entry globals.css");
