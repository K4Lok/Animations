import { stagger } from "motion";
import { animate } from "./anim";
import type { DemoFactory } from "./types";
import { clearStage, createBox, dt, EASING_ARRAYS, num, str } from "./utils";
import { elem, frame, imageTile, listRow } from "./kit";

function ease(p: Record<string, unknown>) {
  return EASING_ARRAYS[str(p, "easing", "ease-out")] ?? EASING_ARRAYS["ease-out"];
}

const keyframes: DemoFactory = (stage) => {
  clearStage(stage);
  const box = createBox({ label: "" });
  stage.append(box);
  const track = document.createElement("div");
  track.className = "demo-caption";
  track.textContent = "0% → 50% → 100%";
  stage.append(track);
  return {
    play(p) {
      animate(
        box,
        { x: [-90, 90, 0], y: [0, -50, 0], rotate: [0, 90, 0] },
        { duration: num(p, "duration", 1.4), ease: ease(p), times: [0, 0.5, 1] }
      );
    },
    code: () => `animate(el, {\n  x: [-90, 90, 0],\n  rotate: [0, 90, 0],\n}, { times: [0, 0.5, 1] });`,
  };
};

const tween: DemoFactory = (stage) => {
  clearStage(stage);
  const wrap = document.createElement("div");
  wrap.style.cssText = "position:relative;width:100%;max-width:240px;height:40px";
  const start = createBox({ size: 40 });
  start.style.cssText += ";opacity:.15;position:absolute;left:0";
  const end = createBox({ size: 40 });
  end.style.cssText += ";opacity:.15;position:absolute;right:0";
  const mover = createBox({ size: 40 });
  mover.style.cssText += ";position:absolute;left:0";
  wrap.append(start, end, mover);
  stage.append(wrap);
  return {
    play(p) {
      animate(mover, { x: [0, 200] }, { duration: num(p, "duration", 1), ease: ease(p) });
    },
    code: () => `// a tween generates every in-between frame\nanimate(el, { x: [0, 200] }, { duration: 1 });`,
  };
};

const staggerDemo: DemoFactory = (stage) => {
  clearStage(stage);
  const row = document.createElement("div");
  row.style.cssText = "display:flex;gap:10px";
  stage.append(row);
  let boxes: HTMLElement[] = [];
  const build = (n: number) => {
    row.innerHTML = "";
    boxes = Array.from({ length: n }, () => {
      const b = createBox({ size: 32 });
      row.append(b);
      return b;
    });
  };
  return {
    play(p) {
      const n = Math.round(num(p, "count", 5));
      if (boxes.length !== n) build(n);
      animate(
        boxes,
        { y: [24, 0], opacity: [0, 1] },
        { duration: num(p, "duration", 0.5), delay: stagger(num(p, "stagger", 0.08)) }
      );
    },
    code: (p) =>
      `animate(items, { y: [24, 0], opacity: [0, 1] }, {\n  delay: stagger(${num(p, "stagger", 0.08)}),\n});`,
  };
};

const orchestration: DemoFactory = (stage) => {
  clearStage(stage);
  const card = document.createElement("div");
  card.style.cssText =
    "width:180px;padding:14px;border-radius:12px;background:#fff;box-shadow:var(--shadow-floating);display:flex;flex-direction:column;gap:8px";
  const bar = document.createElement("div");
  bar.style.cssText = "height:10px;width:70%;border-radius:6px;background:var(--color-midnight-ink)";
  const line = document.createElement("div");
  line.style.cssText = "height:8px;width:100%;border-radius:6px;background:var(--color-light-taupe)";
  const btn = document.createElement("div");
  btn.style.cssText =
    "height:28px;border-radius:8px;background:var(--color-midnight-ink);color:#fff;display:grid;place-items:center;font-size:11px";
  btn.textContent = dt("Confirm");
  card.append(bar, line, btn);
  stage.append(card);
  return {
    play(p) {
      const g = num(p, "gap", 0.15);
      animate(card, { scale: [0.9, 1], opacity: [0, 1] }, { duration: 0.4 });
      animate(bar, { x: [-12, 0], opacity: [0, 1] }, { duration: 0.4, delay: g });
      animate(line, { x: [-12, 0], opacity: [0, 1] }, { duration: 0.4, delay: g * 2 });
      animate(btn, { y: [10, 0], opacity: [0, 1] }, { duration: 0.4, delay: g * 3 });
    },
    code: () =>
      `// each part starts one beat after the last\nanimate(card,  ..., { delay: 0 });\nanimate(title, ..., { delay: gap });\nanimate(btn,   ..., { delay: gap * 2 });`,
  };
};

