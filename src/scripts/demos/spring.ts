import { animate } from "./anim";
import type { DemoFactory } from "./types";
import { clearStage, createBox, dt, num } from "./utils";
import { elem, frame, gradientFor, imageTile, listRow, textLine } from "./kit";

function springStage(stage: HTMLElement, label = "") {
  clearStage(stage);
  const track = document.createElement("div");
  track.className = "demo-track demo-track--wide";
  const box = createBox({ label });
  box.style.position = "relative";
  track.append(box);
  stage.append(track);
  return box;
}

function makeSpring(read: (p: Record<string, unknown>) => Record<string, number>): DemoFactory {
  return (stage) => {
    const box = springStage(stage);
    return {
      play(p) {
        const cfg = read(p);
        animate(box, { x: [-110, 110] }, { type: "spring", ...cfg });
      },
      code(p) {
        const cfg = read(p);
        const entries = Object.entries(cfg)
          .map(([k, v]) => `  ${k}: ${v},`)
          .join("\n");
        return `animate(el, { x: 110 }, {\n  type: "spring",\n${entries}\n});`;
      },
    };
  };
}

const spring = makeSpring((p) => ({
  stiffness: num(p, "stiffness", 240),
  damping: num(p, "damping", 18),
  mass: num(p, "mass", 1),
}));
const stiffness = makeSpring((p) => ({ stiffness: num(p, "stiffness", 200), damping: 14 }));
const damping = makeSpring((p) => ({ damping: num(p, "damping", 10), stiffness: 220 }));
const mass = makeSpring((p) => ({ mass: num(p, "mass", 1), stiffness: 220, damping: 16 }));

const bounce: DemoFactory = (stage) => {
  const box = springStage(stage);
  return {
    play(p) {
      animate(box, { x: [-110, 110] }, { type: "spring", bounce: num(p, "bounce", 0.5), visualDuration: num(p, "duration", 0.7) });
    },
    code: (p) => `animate(el, { x: 110 }, {\n  type: "spring",\n  bounce: ${num(p, "bounce", 0.5)},\n  visualDuration: ${num(p, "duration", 0.7)},\n});`,
  };
};

const perceptualDuration: DemoFactory = (stage) => {
  const box = springStage(stage);
  const cap = document.createElement("div");
  cap.className = "demo-caption";
  stage.append(cap);
  return {
    play(p) {
      const v = num(p, "visual", 0.6);
      cap.textContent = dt("Feels done in ~{v}s, while micro-settling continues underneath", { v });
      animate(box, { x: [-110, 110] }, { type: "spring", visualDuration: v, bounce: num(p, "bounce", 0.4) });
    },
    code: (p) => `animate(el, { x: 110 }, {\n  type: "spring",\n  visualDuration: ${num(p, "visual", 0.6)}, // perceptual\n});`,
  };
};

function flickBox(stage: HTMLElement, showVelocity = false) {
  clearStage(stage);
  const track = document.createElement("div");
  track.className = "demo-track demo-track--wide";
  const box = createBox({ label: showVelocity ? "↔" : dt("Flick") });
  track.append(box);
  const cap = document.createElement("div");
  cap.className = "demo-caption";
  cap.textContent = dt("Flick the box and let go");
  stage.append(track, cap);

  let startX = 0,
    lastX = 0,
    posX = 0,
    lastT = 0,
    vx = 0,
    dragging = false;
  box.style.touchAction = "none";
  box.style.cursor = "grab";
  box.addEventListener("pointerdown", (e) => {
    dragging = true;
    box.setPointerCapture(e.pointerId);
    startX = e.clientX - posX;
    lastT = performance.now();
  });
  box.addEventListener("pointermove", (e) => {
    if (!dragging) return;
    posX = Math.max(-120, Math.min(120, e.clientX - startX));
    const now = performance.now();
    vx = ((posX - lastX) / Math.max(now - lastT, 1)) * 1000;
    lastX = posX;
    lastT = now;
    box.style.transform = `translateX(${posX}px)`;
    if (showVelocity) cap.textContent = dt("velocity: {v} px/s", { v: vx.toFixed(0) });
  });
  const end = () => {
    if (!dragging) return;
    dragging = false;
    animate(box, { x: [posX, 0] }, { type: "spring", velocity: vx, stiffness: 180, damping: 18 }).then(() => {
      posX = 0;
    });
    if (showVelocity) cap.textContent = dt("released at {v} px/s — spring carries it home", { v: vx.toFixed(0) });
  };
  box.addEventListener("pointerup", end);
  box.addEventListener("pointercancel", end);
  return box;
}

