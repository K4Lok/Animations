import { animate } from "./anim";
import type { DemoFactory } from "./types";
import { clearStage, createBox, dt, num } from "./utils";
import { elem, frame, gradientFor, imageTile, listRow } from "./kit";

const EASE_OUT: [number, number, number, number] = [0.16, 1, 0.3, 1];

const hint = (text: string) => {
  const el = document.createElement("div");
  el.className = "demo-caption";
  el.textContent = text;
  return el;
};

const hover: DemoFactory = (stage) => {
  clearStage(stage);
  const box = createBox({ label: dt("Hover") });
  box.style.transition = "transform .25s cubic-bezier(0.34,1.56,0.64,1), box-shadow .25s ease";
  box.style.cursor = "pointer";
  box.addEventListener("pointerenter", () => {
    box.style.transform = "scale(1.1) translateY(-4px)";
    box.style.boxShadow = "var(--shadow-xl)";
  });
  box.addEventListener("pointerleave", () => {
    box.style.transform = "";
    box.style.boxShadow = "";
  });
  stage.append(box, hint(dt("Move your cursor over the box")));
  return { play() {}, continuous: true, code: () => `el:hover { transform: scale(1.1) translateY(-4px); }` };
};

const press: DemoFactory = (stage) => {
  clearStage(stage);
  const btn = document.createElement("button");
  btn.className = "demo-trigger demo-trigger--solid";
  btn.textContent = dt("Press me");
  btn.style.transition = "transform .12s ease";
  const down = () => (btn.style.transform = "scale(0.94)");
  const up = () => (btn.style.transform = "");
  btn.addEventListener("pointerdown", down);
  btn.addEventListener("pointerup", up);
  btn.addEventListener("pointerleave", up);
  stage.append(btn, hint(dt("Click and hold")));
  return { play() {}, continuous: true, code: () => `el:active { transform: scale(0.94); }` };
};

const holdToConfirm: DemoFactory = (stage) => {
  clearStage(stage);
  const btn = document.createElement("button");
  btn.className = "demo-trigger demo-trigger--solid demo-hold";
  btn.innerHTML = `<span class="demo-hold__fill"></span><span class="demo-hold__label">${dt("Hold to confirm")}</span>`;
  const fill = btn.querySelector(".demo-hold__fill") as HTMLElement;
  const label = btn.querySelector(".demo-hold__label") as HTMLElement;
  let hold = 1.2;
  let anim: { stop: () => void } | null = null;
  const start = () => {
    anim = animate(fill, { width: ["0%", "100%"] }, { duration: hold, ease: "linear" });
    (anim as any).then?.(() => {
      label.textContent = dt("Confirmed ✓");
      setTimeout(() => (label.textContent = dt("Hold to confirm")), 900);
    });
  };
  const cancel = () => {
    anim?.stop();
    animate(fill, { width: "0%" }, { duration: 0.2 });
  };
  btn.addEventListener("pointerdown", start);
  btn.addEventListener("pointerup", cancel);
  btn.addEventListener("pointerleave", cancel);
  stage.append(btn, hint(dt("Press and hold until it fills")));
  return {
    play(p) {
      hold = num(p, "hold", 1.2);
    },
    continuous: true,
    code: () => `pointerdown → animate(fill, { width: "100%" }, { duration: hold });\npointerup before done → cancel + reset`,
  };
};

function draggable(el: HTMLElement, opts: { onRelease?: (vx: number, vy: number) => void; axis?: "x" | "y" | "both" } = {}) {
  let startX = 0,
    startY = 0,
    lastX = 0,
    lastY = 0,
    lastT = 0,
    vx = 0,
    vy = 0,
    dragging = false;
  const axis = opts.axis ?? "both";
  el.style.touchAction = "none";
  el.style.cursor = "grab";
  el.addEventListener("pointerdown", (e) => {
    dragging = true;
    el.setPointerCapture(e.pointerId);
    el.style.cursor = "grabbing";
    startX = e.clientX - lastX;
    startY = e.clientY - lastY;
    lastT = performance.now();
  });
  el.addEventListener("pointermove", (e) => {
    if (!dragging) return;
    const nx = axis === "y" ? 0 : e.clientX - startX;
    const ny = axis === "x" ? 0 : e.clientY - startY;
    const now = performance.now();
    const dt = Math.max(now - lastT, 1);
    vx = ((nx - lastX) / dt) * 1000;
    vy = ((ny - lastY) / dt) * 1000;
    lastX = nx;
    lastY = ny;
    lastT = now;
    el.style.transform = `translate(${nx}px, ${ny}px)`;
  });
  const end = () => {
    if (!dragging) return;
    dragging = false;
    el.style.cursor = "grab";
    opts.onRelease?.(vx, vy);
  };
  el.addEventListener("pointerup", end);
  el.addEventListener("pointercancel", end);
  return {
    reset() {
      lastX = lastY = 0;
      el.style.transform = "translate(0px, 0px)";
    },
    setPos(x: number, y: number) {
      lastX = x;
      lastY = y;
      el.style.transform = `translate(${x}px, ${y}px)`;
    },
    get pos() {
      return { x: lastX, y: lastY };
    },
  };
}

