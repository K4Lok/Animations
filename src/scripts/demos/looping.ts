import { animate } from "./anim";
import type { DemoFactory } from "./types";
import { clearStage, createBox, dt, num } from "./utils";
import { elem, frame, gradientFor } from "./kit";

type Controls = { stop: () => void };

const marquee: DemoFactory = (stage) => {
  clearStage(stage);
  const mask = document.createElement("div");
  mask.className = "demo-marquee";
  const track = document.createElement("div");
  track.className = "demo-marquee__track";
  const content = "FADE · SLIDE · SCALE · POP · SPRING · STAGGER · MORPH · ";
  track.textContent = content + content;
  mask.append(track);
  stage.append(mask);
  let ctrl: Controls | null = null;
  return {
    play(p) {
      ctrl?.stop();
      ctrl = animate(track, { x: ["0%", "-50%"] }, { duration: num(p, "speed", 8), ease: "linear", repeat: Infinity }) as unknown as Controls;
    },
    cleanup: () => ctrl?.stop(),
    continuous: true,
    code: (p) => `animate(track, { x: ["0%", "-50%"] }, {\n  duration: ${num(p, "speed", 8)}, ease: "linear", repeat: Infinity,\n});`,
  };
};

const loop: DemoFactory = (stage) => {
  clearStage(stage);
  const box = createBox({ label: "" });
  stage.append(box);
  let ctrl: Controls | null = null;
  return {
    play(p) {
      ctrl?.stop();
      ctrl = animate(box, { rotate: [0, 360] }, { duration: num(p, "duration", 0.8), ease: "linear", repeat: Infinity }) as unknown as Controls;
    },
    cleanup: () => ctrl?.stop(),
    continuous: true,
    code: (p) => `animate(el, { rotate: 360 }, {\n  duration: ${num(p, "duration", 0.8)}, repeat: Infinity,\n});`,
  };
};

const alternate: DemoFactory = (stage) => {
  clearStage(stage);
  const box = createBox({ label: "" });
  stage.append(box);
  let ctrl: Controls | null = null;
  return {
    play(p) {
      ctrl?.stop();
      ctrl = animate(box, { x: [-80, 80] }, { duration: num(p, "duration", 0.9), ease: "easeInOut", repeat: Infinity, repeatType: "reverse" }) as unknown as Controls;
    },
    cleanup: () => ctrl?.stop(),
    continuous: true,
    code: () => `animate(el, { x: [-80, 80] }, {\n  repeat: Infinity, repeatType: "reverse",\n});`,
  };
};

const orbit: DemoFactory = (stage) => {
  clearStage(stage);
  const center = document.createElement("div");
  center.className = "demo-orbit";
  const sun = createBox({ size: 24 });
  sun.style.background = "var(--color-muted-ash)";
  const satWrap = document.createElement("div");
  satWrap.className = "demo-orbit__arm";
  const sat = createBox({ size: 18 });
  sat.style.background = "var(--color-phoenix-orange)";
  satWrap.append(sat);
  center.append(sun, satWrap);
  stage.append(center);
  let ctrl: Controls | null = null;
  return {
    play(p) {
      ctrl?.stop();
      const r = num(p, "radius", 50);
      sat.style.transform = `translateX(${r}px)`;
      ctrl = animate(satWrap, { rotate: [0, 360] }, { duration: num(p, "speed", 4), ease: "linear", repeat: Infinity }) as unknown as Controls;
    },
    cleanup: () => ctrl?.stop(),
    continuous: true,
    code: () => `// arm spins; satellite sits at radius on the arm\nanimate(arm, { rotate: 360 }, { repeat: Infinity });`,
  };
};

