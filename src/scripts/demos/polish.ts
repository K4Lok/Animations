import { animate } from "./anim";
import type { DemoFactory } from "./types";
import { clearStage, createBox, dt, num, str, bool } from "./utils";
import { elem, frame, gradientFor, imageTile, textLine } from "./kit";

const EASE_OUT: [number, number, number, number] = [0.16, 1, 0.3, 1];

const blur: DemoFactory = (stage) => {
  clearStage(stage);
  const box = createBox({ label: dt("Hi") });
  stage.append(box);
  return {
    play(p) {
      const b = num(p, "blur", 10);
      animate(box, { filter: [`blur(${b}px)`, "blur(0px)"], opacity: [0, 1] }, { duration: num(p, "duration", 0.8) });
    },
    code: (p) => `animate(el, { filter: ["blur(${num(p, "blur", 10)}px)", "blur(0px)"] });`,
  };
};

const SHAPES: Record<string, [string, string]> = {
  circle: ["circle(0% at 50% 50%)", "circle(75% at 50% 50%)"],
  inset: ["inset(50% 50% 50% 50%)", "inset(0% 0% 0% 0%)"],
  diamond: ["polygon(50% 50%, 50% 50%, 50% 50%, 50% 50%)", "polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)"],
};

const clipPath: DemoFactory = (stage) => {
  clearStage(stage);
  const box = createBox({ label: "", size: 120 });
  box.style.background = "var(--gradient-phoenix)";
  stage.append(box);
  return {
    play(p) {
      const [from, to] = SHAPES[str(p, "shape", "circle")] ?? SHAPES.circle;
      animate(box, { clipPath: [from, to] }, { duration: num(p, "duration", 0.8), ease: [0.16, 1, 0.3, 1] });
    },
    code: (p) => {
      const [from, to] = SHAPES[str(p, "shape", "circle")] ?? SHAPES.circle;
      return `animate(el, { clipPath: ["${from}", "${to}"] });`;
    },
  };
};

const mask: DemoFactory = (stage) => {
  clearStage(stage);
  const box = document.createElement("div");
  box.className = "demo-mask";
  box.textContent = dt("Soft mask");
  stage.append(box);
  return {
    play(p) {
      animate(
        box,
        { maskPosition: ["120% 0", "0% 0"], WebkitMaskPosition: ["120% 0", "0% 0"] } as any,
        { duration: num(p, "duration", 1.2), ease: [0.16, 1, 0.3, 1] }
      );
    },
    code: () => `// gradient mask with soft, fadeable edges\nanimate(el, { maskPosition: ["120% 0", "0% 0"] });`,
  };
};

const beforeAfter: DemoFactory = (stage) => {
  clearStage(stage);
  const wrap = document.createElement("div");
  wrap.className = "demo-ba";
  const before = document.createElement("div");
  before.className = "demo-ba__layer demo-ba__before";
  before.textContent = dt("AFTER");
  const after = document.createElement("div");
  after.className = "demo-ba__layer demo-ba__after";
  after.textContent = dt("BEFORE");
  const handle = document.createElement("div");
  handle.className = "demo-ba__handle";
  wrap.append(before, after, handle);
  stage.append(wrap);
  let pos = 0.5;
  const apply = () => {
    after.style.clipPath = `inset(0 ${(1 - pos) * 100}% 0 0)`;
    handle.style.left = `${pos * 100}%`;
  };
  apply();
  let dragging = false;
  const set = (clientX: number) => {
    const rect = wrap.getBoundingClientRect();
    pos = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    apply();
  };
  wrap.addEventListener("pointerdown", (e) => {
    dragging = true;
    wrap.setPointerCapture(e.pointerId);
    set(e.clientX);
  });
  wrap.addEventListener("pointermove", (e) => dragging && set(e.clientX));
  wrap.addEventListener("pointerup", () => (dragging = false));
  return { play() {}, continuous: true, code: () => `// divider drives a clip-path on the top layer\nafter.style.clipPath = \`inset(0 \${(1 - pos) * 100}% 0 0)\`;` };
};

