import { animate } from "./anim";
import type { DemoFactory } from "./types";
import { clearStage, createBox, dt, num, str } from "./utils";
import { elem, frame, imageTile, listRow } from "./kit";

const EASE_OUT: [number, number, number, number] = [0.16, 1, 0.3, 1];
const SPRINGY: [number, number, number, number] = [0.34, 1.56, 0.64, 1];

const translate: DemoFactory = (stage) => {
  clearStage(stage);
  const box = createBox({ label: "" });
  stage.append(box);
  return {
    play(p) {
      animate(box, { x: [0, num(p, "x", 80)], y: [0, num(p, "y", 0)] }, { duration: num(p, "duration", 0.6), ease: [0.16, 1, 0.3, 1] });
    },
    code: (p) => `animate(el, { x: ${num(p, "x", 80)}, y: ${num(p, "y", 0)} });`,
  };
};

const scaleDemo: DemoFactory = (stage) => {
  clearStage(stage);
  const box = createBox({ label: "" });
  stage.append(box);
  return {
    play(p) {
      animate(box, { scale: [1, num(p, "scale", 1.4)] }, { duration: num(p, "duration", 0.6), ease: [0.16, 1, 0.3, 1] });
    },
    code: (p) => `animate(el, { scale: ${num(p, "scale", 1.4)} });`,
  };
};

const rotate: DemoFactory = (stage) => {
  clearStage(stage);
  const box = createBox({ label: "" });
  stage.append(box);
  return {
    play(p) {
      animate(box, { rotate: [0, num(p, "angle", 180)] }, { duration: num(p, "duration", 0.7), ease: [0.16, 1, 0.3, 1] });
    },
    code: (p) => `animate(el, { rotate: ${num(p, "angle", 180)} });`,
  };
};

const skew: DemoFactory = (stage) => {
  clearStage(stage);
  const box = createBox({ label: "" });
  stage.append(box);
  return {
    play(p) {
      animate(
        box,
        { skewX: [0, num(p, "skewX", 20)], skewY: [0, num(p, "skewY", 0)] },
        { duration: num(p, "duration", 0.6), ease: [0.16, 1, 0.3, 1] }
      );
    },
    code: (p) => `animate(el, { skewX: ${num(p, "skewX", 20)}, skewY: ${num(p, "skewY", 0)} });`,
  };
};

const tilt3d: DemoFactory = (stage) => {
  clearStage(stage);
  const scene = document.createElement("div");
  const box = createBox({ label: "3D", size: 96 });
  box.style.transformStyle = "preserve-3d";
  scene.append(box);
  stage.append(scene);
  return {
    play(p) {
      scene.style.perspective = `${num(p, "perspective", 600)}px`;
      animate(
        box,
        { rotateX: [0, num(p, "rotateX", 25)], rotateY: [0, num(p, "rotateY", 35)] },
        { duration: num(p, "duration", 0.8), ease: [0.16, 1, 0.3, 1] }
      );
    },
    code: (p) =>
      `// parent: perspective: ${num(p, "perspective", 600)}px\nanimate(el, { rotateX: ${num(p, "rotateX", 25)}, rotateY: ${num(p, "rotateY", 35)} });`,
  };
};

const perspective: DemoFactory = (stage) => {
  clearStage(stage);
  const scene = document.createElement("div");
  const box = createBox({ label: "", size: 96 });
  box.style.transformStyle = "preserve-3d";
  scene.append(box);
  const cap = document.createElement("div");
  cap.className = "demo-caption";
  stage.append(scene, cap);
  return {
    play(p) {
      const persp = num(p, "perspective", 400);
      scene.style.perspective = `${persp}px`;
      cap.textContent = `${persp}px — ${persp < 500 ? dt("exaggerated depth") : dt("subtle depth")}`;
      animate(box, { rotateY: [0, 360] }, { duration: num(p, "duration", 1.4), ease: "linear" });
    },
    code: (p) => `parent { perspective: ${num(p, "perspective", 400)}px }\nanimate(el, { rotateY: 360 });`,
  };
};

