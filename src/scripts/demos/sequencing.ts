import { animate, stagger } from "motion";
import type { DemoFactory } from "./types";
import { clearStage, createBox, EASING_ARRAYS, num, str } from "./utils";

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
      animate(mover, { left: ["0px", "200px"] }, { duration: num(p, "duration", 1), ease: ease(p) });
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
  btn.textContent = "Confirm";
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
          ? "fill: none → snaps back to start when done"
          : "fill: forwards → holds the final frame";
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

export const demos: Record<string, DemoFactory> = {
  keyframes,
  tween,
  stagger: staggerDemo,
  orchestration,
  delay: delayDemo,
  duration: durationDemo,
  fillMode,
  stepped,
};
