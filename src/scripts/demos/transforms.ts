import { animate } from "./anim";
import type { DemoFactory } from "./types";
import { clearStage, createBox, num, str } from "./utils";

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
      cap.textContent = `${persp}px — ${persp < 500 ? "exaggerated depth" : "subtle depth"}`;
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
  btn.textContent = "Open menu";
  const pop = document.createElement("div");
  pop.style.cssText =
    "position:absolute;top:56px;width:220px;padding:8px;border-radius:14px;background:#fff;box-shadow:var(--shadow-xl);transform-origin:top center;font-size:15px;color:var(--color-midnight-ink);z-index:2";
  const item = (t: string) =>
    `<div style="padding:10px 12px;border-radius:8px;font-weight:500">${t}</div>`;
  pop.innerHTML = item("Profile") + item("Settings") + item("Log out");
  wrap.append(btn, pop);
  stage.append(wrap);
  return {
    play(p) {
      const open = p.open === true;
      const d = num(p, "duration", 0.5);
      pop.style.display = "block";
      if (open) animate(pop, { opacity: [0, 1], scale: [0.6, 1], y: [-8, 0] }, { duration: d, ease: [0.34, 1.56, 0.64, 1] });
      else animate(pop, { opacity: [1, 0], scale: [1, 0.6], y: [0, -8] }, { duration: d * 0.7, ease: [0.7, 0, 0.84, 0] });
    },
    code: () => `// popover grows FROM the button, not its own centre\nel.style.transformOrigin = "top center";\nanimate(el, { scale: [0.6, 1], opacity: [0, 1] });`,
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
};
