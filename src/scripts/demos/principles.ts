import { animate } from "./anim";
import type { DemoFactory } from "./types";
import { clearStage, createBox, dt, num, bool } from "./utils";
import { elem, frame, gradientFor, imageTile } from "./kit";

type Controls = { stop: () => void };
const EASE_OUT: [number, number, number, number] = [0.16, 1, 0.3, 1];

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
        ? dt("Gratuitous: spins and flips for no reason")
        : dt("Purposeful: a clean entrance that orients you");
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
      cap.textContent = useSkeleton ? dt("Skeleton → feels instant and responsive") : dt("Spinner → feels like waiting");
      if (useSkeleton) {
        view.innerHTML = `<div class="demo-skel__line" style="width:55%"></div><div class="demo-skel__line" style="width:100%"></div><div class="demo-skel__line" style="width:78%"></div>`;
      } else {
        view.innerHTML = `<div class="demo-spinner"></div>`;
      }
      timer = window.setTimeout(() => {
        view.innerHTML = `<div style="font-weight:600">Aurora Borealis</div><div style="font-size:12px;color:var(--color-muted-ash);margin-top:6px">${dt("Loaded in 1.2s")}</div>`;
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
        restraint > 0.6 ? dt("Seen often → short and subtle") : dt("Seen rarely → can be bigger and slower");
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
  cap.textContent = dt("transform + opacity stay on the GPU — buttery smooth");
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
        ? dt("Reduced: a quiet fade, no large movement")
        : dt("Full: slides and scales in");
      if (reduce) animate(box, { opacity: [0, 1] }, { duration: 0.3 });
      else animate(box, { x: [-90, 0], scale: [0.6, 1], opacity: [0, 1] }, { duration: 0.6, ease: [0.34, 1.56, 0.64, 1] });
    },
    code: () => `@media (prefers-reduced-motion: reduce) {\n  /* tone down or remove movement */\n}`,
  };
};

// A bookmark button on an article card. Saving is a tiny, frequent action, so a
// clean confirmation is purposeful; a 720° spin-and-flip is gratuitous noise.
const purposefulUseCase: DemoFactory = (stage) => {
  clearStage(stage);
  const card = frame("width:236px;padding:14px");
  const thumb = imageTile({ i: 4, radius: 10 });
  thumb.style.cssText += ";height:74px;width:100%";
  const t = elem("span", undefined, "display:block;margin-top:11px;font-size:13px;font-weight:600;color:var(--color-midnight-ink)");
  t.textContent = dt("Aurora over the fjord");
  const sub = elem("span", undefined, "display:block;margin-top:3px;font-size:11px;color:var(--color-muted-ash)");
  sub.textContent = dt("by Sam KaLok");
  const btn = elem("button", undefined, "cursor:pointer;margin-top:12px;display:flex;align-items:center;gap:8px;width:100%;justify-content:center;height:36px;border:1px solid var(--border-hairline);border-radius:9px;background:var(--color-canvas-white);font-size:13px;font-weight:600;color:var(--color-midnight-ink)");
  const mark = elem("span", undefined, "display:inline-flex;width:14px;height:14px");
  mark.innerHTML = `<svg viewBox="0 0 14 14" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M3 1.5h8v11l-4-3-4 3z"/></svg>`;
  const lbl = elem("span");
  lbl.textContent = dt("Save");
  btn.append(mark, lbl);
  const cap = elem("div", "demo-caption");
  card.append(thumb, t, sub, btn);
  stage.append(card, cap);
  let gratuitous = false;
  let saved = false;
  btn.addEventListener("click", () => {
    saved = !saved;
    lbl.textContent = saved ? dt("Saved") : dt("Save");
    mark.querySelector("path")!.setAttribute("fill", saved ? "currentColor" : "none");
    if (!saved) return;
    if (gratuitous)
      animate(mark, { rotate: [0, 720], rotateY: [0, 180, 0], scale: [1, 1.6, 1] }, { duration: 1, ease: "easeInOut" });
    else animate(mark, { scale: [0.4, 1.15, 1], opacity: [0.3, 1] }, { duration: 0.4, ease: EASE_OUT });
  });
  return {
    play(p) {
      gratuitous = bool(p, "gratuitous", false);
      cap.textContent = gratuitous
        ? dt("Gratuitous: spins and flips for no reason")
        : dt("Purposeful: a clean entrance that orients you");
    },
    code: () => `// confirm the save, don't perform for it\nanimate(icon, { scale: [0.4, 1.15, 1], opacity: [0.3, 1] });`,
  };
};

