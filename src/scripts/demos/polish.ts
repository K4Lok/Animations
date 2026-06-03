import { animate } from "./anim";
import type { DemoFactory } from "./types";
import { clearStage, createBox, dt, num, str, bool } from "./utils";

const blur: DemoFactory = (stage) => {
  clearStage(stage);
  const box = createBox({ label: dt("Hi") });
  stage.append(box);
  return {
    play(p) {
      const b = num(p, "blur", 10);
      animate(box, { filter: [`blur(${b}px)`, "blur(0px)"], opacity: [0, 1] }, { duration: num(p, "duration", 0.8) });
    },
    code: (p) => `animate(el, { filter: ["blur(${num(p, "blur", 10)}px)", "blur(0px)"] });`,
  };
};

const SHAPES: Record<string, [string, string]> = {
  circle: ["circle(0% at 50% 50%)", "circle(75% at 50% 50%)"],
  inset: ["inset(50% 50% 50% 50%)", "inset(0% 0% 0% 0%)"],
  diamond: ["polygon(50% 50%, 50% 50%, 50% 50%, 50% 50%)", "polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)"],
};

const clipPath: DemoFactory = (stage) => {
  clearStage(stage);
  const box = createBox({ label: "", size: 120 });
  box.style.background = "var(--gradient-phoenix)";
  stage.append(box);
  return {
    play(p) {
      const [from, to] = SHAPES[str(p, "shape", "circle")] ?? SHAPES.circle;
      animate(box, { clipPath: [from, to] }, { duration: num(p, "duration", 0.8), ease: [0.16, 1, 0.3, 1] });
    },
    code: (p) => {
      const [from, to] = SHAPES[str(p, "shape", "circle")] ?? SHAPES.circle;
      return `animate(el, { clipPath: ["${from}", "${to}"] });`;
    },
  };
};

const mask: DemoFactory = (stage) => {
  clearStage(stage);
  const box = document.createElement("div");
  box.className = "demo-mask";
  box.textContent = dt("Soft mask");
  stage.append(box);
  return {
    play(p) {
      animate(
        box,
        { maskPosition: ["120% 0", "0% 0"], WebkitMaskPosition: ["120% 0", "0% 0"] } as any,
        { duration: num(p, "duration", 1.2), ease: [0.16, 1, 0.3, 1] }
      );
    },
    code: () => `// gradient mask with soft, fadeable edges\nanimate(el, { maskPosition: ["120% 0", "0% 0"] });`,
  };
};

const beforeAfter: DemoFactory = (stage) => {
  clearStage(stage);
  const wrap = document.createElement("div");
  wrap.className = "demo-ba";
  const before = document.createElement("div");
  before.className = "demo-ba__layer demo-ba__before";
  before.textContent = dt("AFTER");
  const after = document.createElement("div");
  after.className = "demo-ba__layer demo-ba__after";
  after.textContent = dt("BEFORE");
  const handle = document.createElement("div");
  handle.className = "demo-ba__handle";
  wrap.append(before, after, handle);
  stage.append(wrap);
  let pos = 0.5;
  const apply = () => {
    after.style.clipPath = `inset(0 ${(1 - pos) * 100}% 0 0)`;
    handle.style.left = `${pos * 100}%`;
  };
  apply();
  let dragging = false;
  const set = (clientX: number) => {
    const rect = wrap.getBoundingClientRect();
    pos = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    apply();
  };
  wrap.addEventListener("pointerdown", (e) => {
    dragging = true;
    wrap.setPointerCapture(e.pointerId);
    set(e.clientX);
  });
  wrap.addEventListener("pointermove", (e) => dragging && set(e.clientX));
  wrap.addEventListener("pointerup", () => (dragging = false));
  return { play() {}, continuous: true, code: () => `// divider drives a clip-path on the top layer\nafter.style.clipPath = \`inset(0 \${(1 - pos) * 100}% 0 0)\`;` };
};

const lineDrawing: DemoFactory = (stage) => {
  clearStage(stage);
  const svgNS = "http://www.w3.org/2000/svg";
  const svg = document.createElementNS(svgNS, "svg");
  svg.setAttribute("viewBox", "0 0 100 100");
  svg.classList.add("demo-line__svg");
  const path = document.createElementNS(svgNS, "path");
  path.setAttribute("d", "M10 60 Q 30 10 50 50 T 90 40");
  path.setAttribute("class", "demo-line__path");
  svg.append(path);
  stage.append(svg);
  return {
    play(p) {
      const len = path.getTotalLength();
      path.style.strokeDasharray = String(len);
      animate(path, { strokeDashoffset: [len, 0] }, { duration: num(p, "duration", 1.6), ease: [0.16, 1, 0.3, 1] });
    },
    code: () => `path.style.strokeDasharray = length;\nanimate(path, { strokeDashoffset: [length, 0] });`,
  };
};

