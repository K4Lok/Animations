import { animate } from "./anim";
import type { DemoFactory, Params } from "./types";
import {
  clearStage,
  createBox,
  dt,
  EASING_ARRAYS,
  num,
  str,
  bool,
} from "./utils";

const easeOptions = [
  { label: "Ease out", value: "ease-out" },
  { label: "Ease in out", value: "ease-in-out" },
  { label: "Ease in", value: "ease-in" },
  { label: "Linear", value: "linear" },
];

function ease(p: Params) {
  return EASING_ARRAYS[str(p, "easing", "ease-out")] ?? EASING_ARRAYS["ease-out"];
}

const fade: DemoFactory = (stage) => {
  clearStage(stage);
  const box = createBox({ label: dt("Hi") });
  stage.append(box);
  return {
    play(p) {
      const opts = { duration: num(p, "duration", 0.6), delay: num(p, "delay", 0), ease: ease(p) };
      animate(box, { opacity: [0, 1] }, opts);
    },
    code: (p) =>
      `animate(el, { opacity: [0, 1] }, {\n  duration: ${num(p, "duration", 0.6)},\n  delay: ${num(p, "delay", 0)},\n});`,
  };
};

const slide: DemoFactory = (stage) => {
  clearStage(stage);
  const box = createBox({ label: dt("Hi") });
  stage.append(box);
  return {
    play(p) {
      const dist = num(p, "distance", 64);
      const dir = str(p, "direction", "left");
      const from: Record<string, number[]> = { opacity: [0, 1] };
      if (dir === "left") from.x = [-dist, 0];
      else if (dir === "right") from.x = [dist, 0];
      else if (dir === "top") from.y = [-dist, 0];
      else from.y = [dist, 0];
      animate(box, from as any, {
        duration: num(p, "duration", 0.6),
        delay: num(p, "delay", 0),
        ease: ease(p),
      });
    },
    code: (p) =>
      `animate(el, {\n  ${str(p, "direction", "left") === "left" || str(p, "direction", "left") === "right" ? "x" : "y"}: [from, 0],\n  opacity: [0, 1],\n}, { duration: ${num(p, "duration", 0.6)} });`,
  };
};

const scale: DemoFactory = (stage) => {
  clearStage(stage);
  const box = createBox({ label: dt("Hi") });
  stage.append(box);
  return {
    play(p) {
      animate(
        box,
        { scale: [num(p, "from", 0.6), 1], opacity: [0, 1] },
        { duration: num(p, "duration", 0.5), delay: num(p, "delay", 0), ease: ease(p) }
      );
    },
    code: (p) =>
      `animate(el, { scale: [${num(p, "from", 0.6)}, 1], opacity: [0, 1] },\n  { duration: ${num(p, "duration", 0.5)} });`,
  };
};

const pop: DemoFactory = (stage) => {
  clearStage(stage);
  const box = createBox({ label: dt("Pop") });
  stage.append(box);
  return {
    play(p) {
      animate(
        box,
        { scale: [0.3, 1], opacity: [0, 1] },
        {
          type: "spring",
          visualDuration: num(p, "duration", 0.5),
          bounce: num(p, "bounce", 0.5),
          delay: num(p, "delay", 0),
        } as any
      );
    },
    code: (p) =>
      `animate(el, { scale: [0.3, 1], opacity: [0, 1] }, {\n  type: "spring",\n  visualDuration: ${num(p, "duration", 0.5)},\n  bounce: ${num(p, "bounce", 0.5)},\n});`,
  };
};

const closedClip = (dir: string) =>
  dir === "left"
    ? "inset(0 100% 0 0)"
    : dir === "right"
      ? "inset(0 0 0 100%)"
      : dir === "top"
        ? "inset(0 0 100% 0)"
        : "inset(100% 0 0 0)";

const reveal: DemoFactory = (stage) => {
  clearStage(stage);
  const box = createBox({ label: dt("Reveal"), size: 120 });
  // Start fully clipped so the first frame is empty — otherwise the box flashes
  // fully visible for a moment before the reveal runs.
  box.style.clipPath = closedClip("left");
  stage.append(box);
  return {
    play(p) {
      const dir = str(p, "direction", "left");
      const closed = closedClip(dir);
      animate(
        box,
        { clipPath: [closed, "inset(0 0 0 0)"] },
        { duration: num(p, "duration", 0.7), delay: num(p, "delay", 0), ease: ease(p) }
      );
    },
    code: (p) =>
      `animate(el, {\n  clipPath: ["inset(0 100% 0 0)", "inset(0 0 0 0)"],\n}, { duration: ${num(p, "duration", 0.7)} });`,
  };
};

const enterExit: DemoFactory = (stage) => {
  clearStage(stage);
  const box = createBox({ label: "" });
  stage.append(box);
  return {
    play(p) {
      const d = num(p, "duration", 0.45);
      const show = bool(p, "present", true);
      if (show) {
        box.style.display = "grid";
        animate(box, { opacity: [0, 1], scale: [0.85, 1], y: [12, 0] }, { duration: d, ease: ease(p) });
      } else {
        animate(box, { opacity: [1, 0], scale: [1, 0.85], y: [0, 12] }, { duration: d, ease: EASING_ARRAYS["ease-in"] });
      }
    },
    code: () =>
      `// Enter\nanimate(el, { opacity: [0,1], scale: [0.85,1] });\n// Exit\nanimate(el, { opacity: [1,0], scale: [1,0.85] });`,
  };
};

export const demos: Record<string, DemoFactory> = {
  fade,
  slide,
  scale,
  pop,
  reveal,
  enterExit,
};

export const controlPresets = { easeOptions };
