/**
 * Reusable UI component builders for "use case" demos. These return styled
 * HTMLElements so realistic demos share one consistent visual language instead
 * of hand-building inline DOM. Styling lives in the `.uikit-*` classes in
 * global.css; per-instance specifics are set inline.
 */

const TONES = [
  ["#cfe3ff", "var(--color-intelligence-blue)"],
  ["#ffd9c7", "var(--color-phoenix-orange)"],
  ["#c7f0db", "var(--color-deliver-green)"],
  ["#fde7b3", "var(--color-engagement-gold)"],
  ["#ded8fb", "var(--color-midnight-violet)"],
  ["#ffd7f0", "var(--color-leadgen-red)"],
] as const;

/** A soft two-stop gradient used to fake a photo thumbnail. */
export function gradientFor(i: number): string {
  const [a, b] = TONES[((i % TONES.length) + TONES.length) % TONES.length];
  return `linear-gradient(135deg, ${a} 0%, ${b} 100%)`;
}

export function elem(tag: string, className?: string, css?: string): HTMLElement {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (css) node.style.cssText = css;
  return node;
}

/** A rounded "photo" tile with an optional caption. */
export function imageTile(opts: { i?: number; label?: string; radius?: number } = {}): HTMLElement {
  const { i = 0, label, radius = 12 } = opts;
  const tile = elem("div", "uikit-tile");
  tile.style.borderRadius = `${radius}px`;
  tile.style.background = gradientFor(i);
  if (label) {
    const cap = elem("span", "uikit-tile__cap");
    cap.textContent = label;
    tile.append(cap);
  }
  return tile;
}

/** A white rounded surface (sheet / card / device frame). */
export function frame(css = ""): HTMLElement {
  return elem("div", "uikit-frame", css);
}

/** A list row: color chip + two text lines + optional trailing node. */
export function listRow(opts: {
  i?: number;
  title: string;
  sub?: string;
  trailing?: HTMLElement;
}): HTMLElement {
  const { i = 0, title, sub, trailing } = opts;
  const row = elem("div", "uikit-row");
  const chip = elem("span", "uikit-row__chip");
  chip.style.background = gradientFor(i);
  const text = elem("div", "uikit-row__text");
  const t = elem("span", "uikit-row__title");
  t.textContent = title;
  text.append(t);
  if (sub) {
    const s = elem("span", "uikit-row__sub");
    s.textContent = sub;
    text.append(s);
  }
  row.append(chip, text);
  if (trailing) {
    trailing.classList.add("uikit-row__trail");
    row.append(trailing);
  }
  return row;
}

/** A search-style input pill (non-functional, display only). */
export function searchField(placeholder: string): HTMLElement {
  const field = elem("div", "uikit-field");
  const glyph = elem("span", "uikit-field__glyph");
  glyph.textContent = "⌕";
  const text = elem("span", "uikit-field__text");
  text.textContent = placeholder;
  field.append(glyph, text);
  return field;
}

/** A circular floating action button. */
export function fab(symbol = "+"): HTMLElement {
  const b = elem("button", "uikit-fab");
  b.setAttribute("type", "button");
  b.textContent = symbol;
  return b;
}

/** A segmented control. Returns the bar plus its buttons + sliding indicator. */
export function segmented(labels: string[]): {
  bar: HTMLElement;
  buttons: HTMLButtonElement[];
  indicator: HTMLElement;
} {
  const bar = elem("div", "uikit-seg");
  const indicator = elem("span", "uikit-seg__ind");
  bar.append(indicator);
  const buttons = labels.map((label, idx) => {
    const b = elem("button", "uikit-seg__btn") as HTMLButtonElement;
    b.type = "button";
    b.textContent = label;
    b.dataset.idx = String(idx);
    bar.append(b);
    return b;
  });
  return { bar, buttons, indicator };
}

/** A short content "line" (skeleton-style bar) for fleshing out cards. */
export function textLine(width = 100, opacity = 1): HTMLElement {
  const line = elem("div", "uikit-line");
  line.style.width = typeof width === "number" ? `${width}px` : width;
  line.style.opacity = String(opacity);
  return line;
}
