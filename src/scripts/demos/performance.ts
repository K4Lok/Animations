import { animate } from "./anim";
import type { DemoFactory } from "./types";
import { clearStage, bool, dt } from "./utils";
import { elem, frame, gradientFor, imageTile } from "./kit";

type Controls = { stop: () => void };

function caption(text = ""): HTMLElement {
  const c = elem("div", "demo-caption");
  c.textContent = text;
  return c;
}

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

/* ---- realistic "use case" variants ---- */

// A music player whose album art spins at a steady frame rate; an fps badge
// reads the real refresh rate so you see the baseline for "smooth".
const fpsUseCase: DemoFactory = (stage) => {
  clearStage(stage);
  const card = frame("position:relative;display:flex;align-items:center;gap:12px;width:236px;padding:12px 14px");
  const disc = elem("div", undefined, "position:relative;flex:none;width:52px;height:52px;border-radius:999px;overflow:hidden;will-change:transform");
  disc.style.background = gradientFor(0);
  const hole = elem("span", undefined, "position:absolute;top:50%;left:50%;width:10px;height:10px;margin:-5px 0 0 -5px;border-radius:999px;background:var(--color-canvas-white);box-shadow:0 0 0 3px rgba(0,0,0,.12)");
  disc.append(hole);
  const text = elem("div", undefined, "flex:1;min-width:0");
  const t = elem("span", undefined, "display:block;font-size:13px;font-weight:600;color:var(--color-midnight-ink);white-space:nowrap;overflow:hidden;text-overflow:ellipsis");
  t.textContent = dt("Now playing — Aurora");
  const sub = elem("span", undefined, "display:block;margin-top:3px;font-size:11px;color:var(--color-muted-ash)");
  sub.textContent = dt("Aurora team");
  text.append(t, sub);
  const badge = elem("div", undefined, "position:absolute;top:10px;right:12px;display:flex;align-items:baseline;gap:3px;padding:3px 8px;border-radius:999px;background:var(--color-whisper-gray)");
  const numEl = elem("span", "demo-bignum--tabular", "font-size:12px;font-weight:700;color:var(--color-midnight-ink)");
  numEl.textContent = "–";
  const unit = elem("span", undefined, "font-size:9px;font-weight:600;color:var(--color-muted-ash)");
  unit.textContent = "fps";
  badge.append(numEl, unit);
  card.append(disc, text, badge);
  stage.append(card);
  let raf = 0;
  let last = performance.now();
  let frames = 0;
  let acc = 0;
  const loop = (tm: number) => {
    frames++;
    acc += tm - last;
    last = tm;
    if (acc >= 500) {
      numEl.textContent = Math.round((frames * 1000) / acc).toString();
      frames = 0;
      acc = 0;
    }
    raf = requestAnimationFrame(loop);
  };
  raf = requestAnimationFrame(loop);
  let spin: Controls | null = null;
  return {
    play() {
      spin?.stop();
      spin = animate(disc, { rotate: [0, 360] }, { duration: 3.5, ease: "linear", repeat: Infinity }) as unknown as Controls;
    },
    cleanup: () => {
      cancelAnimationFrame(raf);
      spin?.stop();
    },
    continuous: true,
    code: () => `// the album art spins at a steady 60fps\nrequestAnimationFrame(loop); // count drawn frames`,
  };
};

// A "Trusted by" carousel that scrolls forever; adding main-thread work starves
// the scroll and you watch it stutter.
const jankUseCase: DemoFactory = (stage) => {
  clearStage(stage);
  const wrap = frame("width:244px;padding:12px 0");
  const mask = elem("div", undefined, "position:relative;width:100%;overflow:hidden;-webkit-mask-image:linear-gradient(90deg,transparent,#000 10%,#000 90%,transparent);mask-image:linear-gradient(90deg,transparent,#000 10%,#000 90%,transparent)");
  const track = elem("div", undefined, "display:flex;gap:10px;width:max-content;padding:0 10px;will-change:transform");
  const names = ["Aurora", "Borealis", "Cascade", "Drift", "Finch", "Harbor"];
  const tile = (name: string, i: number) => {
    const c = elem("div", undefined, "flex:none;width:96px;border-radius:12px;overflow:hidden;background:var(--color-canvas-white);box-shadow:var(--shadow-subtle)");
    const img = imageTile({ i, radius: 0 });
    img.style.cssText += ";height:54px";
    const cap = elem("div", undefined, "padding:7px 9px;font-size:11px;font-weight:600;color:var(--color-midnight-ink);white-space:nowrap");
    cap.textContent = name;
    c.append(img, cap);
    return c;
  };
  [...names, ...names].forEach((n, i) => track.append(tile(n, i)));
  mask.append(track);
  const cap = caption();
  wrap.append(mask);
  stage.append(wrap, cap);
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
      ctrl = animate(track, { x: ["0%", "-50%"] }, { duration: 6, ease: "linear", repeat: Infinity }) as unknown as Controls;
    },
    cleanup: () => {
      ctrl?.stop();
      cancelAnimationFrame(raf);
    },
    continuous: true,
    code: () => `// main-thread work starves the scroll → jank\nwhile (performance.now() < deadline) {}`,
  };
};