// A send button whose paper plane winds back before it flies — the wind-up tells
// you the tap registered a beat before the plane leaves.
const anticipationUseCase: DemoFactory = (stage) => {
  clearStage(stage);
  const bar = frame("display:flex;align-items:center;gap:8px;width:240px;padding:8px 8px 8px 14px");
  const field = elem("span", undefined, "flex:1;font-size:13px;color:var(--color-muted-ash);white-space:nowrap;overflow:hidden;text-overflow:ellipsis");
  field.textContent = dt("New message");
  const btn = elem("button", undefined, "cursor:pointer;flex:none;display:inline-flex;align-items:center;justify-content:center;width:36px;height:36px;border:none;border-radius:999px;background:var(--color-midnight-ink);overflow:hidden");
  const plane = elem("span", undefined, "display:inline-flex;color:var(--color-canvas-white)");
  plane.innerHTML = `<svg viewBox="0 0 16 16" width="16" height="16" fill="currentColor"><path d="M1.5 7.5 14 2 9 14l-2.2-4.3L1.5 7.5z"/></svg>`;
  btn.append(plane);
  const cap = elem("div", "demo-caption");
  bar.append(field, btn);
  stage.append(bar, cap);
  let on = true;
  let busy = false;
  btn.addEventListener("click", () => {
    if (busy) return;
    busy = true;
    const keys = on
      ? { x: [0, -7, 34], y: [0, 4, -22], opacity: [1, 1, 0] }
      : { x: [0, 34], y: [0, -22], opacity: [1, 0] };
    const opts = on
      ? { duration: 0.62, times: [0, 0.32, 1], ease: [0.5, 0, 0.2, 1] as [number, number, number, number] }
      : { duration: 0.42, ease: EASE_OUT };
    field.textContent = dt("Message sent");
    animate(plane, keys, opts).then(() => {
      plane.style.transform = "";
      plane.style.opacity = "0";
      setTimeout(() => {
        field.textContent = dt("New message");
        plane.style.opacity = "1";
        busy = false;
      }, 650);
    });
  });
  return {
    play(p) {
      on = bool(p, "on", true);
      cap.textContent = on ? dt("Anticipation: a wind-up before the send") : dt("No wind-up: the plane just leaves");
    },
    code: () => `// a small pull-back before it flies\nanimate(plane, { x: [0, -7, 34] }, { times: [0, 0.32, 1] });`,
  };
};

