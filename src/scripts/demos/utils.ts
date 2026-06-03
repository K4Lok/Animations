/**
 * Translate a demo display string. Keys are the English source text; the active
 * locale's overrides live on `window.__PG_I18N__.demos` (English passes through).
 * `{token}` placeholders are filled from `vars`.
 */
export function dt(key: string, vars?: Record<string, string | number>): string {
  const map =
    typeof window !== "undefined"
      ? (window as unknown as { __PG_I18N__?: { demos?: Record<string, string> } }).__PG_I18N__?.demos
      : undefined;
  let out = map?.[key] ?? key;
  if (vars) {
    for (const [k, v] of Object.entries(vars)) out = out.replaceAll(`{${k}}`, String(v));
  }
  return out;
}

export function prefersReducedMotion(): boolean {
  return (
    typeof matchMedia !== "undefined" &&
    matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

export function clearStage(stage: HTMLElement): void {
  stage.innerHTML = "";
}

/** A reusable "object" that most movement/entrance demos animate. */
export function createBox(
  opts: { label?: string; size?: number; rounded?: boolean } = {}
): HTMLElement {
  const { label, size = 72, rounded = true } = opts;
  const box = document.createElement("div");
  box.className = "demo-box";
  box.style.width = `${size}px`;
  box.style.height = `${size}px`;
  box.style.borderRadius = rounded ? "16px" : "4px";
  if (label) box.textContent = label;
  return box;
}

export function createDot(size = 20): HTMLElement {
  const dot = document.createElement("div");
  dot.className = "demo-dot";
  dot.style.width = `${size}px`;
  dot.style.height = `${size}px`;
  return dot;
}

/** Maps a friendly easing key to a CSS timing function string. */
export const EASINGS: Record<string, string> = {
  linear: "linear",
  "ease-out": "cubic-bezier(0.16, 1, 0.3, 1)",
  "ease-in": "cubic-bezier(0.7, 0, 0.84, 0)",
  "ease-in-out": "cubic-bezier(0.65, 0, 0.35, 1)",
  "ease-out-soft": "cubic-bezier(0.25, 1, 0.5, 1)",
  spring: "cubic-bezier(0.34, 1.56, 0.64, 1)",
};

/** Motion bezier arrays, matching the EASINGS above where possible. */
export const EASING_ARRAYS: Record<string, [number, number, number, number]> = {
  linear: [0, 0, 1, 1],
  "ease-out": [0.16, 1, 0.3, 1],
  "ease-in": [0.7, 0, 0.84, 0],
  "ease-in-out": [0.65, 0, 0.35, 1],
  "ease-out-soft": [0.25, 1, 0.5, 1],
  spring: [0.34, 1.56, 0.64, 1],
};

export function num(p: Record<string, unknown>, key: string, fallback: number): number {
  const v = p[key];
  return typeof v === "number" ? v : fallback;
}

export function str(p: Record<string, unknown>, key: string, fallback: string): string {
  const v = p[key];
  return typeof v === "string" ? v : fallback;
}

export function bool(p: Record<string, unknown>, key: string, fallback: boolean): boolean {
  const v = p[key];
  return typeof v === "boolean" ? v : fallback;
}