const lineDrawing: DemoFactory = (stage) => {
  clearStage(stage);
  const svgNS = "http://www.w3.org/2000/svg";
  const svg = document.createElementNS(svgNS, "svg");
  svg.setAttribute("viewBox", "0 0 100 100");
  svg.classList.add("demo-line__svg");
  const path = document.createElementNS(svgNS, "path");
  path.setAttribute("d", "M10 60 Q 30 10 50 50 T 90 40");
  path.setAttribute("class", "demo-line__path");
  svg.append(path);
  stage.append(svg);
  return {
    play(p) {
      const len = path.getTotalLength();
      path.style.strokeDasharray = String(len);
      animate(path, { strokeDashoffset: [len, 0] }, { duration: num(p, "duration", 1.6), ease: [0.16, 1, 0.3, 1] });
    },
    code: () => `path.style.strokeDasharray = length;\nanimate(path, { strokeDashoffset: [length, 0] });`,
  };
};

const textMorph: DemoFactory = (stage) => {
  clearStage(stage);
  const el = document.createElement("div");
  el.className = "demo-bignum";
  const words = ["12:04", "12:05", "12:06", "12:07"];
  let i = 0;
  el.textContent = words[0];
  stage.append(el);
  return {
    play() {
      i = (i + 1) % words.length;
      const next = words[i];
      const out = el.cloneNode(true) as HTMLElement;
      out.style.position = "absolute";
      el.parentElement?.append(out);
      el.textContent = next;
      animate(el, { y: [14, 0], opacity: [0, 1] }, { duration: 0.35, ease: [0.16, 1, 0.3, 1] });
      animate(out, { y: [0, -14], opacity: [1, 0] }, { duration: 0.35 }).then(() => out.remove());
    },
    code: () => `// old value slides out, new slides in\nanimate(out, { y: -14, opacity: 0 });\nanimate(in,  { y: [14, 0], opacity: [0, 1] });`,
  };
};

const skeleton: DemoFactory = (stage) => {
  clearStage(stage);
  const card = document.createElement("div");
  card.className = "demo-skel";
  card.innerHTML = `<div class="demo-skel__line" style="width:60%"></div><div class="demo-skel__line" style="width:100%"></div><div class="demo-skel__line" style="width:80%"></div>`;
  stage.append(card);
  return {
    play(p) {
      card.style.setProperty("--shimmer", `${num(p, "speed", 1.4)}s`);
    },
    continuous: true,
    code: (p) => `/* moving sheen */\n.skeleton { animation: shimmer ${num(p, "speed", 1.4)}s linear infinite; }`,
  };
};

const numberTicker: DemoFactory = (stage) => {
  clearStage(stage);
  const el = document.createElement("div");
  el.className = "demo-bignum demo-bignum--tabular";
  el.textContent = "0";
  stage.append(el);
  return {
    play(p) {
      const target = Math.round(num(p, "target", 4096));
      animate(0, target, {
        duration: num(p, "duration", 1.4),
        ease: [0.16, 1, 0.3, 1],
        onUpdate: (v: number) => (el.textContent = Math.round(v).toLocaleString()),
      });
    },
    code: (p) => `animate(0, ${Math.round(num(p, "target", 4096))}, {\n  onUpdate: (v) => el.textContent = Math.round(v),\n});`,
  };
};

const tabularNumbers: DemoFactory = (stage) => {
  clearStage(stage);
  const el = document.createElement("div");
  el.className = "demo-bignum";
  const cap = document.createElement("div");
  cap.className = "demo-caption";
  stage.append(el, cap);
  let timer: number | undefined;
  return {
    play(p) {
      const tab = bool(p, "tabular", true);
      el.style.fontVariantNumeric = tab ? "tabular-nums" : "normal";
      cap.textContent = tab ? dt("tabular-nums → digits never shift") : dt("proportional → watch the width jitter");
      clearInterval(timer);
      timer = window.setInterval(() => {
        el.textContent = String(Math.floor(Math.random() * 9000) + 1000);
      }, 220);
    },
    cleanup: () => clearInterval(timer),
    continuous: true,
    code: () => `el.style.fontVariantNumeric = "tabular-nums";`,
  };
};