// A bell that drops a notification card. Follow-through lets the card overshoot
// and the badge keep moving a beat after the card has settled.
const followThroughUseCase: DemoFactory = (stage) => {
  clearStage(stage);
  const wrap = elem("div", undefined, "position:relative;display:flex;flex-direction:column;align-items:flex-end;gap:10px;width:240px");
  const bell = elem("button", undefined, "cursor:pointer;display:inline-flex;align-items:center;justify-content:center;width:38px;height:38px;border:1px solid var(--border-hairline);border-radius:999px;background:var(--color-canvas-white);color:var(--color-midnight-ink)");
  bell.innerHTML = `<svg viewBox="0 0 18 18" width="17" height="17" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M5 7a4 4 0 0 1 8 0c0 4 1.5 5 1.5 5h-11S5 11 5 7z"/><path d="M7.5 14.5a1.5 1.5 0 0 0 3 0"/></svg>`;
  const tray = elem("div", undefined, "position:relative;width:100%;min-height:62px");
  wrap.append(bell, tray);
  const cap = elem("div", "demo-caption");
  stage.append(wrap, cap);
  let on = true;
  let card: HTMLElement | null = null;
  bell.addEventListener("click", () => {
    card?.remove();
    const c = frame("position:absolute;top:0;left:0;display:flex;align-items:center;gap:10px;width:100%;padding:10px 12px");
    const chip = elem("span", undefined, "flex:none;width:30px;height:30px;border-radius:9px");
    chip.style.background = gradientFor(1);
    const txt = elem("div", undefined, "flex:1;min-width:0");
    const tl = elem("span", undefined, "display:block;font-size:12px;font-weight:600;color:var(--color-midnight-ink)");
    tl.textContent = dt("Aurora team");
    const sl = elem("span", undefined, "display:block;font-size:11px;color:var(--color-muted-ash)");
    sl.textContent = dt("liked your post");
    txt.append(tl, sl);
    const badge = elem("span", undefined, "flex:none;width:9px;height:9px;border-radius:999px;background:var(--color-leadgen-red)");
    c.append(chip, txt, badge);
    tray.append(c);
    card = c;
    if (on) {
      animate(c, { y: [-58, 0], opacity: [0, 1] }, { type: "spring", stiffness: 260, damping: 14 });
      animate(badge, { y: [-58, 0] }, { type: "spring", stiffness: 200, damping: 9 });
    } else {
      animate(c, { y: [-58, 0], opacity: [0, 1] }, { duration: 0.3, ease: "linear" });
    }
  });
  return {
    play(p) {
      on = bool(p, "on", true);
      cap.textContent = on ? dt("Follow-through: it overshoots, then settles") : dt("No follow-through: a flat stop");
    },
    code: () => `// the card overshoots and settles back\nanimate(card, { y: 0 }, { type: "spring", damping: 14 });`,
  };
};

// A chat composer: the sent bubble drops into the thread and squashes on impact,
// giving the message physical weight.
const squashStretchUseCase: DemoFactory = (stage) => {
  clearStage(stage);
  const phone = frame("display:flex;flex-direction:column;width:222px;height:184px;padding:12px;overflow:hidden");
  const thread = elem("div", undefined, "flex:1;display:flex;flex-direction:column;justify-content:flex-end;gap:7px;overflow:hidden");
  const incoming = elem("div", undefined, "align-self:flex-start;max-width:70%;padding:8px 11px;border-radius:13px 13px 13px 4px;background:var(--color-whisper-gray);font-size:12px;color:var(--color-midnight-ink)");
  incoming.textContent = dt("Did you see the build?");
  thread.append(incoming);
  const composer = elem("div", undefined, "display:flex;align-items:center;gap:8px;margin-top:10px");
  const field = elem("span", undefined, "flex:1;font-size:12px;color:var(--color-muted-ash)");
  field.textContent = dt("Sounds good — ship it");
  const send = elem("button", undefined, "cursor:pointer;flex:none;height:30px;padding:0 13px;border:none;border-radius:999px;background:var(--color-midnight-ink);color:var(--color-canvas-white);font-size:12px;font-weight:600");
  send.textContent = dt("Send");
  composer.append(field, send);
  phone.append(thread, composer);
  stage.append(phone);
  let amount = 0.3;
  send.addEventListener("click", () => {
    const bubble = elem("div", undefined, "align-self:flex-end;max-width:70%;padding:8px 11px;border-radius:13px 13px 4px 13px;background:var(--color-midnight-ink);color:var(--color-canvas-white);font-size:12px;transform-origin:bottom right");
    bubble.textContent = dt("Sounds good — ship it");
    thread.append(bubble);
    animate(
      bubble,
      { y: [-46, 0, -16, 0], scaleY: [1, 1 - amount, 1 + amount * 0.4, 1], scaleX: [1, 1 + amount, 1 - amount * 0.25, 1], opacity: [0, 1, 1, 1] },
      { duration: 0.9, times: [0, 0.5, 0.74, 1], ease: "easeIn" }
    );
    if (thread.childElementCount > 4) thread.firstElementChild?.remove();
  });
  return {
    play(p) {
      amount = num(p, "amount", 0.3);
    },
    code: (p) => `animate(bubble, {\n  y: [-46, 0, -16, 0],\n  scaleY: [1, ${(1 - num(p, "amount", 0.3)).toFixed(2)}, 1.1, 1],\n});`,
  };
};

