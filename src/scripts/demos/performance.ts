import { animate } from "./anim";
import type { DemoFactory } from "./types";
import { clearStage, bool, dt } from "./utils";

type Controls = { stop: () => void };

const fps: DemoFactory = (stage) => {
  clearStage(stage);
  const meter = document.createElement("div");
  meter.className = "demo-fps";
  meter.innerHTML = `<span class="demo-fps__num demo-bignum--tabular">–</span><span class="demo-fps__unit">fps</span>`;
  const num = meter.querySelector(".demo-fps__num") as HTMLElement;
  const spinner = document.createElement("div");
  spinner.className = "demo-dot";
  spinner.style.cssText = "width:36px;height:36px;border-radius:10px;background:var(--color-midnight-ink);margin-top:14px";
  stage.append(meter, spinner);
  let raf = 0;
  let last = performance.now();
  let frames = 0;
  let acc = 0;
  const spin = animate(spinner, { rotate: [0, 360] }, { duration: 1.2, ease: "linear", repeat: Infinity }) as unknown as Controls;
  const loop = (t: number) => {
    frames++;
    acc += t - last;
    last = t;
    if (acc >= 500) {
      num.textContent = Math.round((frames * 1000) / acc).toString();
      frames = 0;
      acc = 0;
    }
    raf = requestAnimationFrame(loop);
  };
  raf = requestAnimationFrame(loop);
  return {
    play() {},
    cleanup: () => {
      cancelAnimationFrame(raf);
      spin.stop();
    },
    continuous: true,
    code: () => `let frames = 0;\nfunction loop(t) {\n  frames++; // count drawn frames\n  requestAnimationFrame(loop);\n}`,
  };
};

const jank: DemoFactory = (stage) => {
  clearStage(stage);
  const cap = document.createElement("div");
  cap.className = "demo-caption";
  const dot = document.createElement("div");
  dot.className = "demo-dot";
  dot.style.cssText = "width:32px;height:32px;border-radius:8px;background:var(--color-phoenix-orange)";
  stage.append(dot, cap);
  let ctrl: Controls | null = null;
  let raf = 0;
  let stress = false;
  const burn = () => {
    if (stress) {
      const end = performance.now() + 9; // block the main thread ~9ms/frame
      while (performance.now() < end) {}
    }
    raf = requestAnimationFrame(burn);
  };
  raf = requestAnimationFrame(burn);
  return {
    play(p) {
      stress = bool(p, "stress", false);
      cap.textContent = stress
        ? dt("Main thread is busy → frames drop → jank")
        : dt("Main thread idle → smooth 60fps");
      ctrl?.stop();
      ctrl = animate(dot, { x: [-90, 90] }, { duration: 1, ease: "linear", repeat: Infinity, repeatType: "reverse" }) as unknown as Controls;
    },
    cleanup: () => {
      cancelAnimationFrame(raf);
      ctrl?.stop();
    },
    continuous: true,
    code: () => `// blocking the main thread starves the animation\nwhile (performance.now() < deadline) {} // jank`,
  };
};

const droppedFrame: DemoFactory = (stage) => {
  clearStage(stage);
  const strip = document.createElement("div");
  strip.className = "demo-filmstrip";
  for (let i = 0; i < 8; i++) {
    const f = document.createElement("div");
    f.className = "demo-frame";
    if (i === 4) f.classList.add("is-dropped");
    f.textContent = i === 4 ? "✕" : String(i + 1);
    strip.append(f);
  }
  const cap = document.createElement("div");
  cap.className = "demo-caption";
  cap.textContent = dt("Frame 5 missed its deadline — a visible hitch");
  stage.append(strip, cap);
  let ctrl: Controls | null = null;
  return {
    play() {
      ctrl?.stop();
      const frames = Array.from(strip.children) as HTMLElement[];
      ctrl = animate(
        frames,
        { opacity: [0.35, 1] },
        { duration: 0.25, delay: (i: number) => i * 0.12, repeat: Infinity, repeatType: "reverse", repeatDelay: 0.4 }
      ) as unknown as Controls;
    },
    cleanup: () => ctrl?.stop(),
    continuous: true,
    code: () => `// a dropped frame = the browser missed one draw deadline`,
  };
};

