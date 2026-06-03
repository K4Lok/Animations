import { animate } from "motion";
import type { DemoFactory } from "./types";
import { clearStage, createBox, num, bool } from "./utils";

const purposeful: DemoFactory = (stage) => {
  clearStage(stage);
  const box = createBox({ label: "" });
  const cap = document.createElement("div");
  cap.className = "demo-caption";
  stage.append(box, cap);
  return {
    play(p) {
      const bad = bool(p, "gratuitous", false);
      cap.textContent = bad
        ? "Gratuitous: spins and flips for no reason"
        : "Purposeful: a clean entrance that orients you";
      if (bad)
        animate(box, { rotate: [0, 720], scale: [0.2, 1.4, 1], opacity: [0, 1] }, { duration: 1.1, ease: "easeInOut" });
      else animate(box, { y: [16, 0], opacity: [0, 1] }, { duration: 0.4, ease: [0.16, 1, 0.3, 1] });
    },
    code: () => `// motion should serve a function, not decorate\nanimate(el, { y: [16, 0], opacity: [0, 1] });`,
  };
};

const anticipation: DemoFactory = (stage) => {
  clearStage(stage);
  const box = createBox({ label: "" });
  stage.append(box);
  return {
    play(p) {
      if (bool(p, "on", true))
        animate(box, { x: [0, -24, 140] }, { duration: 0.7, times: [0, 0.3, 1], ease: [0.5, 0, 0.2, 1] });
      else animate(box, { x: [0, 140] }, { duration: 0.5, ease: [0.16, 1, 0.3, 1] });
    },
    code: () => `// small wind-up the opposite way first\nanimate(el, { x: [0, -24, 140] }, { times: [0, 0.3, 1] });`,
  };
};

const followThrough: DemoFactory = (stage) => {
  clearStage(stage);
  const box = createBox({ label: "" });
  stage.append(box);
  return {
    play(p) {
      if (bool(p, "on", true))
        animate(box, { x: [-110, 110] }, { type: "spring", stiffness: 220, damping: 12 });
      else animate(box, { x: [-110, 110] }, { duration: 0.45, ease: [0.16, 1, 0.3, 1] });
    },
    code: () => `// overshoots, then settles back\nanimate(el, { x: 110 }, { type: "spring", damping: 12 });`,
  };
};

const squashStretch: DemoFactory = (stage) => {
  clearStage(stage);
  const lane = document.createElement("div");
  lane.className = "demo-drop-lane";
  const ball = document.createElement("div");
  ball.className = "demo-dot";
  ball.style.cssText = "width:44px;height:44px;border-radius:999px;background:var(--color-midnight-ink)";
  lane.append(ball);
  stage.append(lane);
  return {
    play(p) {
      const a = num(p, "amount", 0.3);
      animate(
        ball,
        {
          y: [-70, 0, -40, 0],
          scaleY: [1, 1 - a, 1 + a * 0.5, 1],
          scaleX: [1, 1 + a, 1 - a * 0.3, 1],
        },
        { duration: 1, times: [0, 0.45, 0.7, 1], ease: "easeIn" }
      );
    },
    code: (p) => `animate(ball, {\n  y: [-70, 0, -40, 0],\n  scaleY: [1, ${(1 - num(p, "amount", 0.3)).toFixed(2)}, 1.1, 1],\n});`,
  };
};

const perceivedPerf: DemoFactory = (stage) => {
  clearStage(stage);
  const cap = document.createElement("div");
  cap.className = "demo-caption";
  const view = document.createElement("div");
  view.className = "demo-skel";
  stage.append(view, cap);
  let timer: number | undefined;
  return {
    play(p) {
      clearTimeout(timer);
      const useSkeleton = bool(p, "skeleton", true);
      cap.textContent = useSkeleton ? "Skeleton → feels instant and responsive" : "Spinner → feels like waiting";
      if (useSkeleton) {
        view.innerHTML = `<div class="demo-skel__line" style="width:55%"></div><div class="demo-skel__line" style="width:100%"></div><div class="demo-skel__line" style="width:78%"></div>`;
      } else {
        view.innerHTML = `<div class="demo-spinner"></div>`;
      }
      timer = window.setTimeout(() => {
        view.innerHTML = `<div style="font-weight:600">Aurora Borealis</div><div style="font-size:12px;color:var(--color-muted-ash);margin-top:6px">Loaded in 1.2s</div>`;
      }, 1200);
    },
    cleanup: () => clearTimeout(timer),
    code: () => `// a skeleton makes the same wait feel faster\nshow(skeleton); await data; show(content);`,
  };
};