const pulse: DemoFactory = (stage) => {
  clearStage(stage);
  const box = createBox({ size: 64 });
  box.style.borderRadius = "999px";
  stage.append(box);
  let ctrl: Controls | null = null;
  return {
    play(p) {
      ctrl?.stop();
      ctrl = animate(box, { scale: [1, 1.18, 1], opacity: [1, 0.7, 1] }, { duration: num(p, "duration", 1.2), ease: "easeInOut", repeat: Infinity }) as unknown as Controls;
    },
    cleanup: () => ctrl?.stop(),
    continuous: true,
    code: (p) => `animate(el, { scale: [1, 1.18, 1] }, {\n  duration: ${num(p, "duration", 1.2)}, repeat: Infinity,\n});`,
  };
};

const float: DemoFactory = (stage) => {
  clearStage(stage);
  const box = createBox({ label: "" });
  stage.append(box);
  let ctrl: Controls | null = null;
  return {
    play(p) {
      ctrl?.stop();
      const a = num(p, "amplitude", 12);
      ctrl = animate(box, { y: [-a, a] }, { duration: num(p, "duration", 2.4), ease: "easeInOut", repeat: Infinity, repeatType: "reverse" }) as unknown as Controls;
    },
    cleanup: () => ctrl?.stop(),
    continuous: true,
    code: (p) => `animate(el, { y: [-${num(p, "amplitude", 12)}, ${num(p, "amplitude", 12)}] }, {\n  repeat: Infinity, repeatType: "reverse", ease: "easeInOut",\n});`,
  };
};

const idle: DemoFactory = (stage) => {
  clearStage(stage);
  const box = createBox({ label: dt("idle") });
  stage.append(box);
  let ctrl: Controls | null = null;
  return {
    play() {
      ctrl?.stop();
      ctrl = animate(box, { rotate: [-2, 2], y: [-3, 3] }, { duration: 3, ease: "easeInOut", repeat: Infinity, repeatType: "mirror" }) as unknown as Controls;
    },
    cleanup: () => ctrl?.stop(),
    continuous: true,
    code: () => `// barely-there motion while waiting\nanimate(el, { rotate: [-2, 2], y: [-3, 3] }, {\n  repeat: Infinity, repeatType: "mirror",\n});`,
  };
};

/* ---- realistic "use case" variants ---- */

// "Trusted by" logo strip that scrolls forever. The content is duplicated so the
// -50% slide wraps seamlessly; a masked overflow:hidden frame hides the seam.
const marqueeUseCase: DemoFactory = (stage) => {
  clearStage(stage);
  const wrap = frame("width:240px;padding:14px 0");
  const label = elem(
    "div",
    undefined,
    "padding:0 14px 10px;font-size:11px;font-weight:600;letter-spacing:.04em;text-transform:uppercase;color:var(--color-muted-ash)"
  );
  label.textContent = dt("Trusted by");
  const mask = elem(
    "div",
    undefined,
    "position:relative;width:100%;overflow:hidden;-webkit-mask-image:linear-gradient(90deg,transparent,#000 12%,#000 88%,transparent);mask-image:linear-gradient(90deg,transparent,#000 12%,#000 88%,transparent)"
  );
  const track = elem("div", undefined, "display:flex;gap:14px;width:max-content;padding:0 7px;will-change:transform");
  const brands = ["Aurora", "Borealis", "Cascade", "Drift", "Ember", "Flux"];
  // Duplicate the brand list so a -50% slide lands exactly on the original set.
  const chip = (name: string, i: number) => {
    const c = elem(
      "div",
      undefined,
      "display:flex;align-items:center;gap:8px;flex:none;padding:7px 12px;border-radius:10px;background:var(--color-canvas-white);box-shadow:var(--shadow-subtle)"
    );
    const dot = elem("span", undefined, "flex:none;width:16px;height:16px;border-radius:5px");
    dot.style.background = gradientFor(i);
    const t = elem("span", undefined, "font-size:12px;font-weight:600;color:var(--color-midnight-ink);white-space:nowrap");
    t.textContent = name;
    c.append(dot, t);
    return c;
  };
  [...brands, ...brands].forEach((b, i) => track.append(chip(b, i)));
  mask.append(track);
  wrap.append(label, mask);
  stage.append(wrap);
  let ctrl: Controls | null = null;
  return {
    play(p) {
      ctrl?.stop();
      ctrl = animate(track, { x: ["0%", "-50%"] }, { duration: num(p, "speed", 8), ease: "linear", repeat: Infinity }) as unknown as Controls;
    },
    cleanup: () => ctrl?.stop(),
    continuous: true,
    code: (p) => `// content is duplicated → -50% wraps seamlessly\nanimate(track, { x: ["0%", "-50%"] }, {\n  duration: ${num(p, "speed", 8)}, ease: "linear", repeat: Infinity,\n});`,
  };
};