const transformOrigin: DemoFactory = (stage) => {
  clearStage(stage);
  const box = createBox({ label: "", size: 96 });
  stage.append(box);
  return {
    play(p) {
      box.style.transformOrigin = str(p, "origin", "top left");
      animate(box, { rotate: [0, 90], scale: [1, 0.6, 1] }, { duration: num(p, "duration", 0.8), ease: [0.16, 1, 0.3, 1] });
    },
    code: (p) => `el.style.transformOrigin = "${str(p, "origin", "top left")}";\nanimate(el, { rotate: 90 });`,
  };
};

const originAware: DemoFactory = (stage) => {
  clearStage(stage);
  const wrap = document.createElement("div");
  wrap.style.cssText = "position:relative;display:flex;flex-direction:column;align-items:center;gap:8px";
  const btn = document.createElement("button");
  btn.className = "demo-trigger";
  btn.style.cursor = "pointer";
  btn.textContent = dt("Open menu");
  const pop = document.createElement("div");
  pop.style.cssText =
    "position:absolute;top:56px;width:220px;padding:8px;border-radius:14px;background:#fff;box-shadow:var(--shadow-xl);transform-origin:top center;font-size:15px;color:var(--color-midnight-ink);z-index:2;opacity:0;pointer-events:none";
  const item = (t: string) =>
    `<div style="padding:10px 12px;border-radius:8px;font-weight:500">${t}</div>`;
  pop.innerHTML = item(dt("Profile")) + item(dt("Settings")) + item(dt("Log out"));
  wrap.append(btn, pop);
  stage.append(wrap);
  let open = false;
  let duration = 0.5;
  btn.addEventListener("click", () => {
    open = !open;
    pop.style.pointerEvents = open ? "auto" : "none";
    if (open) animate(pop, { opacity: [0, 1], scale: [0.6, 1], y: [-8, 0] }, { duration, ease: SPRINGY });
    else animate(pop, { opacity: [1, 0], scale: [1, 0.6], y: [0, -8] }, { duration: duration * 0.7, ease: [0.7, 0, 0.84, 0] });
  });
  return {
    play(p) {
      duration = num(p, "duration", 0.5);
    },
    code: () => `// popover grows FROM the button, not its own centre\nel.style.transformOrigin = "top center";\nanimate(el, { scale: [0.6, 1], opacity: [0, 1] });`,
  };
};

/* ---- realistic "use case" variants ---- */

// translate → an iOS-style toggle switch whose knob slides on/off.
const translateUseCase: DemoFactory = (stage) => {
  clearStage(stage);
  const sw = elem(
    "button",
    undefined,
    "position:relative;width:64px;height:36px;border-radius:999px;border:none;padding:0;background:#d4d8e0;cursor:pointer;transition:background-color .25s ease;box-shadow:inset 0 0 0 1px rgba(0,0,0,.04)"
  );
  const knob = elem(
    "span",
    undefined,
    "position:absolute;top:3px;left:3px;width:30px;height:30px;border-radius:999px;background:#fff;box-shadow:0 2px 6px rgba(0,0,0,.25);pointer-events:none"
  );
  sw.append(knob);
  stage.append(sw);
  let on = false;
  // The knob slides by `x` (the track grows to fit it); `y` adds a small nudge.
  let x = 28;
  let y = 0;
  let duration = 0.6;
  const sizeTrack = () => {
    sw.style.width = `${x + 36}px`;
  };
  sw.addEventListener("click", () => {
    on = !on;
    sw.style.background = on ? "var(--color-deliver-green)" : "#d4d8e0";
    animate(knob, { x: on ? [0, x] : [x, 0], y: on ? [0, y] : [y, 0] }, { duration, ease: SPRINGY });
  });
  return {
    play(p) {
      x = Math.max(0, num(p, "x", 80));
      y = num(p, "y", 0);
      duration = num(p, "duration", 0.6);
      sizeTrack();
      knob.style.transform = on ? `translateX(${x}px) translateY(${y}px)` : "translateX(0px) translateY(0px)";
    },
    code: () => "// tap the switch → the knob translates across the track\nanimate(knob, { x: on ? x : 0, y });",
  };
};

