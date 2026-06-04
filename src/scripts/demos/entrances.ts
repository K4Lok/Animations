import { animate } from "./anim";
import type { DemoFactory, Params } from "./types";
import {
  clearStage,
  createBox,
  dt,
  EASING_ARRAYS,
  num,
  str,
} from "./utils";
import { elem, frame, gradientFor, imageTile, listRow, textLine } from "./kit";

const EASE_OUT: [number, number, number, number] = [0.16, 1, 0.3, 1];

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
  const wrap = document.createElement("div");
  wrap.style.cssText = "display:flex;flex-direction:column;align-items:center;gap:16px";
  const slot = document.createElement("div");
  slot.style.cssText = "display:grid;place-items:center;height:84px";
  const box = createBox({ label: "" });
  slot.append(box);
  const btn = document.createElement("button");
  btn.className = "demo-trigger demo-trigger--sm";
  btn.style.cursor = "pointer";
  btn.textContent = dt("Remove");
  wrap.append(slot, btn);
  stage.append(wrap);
  let present = true;
  let duration = 0.45;
  let ez = EASE_OUT;
  btn.addEventListener("click", () => {
    present = !present;
    btn.textContent = present ? dt("Remove") : dt("Add");
    if (present) {
      box.style.visibility = "visible";
      animate(box, { opacity: [0, 1], scale: [0.85, 1], y: [12, 0] }, { duration, ease: ez });
    } else {
      animate(box, { opacity: [1, 0], scale: [1, 0.85], y: [0, 12] }, { duration, ease: EASING_ARRAYS["ease-in"] }).then(
        () => {
          if (!present) box.style.visibility = "hidden";
        }
      );
    }
  });
  return {
    play(p) {
      duration = num(p, "duration", 0.45);
      ez = ease(p);
    },
    code: () =>
      `// Enter\nanimate(el, { opacity: [0,1], scale: [0.85,1] });\n// Exit\nanimate(el, { opacity: [1,0], scale: [1,0.85] });`,
  };
};

/* ---- realistic "use case" variants ---- */

// A settings card: hitting Save fades a confirmation toast in, then out.
const fadeUseCase: DemoFactory = (stage) => {
  clearStage(stage);
  const card = frame("width:210px;padding:14px;display:flex;flex-direction:column;gap:11px");
  const title = elem("span", undefined, "font-size:13px;font-weight:600;color:var(--color-midnight-ink)");
  title.textContent = dt("Notifications");
  const save = elem(
    "button",
    "demo-trigger demo-trigger--solid demo-trigger--sm",
    "align-self:flex-start;cursor:pointer"
  );
  save.textContent = dt("Save");
  const toast = elem(
    "div",
    undefined,
    "position:absolute;left:14px;right:14px;bottom:14px;display:flex;align-items:center;gap:8px;padding:9px 12px;border-radius:10px;background:var(--color-midnight-ink);color:#fff;font-size:12px;font-weight:500;opacity:0;pointer-events:none;box-shadow:var(--shadow-floating)"
  );
  const tick = elem(
    "span",
    undefined,
    "display:grid;place-items:center;flex:none;width:16px;height:16px;border-radius:999px;background:var(--color-deliver-green);color:#fff;font-size:10px;line-height:1"
  );
  tick.textContent = "✓";
  const tlabel = elem("span");
  tlabel.textContent = dt("Changes saved");
  toast.append(tick, tlabel);
  card.append(title, textLine(150), textLine(112, 0.7), save, toast);
  stage.append(card);

  let duration = 0.6;
  let delay = 0;
  let ez = EASE_OUT;
  let visible = false;
  let hideT: ReturnType<typeof setTimeout> | undefined;
  save.addEventListener("click", () => {
    if (visible) return;
    visible = true;
    clearTimeout(hideT);
    animate(toast, { opacity: [0, 1] }, { duration, delay, ease: ez });
    hideT = setTimeout(
      () => {
        animate(toast, { opacity: [1, 0] }, { duration, ease: ez }).then(() => {
          visible = false;
        });
      },
      (delay + duration) * 1000 + 900
    );
  });
  return {
    play(p) {
      duration = num(p, "duration", 0.6);
      delay = num(p, "delay", 0);
      ez = ease(p);
    },
    code: () => `// tap Save → toast fades in, then out\nanimate(toast, { opacity: [0, 1] });\nanimate(toast, { opacity: [1, 0] });`,
  };
};