// A button stuck in its loading state: a spinning SVG ring next to "Saving…".
const loopUseCase: DemoFactory = (stage) => {
  clearStage(stage);
  const btn = elem(
    "div",
    undefined,
    "display:inline-flex;align-items:center;gap:10px;padding:11px 18px;border-radius:12px;background:var(--color-midnight-ink);box-shadow:var(--shadow-floating)"
  );
  // Inline SVG ring: a faint full circle with a bright arc that rotates.
  const spinner = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  spinner.setAttribute("viewBox", "0 0 24 24");
  spinner.setAttribute("width", "18");
  spinner.setAttribute("height", "18");
  spinner.style.cssText = "flex:none;display:block";
  spinner.innerHTML =
    `<circle cx="12" cy="12" r="9" fill="none" stroke="rgba(255,255,255,.28)" stroke-width="3" />` +
    `<path d="M12 3 a9 9 0 0 1 9 9" fill="none" stroke="#ffffff" stroke-width="3" stroke-linecap="round" />`;
  const text = elem("span", undefined, "font-size:13px;font-weight:600;color:var(--color-canvas-white)");
  text.textContent = dt("Saving…");
  btn.append(spinner, text);
  stage.append(btn);
  let ctrl: Controls | null = null;
  return {
    play(p) {
      ctrl?.stop();
      ctrl = animate(spinner, { rotate: [0, 360] }, { duration: num(p, "duration", 0.8), ease: "linear", repeat: Infinity }) as unknown as Controls;
    },
    cleanup: () => ctrl?.stop(),
    continuous: true,
    code: (p) => `// loading spinner rotates forever\nanimate(ring, { rotate: 360 }, {\n  duration: ${num(p, "duration", 0.8)}, ease: "linear", repeat: Infinity,\n});`,
  };
};

// "Swipe to continue" onboarding hint: a geometric chevron slides back and forth.
const alternateUseCase: DemoFactory = (stage) => {
  clearStage(stage);
  const card = frame("display:flex;align-items:center;gap:12px;width:220px;padding:14px 16px");
  const text = elem("div", undefined, "flex:1;min-width:0");
  const t = elem("span", undefined, "display:block;font-size:13px;font-weight:600;color:var(--color-midnight-ink)");
  t.textContent = dt("Swipe to continue");
  const s = elem("span", undefined, "display:block;margin-top:3px;font-size:11px;color:var(--color-muted-ash)");
  s.textContent = dt("Drag right to get started");
  text.append(t, s);
  const cue = elem("div", undefined, "flex:none;display:grid;place-items:center;width:34px;height:34px;border-radius:999px;background:var(--color-whisper-gray)");
  // Geometric chevron (rotated bordered box) rather than a glyph, so it stays centered.
  const chevron = elem(
    "span",
    undefined,
    "width:9px;height:9px;border-top:2px solid var(--color-phoenix-orange);border-right:2px solid var(--color-phoenix-orange);transform:rotate(45deg) translate(-1px,1px)"
  );
  cue.append(chevron);
  card.append(text, cue);
  stage.append(card);
  let ctrl: Controls | null = null;
  return {
    play(p) {
      ctrl?.stop();
      ctrl = animate(cue, { x: [-6, 6] }, { duration: num(p, "duration", 0.9), ease: "easeInOut", repeat: Infinity, repeatType: "reverse" }) as unknown as Controls;
    },
    cleanup: () => ctrl?.stop(),
    continuous: true,
    code: (p) => `// hint nudges back and forth forever\nanimate(chevron, { x: [-6, 6] }, {\n  duration: ${num(p, "duration", 0.9)}, repeat: Infinity, repeatType: "reverse",\n});`,
  };
};