const textMorph: DemoFactory = (stage) => {
  clearStage(stage);
  const el = document.createElement("div");
  el.className = "demo-bignum";
  const words = ["12:04", "12:05", "12:06", "12:07"];
  let i = 0;
  el.textContent = words[0];
  stage.append(el);
  return {
    play() {
      i = (i + 1) % words.length;
      const next = words[i];
      const out = el.cloneNode(true) as HTMLElement;
      out.style.position = "absolute";
      el.parentElement?.append(out);
      el.textContent = next;
      animate(el, { y: [14, 0], opacity: [0, 1] }, { duration: 0.35, ease: [0.16, 1, 0.3, 1] });
      animate(out, { y: [0, -14], opacity: [1, 0] }, { duration: 0.35 }).then(() => out.remove());
    },
    code: () => `// old value slides out, new slides in\nanimate(out, { y: -14, opacity: 0 });\nanimate(in,  { y: [14, 0], opacity: [0, 1] });`,
  };
};

const skeleton: DemoFactory = (stage) => {
  clearStage(stage);
  const card = document.createElement("div");
  card.className = "demo-skel";
  card.innerHTML = `<div class="demo-skel__line" style="width:60%"></div><div class="demo-skel__line" style="width:100%"></div><div class="demo-skel__line" style="width:80%"></div>`;
  stage.append(card);
  return {
    play(p) {
      card.style.setProperty("--shimmer", `${num(p, "speed", 1.4)}s`);
    },
    continuous: true,
    code: (p) => `/* moving sheen */\n.skeleton { animation: shimmer ${num(p, "speed", 1.4)}s linear infinite; }`,
  };
};

const numberTicker: DemoFactory = (stage) => {
  clearStage(stage);
  const el = document.createElement("div");
  el.className = "demo-bignum demo-bignum--tabular";
  el.textContent = "0";
  stage.append(el);
  return {
    play(p) {
      const target = Math.round(num(p, "target", 4096));
      animate(0, target, {
        duration: num(p, "duration", 1.4),
        ease: [0.16, 1, 0.3, 1],
        onUpdate: (v: number) => (el.textContent = Math.round(v).toLocaleString()),
      });
    },
    code: (p) => `animate(0, ${Math.round(num(p, "target", 4096))}, {\n  onUpdate: (v) => el.textContent = Math.round(v),\n});`,
  };
};

const tabularNumbers: DemoFactory = (stage) => {
  clearStage(stage);
  const el = document.createElement("div");
  el.className = "demo-bignum";
  const cap = document.createElement("div");
  cap.className = "demo-caption";
  stage.append(el, cap);
  let timer: number | undefined;
  return {
    play(p) {
      const tab = bool(p, "tabular", true);
      el.style.fontVariantNumeric = tab ? "tabular-nums" : "normal";
      cap.textContent = tab ? dt("tabular-nums → digits never shift") : dt("proportional → watch the width jitter");
      clearInterval(timer);
      timer = window.setInterval(() => {
        el.textContent = String(Math.floor(Math.random() * 9000) + 1000);
      }, 220);
    },
    cleanup: () => clearInterval(timer),
    continuous: true,
    code: () => `el.style.fontVariantNumeric = "tabular-nums";`,
  };
};

const typewriter: DemoFactory = (stage) => {
  clearStage(stage);
  const el = document.createElement("div");
  el.className = "demo-type";
  el.innerHTML = `<span class="demo-type__text"></span><span class="demo-type__caret"></span>`;
  const textEl = el.querySelector(".demo-type__text") as HTMLElement;
  stage.append(el);
  const full = dt("Text appears one character at a time…");
  let timer: number | undefined;
  return {
    play(p) {
      clearInterval(timer);
      textEl.textContent = "";
      let i = 0;
      const speed = num(p, "speed", 60);
      timer = window.setInterval(() => {
        textEl.textContent = full.slice(0, ++i);
        if (i >= full.length) clearInterval(timer);
      }, speed);
    },
    cleanup: () => clearInterval(timer),
    code: (p) => `setInterval(() => {\n  text.textContent = full.slice(0, ++i);\n}, ${num(p, "speed", 60)});`,
  };
};

export const demos: Record<string, DemoFactory> = {
  blur,
  clipPath,
  mask,
  beforeAfter,
  lineDrawing,
  textMorph,
  skeleton,
  numberTicker,
  tabularNumbers,
  typewriter,
};