// A profile card that reloads: a skeleton stands in for the layout and feels
// instant; a spinner gives nothing to read and feels like waiting.
const perceivedPerfUseCase: DemoFactory = (stage) => {
  clearStage(stage);
  const card = frame("width:230px;height:150px;padding:14px;overflow:hidden");
  const view = elem("div", undefined, "height:74px");
  const reload = elem("button", undefined, "cursor:pointer;margin-top:14px;display:inline-flex;align-items:center;gap:7px;height:32px;padding:0 13px;border:1px solid var(--border-hairline);border-radius:8px;background:var(--color-canvas-white);font-size:12px;font-weight:600;color:var(--color-midnight-ink)");
  reload.textContent = dt("Reload");
  const cap = elem("div", "demo-caption");
  card.append(view, reload);
  stage.append(card, cap);
  let skeleton = true;
  let timer: number | undefined;
  const content = () => {
    view.innerHTML = "";
    const top = elem("div", undefined, "display:flex;align-items:center;gap:10px");
    const av = elem("span", undefined, "flex:none;width:38px;height:38px;border-radius:999px");
    av.style.background = gradientFor(2);
    const tx = elem("div");
    const n = elem("span", undefined, "display:block;font-size:13px;font-weight:600;color:var(--color-midnight-ink)");
    n.textContent = dt("Aurora team");
    const r = elem("span", undefined, "display:block;font-size:11px;color:var(--color-muted-ash)");
    r.textContent = dt("Product Designer");
    tx.append(n, r);
    top.append(av, tx);
    const meta = elem("div", undefined, "margin-top:12px;font-size:11px;color:var(--color-muted-ash)");
    meta.textContent = dt("Loaded in 1.2s");
    view.append(top, meta);
    animate(view, { opacity: [0, 1] }, { duration: 0.3 });
  };
  const run = () => {
    clearTimeout(timer);
    if (skeleton) {
      view.innerHTML = `<div class="demo-skel" style="height:100%"><div class="demo-skel__line" style="width:48%"></div><div class="demo-skel__line" style="width:90%"></div><div class="demo-skel__line" style="width:70%"></div></div>`;
    } else {
      view.innerHTML = `<div style="display:grid;place-items:center;height:100%"><div class="demo-spinner"></div></div>`;
    }
    timer = window.setTimeout(content, 1200);
  };
  reload.addEventListener("click", run);
  content();
  return {
    play(p) {
      skeleton = bool(p, "skeleton", true);
      cap.textContent = skeleton ? dt("Skeleton → feels instant and responsive") : dt("Spinner → feels like waiting");
    },
    cleanup: () => clearTimeout(timer),
    code: () => `// show the shape of the content while it loads\nshow(skeleton); await data; show(content);`,
  };
};