const slideOffset = (dir: string, dist: number) =>
  dir === "left"
    ? { x: -dist, y: 0 }
    : dir === "right"
      ? { x: dist, y: 0 }
      : dir === "top"
        ? { x: 0, y: -dist }
        : { x: 0, y: dist };

// A notification toast slides in over a faux inbox from the chosen edge.
const slideUseCase: DemoFactory = (stage) => {
  clearStage(stage);
  const screen = frame("width:210px;height:142px");
  const bg = elem("div", undefined, "position:absolute;inset:0;display:flex;flex-direction:column;gap:9px;padding:14px;opacity:0.5");
  const h = elem("span", undefined, "font-size:13px;font-weight:600;color:var(--color-midnight-ink)");
  h.textContent = dt("Inbox");
  bg.append(h, textLine(150), textLine(130, 0.7), textLine(140, 0.55));
  const btn = elem(
    "button",
    "demo-trigger demo-trigger--sm",
    "position:absolute;left:50%;bottom:12px;transform:translateX(-50%);z-index:2;cursor:pointer"
  );
  btn.textContent = dt("Notify");
  const close = elem(
    "button",
    undefined,
    "display:grid;place-items:center;flex:none;width:20px;height:20px;border-radius:999px;border:none;background:var(--color-whisper-gray);color:var(--color-muted-ash);font-size:11px;line-height:1;cursor:pointer"
  );
  close.textContent = "✕";
  const toast = listRow({ i: 1, title: dt("New message"), sub: dt("Tap to read"), trailing: close });
  toast.style.cssText += ";position:absolute;left:12px;right:12px;top:12px;z-index:3;opacity:0;box-shadow:var(--shadow-floating)";
  screen.append(bg, btn, toast);
  stage.append(screen);

  let open = false;
  let dir = "top";
  let dist = 64;
  let duration = 0.6;
  let ez = EASE_OUT;
  btn.addEventListener("click", () => {
    if (open) return;
    open = true;
    const o = slideOffset(dir, dist);
    animate(toast, { x: [o.x, 0], y: [o.y, 0], opacity: [0, 1] }, { duration, ease: ez });
  });
  close.addEventListener("click", () => {
    if (!open) return;
    open = false;
    const o = slideOffset(dir, dist);
    animate(toast, { x: [0, o.x], y: [0, o.y], opacity: [1, 0] }, { duration, ease: ez });
  });
  return {
    play(p) {
      dir = str(p, "direction", "top");
      dist = num(p, "distance", 64);
      duration = num(p, "duration", 0.6);
      ez = ease(p);
    },
    code: () => `// tap Notify → toast slides in from the edge\nanimate(toast, { y: [from, 0], opacity: [0, 1] });`,
  };
};

// An avatar button opens a menu that scales + fades in from its top edge.
const scaleUseCase: DemoFactory = (stage) => {
  clearStage(stage);
  const wrap = elem("div", undefined, "position:relative;width:170px;height:158px;display:flex;justify-content:center");
  const avatar = elem(
    "button",
    undefined,
    "position:absolute;top:8px;display:grid;place-items:center;width:40px;height:40px;border-radius:999px;background:var(--color-intelligence-blue);color:#fff;font-size:13px;font-weight:600;border:none;cursor:pointer;z-index:2;box-shadow:var(--shadow-subtle)"
  );
  avatar.textContent = "SK";
  const menu = frame(
    "position:absolute;top:56px;width:150px;padding:6px;display:flex;flex-direction:column;gap:1px;transform-origin:top center;opacity:0;pointer-events:none"
  );
  const item = (label: string) => {
    const b = elem(
      "button",
      undefined,
      "width:100%;padding:8px 10px;font:inherit;font-size:12px;font-weight:500;color:var(--color-midnight-ink);background:transparent;border:none;border-radius:7px;text-align:left;cursor:pointer"
    );
    b.textContent = label;
    return b;
  };
  const items = [dt("Profile"), dt("Settings"), dt("Log out")].map(item);
  menu.append(...items);
  wrap.append(avatar, menu);
  stage.append(wrap);

  let open = false;
  let from = 0.6;
  let duration = 0.5;
  let ez = EASE_OUT;
  const apply = () => {
    menu.style.pointerEvents = open ? "auto" : "none";
    animate(menu, { scale: open ? [from, 1] : [1, from], opacity: open ? [0, 1] : [1, 0] }, { duration, ease: ez });
  };
  avatar.addEventListener("click", () => {
    open = !open;
    apply();
  });
  items.forEach((b) =>
    b.addEventListener("click", () => {
      if (!open) return;
      open = false;
      apply();
    })
  );
  return {
    play(p) {
      from = num(p, "from", 0.6);
      duration = num(p, "duration", 0.5);
      ez = ease(p);
    },
    code: () => `// tap avatar → menu scales in from the top\nanimate(menu, { scale: [from, 1], opacity: [0, 1] });`,
  };
};