const drag: DemoFactory = (stage) => {
  clearStage(stage);
  const box = createBox({ label: dt("Drag") });
  stage.append(box, hint(dt("Throw the box — it carries momentum")));
  const d = draggable(box, {
    onRelease: (vx, vy) => {
      const { x, y } = d.pos;
      animate(box, { x: [x, 0], y: [y, 0] }, { type: "spring", velocity: Math.hypot(vx, vy), stiffness: 200, damping: 22 }).then(() => d.reset());
    },
  });
  return { play() {}, continuous: true, code: () => `onRelease(velocity) =>\n  animate(el, { x: 0, y: 0 }, { type: "spring", velocity });` };
};

const dragReorder: DemoFactory = (stage) => {
  clearStage(stage);
  const list = document.createElement("div");
  list.style.cssText = "position:relative;display:flex;flex-direction:column;gap:8px;width:200px";
  [dt("Design"), dt("Build"), dt("Ship"), dt("Learn")].forEach((t) => {
    const row = document.createElement("div");
    row.className = "demo-row";
    row.textContent = t;
    list.append(row);
  });
  stage.append(list, hint(dt("Drag a row — the dashed slot shows where it lands")));

  let dragEl: HTMLElement | null = null;
  let placeholder: HTMLElement | null = null;
  let offsetY = 0;
  const siblingRows = () => [...list.querySelectorAll<HTMLElement>(".demo-row")].filter((r) => r !== dragEl);

  list.addEventListener("pointerdown", (e) => {
    const row = (e.target as HTMLElement).closest<HTMLElement>(".demo-row");
    if (!row || dragEl) return;
    const rect = row.getBoundingClientRect();
    offsetY = e.clientY - rect.top;
    list.setPointerCapture(e.pointerId);

    placeholder = document.createElement("div");
    placeholder.className = "demo-row-placeholder";
    placeholder.style.height = `${rect.height}px`;
    list.insertBefore(placeholder, row);

    dragEl = row;
    row.classList.add("is-dragging");
    row.style.position = "fixed";
    row.style.width = `${rect.width}px`;
    row.style.left = `${rect.left}px`;
    row.style.top = `${rect.top}px`;
    row.style.margin = "0";
    row.style.pointerEvents = "none";
  });

  list.addEventListener("pointermove", (e) => {
    if (!dragEl || !placeholder) return;
    dragEl.style.top = `${e.clientY - offsetY}px`;
    const siblings = siblingRows();
    const after = siblings.find((r) => {
      const rect = r.getBoundingClientRect();
      return e.clientY < rect.top + rect.height / 2;
    });
    const first = siblings.map((r) => r.getBoundingClientRect());
    if (after) list.insertBefore(placeholder, after);
    else list.append(placeholder);
    siblings.forEach((r, i) => {
      const dy = first[i].top - r.getBoundingClientRect().top;
      if (dy) animate(r, { y: [dy, 0] }, { type: "spring", stiffness: 600, damping: 40 });
    });
  });

  const end = () => {
    if (!dragEl || !placeholder) return;
    const el = dragEl;
    const ph = placeholder;
    const slot = ph.getBoundingClientRect();
    animate(el, { top: `${slot.top}px`, left: `${slot.left}px` }, { type: "spring", stiffness: 700, damping: 42 }).then(() => {
      list.insertBefore(el, ph);
      ph.remove();
      el.classList.remove("is-dragging");
      el.removeAttribute("style");
    });
    dragEl = null;
    placeholder = null;
  };
  list.addEventListener("pointerup", end);
  list.addEventListener("pointercancel", end);

  return {
    play() {},
    continuous: true,
    code: () => `// dashed placeholder marks the drop slot; FLIP the rest\nlist.insertBefore(placeholder, target);\nanimate(other, { y: [delta, 0] }, { type: "spring" });`,
  };
};