// An inbox row marked read on tap. It's a constant action, so restraint keeps
// the highlight short and small; loosen it and the same row feels theatrical.
const frequencyUseCase: DemoFactory = (stage) => {
  clearStage(stage);
  const list = frame("width:236px;padding:6px");
  const cap = elem("div", "demo-caption");
  const rows: { row: HTMLElement; dot: HTMLElement; read: boolean }[] = [];
  const data = [
    [dt("Aurora team"), dt("liked your post")],
    [dt("Cascade trailhead"), dt("sent a message")],
    [dt("Coastal fog"), dt("mentioned you")],
  ];
  let restraint = 0.6;
  data.forEach(([title, sub], i) => {
    const row = elem("div", undefined, "cursor:pointer;display:flex;align-items:center;gap:10px;padding:9px 8px;border-radius:9px");
    const chip = elem("span", undefined, "flex:none;width:30px;height:30px;border-radius:9px");
    chip.style.background = gradientFor(i);
    const tx = elem("div", undefined, "flex:1;min-width:0");
    const tl = elem("span", undefined, "display:block;font-size:12px;font-weight:600;color:var(--color-midnight-ink)");
    tl.textContent = title;
    const sl = elem("span", undefined, "display:block;font-size:11px;color:var(--color-muted-ash);white-space:nowrap;overflow:hidden;text-overflow:ellipsis");
    sl.textContent = sub;
    tx.append(tl, sl);
    const dot = elem("span", undefined, "flex:none;width:8px;height:8px;border-radius:999px;background:var(--color-intelligence-blue)");
    row.append(chip, tx, dot);
    const entry = { row, dot, read: false };
    row.addEventListener("click", () => {
      entry.read = !entry.read;
      dot.style.opacity = entry.read ? "0" : "1";
      const travel = 4 + (1 - restraint) * 22;
      const dur = 0.22 + (1 - restraint) * 0.7;
      row.style.background = "var(--color-whisper-gray)";
      animate(row, { x: [travel, 0] }, { duration: dur, ease: EASE_OUT });
      animate(dot, { scale: entry.read ? [1, 0] : [0, 1] }, { duration: dur * 0.7, ease: EASE_OUT });
      setTimeout(() => (row.style.background = ""), dur * 1000 + 120);
    });
    rows.push(entry);
    list.append(row);
  });
  stage.append(list, cap);
  return {
    play(p) {
      restraint = num(p, "subtlety", 0.6);
      cap.textContent = restraint > 0.6 ? dt("Seen often → short and subtle") : dt("Seen rarely → can be bigger and slower");
    },
    code: () => `// frequent action → shorter, smaller motion\nduration = 0.22 + rareness * 0.7;`,
  };
};

// A photo grid that opens to a detail view. Animating the tile to its larger
// self keeps its identity; snapping makes you hunt for where it went.
const spatialConsistencyUseCase: DemoFactory = (stage) => {
  clearStage(stage);
  const wrap = frame("position:relative;width:236px;height:172px;padding:10px;overflow:hidden");
  const grid = elem("div", undefined, "display:grid;grid-template-columns:1fr 1fr;gap:8px;height:100%");
  const names = [dt("Aurora over the fjord"), dt("Borealis at midnight"), dt("Cascade trailhead"), dt("Coastal fog")];
  const tiles: HTMLElement[] = [];
  names.forEach((name, i) => {
    const tile = elem("div", undefined, "cursor:pointer;position:relative;border-radius:10px;overflow:hidden");
    tile.style.background = gradientFor(i);
    tile.dataset.name = name;
    grid.append(tile);
    tiles.push(tile);
  });
  const overlay = elem("div", undefined, "position:absolute;border-radius:10px;overflow:hidden;display:none;cursor:pointer;box-shadow:var(--shadow-floating)");
  const ocap = elem("span", undefined, "position:absolute;left:0;right:0;bottom:0;padding:9px 11px;font-size:12px;font-weight:600;color:#fff;background:linear-gradient(transparent,rgba(0,0,0,.45))");
  overlay.append(ocap);
  wrap.append(grid, overlay);
  stage.append(wrap);
  let doAnimate = true;
  let open = false;
  const closeRect = () => wrap.getBoundingClientRect();
  const openTile = (tile: HTMLElement, i: number) => {
    if (open) return;
    open = true;
    const t = tile.getBoundingClientRect();
    const w = closeRect();
    const from = { left: t.left - w.left, top: t.top - w.top, width: t.width, height: t.height };
    const pad = 10;
    const to = { left: pad, top: pad, width: w.width - pad * 2, height: w.height - pad * 2 };
    overlay.style.background = gradientFor(i);
    ocap.textContent = tile.dataset.name!;
    overlay.style.display = "block";
    overlay.style.left = `${from.left}px`;
    overlay.style.top = `${from.top}px`;
    overlay.style.width = `${from.width}px`;
    overlay.style.height = `${from.height}px`;
    tile.style.visibility = "hidden";
    overlay.dataset.idx = String(i);
    if (doAnimate) {
      animate(overlay, { left: [from.left, to.left], top: [from.top, to.top], width: [from.width, to.width], height: [from.height, to.height] }, { type: "spring", stiffness: 320, damping: 32 });
      animate(ocap, { opacity: [0, 1] }, { duration: 0.3 });
    } else {
      overlay.style.left = `${to.left}px`;
      overlay.style.top = `${to.top}px`;
      overlay.style.width = `${to.width}px`;
      overlay.style.height = `${to.height}px`;
    }
  };
  const closeOverlay = () => {
    if (!open) return;
    const i = Number(overlay.dataset.idx);
    const tile = tiles[i];
    const t = tile.getBoundingClientRect();
    const w = closeRect();
    const to = { left: t.left - w.left, top: t.top - w.top, width: t.width, height: t.height };
    const reveal = () => {
      tile.style.visibility = "";
      overlay.style.display = "none";
      open = false;
    };
    if (doAnimate) {
      ocap.style.opacity = "0";
      animate(overlay, { left: to.left, top: to.top, width: to.width, height: to.height }, { type: "spring", stiffness: 340, damping: 34 }).then(reveal);
    } else reveal();
  };
  tiles.forEach((tile, i) => tile.addEventListener("click", () => openTile(tile, i)));
  overlay.addEventListener("click", closeOverlay);
  return {
    play(p) {
      doAnimate = bool(p, "animate", true);
    },
    code: () => `// grow the tile into its detail view\nanimate(overlay, { left, top, width, height }, { type: "spring" });`,
  };
};

