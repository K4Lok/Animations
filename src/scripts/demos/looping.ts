import { animate } from "./anim";
import type { DemoFactory } from "./types";
import { clearStage, createBox, num } from "./utils";

type Controls = { stop: () => void };

const marquee: DemoFactory = (stage) => {
  clearStage(stage);
  const mask = document.createElement("div");
  mask.className = "demo-marquee";
  const track = document.createElement("div");
  track.className = "demo-marquee__track";
  const content = "FADE · SLIDE · SCALE · POP · SPRING · STAGGER · MORPH · ";
  track.textContent = content + content;
  mask.append(track);
  stage.append(mask);
  let ctrl: Controls | null = null;
  return {
    play(p) {
      ctrl?.stop();
      ctrl = animate(track, { x: ["0%", "-50%"] }, { duration: num(p, "speed", 8), ease: "linear", repeat: Infinity }) as unknown as Controls;
    },
    cleanup: () => ctrl?.stop(),
    continuous: true,
    code: (p) => `animate(track, { x: ["0%", "-50%"] }, {\n  duration: ${num(p, "speed", 8)}, ease: "linear", repeat: Infinity,\n});`,
  };
};

const loop: DemoFactory = (stage) => {
  clearStage(stage);
  const box = createBox({ label: "" });
  stage.append(box);
  let ctrl: Controls | null = null;
  return {
    play(p) {
      ctrl?.stop();
      ctrl = animate(box, { rotate: [0, 360] }, { duration: num(p, "duration", 0.8), ease: "linear", repeat: Infinity }) as unknown as Controls;
    },
    cleanup: () => ctrl?.stop(),
    continuous: true,
    code: (p) => `animate(el, { rotate: 360 }, {\n  duration: ${num(p, "duration", 0.8)}, repeat: Infinity,\n});`,
  };
};

const alternate: DemoFactory = (stage) => {
  clearStage(stage);
  const box = createBox({ label: "" });
  stage.append(box);
  let ctrl: Controls | null = null;
  return {
    play(p) {
      ctrl?.stop();
      ctrl = animate(box, { x: [-80, 80] }, { duration: num(p, "duration", 0.9), ease: "easeInOut", repeat: Infinity, repeatType: "reverse" }) as unknown as Controls;
    },
    cleanup: () => ctrl?.stop(),
    continuous: true,
    code: () => `animate(el, { x: [-80, 80] }, {\n  repeat: Infinity, repeatType: "reverse",\n});`,
  };
};

const orbit: DemoFactory = (stage) => {
  clearStage(stage);
  const center = document.createElement("div");
  center.className = "demo-orbit";
  const sun = createBox({ size: 24 });
  sun.style.background = "var(--color-muted-ash)";
  const satWrap = document.createElement("div");
  satWrap.className = "demo-orbit__arm";
  const sat = createBox({ size: 18 });
  sat.style.background = "var(--color-phoenix-orange)";
  satWrap.append(sat);
  center.append(sun, satWrap);
  stage.append(center);
  let ctrl: Controls | null = null;
  return {
    play(p) {
      ctrl?.stop();
      const r = num(p, "radius", 50);
      sat.style.transform = `translateX(${r}px)`;
      ctrl = animate(satWrap, { rotate: [0, 360] }, { duration: num(p, "speed", 4), ease: "linear", repeat: Infinity }) as unknown as Controls;
    },
    cleanup: () => ctrl?.stop(),
    continuous: true,
    code: () => `// arm spins; satellite sits at radius on the arm\nanimate(arm, { rotate: 360 }, { repeat: Infinity });`,
  };
};

const pulse: DemoFactory = (stage) => {
  clearStage(stage);
  const box = createBox({ size: 64 });
  box.style.borderRadius = "999px";
  stage.append(box);
  let ctrl: Controls | null = null;
  return {
    play(p) {
      ctrl?.stop();
      ctrl = animate(box, { scale: [1, 1.18, 1], opacity: [1, 0.7, 1] }, { duration: num(p, "duration", 1.2), ease: "easeInOut", repeat: Infinity }) as unknown as Controls;
    },
    cleanup: () => ctrl?.stop(),
    continuous: true,
    code: (p) => `animate(el, { scale: [1, 1.18, 1] }, {\n  duration: ${num(p, "duration", 1.2)}, repeat: Infinity,\n});`,
  };
};

const float: DemoFactory = (stage) => {
  clearStage(stage);
  const box = createBox({ label: "" });
  stage.append(box);
  let ctrl: Controls | null = null;
  return {
    play(p) {
      ctrl?.stop();
      const a = num(p, "amplitude", 12);
      ctrl = animate(box, { y: [-a, a] }, { duration: num(p, "duration", 2.4), ease: "easeInOut", repeat: Infinity, repeatType: "reverse" }) as unknown as Controls;
    },
    cleanup: () => ctrl?.stop(),
    continuous: true,
    code: (p) => `animate(el, { y: [-${num(p, "amplitude", 12)}, ${num(p, "amplitude", 12)}] }, {\n  repeat: Infinity, repeatType: "reverse", ease: "easeInOut",\n});`,
  };
};

const idle: DemoFactory = (stage) => {
  clearStage(stage);
  const box = createBox({ label: "idle" });
  stage.append(box);
  let ctrl: Controls | null = null;
  return {
    play() {
      ctrl?.stop();
      ctrl = animate(box, { rotate: [-2, 2], y: [-3, 3] }, { duration: 3, ease: "easeInOut", repeat: Infinity, repeatType: "mirror" }) as unknown as Controls;
    },
    cleanup: () => ctrl?.stop(),
    continuous: true,
    code: () => `// barely-there motion while waiting\nanimate(el, { rotate: [-2, 2], y: [-3, 3] }, {\n  repeat: Infinity, repeatType: "mirror",\n});`,
  };
};

export const demos: Record<string, DemoFactory> = {
  marquee,
  loop,
  alternate,
  orbit,
  pulse,
  float,
  idle,
};