const swipeDismiss: DemoFactory = (stage) => {
  clearStage(stage);
  const toast = document.createElement("div");
  toast.className = "demo-toast";
  toast.textContent = dt("Swipe me away →");
  stage.append(toast, hint(dt("Drag horizontally past the edge to dismiss")));
  const d = draggable(toast, {
    axis: "x",
    onRelease: (vx) => {
      const { x } = d.pos;
      if (Math.abs(x) > 80 || Math.abs(vx) > 500) {
        const dir = x > 0 || vx > 0 ? 1 : -1;
        animate(toast, { x: [x, dir * 320], opacity: [1, 0] }, { duration: 0.3 }).then(() => {
          setTimeout(() => {
            d.setPos(0, 0);
            animate(toast, { opacity: [0, 1] }, { duration: 0.3 });
          }, 600);
        });
      } else {
        animate(toast, { x: [x, 0] }, { type: "spring", stiffness: 400, damping: 30 }).then(() => d.reset());
      }
    },
  });
  return { play() {}, continuous: true, code: () => `if (offset > threshold) animate(el, { x: 320, opacity: 0 });\nelse animate(el, { x: 0 }, { type: "spring" });` };
};

const rubberBanding: DemoFactory = (stage) => {
  clearStage(stage);
  const track = document.createElement("div");
  track.className = "demo-track";
  const box = createBox({ label: "", size: 48 });
  track.append(box);
  stage.append(track, hint(dt("Drag past the edges — it resists")));
  const limit = 60;
  let lastX = 0;
  box.style.touchAction = "none";
  box.style.cursor = "grab";
  let startX = 0,
    dragging = false;
  box.addEventListener("pointerdown", (e) => {
    dragging = true;
    box.setPointerCapture(e.pointerId);
    startX = e.clientX - lastX;
  });
  box.addEventListener("pointermove", (e) => {
    if (!dragging) return;
    let x = e.clientX - startX;
    if (Math.abs(x) > limit) {
      const over = Math.abs(x) - limit;
      x = Math.sign(x) * (limit + over * 0.25); // resistance
    }
    lastX = x;
    box.style.transform = `translateX(${x}px)`;
  });
  const end = () => {
    if (!dragging) return;
    dragging = false;
    const clamped = Math.max(-limit, Math.min(limit, lastX));
    animate(box, { x: [lastX, clamped] }, { type: "spring", stiffness: 500, damping: 30 });
    lastX = clamped;
  };
  box.addEventListener("pointerup", end);
  box.addEventListener("pointercancel", end);
  return { play() {}, continuous: true, code: () => `if (past edge) x = limit + overshoot * 0.25; // resistance\nonRelease → spring back to the boundary` };
};

const shake: DemoFactory = (stage) => {
  clearStage(stage);
  const field = document.createElement("div");
  field.className = "demo-field";
  field.textContent = dt("wrong password");
  stage.append(field);
  return {
    play(p) {
      const i = num(p, "intensity", 10);
      animate(field, { x: [0, -i, i, -i * 0.7, i * 0.7, -i * 0.4, 0] }, { duration: 0.45, ease: "easeInOut" });
    },
    code: (p) => `animate(el, { x: [0, -${num(p, "intensity", 10)}, ${num(p, "intensity", 10)}, ..., 0] }, { duration: 0.45 });`,
  };
};

const ripple: DemoFactory = (stage) => {
  clearStage(stage);
  const surface = document.createElement("button");
  surface.className = "demo-ripple-surface";
  surface.textContent = dt("Tap anywhere");
  surface.addEventListener("pointerdown", (e) => {
    const rect = surface.getBoundingClientRect();
    const r = document.createElement("span");
    r.className = "demo-ripple";
    const size = Math.max(rect.width, rect.height);
    r.style.width = r.style.height = `${size}px`;
    r.style.left = `${e.clientX - rect.left - size / 2}px`;
    r.style.top = `${e.clientY - rect.top - size / 2}px`;
    surface.append(r);
    animate(r, { scale: [0, 2], opacity: [0.4, 0] }, { duration: 0.6, ease: "easeOut" }).then(() => r.remove());
  });
  stage.append(surface);
  return { play() {}, continuous: true, code: () => `onPointerDown(e) => {\n  place circle at tap point;\n  animate(circle, { scale: [0, 2], opacity: [0.4, 0] });\n}` };
};