// A promo banner whose artwork pans and badge pulses forever — all on transform
// and opacity, so the GPU keeps it smooth.
const hardwareAccelUseCase: DemoFactory = (stage) => {
  clearStage(stage);
  const card = frame("position:relative;width:236px;height:118px;overflow:hidden");
  const art = imageTile({ i: 0, radius: 0 });
  art.style.cssText += ";position:absolute;inset:0 -22% 0 0;width:122%;height:100%;will-change:transform";
  const shade = elem("div", undefined, "position:absolute;inset:0;background:linear-gradient(90deg,rgba(0,0,0,.42),transparent 70%)");
  const live = elem("span", undefined, "position:absolute;top:10px;left:12px;display:flex;align-items:center;gap:6px;padding:4px 9px;border-radius:999px;background:rgba(0,0,0,.4);color:#fff;font-size:10px;font-weight:700;letter-spacing:.4px");
  const liveDot = elem("span", undefined, "width:6px;height:6px;border-radius:999px;background:var(--color-leadgen-red)");
  const liveTx = elem("span");
  liveTx.textContent = dt("Now live");
  live.append(liveDot, liveTx);
  const title = elem("span", undefined, "position:absolute;left:12px;bottom:12px;color:#fff;font-size:15px;font-weight:700");
  title.textContent = dt("Aurora over the fjord");
  card.append(art, shade, live, title);
  const cap = elem("div", "demo-caption");
  cap.textContent = dt("transform + opacity stay on the GPU — buttery smooth");
  stage.append(card, cap);
  let ctrls: Controls[] = [];
  return {
    play() {
      ctrls.forEach((c) => c.stop());
      ctrls = [
        animate(art, { x: ["0%", "-18%"] }, { duration: 7, ease: "easeInOut", repeat: Infinity, repeatType: "reverse" }) as unknown as Controls,
        animate(liveDot, { opacity: [1, 0.25, 1], scale: [1, 0.8, 1] }, { duration: 1.4, ease: "easeInOut", repeat: Infinity }) as unknown as Controls,
      ];
    },
    cleanup: () => ctrls.forEach((c) => c.stop()),
    continuous: true,
    code: () => `// pan + pulse on GPU-friendly props only\nanimate(art, { x: "-18%" }); animate(dot, { opacity });`,
  };
};