const momentum: DemoFactory = (stage) => {
  flickBox(stage, false);
  return { play() {}, continuous: true, code: () => `onRelease(velocity) =>\n  animate(el, { x: 0 }, { type: "spring", velocity });` };
};

const velocity: DemoFactory = (stage) => {
  flickBox(stage, true);
  return { play() {}, continuous: true, code: () => `// the release velocity is fed into the spring\nanimate(el, { x: 0 }, { type: "spring", velocity });` };
};

const interruptible: DemoFactory = (stage) => {
  clearStage(stage);
  const field = document.createElement("div");
  field.className = "demo-field-area";
  const box = createBox({ label: "" });
  box.style.position = "absolute";
  field.append(box);
  const cap = document.createElement("div");
  cap.className = "demo-caption";
  cap.textContent = dt("Click anywhere — then click again before it lands");
  stage.append(field, cap);
  field.addEventListener("pointerdown", (e) => {
    const rect = field.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    // Calling animate again interrupts the in-flight spring, carrying its velocity.
    animate(box, { x, y }, { type: "spring", stiffness: 200, damping: 20 });
  });
  return { play() {}, continuous: true, code: () => `// re-call animate mid-flight; the spring keeps its velocity\nfield.onpointerdown = (e) => animate(box, { x, y }, { type: "spring" });` };
};

/* ---- realistic "use case" variants ---- */

// A bottom sheet that springs up when you tap the handle, and back down on
// close. The three spring params tune how the surface arrives and settles.
const springUseCase: DemoFactory = (stage) => {
  clearStage(stage);
  const phone = frame("width:210px;height:188px;background:var(--color-whisper-gray)");
  // Faux app content behind the sheet.
  const bg = elem(
    "div",
    undefined,
    "position:absolute;inset:0;display:flex;flex-direction:column;gap:9px;padding:14px;opacity:0.55"
  );
  const h = elem("span", undefined, "font-size:13px;font-weight:600;color:var(--color-midnight-ink)");
  h.textContent = dt("Library");
  bg.append(h, textLine(150), textLine(132, 0.7), textLine(140, 0.55));
  // A pill button that opens the sheet.
  const open = elem(
    "button",
    "demo-trigger demo-trigger--sm",
    "position:absolute;left:50%;bottom:14px;transform:translateX(-50%);z-index:2;cursor:pointer"
  );
  open.textContent = dt("Open sheet");
  // The sheet itself — parked just below the frame, slid up via y.
  const sheet = elem(
    "div",
    undefined,
    "position:absolute;left:0;right:0;bottom:0;height:128px;background:var(--color-canvas-white);border-radius:16px 16px 0 0;box-shadow:var(--shadow-floating);display:flex;flex-direction:column;gap:10px;padding:14px;transform:translateY(140px)"
  );
  const grip = elem(
    "span",
    undefined,
    "align-self:center;width:34px;height:4px;border-radius:999px;background:var(--color-light-taupe);cursor:pointer"
  );
  const stitle = elem("span", undefined, "font-size:12px;font-weight:600;color:var(--color-midnight-ink)");
  stitle.textContent = dt("Now playing — Aurora");
  const close = elem(
    "button",
    "demo-trigger demo-trigger--sm",
    "align-self:flex-end;margin-top:auto;cursor:pointer"
  );
  close.textContent = dt("Close");
  sheet.append(grip, stitle, textLine(150), close);
  phone.append(bg, open, sheet);
  stage.append(phone);

  let shown = false;
  let cfg = { stiffness: 240, damping: 18, mass: 1 };
  const spr = () => ({ type: "spring" as const, ...cfg });
  const show = () => {
    if (shown) return;
    shown = true;
    open.style.opacity = "0";
    open.style.pointerEvents = "none";
    animate(sheet, { y: [140, 0] }, spr());
  };
  const hide = () => {
    if (!shown) return;
    shown = false;
    animate(sheet, { y: [0, 140] }, spr()).then(() => {
      if (!shown) {
        open.style.opacity = "1";
        open.style.pointerEvents = "auto";
      }
    });
  };
  open.addEventListener("click", show);
  grip.addEventListener("click", hide);
  close.addEventListener("click", hide);
  return {
    play(p) {
      cfg = {
        stiffness: num(p, "stiffness", 240),
        damping: num(p, "damping", 18),
        mass: num(p, "mass", 1),
      };
    },
    code: () => `// tap to spring the sheet up / down\nanimate(sheet, { y: 0 }, { type: "spring", stiffness, damping, mass });`,
  };
};

