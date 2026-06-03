import { animate } from "motion";
import type { DemoFactory, Params } from "./types";
import { clearStage, createDot, EASING_ARRAYS, num, str } from "./utils";

type Bezier = [number, number, number, number];

function buildStage(stage: HTMLElement) {
  clearStage(stage);
  const wrap = document.createElement("div");
  wrap.className = "demo-ease";
  const svgNS = "http://www.w3.org/2000/svg";
  const svg = document.createElementNS(svgNS, "svg");
  svg.setAttribute("viewBox", "0 0 100 100");
  svg.classList.add("demo-ease__svg");
  const grid = document.createElementNS(svgNS, "path");
  grid.setAttribute("d", "M0 100 L100 0");
  grid.setAttribute("class", "demo-ease__diag");
  const curve = document.createElementNS(svgNS, "path");
  curve.setAttribute("class", "demo-ease__curve");
  svg.append(grid, curve);
  const track = document.createElement("div");
  track.className = "demo-ease__track";
  const dot = createDot(18);
  track.append(dot);
  wrap.append(svg, track);
  stage.append(wrap);
  return { curve, dot };
}

function curvePath([x1, y1, x2, y2]: Bezier): string {
  // SVG y is inverted: progress 1 = top (y=0)
  return `M0 100 C ${x1 * 100} ${100 - y1 * 100}, ${x2 * 100} ${100 - y2 * 100}, 100 0`;
}

function makeEasing(fixed?: Bezier): DemoFactory {
  return (stage) => {
    const { curve, dot } = buildStage(stage);
    return {
      play(p: Params) {
        const b: Bezier = fixed ?? (EASING_ARRAYS[str(p, "easing", "ease-out")] as Bezier) ?? EASING_ARRAYS["ease-out"];
        curve.setAttribute("d", curvePath(b));
        animate(dot, { x: [0, 222] }, { duration: num(p, "duration", 1.2), ease: b });
      },
      code: (p) => {
        const b = fixed ?? (EASING_ARRAYS[str(p, "easing", "ease-out")] as Bezier);
        return `animate(el, { x: "100%" }, {\n  ease: [${b.map((n) => n).join(", ")}],\n  duration: ${num(p, "duration", 1.2)},\n});`;
      },
    };
  };
}

const cubicBezier: DemoFactory = (stage) => {
  const { curve, dot } = buildStage(stage);
  return {
    play(p) {
      const b: Bezier = [num(p, "x1", 0.16), num(p, "y1", 1), num(p, "x2", 0.3), num(p, "y2", 1)];
      curve.setAttribute("d", curvePath(b));
      animate(dot, { x: [0, 222] }, { duration: num(p, "duration", 1.4), ease: b });
    },
    code: (p) =>
      `cubic-bezier(${num(p, "x1", 0.16)}, ${num(p, "y1", 1)}, ${num(p, "x2", 0.3)}, ${num(p, "y2", 1)})`,
  };
};

export const demos: Record<string, DemoFactory> = {
  easing: makeEasing(),
  easeOut: makeEasing(EASING_ARRAYS["ease-out"] as Bezier),
  easeIn: makeEasing(EASING_ARRAYS["ease-in"] as Bezier),
  easeInOut: makeEasing(EASING_ARRAYS["ease-in-out"] as Bezier),
  linear: makeEasing(EASING_ARRAYS["linear"] as Bezier),
  cubicBezier,
  asymmetric: makeEasing([0.5, 0, 0.1, 1]),
};