// A settings sheet. With motion it slides and scales up over a dimming backdrop;
// under reduced-motion it simply fades, with no large movement.
const reducedMotionUseCase: DemoFactory = (stage) => {
  clearStage(stage);
  const phone = elem("div", undefined, "position:relative;width:222px;height:178px;border-radius:16px;overflow:hidden;border:1px solid var(--border-hairline);background:var(--color-whisper-gray)");
  const open = elem("button", undefined, "cursor:pointer;position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);height:36px;padding:0 16px;border:none;border-radius:9px;background:var(--color-midnight-ink);color:var(--color-canvas-white);font-size:13px;font-weight:600");
  open.textContent = dt("Open sheet");
  const backdrop = elem("div", undefined, "position:absolute;inset:0;background:rgba(10,10,25,.4);opacity:0;display:none");
  const sheet = elem("div", undefined, "position:absolute;left:10px;right:10px;bottom:10px;padding:14px;border-radius:14px;background:var(--color-canvas-white);box-shadow:var(--shadow-floating);transform-origin:bottom center");
  const sh = elem("span", undefined, "display:block;font-size:13px;font-weight:700;color:var(--color-midnight-ink)");
  sh.textContent = dt("Settings");
  for (const label of [dt("Notifications"), dt("Privacy")]) {
    const r = elem("div", undefined, "display:flex;align-items:center;justify-content:space-between;margin-top:10px;font-size:12px;color:var(--color-midnight-ink)");
    const l = elem("span");
    l.textContent = label;
    const sw = elem("span", undefined, "width:28px;height:16px;border-radius:999px;background:var(--color-deliver-green)");
    r.append(l, sw);
    sheet.append(r);
  }
  sheet.prepend(sh);
  const close = elem("button", undefined, "cursor:pointer;margin-top:14px;width:100%;height:32px;border:1px solid var(--border-hairline);border-radius:8px;background:var(--color-canvas-white);font-size:12px;font-weight:600;color:var(--color-midnight-ink)");
  close.textContent = dt("Close");
  sheet.append(close);
  sheet.style.display = "none";
  phone.append(open, backdrop, sheet);
  const cap = elem("div", "demo-caption");
  stage.append(phone, cap);
  let reduce = false;
  const show = () => {
    backdrop.style.display = "block";
    sheet.style.display = "block";
    animate(backdrop, { opacity: [0, 1] }, { duration: 0.3 });
    if (reduce) animate(sheet, { opacity: [0, 1] }, { duration: 0.3 });
    else animate(sheet, { y: [120, 0], scale: [0.94, 1], opacity: [0, 1] }, { duration: 0.5, ease: EASE_OUT });
  };
  const hide = () => {
    animate(backdrop, { opacity: [1, 0] }, { duration: 0.25 }).then(() => (backdrop.style.display = "none"));
    const a = reduce
      ? animate(sheet, { opacity: [1, 0] }, { duration: 0.25 })
      : animate(sheet, { y: [0, 120], opacity: [1, 0] }, { duration: 0.3, ease: "easeIn" });
    a.then(() => (sheet.style.display = "none"));
  };
  open.addEventListener("click", show);
  close.addEventListener("click", hide);
  backdrop.addEventListener("click", hide);
  return {
    play(p) {
      reduce = bool(p, "reduce", false);
      cap.textContent = reduce ? dt("Reduced: a quiet fade, no large movement") : dt("Full: slides and scales in");
    },
    code: () => `@media (prefers-reduced-motion: reduce) {\n  /* fade only — no slide or scale */\n}`,
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
  purposefulUseCase,
  anticipationUseCase,
  followThroughUseCase,
  squashStretchUseCase,
  perceivedPerfUseCase,
  frequencyUseCase,
  spatialConsistencyUseCase,
  hardwareAccelUseCase,
  reducedMotionUseCase,
};