// scale → a photo thumbnail that zooms up (with a subtle shadow) on tap.
const scaleUseCase: DemoFactory = (stage) => {
  clearStage(stage);
  const wrap = elem("div", undefined, "display:grid;place-items:center;width:140px;height:140px");
  const tile = imageTile({ i: 1, radius: 14 });
  tile.style.cssText += ";width:84px;height:84px;cursor:pointer;will-change:transform;box-shadow:var(--shadow-subtle)";
  wrap.append(tile);
  stage.append(wrap);
  let zoomed = false;
  let scale = 1.4;
  let duration = 0.6;
  tile.addEventListener("click", () => {
    zoomed = !zoomed;
    tile.style.boxShadow = zoomed ? "var(--shadow-xl)" : "var(--shadow-subtle)";
    animate(tile, { scale: zoomed ? [1, scale] : [scale, 1] }, { duration, ease: EASE_OUT });
  });
  return {
    play(p) {
      scale = num(p, "scale", 1.4);
      duration = num(p, "duration", 0.6);
    },
    code: () => `// tap the thumbnail → it scales up with a deeper shadow\nanimate(tile, { scale: zoomed ? target : 1 });`,
  };
};

// rotate → a refresh/sync icon button whose circular-arrow spins on tap.
const rotateUseCase: DemoFactory = (stage) => {
  clearStage(stage);
  const btn = elem(
    "button",
    undefined,
    "display:grid;place-items:center;width:52px;height:52px;border-radius:14px;border:none;background:#fff;box-shadow:var(--shadow-floating);cursor:pointer"
  );
  const NS = "http://www.w3.org/2000/svg";
  const svg = document.createElementNS(NS, "svg");
  svg.setAttribute("viewBox", "0 0 24 24");
  svg.setAttribute("width", "26");
  svg.setAttribute("height", "26");
  svg.setAttribute("fill", "none");
  svg.style.display = "block";
  // Circular-arrow (refresh) icon: a near-full ring with an arrow head.
  const ring = document.createElementNS(NS, "path");
  ring.setAttribute("d", "M20 12a8 8 0 1 1-2.34-5.66");
  ring.setAttribute("stroke", "var(--color-intelligence-blue)");
  ring.setAttribute("stroke-width", "2.2");
  ring.setAttribute("stroke-linecap", "round");
  const head = document.createElementNS(NS, "path");
  head.setAttribute("d", "M20 4v4.5h-4.5");
  head.setAttribute("stroke", "var(--color-intelligence-blue)");
  head.setAttribute("stroke-width", "2.2");
  head.setAttribute("stroke-linecap", "round");
  head.setAttribute("stroke-linejoin", "round");
  svg.append(ring, head);
  btn.append(svg);
  stage.append(btn);
  let angle = 180;
  let duration = 0.7;
  let total = 0;
  btn.addEventListener("click", () => {
    const from = total;
    total += angle;
    animate(svg, { rotate: [from, total] }, { duration, ease: EASE_OUT });
  });
  return {
    play(p) {
      angle = num(p, "angle", 180);
      duration = num(p, "duration", 0.7);
    },
    code: () => `// tap sync → the icon rotates by the chosen angle\nanimate(icon, { rotate: prev + angle });`,
  };
};