// An iOS-style toggle whose knob springs across the track when tapped. The
// stiffness control tunes how snappy that travel feels.
const stiffnessUseCase: DemoFactory = (stage) => {
  clearStage(stage);
  const row = frame("width:210px;padding:14px;display:flex;align-items:center;gap:12px");
  const label = elem("div", undefined, "display:flex;flex-direction:column;gap:3px;min-width:0");
  const t = elem("span", undefined, "font-size:13px;font-weight:600;color:var(--color-midnight-ink)");
  t.textContent = dt("Airplane mode");
  const s = elem("span", undefined, "font-size:10px;color:var(--color-muted-ash)");
  s.textContent = dt("Tap to toggle");
  label.append(t, s);
  const track = elem(
    "button",
    undefined,
    "margin-left:auto;flex:none;position:relative;width:50px;height:30px;border-radius:999px;border:none;padding:0;background:var(--color-light-taupe);cursor:pointer;transition:background .25s ease"
  );
  const knob = elem(
    "span",
    undefined,
    "position:absolute;top:3px;left:3px;width:24px;height:24px;border-radius:999px;background:#fff;box-shadow:var(--shadow-subtle)"
  );
  track.append(knob);
  row.append(label, track);
  stage.append(row);

  let on = false;
  let stiff = 200;
  track.addEventListener("click", () => {
    on = !on;
    track.style.background = on ? "var(--color-deliver-green)" : "var(--color-light-taupe)";
    animate(knob, { x: on ? [0, 20] : [20, 0] }, { type: "spring", stiffness: stiff, damping: 14 });
  });
  return {
    play(p) {
      stiff = num(p, "stiffness", 200);
    },
    code: () => `// tap → knob springs across the track\nanimate(knob, { x: on ? 20 : 0 }, { type: "spring", stiffness });`,
  };
};

// A notification panel that springs down from the top. Low damping lets it
// visibly overshoot and oscillate before settling.
const dampingUseCase: DemoFactory = (stage) => {
  clearStage(stage);
  const phone = frame("width:210px;height:172px;background:var(--color-whisper-gray)");
  const bg = elem(
    "div",
    undefined,
    "position:absolute;inset:0;display:flex;flex-direction:column;gap:9px;padding:14px;justify-content:flex-end;opacity:0.5"
  );
  bg.append(textLine(150), textLine(120, 0.7));
  const open = elem(
    "button",
    "demo-trigger demo-trigger--sm",
    "position:absolute;left:50%;bottom:14px;transform:translateX(-50%);z-index:2;cursor:pointer"
  );
  open.textContent = dt("Show alert");
  const close = elem(
    "button",
    undefined,
    "display:grid;place-items:center;flex:none;width:20px;height:20px;border-radius:999px;border:none;background:var(--color-whisper-gray);color:var(--color-muted-ash);font-size:11px;line-height:1;cursor:pointer"
  );
  close.textContent = "✕";
  const panel = listRow({ i: 1, title: dt("New message"), sub: dt("Tap to read"), trailing: close });
  panel.style.cssText += ";position:absolute;left:12px;right:12px;top:12px;z-index:3;box-shadow:var(--shadow-floating);transform:translateY(-92px)";
  phone.append(bg, open, panel);
  stage.append(phone);

  let shown = false;
  let damp = 10;
  const spr = () => ({ type: "spring" as const, damping: damp, stiffness: 220 });
  const show = () => {
    if (shown) return;
    shown = true;
    open.style.opacity = "0";
    open.style.pointerEvents = "none";
    animate(panel, { y: [-92, 0] }, spr());
  };
  const hide = () => {
    if (!shown) return;
    shown = false;
    animate(panel, { y: [0, -92] }, spr()).then(() => {
      if (!shown) {
        open.style.opacity = "1";
        open.style.pointerEvents = "auto";
      }
    });
  };
  open.addEventListener("click", show);
  close.addEventListener("click", hide);
  return {
    play(p) {
      damp = num(p, "damping", 10);
    },
    code: () => `// low damping → the panel overshoots & oscillates\nanimate(panel, { y: 0 }, { type: "spring", damping, stiffness: 220 });`,
  };
};