function comparison(stage: HTMLElement, goodLabel: string, badLabel: string, run: (good: HTMLElement, bad: HTMLElement) => Controls[]) {
  clearStage(stage);
  const grid = document.createElement("div");
  grid.className = "demo-compare";
  const mk = (label: string, tag: string) => {
    const col = document.createElement("div");
    col.className = "demo-compare__col";
    const lane = document.createElement("div");
    lane.className = "demo-compare__lane";
    const dot = document.createElement("div");
    dot.className = "demo-compare__dot";
    lane.append(dot);
    const lbl = document.createElement("div");
    lbl.className = "demo-caption";
    lbl.innerHTML = `<strong>${tag}</strong> ${label}`;
    col.append(lane, lbl);
    grid.append(col);
    return dot;
  };
  const good = mk(goodLabel, "GPU");
  const bad = mk(badLabel, "CPU");
  stage.append(grid);
  let ctrls: Controls[] = [];
  return {
    arm() {
      ctrls.forEach((c) => c.stop());
      ctrls = run(good, bad);
    },
    stop() {
      ctrls.forEach((c) => c.stop());
    },
  };
}

const compositing: DemoFactory = (stage) => {
  const c = comparison(
    stage,
    dt("transform — composited"),
    dt("margin-left — paints"),
    (good, bad) => [
      animate(good, { x: [0, 120] }, { duration: 1, ease: "easeInOut", repeat: Infinity, repeatType: "reverse" }) as unknown as Controls,
      animate(bad, { marginLeft: ["0px", "120px"] }, { duration: 1, ease: "easeInOut", repeat: Infinity, repeatType: "reverse" }) as unknown as Controls,
    ]
  );
  return {
    play() {
      c.arm();
    },
    cleanup: () => c.stop(),
    continuous: true,
    code: () => `// GPU layer, no layout:\nanimate(el, { transform: "translateX(120px)" });\n// forces layout + paint every frame:\nel.style.marginLeft = "120px";`,
  };
};

const willChange: DemoFactory = (stage) => {
  clearStage(stage);
  const box = document.createElement("div");
  box.className = "demo-compare__dot";
  box.style.width = box.style.height = "44px";
  const cap = document.createElement("div");
  cap.className = "demo-caption";
  stage.append(box, cap);
  let ctrl: Controls | null = null;
  return {
    play(p) {
      const hint = bool(p, "hint", true);
      box.style.willChange = hint ? "transform" : "auto";
      cap.textContent = hint
        ? dt("will-change: transform → promoted to its own layer ahead of time")
        : dt("will-change: auto → promoted only once it starts moving");
      ctrl?.stop();
      ctrl = animate(box, { x: [-90, 90], scale: [1, 1.1] }, { duration: 1, ease: "easeInOut", repeat: Infinity, repeatType: "reverse" }) as unknown as Controls;
    },
    cleanup: () => ctrl?.stop(),
    continuous: true,
    code: () => `el.style.willChange = "transform"; // promote early`,
  };
};

const layoutThrashing: DemoFactory = (stage) => {
  const c = comparison(
    stage,
    dt("transform — one layer"),
    dt("left/width — relayout"),
    (good, bad) => [
      animate(good, { x: [0, 120] }, { duration: 1, ease: "easeInOut", repeat: Infinity, repeatType: "reverse" }) as unknown as Controls,
      animate(bad, { left: ["0px", "120px"], width: ["44px", "64px"] }, { duration: 1, ease: "easeInOut", repeat: Infinity, repeatType: "reverse" }) as unknown as Controls,
    ]
  );
  return {
    play() {
      c.arm();
    },
    cleanup: () => c.stop(),
    continuous: true,
    code: () => `// recalculates layout every frame:\nel.style.left = x + "px";\nel.style.width = w + "px";\n// cheap, GPU-composited:\nel.style.transform = "translateX(" + x + "px)";`,
  };
};

export const demos: Record<string, DemoFactory> = {
  fps,
  jank,
  droppedFrame,
  compositing,
  willChange,
  layoutThrashing,
};