/* ---- realistic "use case" variants ---- */

// A product card in a grid lifts toward you on hover (CSS transition is fine).
const hoverUseCase: DemoFactory = (stage) => {
  clearStage(stage);
  const card = frame("width:170px;cursor:pointer;transition:transform .25s cubic-bezier(0.34,1.56,0.64,1),box-shadow .25s ease");
  const cover = imageTile({ i: 2, radius: 0 });
  cover.style.cssText += ";height:96px;transition:transform .35s ease";
  const cap = elem("div", undefined, "display:flex;flex-direction:column;gap:5px;padding:11px 12px 13px");
  const title = elem("span", undefined, "font-size:13px;font-weight:600;color:var(--color-midnight-ink)");
  title.textContent = dt("Aurora Headphones");
  const sub = elem("span", undefined, "font-size:11px;color:var(--color-muted-ash)");
  sub.textContent = dt("$149 · Free shipping");
  cap.append(title, sub);
  card.append(cover, cap);
  card.addEventListener("pointerenter", () => {
    card.style.transform = "translateY(-4px)";
    card.style.boxShadow = "var(--shadow-xl)";
    cover.style.transform = "scale(1.06)";
  });
  card.addEventListener("pointerleave", () => {
    card.style.transform = "";
    card.style.boxShadow = "";
    cover.style.transform = "";
  });
  stage.append(card);
  return {
    play() {},
    continuous: true,
    code: () => `// card lifts toward you on hover\nel:hover { transform: translateY(-4px); box-shadow: var(--shadow-xl); }`,
  };
};

// A primary "Add to cart" button that scales down while pressed.
const pressUseCase: DemoFactory = (stage) => {
  clearStage(stage);
  const card = frame("width:200px;padding:14px;display:flex;flex-direction:column;gap:11px");
  const title = elem("span", undefined, "font-size:13px;font-weight:600;color:var(--color-midnight-ink)");
  title.textContent = dt("Aurora Headphones");
  const price = elem("span", undefined, "font-size:12px;color:var(--color-muted-ash)");
  price.textContent = dt("$149");
  const btn = elem(
    "button",
    undefined,
    "display:flex;align-items:center;justify-content:center;gap:8px;width:100%;padding:11px;font:inherit;font-size:13px;font-weight:600;color:#fff;background:var(--color-midnight-ink);border:none;border-radius:11px;cursor:pointer;transition:transform .12s ease"
  );
  const bag = elem("span", undefined, "display:grid;place-items:center;width:16px;height:16px");
  bag.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>`;
  const label = elem("span");
  label.textContent = dt("Add to cart");
  btn.append(bag, label);
  card.append(title, price, btn);
  const down = () => (btn.style.transform = "scale(0.94)");
  const up = () => (btn.style.transform = "");
  btn.addEventListener("pointerdown", down);
  btn.addEventListener("pointerup", up);
  btn.addEventListener("pointerleave", up);
  stage.append(card);
  return {
    play() {},
    continuous: true,
    code: () => `// button presses in under your finger\nbtn:active { transform: scale(0.94); }`,
  };
};