const typewriter: DemoFactory = (stage) => {
  clearStage(stage);
  const el = document.createElement("div");
  el.className = "demo-type";
  el.innerHTML = `<span class="demo-type__text"></span><span class="demo-type__caret"></span>`;
  const textEl = el.querySelector(".demo-type__text") as HTMLElement;
  stage.append(el);
  const full = dt("Text appears one character at a time…");
  let timer: number | undefined;
  return {
    play(p) {
      clearInterval(timer);
      textEl.textContent = "";
      let i = 0;
      const speed = num(p, "speed", 60);
      timer = window.setInterval(() => {
        textEl.textContent = full.slice(0, ++i);
        if (i >= full.length) clearInterval(timer);
      }, speed);
    },
    cleanup: () => clearInterval(timer),
    code: (p) => `setInterval(() => {\n  text.textContent = full.slice(0, ++i);\n}, ${num(p, "speed", 60)});`,
  };
};

/* ---- realistic "use case" variants ---- */

// Progressive image load (blur-up / LQIP): a photo arrives blurred and slightly
// zoomed, then sharpens to crisp. Play-driven so the hover-loop replays it; the
// frame is also click-to-replay.
const blurUseCase: DemoFactory = (stage) => {
  clearStage(stage);
  const f = frame("width:210px;height:124px;cursor:pointer");
  const tile = imageTile({ i: 1, radius: 0 });
  tile.style.cssText += ";position:absolute;inset:0";
  const cap = elem("span", "uikit-tile__cap", "position:absolute;left:0;bottom:0;z-index:1");
  cap.textContent = dt("Sunrise.jpg");
  f.append(tile, cap);
  stage.append(f);
  let running = false;
  const run = (p: Record<string, unknown>) => {
    if (running) return;
    running = true;
    const b = num(p, "blur", 10);
    animate(
      tile,
      { filter: [`blur(${b}px)`, "blur(0px)"], scale: [1.06, 1], opacity: [0.4, 1] },
      { duration: num(p, "duration", 0.8), ease: EASE_OUT }
    ).then(() => (running = false));
  };
  let last: Record<string, unknown> = {};
  f.addEventListener("click", () => run(last));
  return {
    play(p) {
      last = p;
      run(p);
    },
    code: (p) =>
      `// low-res placeholder sharpens as the full image loads\nanimate(img, {\n  filter: ["blur(${num(p, "blur", 10)}px)", "blur(0px)"],\n  scale: [1.06, 1], opacity: [0.4, 1],\n});`,
  };
};

const SHAPES_UC: Record<string, [string, string]> = SHAPES;

// A promo card whose photo reveals via the chosen clip shape, paired with a
// zoom + fade so it reads as content developing in (not just a color bar).
const clipPathUseCase: DemoFactory = (stage) => {
  clearStage(stage);
  const f = frame("width:210px;height:124px;cursor:pointer");
  const win = elem("div", undefined, "position:absolute;inset:0;overflow:hidden");
  const tile = imageTile({ i: 4, radius: 0 });
  tile.style.cssText += ";position:absolute;inset:0";
  win.append(tile);
  const cap = elem("span", "uikit-tile__cap", "position:absolute;left:0;bottom:0;z-index:1;opacity:0;pointer-events:none");
  cap.textContent = dt("Now live");
  f.append(win, cap);
  stage.append(f);
  let running = false;
  const run = (p: Record<string, unknown>) => {
    if (running) return;
    running = true;
    const [from, to] = SHAPES_UC[str(p, "shape", "circle")] ?? SHAPES_UC.circle;
    const dur = num(p, "duration", 0.8);
    win.style.clipPath = from;
    cap.style.opacity = "0";
    animate(win, { clipPath: [from, to] }, { duration: dur, ease: EASE_OUT });
    animate(tile, { scale: [1.18, 1], opacity: [0.35, 1] }, { duration: dur, ease: EASE_OUT }).then(() => {
      running = false;
      animate(cap, { opacity: [0, 1] }, { duration: 0.25 });
    });
  };
  let last: Record<string, unknown> = {};
  f.addEventListener("click", () => run(last));
  return {
    play(p) {
      last = p;
      run(p);
    },
    code: (p) => {
      const [from, to] = SHAPES_UC[str(p, "shape", "circle")] ?? SHAPES_UC.circle;
      return `// the clip opens while the photo zooms in\nanimate(window, { clipPath: ["${from}", "${to}"] });\nanimate(photo,  { scale: [1.18, 1], opacity: [0.35, 1] });`;
    },
  };
};