// AI "thinking" indicator: a small dot orbits a core (arm rotates, dot sits at radius).
const orbitUseCase: DemoFactory = (stage) => {
  clearStage(stage);
  const card = frame("display:flex;align-items:center;gap:14px;width:220px;padding:14px 16px");
  const stageBox = elem("div", undefined, "position:relative;flex:none;display:grid;place-items:center;width:48px;height:48px");
  const core = elem(
    "div",
    undefined,
    "width:26px;height:26px;border-radius:8px;background:var(--color-midnight-ink);box-shadow:var(--shadow-floating)"
  );
  const arm = elem("div", undefined, "position:absolute;inset:0;display:grid;place-items:center;will-change:transform");
  const sat = elem("div", undefined, "width:10px;height:10px;border-radius:999px;background:var(--color-phoenix-orange)");
  arm.append(sat);
  stageBox.append(core, arm);
  const text = elem("div", undefined, "flex:1;min-width:0");
  const t = elem("span", undefined, "display:block;font-size:13px;font-weight:600;color:var(--color-midnight-ink)");
  t.textContent = dt("Thinking…");
  const sub = elem("span", undefined, "display:block;margin-top:3px;font-size:11px;color:var(--color-muted-ash)");
  sub.textContent = dt("Generating a response");
  text.append(t, sub);
  card.append(stageBox, text);
  stage.append(card);
  let ctrl: Controls | null = null;
  return {
    play(p) {
      ctrl?.stop();
      const r = num(p, "radius", 50);
      // Clamp the orbit so the satellite stays inside the small indicator.
      sat.style.transform = `translateX(${Math.min(r, 22)}px)`;
      ctrl = animate(arm, { rotate: [0, 360] }, { duration: num(p, "speed", 4), ease: "linear", repeat: Infinity }) as unknown as Controls;
    },
    cleanup: () => ctrl?.stop(),
    continuous: true,
    code: () => `// dot orbits the core while it thinks\nsat.style.transform = ` + "`translateX(${radius}px)`" + `;\nanimate(arm, { rotate: 360 }, { repeat: Infinity });`,
  };
};

// A "LIVE" pill whose recording dot pulses to draw the eye.
const pulseUseCase: DemoFactory = (stage) => {
  clearStage(stage);
  const pill = elem(
    "div",
    undefined,
    "display:inline-flex;align-items:center;gap:8px;padding:7px 14px 7px 11px;border-radius:999px;background:var(--color-midnight-ink);box-shadow:var(--shadow-floating)"
  );
  const dot = elem("span", undefined, "flex:none;width:9px;height:9px;border-radius:999px;background:var(--color-leadgen-red);will-change:transform,opacity");
  const text = elem("span", undefined, "font-size:11px;font-weight:700;letter-spacing:.08em;color:var(--color-canvas-white)");
  text.textContent = dt("LIVE");
  pill.append(dot, text);
  stage.append(pill);
  let ctrl: Controls | null = null;
  return {
    play(p) {
      ctrl?.stop();
      ctrl = animate(dot, { scale: [1, 1.18, 1], opacity: [1, 0.7, 1] }, { duration: num(p, "duration", 1.2), ease: "easeInOut", repeat: Infinity }) as unknown as Controls;
    },
    cleanup: () => ctrl?.stop(),
    continuous: true,
    code: (p) => `// recording dot pulses to draw attention\nanimate(dot, { scale: [1, 1.18, 1], opacity: [1, 0.7, 1] }, {\n  duration: ${num(p, "duration", 1.2)}, repeat: Infinity,\n});`,
  };
};