// A "Hold to delete" settings row: holding fills a progress bar, then collapses
// the row via FLIP (never height). Releasing early cancels and resets.
const holdToConfirmUseCase: DemoFactory = (stage) => {
  clearStage(stage);
  const wrap = elem("div", undefined, "display:flex;flex-direction:column;gap:8px;width:210px");

  const buildRow = () => {
    const trash = elem("span", undefined, "display:grid;place-items:center;width:16px;height:16px");
    trash.innerHTML = `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--color-leadgen-red)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/></svg>`;
    const row = listRow({ i: 5, title: dt("Delete account"), sub: dt("Hold to confirm"), trailing: trash });
    row.style.cssText += ";position:relative;overflow:hidden;cursor:pointer;touch-action:none;user-select:none";
    const fill = elem("span", undefined, "position:absolute;inset:0 auto 0 0;width:0%;background:rgba(229,72,77,0.16);pointer-events:none");
    row.insertBefore(fill, row.firstChild);

    let hold = 1.2;
    let anim: { stop: () => void } | null = null;
    let done = false;
    const start = () => {
      if (done) return;
      anim = animate(fill, { width: ["0%", "100%"] }, { duration: hold, ease: "linear" });
      (anim as any).then?.((res: any) => {
        if (res === false || done) return;
        done = true;
        collapse(row);
      });
    };
    const cancel = () => {
      if (done) return;
      anim?.stop();
      animate(fill, { width: "0%" }, { duration: 0.2 });
    };
    row.addEventListener("pointerdown", start);
    row.addEventListener("pointerup", cancel);
    row.addEventListener("pointerleave", cancel);
    return { row, getHold: () => hold, setHold: (h: number) => (hold = h) };
  };

  let api = buildRow();
  wrap.append(api.row, hint(dt("Press and hold to delete — release early to cancel")));
  stage.append(wrap);

  // Collapse the outgoing row out of the way with a fade + slide (transforms,
  // not height), then rebuild a fresh row so the demo stays interactive.
  function collapse(row: HTMLElement) {
    const out = row;
    animate(out, { opacity: [1, 0], x: [0, 40] }, { duration: 0.35, ease: EASE_OUT }).then(() => {
      out.remove();
      const fresh = buildRow();
      fresh.setHold(api.getHold());
      api = fresh;
      wrap.insertBefore(fresh.row, wrap.firstChild);
      animate(fresh.row, { opacity: [0, 1], y: [-8, 0] }, { duration: 0.3, ease: EASE_OUT });
    });
  }

  return {
    play(p) {
      api.setHold(num(p, "hold", 1.2));
    },
    continuous: true,
    code: () => `pointerdown → animate(fill, { width: "100%" }, { duration: hold });\non complete → fade + slide the row away (FLIP, not height)`,
  };
};