// A like button: tapping fills the heart with a springy pop and pops a count in.
const popUseCase: DemoFactory = (stage) => {
  clearStage(stage);
  const card = frame("width:210px;padding:12px;display:flex;align-items:center;gap:10px");
  const chip = elem("span", undefined, "flex:none;width:30px;height:30px;border-radius:999px");
  chip.style.background = gradientFor(4);
  const text = elem("div", undefined, "display:flex;flex-direction:column;gap:3px;min-width:0");
  const name = elem("span", undefined, "font-size:12px;font-weight:600;color:var(--color-midnight-ink)");
  name.textContent = dt("Sam KaLok");
  const when = elem("span", undefined, "font-size:10px;color:var(--color-muted-ash)");
  when.textContent = dt("2h ago");
  text.append(name, when);
  const likeBtn = elem(
    "button",
    undefined,
    "margin-left:auto;display:flex;align-items:center;gap:7px;background:none;border:none;cursor:pointer"
  );
  const heart = elem("span", undefined, "display:grid;place-items:center;width:24px;height:24px");
  heart.innerHTML = `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--color-muted-ash)" stroke-width="2" stroke-linejoin="round"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41 0.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>`;
  const path = heart.querySelector("path") as SVGPathElement;
  const count = elem("span", undefined, "font-size:12px;font-weight:600;color:var(--color-leadgen-red);opacity:0");
  count.textContent = "1";
  likeBtn.append(heart, count);
  card.append(chip, text, likeBtn);
  stage.append(card);

  let liked = false;
  let duration = 0.5;
  let bounce = 0.5;
  likeBtn.addEventListener("click", () => {
    liked = !liked;
    if (liked) {
      path.setAttribute("fill", "var(--color-leadgen-red)");
      path.setAttribute("stroke", "var(--color-leadgen-red)");
      animate(heart, { scale: [0.3, 1] }, { type: "spring", visualDuration: duration, bounce } as any);
      count.style.opacity = "1";
      animate(count, { scale: [0, 1], opacity: [0, 1] }, { type: "spring", visualDuration: duration, bounce } as any);
    } else {
      path.setAttribute("fill", "none");
      path.setAttribute("stroke", "var(--color-muted-ash)");
      animate(count, { opacity: [1, 0] }, { duration: 0.2 }).then(() => (count.style.opacity = "0"));
    }
  });
  return {
    play(p) {
      duration = num(p, "duration", 0.5);
      bounce = num(p, "bounce", 0.5);
    },
    code: () => `// tap like → heart pops in with overshoot\nanimate(heart, { scale: [0.3, 1] }, {\n  type: "spring", bounce,\n});`,
  };
};