// A FAB that springs open into a small action menu. Higher mass makes the
// expansion feel heavier and more sluggish.
const massUseCase: DemoFactory = (stage) => {
  clearStage(stage);
  const wrap = elem("div", undefined, "position:relative;width:170px;height:178px;display:flex;justify-content:flex-end;align-items:flex-end");
  // The expanded menu sits above the FAB and scales up from its bottom-right.
  const menu = frame(
    "position:absolute;right:0;bottom:0;width:150px;padding:6px;display:flex;flex-direction:column;gap:1px;transform-origin:bottom right;opacity:0;pointer-events:none"
  );
  const item = (i: number, label: string) => {
    const b = elem(
      "button",
      undefined,
      "display:flex;align-items:center;gap:9px;width:100%;padding:8px 10px;font:inherit;font-size:12px;font-weight:500;color:var(--color-midnight-ink);background:transparent;border:none;border-radius:7px;text-align:left;cursor:pointer"
    );
    const chip = elem("span", undefined, "flex:none;width:18px;height:18px;border-radius:6px");
    chip.style.background = gradientFor(i);
    const tx = elem("span");
    tx.textContent = label;
    b.append(chip, tx);
    return b;
  };
  const items = [item(0, dt("New note")), item(2, dt("Upload")), item(4, dt("Reminder"))];
  menu.append(...items);
  const btn = elem(
    "button",
    "uikit-fab",
    "position:absolute;right:0;bottom:0;width:52px;height:52px;border-radius:26px;z-index:2"
  );
  const plus = elem("span", undefined, "font-size:30px;font-weight:300;line-height:1");
  plus.textContent = "+";
  btn.append(plus);
  wrap.append(menu, btn);
  stage.append(wrap);

  let open = false;
  let mass = 1;
  const apply = () => {
    menu.style.pointerEvents = open ? "auto" : "none";
    animate(plus, { rotate: open ? 45 : 0 }, { type: "spring", mass, stiffness: 220, damping: 16 });
    animate(
      menu,
      { scale: open ? [0.6, 1] : [1, 0.6], opacity: open ? [0, 1] : [1, 0] },
      { type: "spring", mass, stiffness: 220, damping: 16 }
    );
  };
  btn.addEventListener("click", () => {
    open = !open;
    apply();
  });
  items.forEach((b) =>
    b.addEventListener("click", () => {
      if (!open) return;
      open = false;
      apply();
    })
  );
  return {
    play(p) {
      mass = num(p, "mass", 1);
    },
    code: () => `// higher mass → the menu springs open more slowly\nanimate(menu, { scale: [0.6, 1], opacity: [0, 1] }, { type: "spring", mass });`,
  };
};

// A cart button: tapping pops a count badge in with spring bounce.
const bounceUseCase: DemoFactory = (stage) => {
  clearStage(stage);
  const card = frame("width:210px;padding:12px;display:flex;align-items:center;gap:10px");
  const thumb = imageTile({ i: 3, radius: 8 });
  thumb.style.cssText += ";flex:none;width:38px;height:38px";
  const text = elem("div", undefined, "display:flex;flex-direction:column;gap:3px;min-width:0");
  const name = elem("span", undefined, "font-size:12px;font-weight:600;color:var(--color-midnight-ink)");
  name.textContent = dt("Aurora Lamp");
  const price = elem("span", undefined, "font-size:10px;color:var(--color-muted-ash)");
  price.textContent = dt("$48");
  text.append(name, price);
  const addBtn = elem(
    "button",
    undefined,
    "margin-left:auto;position:relative;display:grid;place-items:center;width:36px;height:36px;border-radius:999px;border:none;background:var(--color-midnight-ink);color:#fff;font-size:20px;line-height:1;cursor:pointer"
  );
  addBtn.textContent = "+";
  const badge = elem(
    "span",
    undefined,
    "position:absolute;top:-5px;right:-5px;display:grid;place-items:center;min-width:18px;height:18px;padding:0 4px;border-radius:999px;background:var(--color-leadgen-red);color:#fff;font-size:10px;font-weight:700;line-height:1;opacity:0;pointer-events:none"
  );
  addBtn.append(badge);
  card.append(thumb, text, addBtn);
  stage.append(card);

  let count = 0;
  let bounce = 0.5;
  let duration = 0.7;
  addBtn.addEventListener("click", () => {
    count += 1;
    badge.textContent = String(count);
    badge.style.opacity = "1";
    animate(badge, { scale: [0, 1] }, { type: "spring", visualDuration: duration, bounce } as any);
  });
  return {
    play(p) {
      bounce = num(p, "bounce", 0.5);
      duration = num(p, "duration", 0.7);
    },
    code: () => `// tap → cart badge pops in with bounce\nanimate(badge, { scale: [0, 1] }, {\n  type: "spring", visualDuration: duration, bounce,\n});`,
  };
};