// A flickable "now playing" mini-card you throw; it springs back with velocity.
const dragUseCase: DemoFactory = (stage) => {
  clearStage(stage);
  const card = frame("width:180px;padding:11px;display:flex;align-items:center;gap:10px;cursor:grab;will-change:transform");
  const art = elem("span", undefined, "flex:none;width:40px;height:40px;border-radius:9px");
  art.style.background = gradientFor(0);
  const text = elem("div", undefined, "display:flex;flex-direction:column;gap:4px;min-width:0");
  const t = elem("span", undefined, "font-size:12px;font-weight:600;color:var(--color-midnight-ink)");
  t.textContent = dt("Aurora");
  const s = elem("span", undefined, "font-size:10px;color:var(--color-muted-ash)");
  s.textContent = dt("Sam KaLok");
  text.append(t, s);
  const playGlyph = elem("span", undefined, "margin-left:auto;display:grid;place-items:center;width:20px;height:20px");
  playGlyph.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="var(--color-midnight-ink)"><path d="M8 5v14l11-7z"/></svg>`;
  card.append(art, text, playGlyph);
  stage.append(card, hint(dt("Throw the card — it springs back")));
  const d = draggable(card, {
    onRelease: (vx, vy) => {
      const { x, y } = d.pos;
      animate(card, { x: [x, 0], y: [y, 0] }, { type: "spring", velocity: Math.hypot(vx, vy), stiffness: 200, damping: 22 }).then(() => d.reset());
    },
  });
  return { play() {}, continuous: true, code: () => `onRelease(velocity) =>\n  animate(card, { x: 0, y: 0 }, { type: "spring", velocity });` };
};

// A real playlist reorder: drag a row by its grip; the dashed slot shows the drop.
const dragReorderUseCase: DemoFactory = (stage) => {
  clearStage(stage);
  const list = elem("div", undefined, "position:relative;display:flex;flex-direction:column;gap:8px;width:210px");
  const tracks = [
    [dt("Aurora"), dt("3:42")],
    [dt("Borealis"), dt("4:18")],
    [dt("Cascade"), dt("2:55")],
    [dt("Drift"), dt("3:09")],
  ];
  const grip = () => {
    const g = elem("span", "pg-grip", "display:grid;place-items:center;width:18px;height:18px;color:var(--color-muted-ash);cursor:grab");
    g.innerHTML = `<svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><circle cx="9" cy="6" r="1.6"/><circle cx="15" cy="6" r="1.6"/><circle cx="9" cy="12" r="1.6"/><circle cx="15" cy="12" r="1.6"/><circle cx="9" cy="18" r="1.6"/><circle cx="15" cy="18" r="1.6"/></svg>`;
    return g;
  };
  tracks.forEach(([title, dur], i) => {
    const time = elem("span", undefined, "font-size:11px;color:var(--color-muted-ash)");
    time.textContent = dur;
    const row = listRow({ i, title, sub: dt("Sam KaLok"), trailing: time });
    row.classList.add("pg-reorder-row");
    row.style.cssText += ";touch-action:none";
    row.insertBefore(grip(), row.firstChild);
    list.append(row);
  });
  stage.append(list, hint(dt("Drag a row by its grip — the dashed slot shows where it lands")));

  let dragEl: HTMLElement | null = null;
  let placeholder: HTMLElement | null = null;
  let offsetY = 0;
  const rows = () => [...list.querySelectorAll<HTMLElement>(".pg-reorder-row")];
  const siblingRows = () => rows().filter((r) => r !== dragEl);

  list.addEventListener("pointerdown", (e) => {
    const handle = (e.target as HTMLElement).closest(".pg-grip");
    const row = (e.target as HTMLElement).closest<HTMLElement>(".pg-reorder-row");
    if (!handle || !row || dragEl) return;
    const rect = row.getBoundingClientRect();
    offsetY = e.clientY - rect.top;
    list.setPointerCapture(e.pointerId);

    placeholder = elem("div", undefined, `height:${rect.height}px;border:1.5px dashed var(--color-light-taupe);border-radius:10px;box-sizing:border-box`);
    list.insertBefore(placeholder, row);

    dragEl = row;
    row.style.position = "fixed";
    row.style.zIndex = "5";
    row.style.width = `${rect.width}px`;
    row.style.left = `${rect.left}px`;
    row.style.top = `${rect.top}px`;
    row.style.margin = "0";
    row.style.pointerEvents = "none";
    row.style.boxShadow = "var(--shadow-floating)";
  });

  list.addEventListener("pointermove", (e) => {
    if (!dragEl || !placeholder) return;
    dragEl.style.top = `${e.clientY - offsetY}px`;
    const siblings = siblingRows();
    const after = siblings.find((r) => {
      const rect = r.getBoundingClientRect();
      return e.clientY < rect.top + rect.height / 2;
    });
    const first = siblings.map((r) => r.getBoundingClientRect());
    if (after) list.insertBefore(placeholder, after);
    else list.append(placeholder);
    siblings.forEach((r, i) => {
      const dy = first[i].top - r.getBoundingClientRect().top;
      if (dy) animate(r, { y: [dy, 0] }, { type: "spring", stiffness: 600, damping: 40 });
    });
  });

  const end = () => {
    if (!dragEl || !placeholder) return;
    const el = dragEl;
    const ph = placeholder;
    const slot = ph.getBoundingClientRect();
    animate(el, { top: `${slot.top}px`, left: `${slot.left}px` }, { type: "spring", stiffness: 700, damping: 42 }).then(() => {
      list.insertBefore(el, ph);
      ph.remove();
      el.style.position = "";
      el.style.zIndex = "";
      el.style.width = "";
      el.style.left = "";
      el.style.top = "";
      el.style.margin = "";
      el.style.pointerEvents = "";
      el.style.boxShadow = "";
    });
    dragEl = null;
    placeholder = null;
  };
  list.addEventListener("pointerup", end);
  list.addEventListener("pointercancel", end);

  return {
    play() {},
    continuous: true,
    code: () => `// drag by the grip; dashed placeholder marks the slot, FLIP the rest\nlist.insertBefore(placeholder, target);\nanimate(other, { y: [delta, 0] }, { type: "spring" });`,
  };
};