// A floating support chat bubble (circular FAB) that gently drifts up and down.
const floatUseCase: DemoFactory = (stage) => {
  clearStage(stage);
  const bubble = elem(
    "button",
    undefined,
    "display:grid;place-items:center;width:56px;height:56px;border-radius:999px;border:none;background:var(--color-phoenix-orange);box-shadow:var(--shadow-floating);cursor:pointer;will-change:transform"
  );
  bubble.setAttribute("type", "button");
  // SVG chat glyph, sized to the FAB, instead of a font emoji.
  const icon = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  icon.setAttribute("viewBox", "0 0 24 24");
  icon.setAttribute("width", "26");
  icon.setAttribute("height", "26");
  icon.style.cssText = "display:block";
  icon.innerHTML =
    `<path d="M5 4 h14 a2 2 0 0 1 2 2 v8 a2 2 0 0 1 -2 2 H10 l-4 4 v-4 H5 a2 2 0 0 1 -2 -2 V6 a2 2 0 0 1 2 -2 Z" fill="#ffffff" />`;
  bubble.append(icon);
  stage.append(bubble);
  let ctrl: Controls | null = null;
  return {
    play(p) {
      ctrl?.stop();
      const a = num(p, "amplitude", 12);
      ctrl = animate(bubble, { y: [-a, a] }, { duration: num(p, "duration", 2.4), ease: "easeInOut", repeat: Infinity, repeatType: "reverse" }) as unknown as Controls;
    },
    cleanup: () => ctrl?.stop(),
    continuous: true,
    code: (p) => `// help bubble drifts gently while it waits\nanimate(fab, { y: [-${num(p, "amplitude", 12)}, ${num(p, "amplitude", 12)}] }, {\n  repeat: Infinity, repeatType: "reverse", ease: "easeInOut",\n});`,
  };
};

// A primary CTA with a barely-there breathing motion while it waits to be noticed.
const idleUseCase: DemoFactory = (stage) => {
  clearStage(stage);
  const cta = elem(
    "button",
    undefined,
    "display:inline-flex;align-items:center;gap:8px;padding:13px 22px;border-radius:14px;border:none;background:var(--color-midnight-ink);box-shadow:var(--shadow-floating);cursor:pointer;will-change:transform"
  );
  cta.setAttribute("type", "button");
  const text = elem("span", undefined, "font-size:14px;font-weight:600;color:var(--color-canvas-white)");
  text.textContent = dt("Get started");
  // Geometric arrow chevron, sized to the label.
  const arrow = elem(
    "span",
    undefined,
    "width:7px;height:7px;border-top:2px solid var(--color-canvas-white);border-right:2px solid var(--color-canvas-white);transform:rotate(45deg)"
  );
  cta.append(text, arrow);
  stage.append(cta);
  let ctrl: Controls | null = null;
  return {
    play() {
      ctrl?.stop();
      ctrl = animate(cta, { scale: [1, 1.03], y: [-2, 2] }, { duration: 3, ease: "easeInOut", repeat: Infinity, repeatType: "mirror" }) as unknown as Controls;
    },
    cleanup: () => ctrl?.stop(),
    continuous: true,
    code: () => `// CTA breathes while waiting to be noticed\nanimate(cta, { scale: [1, 1.03], y: [-2, 2] }, {\n  duration: 3, repeat: Infinity, repeatType: "mirror",\n});`,
  };
};

export const demos: Record<string, DemoFactory> = {
  marquee,
  loop,
  alternate,
  orbit,
  pulse,
  float,
  idle,
  marqueeUseCase,
  loopUseCase,
  alternateUseCase,
  orbitUseCase,
  pulseUseCase,
  floatUseCase,
  idleUseCase,
};