const delayDemo: DemoFactory = (stage) => {
  clearStage(stage);
  const box = createBox({ label: "" });
  stage.append(box);
  return {
    play(p) {
      animate(box, { x: [-80, 0], opacity: [0, 1] }, { duration: num(p, "duration", 0.5), delay: num(p, "delay", 0.4) });
    },
    code: (p) => `animate(el, { x: [-80, 0] }, { delay: ${num(p, "delay", 0.4)} });`,
  };
};

const durationDemo: DemoFactory = (stage) => {
  clearStage(stage);
  const box = createBox({ label: "" });
  stage.append(box);
  return {
    play(p) {
      animate(box, { x: [-90, 90] }, { duration: num(p, "duration", 0.8), ease: ease(p) });
    },
    code: (p) => `animate(el, { x: [-90, 90] }, { duration: ${num(p, "duration", 0.8)} });`,
  };
};

const fillMode: DemoFactory = (stage) => {
  clearStage(stage);
  const box = createBox({ label: "" });
  stage.append(box);
  const caption = document.createElement("div");
  caption.className = "demo-caption";
  stage.append(caption);
  return {
    play(p) {
      const fill = str(p, "fill", "forwards") as FillMode;
      box.getAnimations().forEach((a) => a.cancel());
      box.animate(
        [
          { transform: "translateX(-90px)", background: "#111111" },
          { transform: "translateX(90px)", background: "#e8400d" },
        ],
        { duration: num(p, "duration", 0.6) * 1000, fill, easing: "cubic-bezier(0.16,1,0.3,1)" }
      );
      caption.textContent =
        fill === "none"
          ? dt("fill: none → snaps back to start when done")
          : dt("fill: forwards → holds the final frame");
    },
    code: (p) =>
      `el.animate(keyframes, {\n  duration: ${num(p, "duration", 0.6) * 1000},\n  fill: "${str(p, "fill", "forwards")}",\n});`,
  };
};

const stepped: DemoFactory = (stage) => {
  clearStage(stage);
  const wrap = document.createElement("div");
  wrap.style.cssText =
    "width:80%;height:14px;border-radius:8px;background:var(--color-light-taupe);overflow:hidden";
  const fill = document.createElement("div");
  fill.style.cssText = "height:100%;width:0;background:var(--color-midnight-ink)";
  wrap.append(fill);
  stage.append(wrap);
  return {
    play(p) {
      const steps = Math.round(num(p, "steps", 6));
      fill.getAnimations().forEach((a) => a.cancel());
      fill.animate([{ width: "0%" }, { width: "100%" }], {
        duration: num(p, "duration", 1.2) * 1000,
        easing: `steps(${steps}, end)`,
        fill: "forwards",
      });
    },
    code: (p) =>
      `el.animate([{width:"0%"},{width:"100%"}], {\n  easing: "steps(${Math.round(num(p, "steps", 6))}, end)",\n});`,
  };
};

/* ---- realistic "use case" variants ---- */

const EASE_OUT: [number, number, number, number] = [0.16, 1, 0.3, 1];