// An inbox row that swipes to reveal a red Delete affordance, then flies off.
const swipeDismissUseCase: DemoFactory = (stage) => {
  clearStage(stage);
  const wrap = elem("div", undefined, "position:relative;width:210px;border-radius:10px;overflow:hidden");
  const behind = elem(
    "div",
    undefined,
    "position:absolute;inset:0;display:flex;align-items:center;justify-content:flex-end;gap:7px;padding:0 16px;background:var(--color-leadgen-red);color:#fff;font-size:12px;font-weight:600;border-radius:10px"
  );
  const dlabel = elem("span");
  dlabel.textContent = dt("Delete");
  const dtrash = elem("span", undefined, "display:grid;place-items:center;width:16px;height:16px");
  dtrash.innerHTML = `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/></svg>`;
  behind.append(dtrash, dlabel);
  const row = listRow({ i: 1, title: dt("Sam KaLok"), sub: dt("Re: launch plan — sounds great!") });
  row.style.cssText += ";position:relative;z-index:1;will-change:transform";
  wrap.append(behind, row);
  stage.append(wrap, hint(dt("Swipe the row left or right to dismiss")));

  const d = draggable(row, {
    axis: "x",
    onRelease: (vx) => {
      const { x } = d.pos;
      if (Math.abs(x) > 90 || Math.abs(vx) > 500) {
        const dir = x > 0 || vx > 0 ? 1 : -1;
        animate(row, { x: [x, dir * 260], opacity: [1, 0] }, { duration: 0.3 }).then(() => {
          setTimeout(() => {
            d.setPos(0, 0);
            animate(row, { opacity: [0, 1] }, { duration: 0.3 });
          }, 700);
        });
      } else {
        animate(row, { x: [x, 0] }, { type: "spring", stiffness: 400, damping: 30 }).then(() => d.reset());
      }
    },
  });
  return {
    play() {},
    continuous: true,
    code: () => `if (offset > threshold) animate(row, { x: 260, opacity: 0 }); // delete\nelse animate(row, { x: 0 }, { type: "spring" }); // snap back`,
  };
};

// A horizontal photo carousel that rubber-bands when dragged past either end.
const rubberBandingUseCase: DemoFactory = (stage) => {
  clearStage(stage);
  const frameEl = frame("width:210px;height:108px;overflow:hidden");
  const strip = elem("div", undefined, "display:flex;gap:10px;padding:12px;will-change:transform;cursor:grab;touch-action:none");
  [0, 2, 4, 1, 5].forEach((i, idx) => {
    const tile = imageTile({ i, radius: 10, label: dt("Photo {n}", { n: idx + 1 }) });
    tile.style.cssText += ";flex:none;width:130px;height:84px;pointer-events:none";
    strip.append(tile);
  });
  frameEl.append(strip);
  stage.append(frameEl, hint(dt("Drag the strip past the ends — it resists, then springs back")));

  // The strip is wider than the frame; clamp scroll between minX and 0.
  let lastX = 0;
  let startX = 0;
  let dragging = false;
  const overflow = () => strip.scrollWidth - frameEl.clientWidth + 24;
  strip.addEventListener("pointerdown", (e) => {
    dragging = true;
    strip.setPointerCapture(e.pointerId);
    strip.style.cursor = "grabbing";
    startX = e.clientX - lastX;
  });
  strip.addEventListener("pointermove", (e) => {
    if (!dragging) return;
    let x = e.clientX - startX;
    const minX = -overflow();
    if (x > 0) x = x * 0.25; // resist past the start
    else if (x < minX) x = minX + (x - minX) * 0.25; // resist past the end
    lastX = x;
    strip.style.transform = `translateX(${x}px)`;
  });
  const end = () => {
    if (!dragging) return;
    dragging = false;
    strip.style.cursor = "grab";
    const minX = -overflow();
    const clamped = Math.max(minX, Math.min(0, lastX));
    if (clamped !== lastX) animate(strip, { x: [lastX, clamped] }, { type: "spring", stiffness: 500, damping: 30 });
    lastX = clamped;
  };
  strip.addEventListener("pointerup", end);
  strip.addEventListener("pointercancel", end);
  return {
    play() {},
    continuous: true,
    code: () => `if (past edge) x = edge + overshoot * 0.25; // resistance\nonRelease → spring back to the boundary`,
  };
};