// A video editor's frame timeline: a playhead sweeps the strip and frame 5,
// hatched + outlined, is the one that missed its deadline.
const droppedFrameUseCase: DemoFactory = (stage) => {
  clearStage(stage);
  const wrap = frame("width:232px;padding:12px");
  const player = elem("div", undefined, "position:relative;width:100%;height:84px;border-radius:10px;overflow:hidden");
  player.style.background = gradientFor(4);
  const strip = elem("div", undefined, "display:flex;gap:3px;margin-top:10px;position:relative");
  let dropped: HTMLElement | null = null;
  for (let i = 0; i < 8; i++) {
    const f = elem("div", undefined, "flex:1;height:26px;border-radius:4px");
    if (i === 4) {
      f.style.background = "repeating-linear-gradient(45deg,var(--color-whisper-gray),var(--color-whisper-gray) 4px,transparent 4px,transparent 8px)";
      f.style.boxShadow = "inset 0 0 0 1.5px var(--color-leadgen-red)";
      dropped = f;
    } else {
      f.style.background = gradientFor(i);
    }
    strip.append(f);
  }
  const playhead = elem("span", undefined, "position:absolute;top:-3px;bottom:-3px;width:2px;border-radius:2px;background:var(--color-midnight-ink);left:0");
  strip.append(playhead);
  const cap = caption(dt("Frame 5 missed its deadline — a visible hitch"));
  wrap.append(player, strip);
  stage.append(wrap, cap);
  let ctrls: Controls[] = [];
  return {
    play() {
      ctrls.forEach((c) => c.stop());
      ctrls = [
        animate(playhead, { left: ["0%", "100%"] }, { duration: 2.4, ease: "linear", repeat: Infinity }) as unknown as Controls,
      ];
      if (dropped)
        ctrls.push(
          animate(dropped, { opacity: [1, 0.35, 1] }, { duration: 0.5, ease: "easeInOut", repeat: Infinity, repeatType: "reverse", repeatDelay: 1.4 }) as unknown as Controls
        );
    },
    cleanup: () => ctrls.forEach((c) => c.stop()),
    continuous: true,
    code: () => `// frame 5 missed its draw deadline → a hitch`,
  };
};

// Two toast notifications enter: one on a GPU layer (transform), one that
// repaints every frame (margin-left).
const compositingUseCase: DemoFactory = (stage) => {
  clearStage(stage);
  const col = elem("div", undefined, "display:flex;flex-direction:column;gap:12px;width:240px");
  const lane = (label: string, i: number) => {
    const w = elem("div", undefined, "display:flex;flex-direction:column;gap:5px");
    const track = elem("div", undefined, "position:relative;height:46px;overflow:hidden;border-radius:12px;background:var(--color-whisper-gray)");
    const toast = elem("div", undefined, "position:absolute;top:6px;left:6px;display:flex;align-items:center;gap:9px;width:200px;padding:8px 10px;border-radius:10px;background:var(--color-canvas-white);box-shadow:var(--shadow-floating)");
    const dot = elem("span", undefined, "flex:none;width:22px;height:22px;border-radius:7px");
    dot.style.background = gradientFor(i);
    const tx = elem("span", undefined, "font-size:12px;font-weight:600;color:var(--color-midnight-ink)");
    tx.textContent = dt("Message sent");
    toast.append(dot, tx);
    track.append(toast);
    const lbl = elem("div", "demo-caption");
    lbl.textContent = label;
    w.append(track, lbl);
    return { w, toast };
  };
  const good = lane(dt("transform — composited"), 2);
  const bad = lane(dt("margin-left — paints"), 1);
  col.append(good.w, bad.w);
  stage.append(col);
  let ctrls: Controls[] = [];
  return {
    play() {
      ctrls.forEach((c) => c.stop());
      ctrls = [
        animate(good.toast, { x: [-210, 0] }, { duration: 0.9, ease: "easeInOut", repeat: Infinity, repeatType: "reverse" }) as unknown as Controls,
        animate(bad.toast, { marginLeft: ["-210px", "0px"] }, { duration: 0.9, ease: "easeInOut", repeat: Infinity, repeatType: "reverse" }) as unknown as Controls,
      ];
    },
    cleanup: () => ctrls.forEach((c) => c.stop()),
    continuous: true,
    code: () => `animate(toast, { x: 0 });        // GPU layer, no paint\ntoast.style.marginLeft = "0px";  // layout + paint each frame`,
  };
};