// Add-to-cart: tapping a product launches a flying chip on a keyframed arc into
// the cart, then the cart badge bumps and its count increments.
const keyframesUseCase: DemoFactory = (stage) => {
  clearStage(stage);
  const wrap = elem("div", undefined, "position:relative;width:210px;height:150px");
  // Cart button + count badge, top-right.
  const cart = elem(
    "button",
    undefined,
    "position:absolute;top:8px;right:8px;z-index:2;display:grid;place-items:center;width:40px;height:40px;border-radius:12px;background:var(--color-midnight-ink);border:none;cursor:pointer;box-shadow:var(--shadow-floating)"
  );
  cart.innerHTML = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>`;
  const badge = elem(
    "span",
    undefined,
    "position:absolute;top:2px;right:2px;z-index:3;display:grid;place-items:center;min-width:18px;height:18px;padding:0 5px;border-radius:999px;background:var(--color-phoenix-orange);color:#fff;font-size:11px;font-weight:700;line-height:1;box-shadow:var(--shadow-subtle)"
  );
  let count = 0;
  badge.textContent = String(count);
  // Product tile.
  const tile = imageTile({ i: 1, radius: 12 });
  tile.style.cssText += ";position:absolute;left:8px;bottom:8px;width:110px;height:110px;cursor:pointer";
  const tcap = elem("span", "uikit-tile__cap");
  tcap.textContent = dt("Tap to add");
  tile.append(tcap);
  wrap.append(tile, cart, badge);
  stage.append(wrap);

  let duration = 1.4;
  let ez = ease({ easing: "ease-out" });
  let flying = false;
  tile.addEventListener("click", () => {
    if (flying) return;
    flying = true;
    // The flying chip starts over the product and arcs into the cart.
    const ts = tile.getBoundingClientRect();
    const cs = cart.getBoundingClientRect();
    const ws = wrap.getBoundingClientRect();
    const startX = ts.left - ws.left + ts.width / 2 - 11;
    const startY = ts.top - ws.top + ts.height / 2 - 11;
    const endX = cs.left - ws.left + cs.width / 2 - 11;
    const endY = cs.top - ws.top + cs.height / 2 - 11;
    const chip = imageTile({ i: 1, radius: 999 });
    chip.style.cssText += `;position:absolute;left:${startX}px;top:${startY}px;width:22px;height:22px;z-index:4;pointer-events:none`;
    wrap.append(chip);
    const dx = endX - startX;
    const dy = endY - startY;
    const lift = Math.abs(dy) + 46;
    animate(
      chip,
      { x: [0, dx * 0.5, dx], y: [0, -lift, dy], scale: [1, 0.9, 0.4], opacity: [1, 1, 0.6] },
      { duration, ease: ez, times: [0, 0.5, 1] }
    ).then(() => {
      chip.remove();
      count += 1;
      badge.textContent = String(count);
      animate(badge, { scale: [1, 1.5, 1] }, { duration: 0.35, ease: ez, times: [0, 0.4, 1] });
      flying = false;
    });
  });
  return {
    play(p) {
      duration = num(p, "duration", 1.4);
      ez = ease(p);
    },
    code: () =>
      `// chip flies on a keyframed arc into the cart\nanimate(chip, {\n  x: [0, dx*0.5, dx],\n  y: [0, -lift, dy],\n}, { times: [0, 0.5, 1] });`,
  };
};