// A "Pro" upgrade label with a highlight sheen that sweeps across via a gradient
// mask — the classic shimmer that draws the eye. Play-driven replay.
const maskUseCase: DemoFactory = (stage) => {
  clearStage(stage);
  const card = frame("width:210px;padding:16px 14px;display:flex;align-items:center;gap:10px");
  const badge = elem(
    "span",
    undefined,
    "flex:none;display:grid;place-items:center;width:26px;height:26px;border-radius:8px;color:#fff;font-size:13px;font-weight:700;line-height:1"
  );
  badge.style.background = gradientFor(3);
  badge.textContent = "★";
  const head = elem(
    "span",
    undefined,
    "font-size:18px;font-weight:700;letter-spacing:-0.4px;color:var(--color-midnight-ink);" +
      "-webkit-mask-image:linear-gradient(90deg,transparent 0%,#000 38%,#000 62%,transparent 100%);" +
      "mask-image:linear-gradient(90deg,transparent 0%,#000 38%,#000 62%,transparent 100%);" +
      "-webkit-mask-size:200% 100%;mask-size:200% 100%"
  );
  head.textContent = dt("Upgrade to Pro");
  card.append(badge, head);
  stage.append(card);
  return {
    play(p) {
      animate(
        head,
        { maskPosition: ["120% 0", "0% 0"], WebkitMaskPosition: ["120% 0", "0% 0"] } as any,
        { duration: num(p, "duration", 1.2), ease: EASE_OUT }
      );
    },
    code: () => `// a gradient mask sweeps a sheen across the label\nanimate(label, { maskPosition: ["120% 0", "0% 0"] });`,
  };
};

// A real photo before/after slider: two image tiles with a draggable divider
// clipping the "after" layer.
const beforeAfterUseCase: DemoFactory = (stage) => {
  clearStage(stage);
  const wrap = elem(
    "div",
    undefined,
    "position:relative;width:210px;height:132px;border-radius:14px;overflow:hidden;box-shadow:var(--shadow-floating);user-select:none;-webkit-user-select:none;touch-action:none;cursor:ew-resize"
  );
  const before = imageTile({ i: 5, radius: 0 });
  before.style.cssText += ";position:absolute;inset:0;filter:grayscale(1) brightness(1.05)";
  const after = imageTile({ i: 1, radius: 0 });
  after.style.cssText += ";position:absolute;inset:0";
  const pill = (text: string, side: "left" | "right") => {
    const p = elem(
      "span",
      undefined,
      `position:absolute;top:8px;${side}:8px;z-index:2;padding:2px 8px;border-radius:999px;font-size:10px;font-weight:600;letter-spacing:0.4px;color:var(--color-midnight-ink);background:rgba(255,255,255,0.82);backdrop-filter:blur(4px)`
    );
    p.textContent = text;
    return p;
  };
  const handle = elem(
    "div",
    undefined,
    "position:absolute;top:0;bottom:0;width:2px;background:#fff;transform:translateX(-50%);pointer-events:none;z-index:3"
  );
  const knob = elem(
    "div",
    undefined,
    "position:absolute;top:50%;left:50%;width:24px;height:24px;transform:translate(-50%,-50%);border-radius:999px;background:#fff;box-shadow:var(--shadow-floating)"
  );
  handle.append(knob);
  wrap.append(before, after, pill(dt("BEFORE"), "left"), pill(dt("AFTER"), "right"), handle);
  stage.append(wrap);
  let pos = 0.5;
  const apply = () => {
    after.style.clipPath = `inset(0 ${(1 - pos) * 100}% 0 0)`;
    handle.style.left = `${pos * 100}%`;
  };
  apply();
  let dragging = false;
  const set = (clientX: number) => {
    const rect = wrap.getBoundingClientRect();
    pos = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    apply();
  };
  wrap.addEventListener("pointerdown", (e) => {
    dragging = true;
    wrap.setPointerCapture(e.pointerId);
    set(e.clientX);
  });
  wrap.addEventListener("pointermove", (e) => dragging && set(e.clientX));
  wrap.addEventListener("pointerup", () => (dragging = false));
  return {
    play() {},
    continuous: true,
    code: () => `// drag the divider → clip the top photo\nafter.style.clipPath = \`inset(0 \${(1 - pos) * 100}% 0 0)\`;`,
  };
};

