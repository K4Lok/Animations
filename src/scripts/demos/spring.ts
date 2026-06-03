import { animate } from "./anim";
import type { DemoFactory } from "./types";
import { clearStage, createBox, num } from "./utils";

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
      cap.textContent = `Feels done in ~${v}s, while micro-settling continues underneath`;
      animate(box, { x: [-110, 110] }, { type: "spring", visualDuration: v, bounce: num(p, "bounce", 0.4) });
    },
    code: (p) => `animate(el, { x: 110 }, {\n  type: "spring",\n  visualDuration: ${num(p, "visual", 0.6)}, // perceptual\n});`,
  };
};

function flickBox(stage: HTMLElement, showVelocity = false) {
  clearStage(stage);
  const track = document.createElement("div");
  track.className = "demo-track demo-track--wide";
  const box = createBox({ label: showVelocity ? "↔" : "Flick" });
  track.append(box);
  const cap = document.createElement("div");
  cap.className = "demo-caption";
  cap.textContent = "Flick the box and let go";
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
    if (showVelocity) cap.textContent = `velocity: ${vx.toFixed(0)} px/s`;
  });
  const end = () => {
    if (!dragging) return;
    dragging = false;
    animate(box, { x: [posX, 0] }, { type: "spring", velocity: vx, stiffness: 180, damping: 18 }).then(() => {
      posX = 0;
    });
    if (showVelocity) cap.textContent = `released at ${vx.toFixed(0)} px/s — spring carries it home`;
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
  cap.textContent = "Click anywhere — then click again before it lands";
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
};
