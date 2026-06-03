import { animate, scroll, inView } from "motion";
import type { DemoFactory } from "./types";
import { clearStage, num } from "./utils";

function scrollStage(stage: HTMLElement, innerHeight = 520) {
  clearStage(stage);
  const scroller = document.createElement("div");
  scroller.className = "demo-scroller";
  const inner = document.createElement("div");
  inner.style.height = `${innerHeight}px`;
  inner.style.position = "relative";
  scroller.append(inner);
  const hint = document.createElement("div");
  hint.className = "demo-caption";
  hint.textContent = "↕ scroll inside this box";
  stage.append(scroller, hint);
  return { scroller, inner };
}

const scrollReveal: DemoFactory = (stage) => {
  const { scroller, inner } = scrollStage(stage, 640);
  const items: HTMLElement[] = [];
  for (let i = 0; i < 6; i++) {
    const card = document.createElement("div");
    card.className = "demo-reveal-card";
    card.textContent = `Item ${i + 1}`;
    card.style.top = `${20 + i * 100}px`;
    inner.append(card);
    items.push(card);
  }
  let duration = 0.5;
  const stops: Array<() => void> = [];
  const arm = () => {
    stops.forEach((s) => s());
    stops.length = 0;
    items.forEach((el) => {
      el.style.opacity = "0";
      el.style.transform = "translateY(24px)";
      const stop = inView(
        el,
        () => {
          animate(el, { opacity: [0, 1], y: [24, 0] }, { duration, ease: [0.16, 1, 0.3, 1] });
        },
        { root: scroller, amount: 0.6 }
      );
      stops.push(stop);
    });
  };
  return {
    play(p) {
      duration = num(p, "duration", 0.5);
      scroller.scrollTop = 0;
      arm();
    },
    cleanup: () => stops.forEach((s) => s()),
    code: () => `inView(el, () => {\n  animate(el, { opacity: [0, 1], y: [24, 0] });\n}, { amount: 0.6 });`,
    continuous: true,
  };
};

const scrollDriven: DemoFactory = (stage) => {
  const { scroller, inner } = scrollStage(stage, 700);
  const ring = document.createElement("div");
  ring.className = "demo-progress-ring";
  const bar = document.createElement("div");
  bar.className = "demo-progress-bar";
  inner.append(ring, bar);
  scroll(
    (progress: number) => {
      bar.style.transform = `scaleX(${progress})`;
      ring.style.transform = `translate(-50%, -50%) rotate(${progress * 360}deg)`;
      ring.style.setProperty("--p", String(progress));
    },
    { container: scroller }
  );
  return {
    play() {},
    code: () => `scroll((progress) => {\n  bar.style.transform = \`scaleX(\${progress})\`;\n}, { container });`,
    continuous: true,
  };
};

const parallax: DemoFactory = (stage) => {
  const { scroller, inner } = scrollStage(stage, 800);
  const bg = document.createElement("div");
  bg.className = "demo-layer demo-layer--bg";
  bg.textContent = "background";
  const fg = document.createElement("div");
  fg.className = "demo-layer demo-layer--fg";
  fg.textContent = "foreground";
  inner.append(bg, fg);
  let depth = 0.4;
  scroll(
    (progress: number) => {
      bg.style.transform = `translateY(${progress * 120 * depth}px)`;
      fg.style.transform = `translateY(${-progress * 120}px)`;
    },
    { container: scroller }
  );
  return {
    play(p) {
      depth = num(p, "depth", 0.4);
    },
    code: () => `scroll((p) => {\n  bg.style.transform = \`translateY(\${p * 120 * depth}px)\`;\n  fg.style.transform = \`translateY(\${-p * 120}px)\`;\n});`,
    continuous: true,
  };
};

const pageTransition: DemoFactory = (stage) => {
  clearStage(stage);
  const wrap = document.createElement("div");
  wrap.style.cssText = "position:relative;width:200px;height:120px;overflow:hidden;border-radius:12px;background:#fff;box-shadow:var(--shadow-floating)";
  let page = 0;
  const labels = ["/ home", "/ about"];
  let view = document.createElement("div");
  view.className = "demo-page";
  view.textContent = labels[0];
  const btn = document.createElement("button");
  btn.className = "demo-trigger demo-trigger--sm";
  btn.style.cssText += ";position:absolute;left:50%;bottom:8px;transform:translateX(-50%)";
  btn.textContent = "Navigate →";
  let duration = 0.5;
  btn.addEventListener("click", () => {
    page = 1 - page;
    const next = document.createElement("div");
    next.className = "demo-page";
    next.textContent = labels[page];
    wrap.insertBefore(next, btn);
    const out = view;
    animate(out, { opacity: [1, 0], y: [0, -16] }, { duration }).then(() => out.remove());
    animate(next, { opacity: [0, 1], y: [16, 0] }, { duration });
    view = next;
  });
  wrap.append(view, btn);
  stage.append(wrap);
  return {
    play(p) {
      duration = num(p, "duration", 0.5);
    },
    code: () => `// on route change\nanimate(oldPage, { opacity: 0, y: -16 });\nanimate(newPage, { opacity: [0,1], y: [16,0] });`,
  };
};

const viewTransition: DemoFactory = (stage) => {
  clearStage(stage);
  const supported = typeof (document as any).startViewTransition === "function";
  const wrap = document.createElement("div");
  wrap.style.cssText = "display:flex;flex-direction:column;align-items:center;gap:10px";
  const box = document.createElement("div");
  box.className = "demo-vt-box";
  box.style.viewTransitionName = "demo-vt";
  let big = false;
  const apply = () => {
    big = !big;
    box.classList.toggle("is-big", big);
  };
  const btn = document.createElement("button");
  btn.className = "demo-trigger demo-trigger--sm";
  btn.textContent = supported ? "Toggle view" : "View Transitions unsupported — fallback";
  btn.addEventListener("click", () => {
    if (supported) (document as any).startViewTransition(() => apply());
    else {
      const first = box.getBoundingClientRect();
      apply();
      const last = box.getBoundingClientRect();
      animate(box, { width: [`${first.width}px`, `${last.width}px`] }, { duration: 0.4 });
    }
  });
  wrap.append(box, btn);
  stage.append(wrap);
  return {
    play() {},
    code: () => `document.startViewTransition(() => {\n  // mutate the DOM; the browser morphs between states\n  box.classList.toggle("is-big");\n});`,
  };
};

export const demos: Record<string, DemoFactory> = {
  scrollReveal,
  scrollDriven,
  parallax,
  pageTransition,
  viewTransition,
};