const frequency: DemoFactory = (stage) => {
  clearStage(stage);
  const box = createBox({ label: "" });
  const cap = document.createElement("div");
  cap.className = "demo-caption";
  stage.append(box, cap);
  return {
    play(p) {
      const restraint = num(p, "subtlety", 0.6); // 0 = showy, 1 = subtle
      const dur = 0.3 + (1 - restraint) * 0.9;
      const travel = 10 + (1 - restraint) * 80;
      cap.textContent =
        restraint > 0.6 ? "Seen often → short and subtle" : "Seen rarely → can be bigger and slower";
      animate(box, { y: [travel * 0.4, 0], scale: [1 - (1 - restraint) * 0.3, 1], opacity: [0, 1] }, { duration: dur, ease: [0.16, 1, 0.3, 1] });
    },
    code: () => `// frequent UI → shorter, smaller motion\nduration = 0.3 + rareness * 0.9;`,
  };
};

const spatialConsistency: DemoFactory = (stage) => {
  clearStage(stage);
  const lane = document.createElement("div");
  lane.className = "demo-track demo-track--wide";
  const box = createBox({ label: "" });
  box.style.position = "absolute";
  box.style.left = "0";
  lane.append(box);
  stage.append(lane);
  let atEnd = false;
  return {
    play(p) {
      atEnd = !atEnd;
      const target = atEnd ? 200 : 0;
      if (bool(p, "animate", true)) animate(box, { left: `${target}px` }, { type: "spring", stiffness: 280, damping: 28 });
      else box.style.left = `${target}px`; // snaps — you lose track
    },
    code: () => `// animate the move so the element keeps its identity\nanimate(el, { left: target }, { type: "spring" });`,
  };
};

const hardwareAccel: DemoFactory = (stage) => {
  clearStage(stage);
  const box = createBox({ label: "GPU" });
  const cap = document.createElement("div");
  cap.className = "demo-caption";
  cap.textContent = "transform + opacity stay on the GPU — buttery smooth";
  stage.append(box, cap);
  let ctrl: { stop: () => void } | null = null;
  return {
    play() {
      ctrl?.stop();
      ctrl = animate(box, { x: [-90, 90], rotate: [0, 12, -12, 0], opacity: [1, 0.7, 1] }, { duration: 1.4, ease: "easeInOut", repeat: Infinity, repeatType: "reverse" }) as unknown as { stop: () => void };
    },
    cleanup: () => ctrl?.stop(),
    continuous: true,
    code: () => `// GPU-friendly properties only\nanimate(el, { transform, opacity });`,
  };
};

const reducedMotion: DemoFactory = (stage) => {
  clearStage(stage);
  const box = createBox({ label: "" });
  const cap = document.createElement("div");
  cap.className = "demo-caption";
  stage.append(box, cap);
  return {
    play(p) {
      const reduce = bool(p, "reduce", false);
      cap.textContent = reduce
        ? "Reduced: a quiet fade, no large movement"
        : "Full: slides and scales in";
      if (reduce) animate(box, { opacity: [0, 1] }, { duration: 0.3 });
      else animate(box, { x: [-90, 0], scale: [0.6, 1], opacity: [0, 1] }, { duration: 0.6, ease: [0.34, 1.56, 0.64, 1] });
    },
    code: () => `@media (prefers-reduced-motion: reduce) {\n  /* tone down or remove movement */\n}`,
  };
};

export const demos: Record<string, DemoFactory> = {
  purposeful,
  anticipation,
  followThrough,
  squashStretch,
  perceivedPerf,
  frequency,
  spatialConsistency,
  hardwareAccel,
  reducedMotion,
};