// Brightness control: tapping a preset chip tweens the fill bar to that value,
// generating every in-between frame.
const tweenUseCase: DemoFactory = (stage) => {
  clearStage(stage);
  const card = frame("width:210px;padding:14px;display:flex;flex-direction:column;gap:12px");
  const labelRow = elem("div", undefined, "display:flex;align-items:center;justify-content:space-between");
  const label = elem("span", undefined, "font-size:12px;font-weight:600;color:var(--color-midnight-ink)");
  label.textContent = dt("Brightness");
  const readout = elem("span", undefined, "font-size:12px;font-weight:600;color:var(--color-muted-ash)");
  readout.textContent = "60%";
  labelRow.append(label, readout);
  const track = elem(
    "div",
    undefined,
    "position:relative;height:12px;border-radius:999px;background:var(--color-light-taupe);overflow:hidden"
  );
  const fill = elem("div", undefined, "height:100%;width:60%;border-radius:999px;background:var(--color-engagement-gold)");
  track.append(fill);
  const chipRow = elem("div", undefined, "display:flex;gap:8px");
  const presets = [25, 60, 100];
  const chips = presets.map((v) => {
    const c = elem(
      "button",
      "demo-trigger demo-trigger--sm",
      "flex:1;cursor:pointer"
    );
    c.textContent = `${v}%`;
    chipRow.append(c);
    return c;
  });
  card.append(labelRow, track, chipRow);
  stage.append(card);

  let duration = 1;
  let ez = ease({ easing: "ease-out" });
  let current = 60;
  presets.forEach((v, i) =>
    chips[i].addEventListener("click", () => {
      if (v === current) return;
      animate(
        fill,
        { width: [`${current}%`, `${v}%`] },
        { duration, ease: ez }
      );
      const from = current;
      const start = performance.now();
      const tick = (now: number) => {
        const t = Math.min(1, (now - start) / (duration * 1000));
        readout.textContent = `${Math.round(from + (v - from) * t)}%`;
        if (t < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
      current = v;
    })
  );
  return {
    play(p) {
      duration = num(p, "duration", 1);
      ez = ease(p);
    },
    code: () =>
      `// a tween fills every frame to the target\nanimate(fill, { width: ["60%", "100%"] }, { duration });`,
  };
};

// Inbox notifications: rows cascade in with a stagger. Play-driven so the
// hover-loop replays the cascade.
const staggerUseCase: DemoFactory = (stage) => {
  clearStage(stage);
  const panel = frame("width:210px;padding:10px;display:flex;flex-direction:column;gap:8px");
  const head = elem("span", undefined, "padding:2px 4px;font-size:12px;font-weight:600;color:var(--color-midnight-ink)");
  head.textContent = dt("Notifications");
  const listEl = elem("div", undefined, "display:flex;flex-direction:column;gap:8px");
  panel.append(head, listEl);
  stage.append(panel);
  const content = [
    [dt("Sam KaLok"), dt("liked your post")],
    [dt("Aurora team"), dt("shared a file")],
    [dt("Borealis"), dt("left a comment")],
    [dt("Cascade"), dt("mentioned you")],
    [dt("Finch"), dt("started following")],
    [dt("Harbor"), dt("sent a message")],
  ];
  let rows: HTMLElement[] = [];
  const build = (n: number) => {
    listEl.innerHTML = "";
    rows = Array.from({ length: n }, (_, i) => {
      const [title, sub] = content[i % content.length];
      const r = listRow({ i, title, sub });
      listEl.append(r);
      return r;
    });
  };
  return {
    play(p) {
      const n = Math.round(num(p, "count", 5));
      if (rows.length !== n) build(n);
      animate(
        rows,
        { y: [16, 0], opacity: [0, 1] },
        { duration: num(p, "duration", 0.5), delay: stagger(num(p, "stagger", 0.08)) }
      );
    },
    code: (p) =>
      `// inbox rows cascade in one after another\nanimate(rows, { y: [16, 0], opacity: [0, 1] }, {\n  delay: stagger(${num(p, "stagger", 0.08)}),\n});`,
  };
};

// Profile card assembles beat by beat: avatar pops, name/sub slide, CTA arrives.
const orchestrationUseCase: DemoFactory = (stage) => {
  clearStage(stage);
  const card = frame("width:190px;padding:16px;display:flex;flex-direction:column;align-items:center;gap:10px");
  const avatar = elem(
    "div",
    undefined,
    "display:grid;place-items:center;width:52px;height:52px;border-radius:999px;color:#fff;font-size:16px;font-weight:700"
  );
  avatar.style.background = "linear-gradient(135deg, #cfe3ff 0%, var(--color-intelligence-blue) 100%)";
  avatar.textContent = "SK";
  const name = elem("span", undefined, "font-size:14px;font-weight:600;color:var(--color-midnight-ink)");
  name.textContent = dt("Sam KaLok");
  const sub = elem("span", undefined, "font-size:11px;color:var(--color-muted-ash)");
  sub.textContent = dt("Product Designer");
  const cta = elem(
    "button",
    "demo-trigger demo-trigger--solid demo-trigger--sm",
    "margin-top:2px;width:100%;cursor:pointer"
  );
  cta.textContent = dt("Follow");
  card.append(avatar, name, sub, cta);
  stage.append(card);
  return {
    play(p) {
      const g = num(p, "gap", 0.15);
      animate(card, { scale: [0.92, 1], opacity: [0, 1] }, { duration: 0.4, ease: EASE_OUT });
      animate(avatar, { scale: [0, 1], opacity: [0, 1] }, { type: "spring", stiffness: 420, damping: 18, delay: g } as any);
      animate(name, { x: [-12, 0], opacity: [0, 1] }, { duration: 0.4, ease: EASE_OUT, delay: g * 2 });
      animate(sub, { x: [-12, 0], opacity: [0, 1] }, { duration: 0.4, ease: EASE_OUT, delay: g * 3 });
      animate(cta, { y: [10, 0], opacity: [0, 1] }, { duration: 0.4, ease: EASE_OUT, delay: g * 4 });
    },
    code: () =>
      `// each part starts one beat after the last\nanimate(avatar, ..., { delay: gap });\nanimate(name,   ..., { delay: gap * 2 });\nanimate(cta,    ..., { delay: gap * 4 });`,
  };
};

// Hover-intent tooltip: dwell on the badge for `delay` seconds and the tip
// fades + slides in; leaving cancels the pending timer.
const delayUseCase: DemoFactory = (stage) => {
  clearStage(stage);
  const wrap = elem("div", undefined, "position:relative;display:flex;flex-direction:column;align-items:center;gap:0");
  const badge = elem(
    "button",
    undefined,
    "display:grid;place-items:center;width:30px;height:30px;border-radius:999px;background:var(--color-midnight-ink);color:#fff;font-size:15px;font-weight:700;border:none;cursor:pointer"
  );
  badge.textContent = "?";
  const tip = elem(
    "div",
    undefined,
    "position:absolute;bottom:calc(100% + 10px);left:50%;width:150px;transform:translateX(-50%);padding:9px 11px;border-radius:9px;background:var(--color-midnight-ink);color:#fff;font-size:11px;line-height:1.4;text-align:center;opacity:0;pointer-events:none;box-shadow:var(--shadow-floating)"
  );
  tip.textContent = dt("Hold to see this hint after a short delay.");
  const arrow = elem(
    "span",
    undefined,
    "position:absolute;top:100%;left:50%;width:8px;height:8px;background:var(--color-midnight-ink);transform:translateX(-50%) translateY(-4px) rotate(45deg)"
  );
  tip.append(arrow);
  wrap.append(tip, badge);
  stage.append(wrap);

  let delay = 0.4;
  let duration = 0.5;
  let visible = false;
  let showT: ReturnType<typeof setTimeout> | undefined;
  badge.addEventListener("pointerenter", () => {
    clearTimeout(showT);
    showT = setTimeout(() => {
      visible = true;
      animate(tip, { y: [6, 0], opacity: [0, 1] }, { duration, ease: EASE_OUT });
    }, delay * 1000);
  });
  badge.addEventListener("pointerleave", () => {
    clearTimeout(showT);
    if (!visible) return;
    visible = false;
    animate(tip, { y: [0, 6], opacity: [1, 0] }, { duration, ease: EASE_OUT });
  });
  return {
    play(p) {
      delay = num(p, "delay", 0.4);
      duration = num(p, "duration", 0.5);
    },
    cleanup() {
      clearTimeout(showT);
    },
    code: (p) =>
      `// hover-intent: wait, then reveal\nshowT = setTimeout(() => {\n  animate(tip, { y: [6, 0], opacity: [0, 1] });\n}, ${num(p, "delay", 0.4)} * 1000);`,
  };
};

// Navigation drawer: a hamburger opens a side drawer that slides in over
// `duration`; the backdrop or close button slides it out.
const durationUseCase: DemoFactory = (stage) => {
  clearStage(stage);
  const screen = frame("width:210px;height:150px");
  const topbar = elem("div", undefined, "position:absolute;top:0;left:0;right:0;height:40px;display:flex;align-items:center;gap:10px;padding:0 12px;border-bottom:1px solid var(--color-whisper-gray);z-index:1");
  const burger = elem(
    "button",
    undefined,
    "display:flex;flex-direction:column;justify-content:center;gap:4px;width:24px;height:24px;padding:0;background:none;border:none;cursor:pointer"
  );
  const bar = () => elem("span", undefined, "display:block;width:20px;height:2px;border-radius:2px;background:var(--color-midnight-ink)");
  burger.append(bar(), bar(), bar());
  const ttl = elem("span", undefined, "font-size:13px;font-weight:600;color:var(--color-midnight-ink)");
  ttl.textContent = dt("Library");
  topbar.append(burger, ttl);
  const backdrop = elem(
    "div",
    undefined,
    "position:absolute;inset:0;z-index:2;background:rgba(17,17,17,.4);opacity:0;pointer-events:none"
  );
  const drawer = elem(
    "div",
    undefined,
    "position:absolute;top:0;bottom:0;left:0;z-index:3;width:140px;padding:14px 12px;display:flex;flex-direction:column;gap:10px;background:var(--color-canvas-white);box-shadow:var(--shadow-floating);transform:translateX(-100%)"
  );
  const menu = [dt("Home"), dt("Saved"), dt("Settings")].map((t) => {
    const r = elem("span", undefined, "font-size:12px;font-weight:500;color:var(--color-midnight-ink);cursor:pointer");
    r.textContent = t;
    return r;
  });
  drawer.append(...menu);
  screen.append(topbar, backdrop, drawer);
  stage.append(screen);

  let open = false;
  let duration = 0.8;
  let ez = ease({ easing: "ease-out" });
  const apply = () => {
    backdrop.style.pointerEvents = open ? "auto" : "none";
    animate(drawer, { x: open ? ["-100%", "0%"] : ["0%", "-100%"] }, { duration, ease: ez });
    animate(backdrop, { opacity: open ? [0, 1] : [1, 0] }, { duration, ease: ez });
  };
  burger.addEventListener("click", () => {
    if (open) return;
    open = true;
    apply();
  });
  backdrop.addEventListener("click", () => {
    if (!open) return;
    open = false;
    apply();
  });
  return {
    play(p) {
      duration = num(p, "duration", 0.8);
      ez = ease(p);
    },
    code: (p) =>
      `// drawer slides in over the chosen duration\nanimate(drawer, { x: ["-100%", "0%"] }, { duration: ${num(p, "duration", 0.8)} });`,
  };
};

// Download button: tapping fills a progress bar with the chosen fill mode.
// forwards holds full + reveals a ✓; none snaps back to empty.
const fillModeUseCase: DemoFactory = (stage) => {
  clearStage(stage);
  const card = frame("width:210px;padding:14px;display:flex;flex-direction:column;gap:11px");
  const btn = elem(
    "button",
    undefined,
    "position:relative;display:flex;align-items:center;justify-content:center;gap:8px;height:38px;border-radius:10px;border:none;background:var(--color-midnight-ink);color:#fff;font:inherit;font-size:13px;font-weight:600;cursor:pointer;overflow:hidden"
  );
  const fill = elem("div", undefined, "position:absolute;inset:0;width:0;background:var(--color-deliver-green);z-index:0");
  const labelEl = elem("span", undefined, "position:relative;z-index:1;display:flex;align-items:center;gap:7px");
  const tick = elem("span", undefined, "display:none");
  tick.textContent = "✓ ";
  const labelText = elem("span");
  labelText.textContent = dt("Download");
  labelEl.append(tick, labelText);
  btn.append(fill, labelEl);
  const caption = elem("div", "demo-caption");
  card.append(btn, caption);
  stage.append(card);

  let fillMode = "forwards" as FillMode;
  let duration = 0.6;
  let busy = false;
  btn.addEventListener("click", () => {
    if (busy) return;
    busy = true;
    tick.style.display = "none";
    labelText.textContent = dt("Downloading…");
    fill.getAnimations().forEach((a) => a.cancel());
    const anim = fill.animate([{ width: "0%" }, { width: "100%" }], {
      duration: duration * 1000,
      fill: fillMode,
      easing: "cubic-bezier(0.16,1,0.3,1)",
    });
    anim.finished.then(() => {
      busy = false;
      if (fillMode === "none") {
        labelText.textContent = dt("Download");
        caption.textContent = dt("fill: none → bar snaps back to empty");
      } else {
        tick.style.display = "inline";
        labelText.textContent = dt("Downloaded");
        caption.textContent = dt("fill: forwards → bar holds full");
      }
    });
  });
  return {
    play(p) {
      fillMode = str(p, "fill", "forwards") as FillMode;
      duration = num(p, "duration", 0.6);
    },
    code: (p) =>
      `el.animate([{width:"0%"},{width:"100%"}], {\n  duration: ${num(p, "duration", 0.6) * 1000},\n  fill: "${str(p, "fill", "forwards")}",\n});`,
  };
};

// Story-style segmented progress: tapping advances a battery/loader fill in
// `steps` discrete jumps. Replayable in play().
const steppedUseCase: DemoFactory = (stage) => {
  clearStage(stage);
  const card = frame("width:210px;padding:14px;display:flex;flex-direction:column;gap:12px");
  const labelRow = elem("div", undefined, "display:flex;align-items:center;justify-content:space-between");
  const label = elem("span", undefined, "font-size:12px;font-weight:600;color:var(--color-midnight-ink)");
  label.textContent = dt("Charging");
  const pct = elem("span", undefined, "font-size:12px;font-weight:600;color:var(--color-deliver-green)");
  pct.textContent = "0%";
  labelRow.append(label, pct);
  const track = elem(
    "div",
    undefined,
    "position:relative;height:18px;border-radius:6px;background:var(--color-light-taupe);overflow:hidden"
  );
  const fill = elem("div", undefined, "height:100%;width:0;background:var(--color-deliver-green)");
  track.append(fill);
  card.append(labelRow, track);
  stage.append(card);

  let steps = 6;
  let duration = 1.2;
  return {
    play(p) {
      steps = Math.round(num(p, "steps", 6));
      duration = num(p, "duration", 1.2);
      fill.getAnimations().forEach((a) => a.cancel());
      pct.textContent = "0%";
      fill.animate([{ width: "0%" }, { width: "100%" }], {
        duration: duration * 1000,
        easing: `steps(${steps}, end)`,
        fill: "forwards",
      });
      // Snap the readout in the same discrete steps as the bar.
      const start = performance.now();
      const tick = (now: number) => {
        const t = Math.min(1, (now - start) / (duration * 1000));
        const stepped = Math.floor(t * steps) / steps;
        pct.textContent = `${Math.round(stepped * 100)}%`;
        if (t < 1) requestAnimationFrame(tick);
        else pct.textContent = "100%";
      };
      requestAnimationFrame(tick);
    },
    code: (p) =>
      `el.animate([{width:"0%"},{width:"100%"}], {\n  easing: "steps(${Math.round(num(p, "steps", 6))}, end)",\n});`,
  };
};

export const demos: Record<string, DemoFactory> = {
  keyframes,
  tween,
  stagger: staggerDemo,
  orchestration,
  delay: delayDemo,
  duration: durationDemo,
  fillMode,
  stepped,
  keyframesUseCase,
  tweenUseCase,
  staggerUseCase,
  orchestrationUseCase,
  delayUseCase,
  durationUseCase,
  fillModeUseCase,
  steppedUseCase,
};