// A real toast that "feels done" in `visual` seconds while a tiny scale settle
// continues underneath. Mirrors the abstract demo's caption phrasing.
const perceptualDurationUseCase: DemoFactory = (stage) => {
  clearStage(stage);
  const phone = frame("width:210px;height:150px;background:var(--color-whisper-gray)");
  const bg = elem(
    "div",
    undefined,
    "position:absolute;inset:0;display:flex;flex-direction:column;gap:9px;padding:14px;opacity:0.5"
  );
  bg.append(textLine(150), textLine(130, 0.7), textLine(140, 0.55));
  const replay = elem(
    "button",
    "demo-trigger demo-trigger--sm",
    "position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);z-index:2;cursor:pointer"
  );
  replay.textContent = dt("Send");
  const toast = elem(
    "div",
    undefined,
    "position:absolute;left:14px;right:14px;bottom:14px;display:flex;align-items:center;gap:8px;padding:10px 12px;border-radius:12px;background:var(--color-midnight-ink);color:#fff;font-size:12px;font-weight:500;opacity:0;pointer-events:none;box-shadow:var(--shadow-floating)"
  );
  const tick = elem(
    "span",
    undefined,
    "display:grid;place-items:center;flex:none;width:16px;height:16px;border-radius:999px;background:var(--color-deliver-green);color:#fff;font-size:10px;line-height:1"
  );
  tick.textContent = "✓";
  const tlabel = elem("span");
  tlabel.textContent = dt("Message sent");
  toast.append(tick, tlabel);
  const cap = elem("div", "demo-caption", "position:absolute;left:0;right:0;bottom:-26px;margin-top:0");
  phone.append(bg, replay, toast);
  stage.append(phone, cap);

  let visual = 0.6;
  let bounce = 0.4;
  let running = false;
  const run = () => {
    if (running) return;
    running = true;
    cap.textContent = dt("Feels done in ~{v}s, while micro-settling continues underneath", { v: visual });
    animate(toast, { y: [16, 0], scale: [0.96, 1], opacity: [0, 1] }, { type: "spring", visualDuration: visual, bounce } as any).then(() => {
      setTimeout(() => {
        animate(toast, { opacity: [1, 0] }, { duration: 0.3 }).then(() => {
          running = false;
        });
      }, 900);
    });
  };
  replay.addEventListener("click", run);
  return {
    play(p) {
      visual = num(p, "visual", 0.6);
      bounce = num(p, "bounce", 0.4);
      cap.textContent = dt("Feels done in ~{v}s, while micro-settling continues underneath", { v: visual });
    },
    code: (p) => `animate(toast, { y: 0, opacity: 1 }, {\n  type: "spring",\n  visualDuration: ${num(p, "visual", 0.6)}, // perceptual\n});`,
  };
};