// A "payment success" confirmation: an SVG checkmark draws itself inside a ring.
// Play-driven replay; a Pay button also triggers the draw.
const lineDrawingUseCase: DemoFactory = (stage) => {
  clearStage(stage);
  const card = frame("width:210px;padding:16px;display:flex;flex-direction:column;align-items:center;gap:10px");
  const svgNS = "http://www.w3.org/2000/svg";
  const svg = document.createElementNS(svgNS, "svg");
  svg.setAttribute("viewBox", "0 0 52 52");
  svg.setAttribute("width", "52");
  svg.setAttribute("height", "52");
  const ring = document.createElementNS(svgNS, "circle");
  ring.setAttribute("cx", "26");
  ring.setAttribute("cy", "26");
  ring.setAttribute("r", "24");
  ring.setAttribute("fill", "none");
  ring.setAttribute("stroke", "var(--color-deliver-green)");
  ring.setAttribute("stroke-width", "3");
  const tick = document.createElementNS(svgNS, "path");
  tick.setAttribute("d", "M15 27 L23 35 L38 18");
  tick.setAttribute("fill", "none");
  tick.setAttribute("stroke", "var(--color-deliver-green)");
  tick.setAttribute("stroke-width", "4");
  tick.setAttribute("stroke-linecap", "round");
  tick.setAttribute("stroke-linejoin", "round");
  svg.append(ring, tick);
  const label = elem("span", undefined, "font-size:13px;font-weight:600;color:var(--color-midnight-ink);opacity:0");
  label.textContent = dt("Payment complete");
  const pay = elem("button", "demo-trigger demo-trigger--solid demo-trigger--sm", "cursor:pointer") as HTMLButtonElement;
  pay.textContent = dt("Pay $42.00");
  card.append(svg, label, pay);
  stage.append(card);
  let running = false;
  const run = (p: Record<string, unknown>) => {
    if (running) return;
    running = true;
    const dur = num(p, "duration", 1.6);
    const rl = ring.getTotalLength();
    const tl = tick.getTotalLength();
    ring.style.strokeDasharray = String(rl);
    tick.style.strokeDasharray = String(tl);
    label.style.opacity = "0";
    animate(ring, { strokeDashoffset: [rl, 0] }, { duration: dur * 0.45, ease: EASE_OUT });
    animate(tick, { strokeDashoffset: [tl, 0] }, { duration: dur * 0.55, delay: dur * 0.45, ease: EASE_OUT }).then(() => {
      running = false;
      animate(label, { opacity: [0, 1], y: [4, 0] }, { duration: 0.25 });
    });
  };
  let last: Record<string, unknown> = {};
  pay.addEventListener("click", () => run(last));
  return {
    play(p) {
      last = p;
      run(p);
    },
    code: () => `// tap Pay → the checkmark draws itself in\ntick.style.strokeDasharray = length;\nanimate(tick, { strokeDashoffset: [length, 0] });`,
  };
};

// A live stat cell (like a departures board): the value updates with the old
// digits sliding up/out and the new ones sliding in. Play advances the value.
const textMorphUseCase: DemoFactory = (stage) => {
  clearStage(stage);
  const card = frame("width:210px;padding:14px;display:flex;flex-direction:column;gap:6px");
  const caption = elem("span", undefined, "font-size:11px;font-weight:500;color:var(--color-muted-ash)");
  caption.textContent = dt("Today's revenue");
  const cell = elem(
    "div",
    undefined,
    "position:relative;height:34px;overflow:hidden;font-size:28px;font-weight:700;letter-spacing:-0.5px;color:var(--color-midnight-ink);font-variant-numeric:tabular-nums"
  );
  const values = ["$1,240", "$1,318", "$1,402", "$1,477"];
  let i = 0;
  const val = elem("span", undefined, "display:block");
  val.textContent = values[0];
  cell.append(val);
  card.append(caption, cell);
  stage.append(card);
  let current = val;
  return {
    play() {
      i = (i + 1) % values.length;
      const out = current;
      const incoming = elem("span", undefined, "display:block;position:absolute;inset:0");
      incoming.textContent = values[i];
      cell.append(incoming);
      animate(out, { y: [0, -34], opacity: [1, 0] }, { duration: 0.35, ease: EASE_OUT }).then(() => out.remove());
      animate(incoming, { y: [34, 0], opacity: [0, 1] }, { duration: 0.35, ease: EASE_OUT });
      current = incoming;
    },
    code: () => `// old figure slides up & out, new slides in\nanimate(out, { y: -34, opacity: 0 });\nanimate(in,  { y: [34, 0], opacity: [0, 1] });`,
  };
};