// A photo that develops in: a directional clip-window opens over a slow zoom.
const revealUseCase: DemoFactory = (stage) => {
  clearStage(stage);
  const f = frame("width:210px;height:124px;cursor:pointer");
  const win = elem("div", undefined, "position:absolute;inset:0;overflow:hidden");
  const tile = imageTile({ i: 4, radius: 0 });
  tile.style.cssText += ";position:absolute;inset:0";
  win.append(tile);
  const cap = elem("span", "uikit-tile__cap", "position:absolute;left:0;bottom:0;z-index:1;opacity:0");
  cap.textContent = dt("Aurora.jpg");
  f.append(win, cap);
  stage.append(f);

  let dir = "left";
  let duration = 0.7;
  let ez = EASE_OUT;
  let running = false;
  const run = () => {
    if (running) return;
    running = true;
    const closed = closedClip(dir);
    win.style.clipPath = closed;
    cap.style.opacity = "0";
    animate(win, { clipPath: [closed, "inset(0 0 0 0)"] }, { duration, ease: ez });
    animate(tile, { scale: [1.18, 1], opacity: [0.35, 1] }, { duration, ease: ez }).then(() => {
      running = false;
      animate(cap, { opacity: [0, 1] }, { duration: 0.25 });
    });
  };
  f.addEventListener("click", run);
  requestAnimationFrame(run);
  return {
    play(p) {
      dir = str(p, "direction", "left");
      duration = num(p, "duration", 0.7);
      ez = ease(p);
    },
    code: () =>
      `// a window opens while the photo zooms in\nanimate(window, { clipPath: [closed, "inset(0 0 0 0)"] });\nanimate(photo,  { scale: [1.18, 1], opacity: [0.35, 1] });`,
  };
};

// A task list (max 3): Add enters a row; ✕ exits it and FLIPs survivors up.
const enterExitUseCase: DemoFactory = (stage) => {
  clearStage(stage);
  const MAX = 3;
  const wrap = elem("div", undefined, "display:flex;flex-direction:column;gap:10px;width:210px");
  const list = elem("div", undefined, "display:flex;flex-direction:column;gap:8px");
  const addBtn = elem("button", "demo-trigger demo-trigger--sm", "align-self:flex-start;cursor:pointer") as HTMLButtonElement;
  addBtn.textContent = dt("Add task");
  wrap.append(list, addBtn);
  stage.append(wrap);

  const titles = [dt("Buy groceries"), dt("Call the dentist"), dt("Plan the trip"), dt("Water the plants")];
  let next = 0;
  let duration = 0.45;
  let ez = EASE_OUT;

  const syncAdd = () => {
    const full = list.children.length >= MAX;
    addBtn.disabled = full;
    addBtn.style.opacity = full ? "0.45" : "1";
    addBtn.style.cursor = full ? "default" : "pointer";
  };

  const makeRow = (title: string) => {
    const close = elem(
      "button",
      undefined,
      "display:grid;place-items:center;width:20px;height:20px;border-radius:999px;border:none;background:var(--color-whisper-gray);color:var(--color-muted-ash);font-size:11px;line-height:1;cursor:pointer"
    );
    close.textContent = "✕";
    const row = listRow({ i: next, title, trailing: close });
    close.addEventListener("click", () => removeRow(row));
    return row;
  };

  // Exit: fade the row out, then slide the remaining rows up via transforms (FLIP).
  const removeRow = (row: HTMLElement) => {
    const survivors = [...list.children].filter((c) => c !== row) as HTMLElement[];
    const first = survivors.map((c) => c.getBoundingClientRect());
    animate(row, { opacity: [1, 0], scale: [1, 0.92] }, { duration: duration * 0.6, ease: ez }).then(() => {
      row.remove();
      const last = survivors.map((c) => c.getBoundingClientRect());
      survivors.forEach((c, i) => {
        const dy = first[i].top - last[i].top;
        if (dy) animate(c, { y: [dy, 0] }, { duration, ease: ez });
      });
      syncAdd();
    });
  };

  const addRow = (animateIn: boolean) => {
    if (list.children.length >= MAX) return;
    const row = makeRow(titles[next % titles.length]);
    next += 1;
    list.append(row);
    if (animateIn) animate(row, { opacity: [0, 1], scale: [0.92, 1], y: [10, 0] }, { duration, ease: ez });
    syncAdd();
  };

  addRow(false);
  addRow(false);
  addBtn.addEventListener("click", () => addRow(true));
  return {
    play(p) {
      duration = num(p, "duration", 0.45);
      ez = ease(p);
    },
    code: () =>
      `// Enter\nanimate(row, { opacity: [0, 1], scale: [0.92, 1] });\n// Exit — fade out, then FLIP survivors up\nanimate(row, { opacity: [1, 0] }).then(remove);`,
  };
};

export const demos: Record<string, DemoFactory> = {
  fade,
  slide,
  scale,
  pop,
  reveal,
  enterExit,
  fadeUseCase,
  slideUseCase,
  scaleUseCase,
  popUseCase,
  revealUseCase,
  enterExitUseCase,
};

export const controlPresets = { easeOptions };