// tilt3d → a premium card that tilts in 3D, following the pointer within it.
const tilt3dUseCase: DemoFactory = (stage) => {
  clearStage(stage);
  const scene = elem("div", undefined, "display:grid;place-items:center;width:220px;height:150px");
  const card = elem(
    "div",
    undefined,
    "position:relative;width:180px;height:112px;border-radius:16px;background:linear-gradient(135deg,var(--color-midnight-violet) 0%,var(--color-intelligence-blue) 100%);box-shadow:var(--shadow-xl);transform-style:preserve-3d;cursor:pointer;overflow:hidden;will-change:transform"
  );
  const sheen = elem(
    "div",
    undefined,
    "position:absolute;inset:0;background:linear-gradient(120deg,rgba(255,255,255,.35),rgba(255,255,255,0) 55%);pointer-events:none"
  );
  const chip = elem("div", undefined, "position:absolute;top:18px;left:18px;width:30px;height:22px;border-radius:5px;background:var(--color-engagement-gold)");
  const number = elem("div", undefined, "position:absolute;left:18px;bottom:34px;color:#fff;font-size:13px;letter-spacing:2px;font-weight:600;opacity:.92");
  number.textContent = "•••• 4 0 7";
  const name = elem("div", undefined, "position:absolute;left:18px;bottom:14px;color:#fff;font-size:11px;letter-spacing:1px;opacity:.85");
  name.textContent = dt("Sam KaLok");
  card.append(sheen, chip, number, name);
  scene.append(card);
  stage.append(scene);
  let rx = 25;
  let ry = 35;
  let duration = 0.8;
  scene.style.perspective = "600px";
  const onMove = (e: PointerEvent) => {
    const r = card.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5; // -0.5 … 0.5
    const py = (e.clientY - r.top) / r.height - 0.5;
    card.style.transform = `rotateX(${-py * 2 * rx}deg) rotateY(${px * 2 * ry}deg)`;
  };
  const onLeave = () => {
    animate(card, { rotateX: 0, rotateY: 0 }, { duration, ease: EASE_OUT });
  };
  card.addEventListener("pointermove", onMove);
  card.addEventListener("pointerleave", onLeave);
  return {
    play(p) {
      scene.style.perspective = `${num(p, "perspective", 600)}px`;
      rx = num(p, "rotateX", 25);
      ry = num(p, "rotateY", 35);
      duration = num(p, "duration", 0.8);
    },
    code: (p) =>
      `// parent: perspective: ${num(p, "perspective", 600)}px\n// pointermove → tilt toward the cursor\ncard.style.transform = "rotateX(..) rotateY(..)";`,
  };
};

// perspective → a flip card that turns to reveal its back face on tap.
const perspectiveUseCase: DemoFactory = (stage) => {
  clearStage(stage);
  const scene = elem("div", undefined, "display:grid;place-items:center;width:200px;height:150px");
  const card = elem(
    "div",
    undefined,
    "position:relative;width:120px;height:120px;transform-style:preserve-3d;cursor:pointer;will-change:transform"
  );
  const face = (css: string) =>
    elem(
      "div",
      undefined,
      "position:absolute;inset:0;border-radius:16px;display:grid;place-items:center;backface-visibility:hidden;box-shadow:var(--shadow-floating);color:#fff;font-size:13px;font-weight:600;" +
        css
    );
  const front = face("background:linear-gradient(135deg,var(--color-intelligence-blue),var(--color-midnight-violet))");
  front.textContent = dt("Tap to flip");
  const back = face(
    "background:linear-gradient(135deg,var(--color-phoenix-orange),var(--color-engagement-gold));transform:rotateY(180deg)"
  );
  back.textContent = dt("Sam KaLok");
  card.append(front, back);
  scene.append(card);
  stage.append(scene);
  let flipped = false;
  let duration = 0.7;
  scene.style.perspective = "400px";
  card.addEventListener("click", () => {
    flipped = !flipped;
    animate(card, { rotateY: flipped ? [0, 180] : [180, 0] }, { duration, ease: EASE_OUT });
  });
  return {
    play(p) {
      scene.style.perspective = `${num(p, "perspective", 400)}px`;
      duration = num(p, "duration", 0.7);
    },
    code: (p) => `// parent { perspective: ${num(p, "perspective", 400)}px }\n// tap → flip to the back face\nanimate(card, { rotateY: flipped ? 180 : 0 });`,
  };
};