/** A flickable card whose release velocity feeds a spring snap-back. */
function flickCard(stage: HTMLElement, showVelocity: boolean) {
  clearStage(stage);
  const lane = elem(
    "div",
    undefined,
    "position:relative;width:240px;height:104px;border-radius:14px;overflow:hidden;background:var(--color-whisper-gray)"
  );
  const card = elem(
    "div",
    undefined,
    "position:absolute;left:50%;top:14px;width:200px;margin-left:-100px;display:flex;align-items:center;gap:11px;padding:12px;background:var(--color-canvas-white);border-radius:12px;box-shadow:var(--shadow-floating);cursor:grab;touch-action:none"
  );
  const art = imageTile({ i: 4, radius: 8 });
  art.style.cssText += ";flex:none;width:44px;height:44px";
  const meta = elem("div", undefined, "display:flex;flex-direction:column;gap:4px;min-width:0");
  const title = elem("span", undefined, "font-size:13px;font-weight:600;color:var(--color-midnight-ink)");
  title.textContent = dt("Aurora");
  const sub = elem("span", undefined, "font-size:11px;color:var(--color-muted-ash)");
  sub.textContent = dt("Sam KaLok");
  meta.append(title, sub);
  card.append(art, meta);
  lane.append(card);
  const cap = elem("div", "demo-caption");
  cap.textContent = dt("Flick the card and let go");
  stage.append(lane, cap);

  let startX = 0,
    lastX = 0,
    posX = 0,
    lastT = 0,
    vx = 0,
    dragging = false;
  card.addEventListener("pointerdown", (e) => {
    dragging = true;
    card.style.cursor = "grabbing";
    card.setPointerCapture(e.pointerId);
    startX = e.clientX - posX;
    lastT = performance.now();
  });
  card.addEventListener("pointermove", (e) => {
    if (!dragging) return;
    posX = Math.max(-130, Math.min(130, e.clientX - startX));
    const now = performance.now();
    vx = ((posX - lastX) / Math.max(now - lastT, 1)) * 1000;
    lastX = posX;
    lastT = now;
    card.style.transform = `translateX(${posX}px)`;
    if (showVelocity) cap.textContent = dt("velocity: {v} px/s", { v: vx.toFixed(0) });
  });
  const endDrag = () => {
    if (!dragging) return;
    dragging = false;
    card.style.cursor = "grab";
    // The release velocity is fed straight into the spring that carries it home.
    animate(card, { x: [posX, 0] }, { type: "spring", velocity: vx, stiffness: 180, damping: 18 }).then(() => {
      posX = 0;
    });
    if (showVelocity) cap.textContent = dt("released at {v} px/s — spring carries it home", { v: vx.toFixed(0) });
  };
  card.addEventListener("pointerup", endDrag);
  card.addEventListener("pointercancel", endDrag);
  return card;
}

// A mini-player card that carries momentum after a flick, then springs home.
const momentumUseCase: DemoFactory = (stage) => {
  flickCard(stage, false);
  return {
    play() {},
    continuous: true,
    code: () => `onRelease(velocity) =>\n  animate(card, { x: 0 }, { type: "spring", velocity });`,
  };
};

// Same flickable card, surfacing the release velocity that feeds the spring.
const velocityUseCase: DemoFactory = (stage) => {
  flickCard(stage, true);
  return {
    play() {},
    continuous: true,
    code: () => `// the release velocity is fed into the spring\nanimate(card, { x: 0 }, { type: "spring", velocity });`,
  };
};

// A movable tile that can be re-targeted mid-flight: tap again before it lands
// and the spring keeps its current velocity into the new target.
const interruptibleUseCase: DemoFactory = (stage) => {
  clearStage(stage);
  const field = frame("width:210px;height:150px;background:var(--color-whisper-gray);cursor:pointer");
  const tile = imageTile({ i: 0, radius: 12 });
  tile.style.cssText += ";position:absolute;left:50%;top:50%;width:46px;height:46px;margin:-23px 0 0 -23px;box-shadow:var(--shadow-floating);pointer-events:none";
  field.append(tile);
  const cap = elem("div", "demo-caption");
  cap.textContent = dt("Tap a spot — then tap again before it lands");
  stage.append(field, cap);
  field.addEventListener("pointerdown", (e) => {
    const rect = field.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    // Re-calling animate interrupts the in-flight spring, carrying its velocity.
    animate(tile, { x, y }, { type: "spring", stiffness: 200, damping: 20 });
  });
  return {
    play() {},
    continuous: true,
    code: () => `// re-call animate mid-flight; the spring keeps its velocity\nfield.onpointerdown = (e) => animate(tile, { x, y }, { type: "spring" });`,
  };
};

export const demos: Record<string, DemoFactory> = {
  spring,
  stiffness,
  damping,
  mass,
  bounce,
  perceptualDuration,
  momentum,
  velocity,
  interruptible,
  springUseCase,
  stiffnessUseCase,
  dampingUseCase,
  massUseCase,
  bounceUseCase,
  perceptualDurationUseCase,
  momentumUseCase,
  velocityUseCase,
  interruptibleUseCase,
};