// A feed card that shows a shimmering skeleton, then resolves to real content.
// Continuous: it reloads itself on a timer so the shimmer is always visible.
const skeletonUseCase: DemoFactory = (stage) => {
  clearStage(stage);
  const card = frame("width:210px;height:150px;padding:14px");
  const skel = elem("div", undefined, "display:flex;flex-direction:column;gap:12px");
  const skelLine = (w: string, h = 12) => {
    const l = elem("div", "demo-skel__line");
    l.style.width = w;
    l.style.height = `${h}px`;
    return l;
  };
  const skelImg = elem("div", "demo-skel__line", "width:100%;height:60px;border-radius:10px");
  skel.append(skelImg, skelLine("60%"), skelLine("90%"));
  const real = elem("div", undefined, "display:flex;flex-direction:column;gap:9px;opacity:0;pointer-events:none");
  const img = imageTile({ i: 2, radius: 10 });
  img.style.cssText += ";width:100%;height:60px";
  const title = elem("span", undefined, "font-size:13px;font-weight:600;color:var(--color-midnight-ink)");
  title.textContent = dt("Aurora over the fjords");
  real.append(img, title, textLine(150, 0.7));
  card.append(skel, real);
  stage.append(card);
  let timer: number | undefined;
  const cycle = () => {
    skel.style.display = "flex";
    skel.style.opacity = "1";
    real.style.opacity = "0";
    timer = window.setTimeout(() => {
      animate(skel, { opacity: [1, 0] }, { duration: 0.3 }).then(() => (skel.style.display = "none"));
      animate(real, { opacity: [0, 1], y: [6, 0] }, { duration: 0.4, ease: EASE_OUT });
      timer = window.setTimeout(cycle, 2200);
    }, 1500);
  };
  return {
    play(p) {
      card.style.setProperty("--shimmer", `${num(p, "speed", 1.4)}s`);
      clearTimeout(timer);
      cycle();
    },
    cleanup: () => clearTimeout(timer),
    continuous: true,
    code: (p) =>
      `/* shimmering placeholders, then real content fades in */\n.skeleton { animation: shimmer ${num(p, "speed", 1.4)}s linear infinite; }`,
  };
};

// A dashboard stat card that counts up to the target with tabular figures.
const numberTickerUseCase: DemoFactory = (stage) => {
  clearStage(stage);
  const card = frame("width:210px;padding:16px 14px;display:flex;flex-direction:column;gap:6px");
  const caption = elem("span", undefined, "font-size:11px;font-weight:500;color:var(--color-muted-ash)");
  caption.textContent = dt("Total revenue");
  const row = elem("div", undefined, "display:flex;align-items:baseline;gap:6px");
  const sign = elem("span", undefined, "font-size:22px;font-weight:700;color:var(--color-midnight-ink)");
  sign.textContent = "$";
  const num$ = elem(
    "span",
    undefined,
    "font-size:30px;font-weight:700;letter-spacing:-0.5px;color:var(--color-midnight-ink);font-variant-numeric:tabular-nums"
  );
  num$.textContent = "0";
  const delta = elem("span", undefined, "margin-left:auto;font-size:11px;font-weight:600;color:var(--color-deliver-green)");
  delta.textContent = dt("+12.4%");
  row.append(sign, num$, delta);
  card.append(caption, row);
  stage.append(card);
  return {
    play(p) {
      const target = Math.round(num(p, "target", 4096));
      animate(0, target, {
        duration: num(p, "duration", 1.4),
        ease: EASE_OUT,
        onUpdate: (v: number) => (num$.textContent = Math.round(v).toLocaleString()),
      });
    },
    code: (p) => `animate(0, ${Math.round(num(p, "target", 4096))}, {\n  onUpdate: (v) => stat.textContent = Math.round(v).toLocaleString(),\n});`,
  };
};