// A hero image with a slow Ken-Burns pan; the will-change hint decides whether
// the layer is promoted ahead of time or only once it starts moving.
const willChangeUseCase: DemoFactory = (stage) => {
  clearStage(stage);
  const card = frame("width:212px;overflow:hidden");
  const viewport = elem("div", undefined, "position:relative;width:100%;height:120px;overflow:hidden");
  const img = imageTile({ i: 3, radius: 0 });
  img.style.cssText += ";position:absolute;inset:-12% -12%;width:124%;height:124%";
  viewport.append(img);
  const bar = elem("div", undefined, "padding:10px 12px");
  const t = elem("span", undefined, "font-size:12px;font-weight:600;color:var(--color-midnight-ink)");
  t.textContent = dt("Aurora over the fjord");
  bar.append(t);
  const cap = caption();
  card.append(viewport, bar);
  stage.append(card, cap);
  let ctrl: Controls | null = null;
  return {
    play(p) {
      const hint = bool(p, "hint", true);
      img.style.willChange = hint ? "transform" : "auto";
      cap.textContent = hint
        ? dt("will-change: transform → promoted to its own layer ahead of time")
        : dt("will-change: auto → promoted only once it starts moving");
      ctrl?.stop();
      ctrl = animate(img, { scale: [1, 1.12], x: [0, -14], y: [0, -8] }, { duration: 6, ease: "easeInOut", repeat: Infinity, repeatType: "reverse" }) as unknown as Controls;
    },
    cleanup: () => ctrl?.stop(),
    continuous: true,
    code: () => `img.style.willChange = "transform"; // promote the layer early`,
  };
};

// A side navigation drawer opening: one slides on a single layer (transform),
// the other animates its width and forces a relayout every frame.
const layoutThrashingUseCase: DemoFactory = (stage) => {
  clearStage(stage);
  const col = elem("div", undefined, "display:flex;flex-direction:column;gap:12px;width:240px");
  const lane = (label: string) => {
    const w = elem("div", undefined, "display:flex;flex-direction:column;gap:5px");
    const win = elem("div", undefined, "position:relative;height:62px;overflow:hidden;border-radius:12px;background:var(--color-whisper-gray)");
    const drawer = elem("div", undefined, "position:absolute;top:0;bottom:0;left:0;width:124px;overflow:hidden;background:var(--color-canvas-white);box-shadow:var(--shadow-floating);display:flex;flex-direction:column;gap:7px;padding:11px 12px");
    for (let i = 0; i < 3; i++) {
      const r = elem("div", undefined, "height:8px;border-radius:4px;background:var(--color-whisper-gray)");
      r.style.width = `${78 - i * 16}px`;
      drawer.append(r);
    }
    win.append(drawer);
    const lbl = elem("div", "demo-caption");
    lbl.textContent = label;
    w.append(win, lbl);
    return { w, drawer };
  };
  const good = lane(dt("transform — one layer"));
  const bad = lane(dt("left/width — relayout"));
  col.append(good.w, bad.w);
  stage.append(col);
  let ctrls: Controls[] = [];
  return {
    play() {
      ctrls.forEach((c) => c.stop());
      ctrls = [
        animate(good.drawer, { x: [-124, 0] }, { duration: 0.95, ease: "easeInOut", repeat: Infinity, repeatType: "reverse" }) as unknown as Controls,
        animate(bad.drawer, { width: ["0px", "124px"] }, { duration: 0.95, ease: "easeInOut", repeat: Infinity, repeatType: "reverse" }) as unknown as Controls,
      ];
    },
    cleanup: () => ctrls.forEach((c) => c.stop()),
    continuous: true,
    code: () => `animate(drawer, { x: 0 });          // one composited layer\ndrawer.style.width = w + "px";      // relayout every frame`,
  };
};

export const demos: Record<string, DemoFactory> = {
  fps,
  jank,
  droppedFrame,
  compositing,
  willChange,
  layoutThrashing,
  fpsUseCase,
  jankUseCase,
  droppedFrameUseCase,
  compositingUseCase,
  willChangeUseCase,
  layoutThrashingUseCase,
};