// transformOrigin → a context menu that scales open FROM the chosen corner.
const transformOriginUseCase: DemoFactory = (stage) => {
  clearStage(stage);
  const wrap = elem("div", undefined, "position:relative;width:210px;height:150px");
  const trigger = elem(
    "button",
    undefined,
    "position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);display:grid;place-items:center;width:44px;height:44px;border-radius:12px;border:none;background:#fff;box-shadow:var(--shadow-floating);color:var(--color-midnight-ink);font-size:20px;line-height:1;cursor:pointer"
  );
  trigger.textContent = "⋯";
  const menu = frame(
    "position:absolute;left:50%;top:50%;width:140px;padding:5px;display:flex;flex-direction:column;gap:1px;opacity:0;pointer-events:none;z-index:2"
  );
  const item = (label: string) => {
    const b = elem(
      "button",
      undefined,
      "width:100%;padding:8px 10px;font:inherit;font-size:12px;font-weight:500;color:var(--color-midnight-ink);background:transparent;border:none;border-radius:7px;text-align:left;cursor:pointer"
    );
    b.textContent = label;
    return b;
  };
  const items = [dt("Edit"), dt("Duplicate"), dt("Delete")].map(item);
  menu.append(...items);
  wrap.append(trigger, menu);
  stage.append(wrap);
  let open = false;
  let origin = "top left";
  let duration = 0.4;
  const place = () => {
    // Anchor the menu's chosen corner near the trigger centre so it grows outward.
    const [vy, vx] = origin.split(" ");
    menu.style.left = vx === "left" ? "50%" : vx === "right" ? "calc(50% - 140px)" : "calc(50% - 70px)";
    menu.style.top = vy === "top" ? "50%" : vy === "bottom" ? "calc(50% - 96px)" : "calc(50% - 48px)";
    menu.style.transformOrigin = origin;
  };
  const apply = () => {
    menu.style.pointerEvents = open ? "auto" : "none";
    if (open) animate(menu, { scale: [0.4, 1], opacity: [0, 1] }, { duration, ease: SPRINGY });
    else animate(menu, { scale: [1, 0.4], opacity: [1, 0] }, { duration: duration * 0.7, ease: [0.7, 0, 0.84, 0] });
  };
  trigger.addEventListener("click", () => {
    open = !open;
    if (open) place();
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
      origin = str(p, "origin", "top left");
      duration = num(p, "duration", 0.4);
      if (open) place();
    },
    code: (p) => `// menu scales open FROM the picked corner\nmenu.style.transformOrigin = "${str(p, "origin", "top left")}";\nanimate(menu, { scale: [0.4, 1], opacity: [0, 1] });`,
  };
};

// originAware → a "+" button opening a menu that grows FROM the button.
const originAwareUseCase: DemoFactory = (stage) => {
  clearStage(stage);
  const wrap = elem("div", undefined, "position:relative;width:200px;height:170px;display:flex;justify-content:center");
  const trigger = elem(
    "button",
    undefined,
    "position:absolute;top:10px;display:grid;place-items:center;width:46px;height:46px;border-radius:999px;background:var(--color-phoenix-orange);color:#fff;font-size:30px;font-weight:300;line-height:1;border:none;cursor:pointer;z-index:2;box-shadow:var(--shadow-floating)"
  );
  trigger.textContent = "+";
  const menu = frame(
    "position:absolute;top:64px;width:160px;padding:6px;display:flex;flex-direction:column;gap:4px;transform-origin:top center;opacity:0;pointer-events:none"
  );
  const opt = (i: number, title: string) => {
    const row = listRow({ i, title });
    row.style.cursor = "pointer";
    return row;
  };
  const options = [opt(2, dt("New note")), opt(3, dt("New task")), opt(4, dt("New event"))];
  menu.append(...options);
  wrap.append(trigger, menu);
  stage.append(wrap);
  let open = false;
  let duration = 0.5;
  const apply = () => {
    menu.style.pointerEvents = open ? "auto" : "none";
    if (open) animate(menu, { scale: [0.5, 1], opacity: [0, 1], y: [-8, 0] }, { duration, ease: SPRINGY });
    else animate(menu, { scale: [1, 0.5], opacity: [1, 0], y: [0, -8] }, { duration: duration * 0.7, ease: [0.7, 0, 0.84, 0] });
  };
  trigger.addEventListener("click", () => {
    open = !open;
    trigger.style.transform = open ? "rotate(45deg)" : "rotate(0deg)";
    trigger.style.transition = "transform .25s ease";
    apply();
  });
  options.forEach((row) =>
    row.addEventListener("click", () => {
      if (!open) return;
      open = false;
      trigger.style.transform = "rotate(0deg)";
      apply();
    })
  );
  return {
    play(p) {
      duration = num(p, "duration", 0.5);
    },
    code: () => `// menu grows FROM the button, not its own centre\nmenu.style.transformOrigin = "top center";\nanimate(menu, { scale: [0.5, 1], opacity: [0, 1] });`,
  };
};

export const demos: Record<string, DemoFactory> = {
  translate,
  scale: scaleDemo,
  rotate,
  skew,
  tilt3d,
  perspective,
  transformOrigin,
  originAware,
  translateUseCase,
  scaleUseCase,
  rotateUseCase,
  tilt3dUseCase,
  perspectiveUseCase,
  transformOriginUseCase,
  originAwareUseCase,
};