// A stopwatch (mm:ss.cs) updating rapidly. With tabular on, digits never shift;
// off, the width jitters. Continuous; keeps the genuine toggle.
const tabularNumbersUseCase: DemoFactory = (stage) => {
  clearStage(stage);
  const card = frame("width:210px;padding:16px 14px;display:flex;flex-direction:column;gap:8px;align-items:center");
  const caption = elem("span", undefined, "font-size:11px;font-weight:500;color:var(--color-muted-ash);align-self:flex-start");
  caption.textContent = dt("Lap timer");
  const clock = elem("div", undefined, "font-size:34px;font-weight:700;letter-spacing:-0.5px;color:var(--color-midnight-ink)");
  card.append(caption, clock);
  stage.append(card);
  let timer: number | undefined;
  let start = 0;
  const fmt = (ms: number) => {
    const cs = Math.floor((ms % 1000) / 10);
    const s = Math.floor(ms / 1000) % 60;
    const m = Math.floor(ms / 60000);
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${pad(m)}:${pad(s)}.${pad(cs)}`;
  };
  return {
    play(p) {
      const tab = bool(p, "tabular", true);
      clock.style.fontVariantNumeric = tab ? "tabular-nums" : "normal";
      clearInterval(timer);
      start = performance.now();
      timer = window.setInterval(() => {
        clock.textContent = fmt(performance.now() - start);
      }, 33);
    },
    cleanup: () => clearInterval(timer),
    continuous: true,
    code: () => `// tabular figures keep every digit the same width\nclock.style.fontVariantNumeric = "tabular-nums";`,
  };
};

// An AI assistant chat bubble typing out a reply one character at a time, with a
// blinking caret. speed = ms per char. Replays like the abstract.
const typewriterUseCase: DemoFactory = (stage) => {
  clearStage(stage);
  const wrap = elem("div", undefined, "display:flex;flex-direction:column;gap:8px;width:210px");
  const meta = elem("div", undefined, "display:flex;align-items:center;gap:7px");
  const avatar = elem(
    "span",
    undefined,
    "flex:none;display:grid;place-items:center;width:22px;height:22px;border-radius:999px;color:#fff;font-size:11px;font-weight:700"
  );
  avatar.style.background = gradientFor(4);
  avatar.textContent = "AI";
  const who = elem("span", undefined, "font-size:11px;font-weight:600;color:var(--color-muted-ash)");
  who.textContent = dt("Assistant");
  meta.append(avatar, who);
  const bubble = elem(
    "div",
    undefined,
    "align-self:flex-start;max-width:100%;padding:10px 12px;border-radius:14px 14px 14px 4px;background:var(--color-whisper-gray);font-size:13px;line-height:1.45;color:var(--color-midnight-ink)"
  );
  const textEl = elem("span");
  const caret = elem("span", "demo-type__caret", "vertical-align:text-bottom;height:1em");
  bubble.append(textEl, caret);
  wrap.append(meta, bubble);
  stage.append(wrap);
  const full = dt("Sure — I can help with that. Here's a quick summary…");
  let timer: number | undefined;
  return {
    play(p) {
      clearInterval(timer);
      textEl.textContent = "";
      let i = 0;
      const speed = num(p, "speed", 60);
      timer = window.setInterval(() => {
        textEl.textContent = full.slice(0, ++i);
        if (i >= full.length) clearInterval(timer);
      }, speed);
    },
    cleanup: () => clearInterval(timer),
    code: (p) => `// the reply streams in one character at a time\nsetInterval(() => {\n  text.textContent = reply.slice(0, ++i);\n}, ${num(p, "speed", 60)});`,
  };
};

export const demos: Record<string, DemoFactory> = {
  blur,
  clipPath,
  mask,
  beforeAfter,
  lineDrawing,
  textMorph,
  skeleton,
  numberTicker,
  tabularNumbers,
  typewriter,
  blurUseCase,
  clipPathUseCase,
  maskUseCase,
  beforeAfterUseCase,
  lineDrawingUseCase,
  textMorphUseCase,
  skeletonUseCase,
  numberTickerUseCase,
  tabularNumbersUseCase,
  typewriterUseCase,
};