// A login card: tapping "Sign in" with a wrong password shakes + flashes red.
const shakeUseCase: DemoFactory = (stage) => {
  clearStage(stage);
  const card = frame("width:200px;padding:16px;display:flex;flex-direction:column;gap:12px");
  const title = elem("span", undefined, "font-size:14px;font-weight:600;color:var(--color-midnight-ink)");
  title.textContent = dt("Sign in");
  const field = elem(
    "div",
    undefined,
    "display:flex;align-items:center;gap:9px;padding:10px 12px;border:1.5px solid var(--color-light-taupe);border-radius:10px;transition:border-color .2s ease,background-color .2s ease;will-change:transform"
  );
  const lock = elem("span", undefined, "display:grid;place-items:center;flex:none;width:15px;height:15px");
  lock.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--color-muted-ash)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>`;
  const dots = elem("span", undefined, "letter-spacing:4px;font-size:14px;color:var(--color-midnight-ink)");
  dots.textContent = "••••••••";
  field.append(lock, dots);
  const error = elem("span", undefined, "font-size:11px;color:var(--color-leadgen-red);opacity:0;height:0;overflow:hidden");
  error.textContent = dt("Incorrect password");
  const btn = elem(
    "button",
    undefined,
    "width:100%;padding:10px;font:inherit;font-size:13px;font-weight:600;color:#fff;background:var(--color-midnight-ink);border:none;border-radius:10px;cursor:pointer"
  );
  btn.textContent = dt("Sign in");
  card.append(title, field, error, btn);
  stage.append(card);

  let intensity = 10;
  btn.addEventListener("click", () => {
    field.style.borderColor = "var(--color-leadgen-red)";
    field.style.backgroundColor = "rgba(229,72,77,0.06)";
    error.style.opacity = "1";
    error.style.height = "auto";
    const i = intensity;
    animate(field, { x: [0, -i, i, -i * 0.7, i * 0.7, -i * 0.4, 0] }, { duration: 0.45, ease: "easeInOut" }).then(() => {
      setTimeout(() => {
        field.style.borderColor = "";
        field.style.backgroundColor = "";
        animate(error, { opacity: [1, 0] }, { duration: 0.25 }).then(() => {
          error.style.height = "0";
        });
      }, 900);
    });
  });
  return {
    play(p) {
      intensity = num(p, "intensity", 10);
    },
    code: (p) => `// wrong password → shake + flash red\nanimate(field, { x: [0, -${num(p, "intensity", 10)}, ${num(p, "intensity", 10)}, ..., 0] }, { duration: 0.45 });`,
  };
};

// A Material-style list row that ripples from the exact tap point.
const rippleUseCase: DemoFactory = (stage) => {
  clearStage(stage);
  const list = frame("width:210px;overflow:hidden");
  const items = [
    [dt("Profile"), dt("Edit your details")],
    [dt("Notifications"), dt("Email and push")],
    [dt("Privacy"), dt("Control your data")],
  ];
  items.forEach(([title, sub], idx) => {
    const chev = elem("span", undefined, "flex:none;width:6px;height:6px;border-right:2px solid var(--color-light-taupe);border-bottom:2px solid var(--color-light-taupe);transform:rotate(-45deg)");
    const row = listRow({ i: idx, title, sub, trailing: chev });
    row.style.cssText += ";position:relative;overflow:hidden;border-radius:0;box-shadow:none;cursor:pointer";
    if (idx > 0) row.style.cssText += ";border-top:1px solid var(--color-whisper-gray)";
    row.addEventListener("pointerdown", (e) => {
      const rect = row.getBoundingClientRect();
      const r = elem("span", undefined, "position:absolute;border-radius:999px;background:rgba(36,42,68,0.12);pointer-events:none");
      const size = Math.max(rect.width, rect.height) * 1.4;
      r.style.width = r.style.height = `${size}px`;
      r.style.left = `${e.clientX - rect.left - size / 2}px`;
      r.style.top = `${e.clientY - rect.top - size / 2}px`;
      row.append(r);
      animate(r, { scale: [0, 1], opacity: [0.5, 0] }, { duration: 0.6, ease: "easeOut" }).then(() => r.remove());
    });
    list.append(row);
  });
  stage.append(list);
  return {
    play() {},
    continuous: true,
    code: () => `onPointerDown(e) => {\n  place circle at tap point;\n  animate(circle, { scale: [0, 1], opacity: [0.5, 0] });\n}`,
  };
};

export const demos: Record<string, DemoFactory> = {
  hover,
  press,
  holdToConfirm,
  drag,
  dragReorder,
  swipeDismiss,
  rubberBanding,
  shake,
  ripple,
  hoverUseCase,
  pressUseCase,
  holdToConfirmUseCase,
  dragUseCase,
  dragReorderUseCase,
  swipeDismissUseCase,
  rubberBandingUseCase,
  shakeUseCase,
  rippleUseCase,
};
