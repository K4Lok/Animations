import { animate } from "./anim";
import type { DemoFactory } from "./types";
import { clearStage, createBox, dt, num } from "./utils";
import { elem, frame, gradientFor, imageTile, listRow, searchField, segmented, textLine } from "./kit";

const SPRING = { type: "spring", stiffness: 320, damping: 30 } as const;

const crossfade: DemoFactory = (stage) => {
  clearStage(stage);
  const wrap = document.createElement("div");
  wrap.style.cssText = "position:relative;width:96px;height:96px;cursor:pointer";
  const a = createBox({ label: "A", size: 96 });
  const b = createBox({ label: "B", size: 96 });
  b.style.background = "var(--color-phoenix-orange)";
  a.style.position = b.style.position = "absolute";
  a.style.inset = b.style.inset = "0";
  b.style.opacity = "0";
  wrap.append(a, b);
  stage.append(wrap);
  let second = false;
  let duration = 0.5;
  wrap.addEventListener("click", () => {
    second = !second;
    animate(a, { opacity: second ? [1, 0] : [0, 1] }, { duration });
    animate(b, { opacity: second ? [0, 1] : [1, 0] }, { duration });
  });
  return {
    play(p) {
      duration = num(p, "duration", 0.5);
    },
    code: () => `// click to swap — both share the same spot\nanimate(out, { opacity: 0 });\nanimate(in,  { opacity: 1 });`,
  };
};

const continuity: DemoFactory = (stage) => {
  clearStage(stage);
  const box = createBox({ label: "" });
  box.style.cursor = "pointer";
  stage.append(box);
  let expanded = false;
  let duration = 0.6;
  box.addEventListener("click", () => {
    expanded = !expanded;
    animate(
      box,
      { width: expanded ? "150px" : "72px", height: expanded ? "100px" : "72px" },
      { duration, ease: [0.16, 1, 0.3, 1] }
    );
  });
  return {
    play(p) {
      duration = num(p, "duration", 0.6);
    },
    code: () => `// click the element to resize in place\nanimate(el, { width: target, height: target });`,
  };
};

const morph: DemoFactory = (stage) => {
  clearStage(stage);
  const island = document.createElement("div");
  island.style.cssText =
    "width:84px;height:32px;border-radius:18px;background:var(--color-midnight-ink);color:#fff;display:grid;place-items:center;font-size:12px;overflow:hidden;white-space:nowrap;cursor:pointer";
  island.textContent = "•••";
  let open = false;
  const apply = () => {
    island.textContent = open ? dt("Now playing — Aurora") : "•••";
    animate(
      island,
      { width: open ? "220px" : "84px", height: open ? "64px" : "32px", borderRadius: ["18px", "18px"] },
      { type: "spring", stiffness: 400, damping: 32 }
    );
  };
  island.addEventListener("click", () => {
    open = !open;
    apply();
  });
  stage.append(island);
  return {
    play() {},
    code: () => `// click toggles the shape morph\nanimate(el, { width, height }, { type: "spring" });`,
  };
};

const sharedElement: DemoFactory = (stage) => {
  clearStage(stage);
  const wrap = document.createElement("div");
  wrap.style.cssText = "position:relative;width:100%;height:140px";
  const thumb = createBox({ label: "", size: 56 });
  thumb.style.cssText += ";position:absolute;left:10px;top:10px;cursor:pointer";
  wrap.append(thumb);
  stage.append(wrap);
  let open = false;
  let duration = 0.6;
  const apply = () => {
    if (open)
      animate(thumb, { width: "180px", height: "120px", left: "50%", top: "10px", x: "-90px" }, { duration, ease: [0.16, 1, 0.3, 1] });
    else
      animate(thumb, { width: "56px", height: "56px", left: "10px", top: "10px", x: "0px" }, { duration, ease: [0.16, 1, 0.3, 1] });
  };
  thumb.addEventListener("click", () => {
    open = !open;
    apply();
  });
  return {
    play(p) {
      duration = num(p, "duration", 0.6);
    },
    code: () => `// click the thumb to expand into a card\nanimate(thumb, { width, height, x, y });`,
  };
};

const layout: DemoFactory = (stage) => {
  clearStage(stage);
  const row = document.createElement("div");
  row.style.cssText = "display:flex;gap:10px;flex-wrap:wrap;justify-content:center;width:200px";
  let duration = 0.5;
  const boxes = ["A", "B", "C"].map((l) => {
    const b = createBox({ label: l, size: 48 });
    b.style.cursor = "pointer";
    b.addEventListener("click", () => sendToEnd(b));
    row.append(b);
    return b;
  });
  stage.append(row);
  // FLIP: record, reorder, animate each box from its old slot to the new one.
  const sendToEnd = (b: HTMLElement) => {
    const first = boxes.map((x) => x.getBoundingClientRect());
    row.append(b);
    const last = boxes.map((x) => x.getBoundingClientRect());
    boxes.forEach((x, i) => {
      const dx = first[i].left - last[i].left;
      const dy = first[i].top - last[i].top;
      if (dx || dy) animate(x, { x: [dx, 0], y: [dy, 0] }, { duration, ease: [0.16, 1, 0.3, 1] });
    });
  };
  return {
    play(p) {
      duration = num(p, "duration", 0.5);
    },
    code: () => `// click a box → FLIP it to the new slot\nconst first = el.getBoundingClientRect();\n// ...reorder...\nanimate(el, { x: [first.left - last.left, 0] });`,
  };
};

const accordion: DemoFactory = (stage) => {
  clearStage(stage);
  const panel = document.createElement("div");
  panel.style.cssText =
    "width:200px;border-radius:12px;background:#fff;box-shadow:var(--shadow-floating);overflow:hidden";
  const head = document.createElement("div");
  head.style.cssText = "padding:12px 14px;font-size:13px;font-weight:500;cursor:pointer";
  head.textContent = dt("Details");
  const body = document.createElement("div");
  body.style.cssText = "height:0;overflow:hidden";
  body.innerHTML = `<div style='padding:0 14px 14px;font-size:12px;color:var(--color-muted-ash);line-height:1.5'>${dt(
    "A section smoothly expands and collapses its height to show or hide content."
  )}</div>`;
  panel.append(head, body);
  stage.append(panel);
  let open = false;
  let duration = 0.45;
  const apply = () => {
    const from = body.getBoundingClientRect().height;
    const to = open ? body.scrollHeight : 0;
    animate(body, { height: [`${from}px`, `${to}px`] }, { duration, ease: [0.16, 1, 0.3, 1] }).then(() => {
      body.style.height = open ? "auto" : "0px";
    });
  };
  head.addEventListener("click", () => {
    open = !open;
    apply();
  });
  return {
    play(p) {
      duration = num(p, "duration", 0.45);
    },
    code: () => `// click the header to expand/collapse\nanimate(body, { height: [from, scrollHeight] });`,
  };
};

const directionAware: DemoFactory = (stage) => {
  clearStage(stage);
  const wrap = document.createElement("div");
  wrap.style.cssText = "position:relative;width:200px;height:90px;overflow:hidden;border-radius:12px;background:#fff;box-shadow:var(--shadow-floating)";
  let idx = 0;
  const labels = [1, 2, 3].map((n) => dt("Page {n}", { n }));
  let slide: HTMLElement = document.createElement("div");
  slide.style.cssText = "position:absolute;inset:0;display:grid;place-items:center;font-size:16px;font-weight:600";
  slide.textContent = labels[0];
  const controls = document.createElement("div");
  controls.style.cssText = "position:absolute;inset:auto 0 8px;display:flex;justify-content:center;gap:8px";
  const mk = (t: string, dir: number) => {
    const b = document.createElement("button");
    b.className = "demo-trigger demo-trigger--sm";
    b.textContent = t;
    b.addEventListener("click", () => go(dir));
    return b;
  };
  let duration = 0.5;
  function go(dir: number) {
    const next = (idx + dir + labels.length) % labels.length;
    idx = next;
    const outgoing = slide;
    const incoming = outgoing.cloneNode(true) as HTMLElement;
    incoming.textContent = labels[next];
    wrap.insertBefore(incoming, controls);
    animate(outgoing, { x: [0, dir > 0 ? -200 : 200], opacity: [1, 0] }, { duration, ease: [0.16, 1, 0.3, 1] }).then(() => outgoing.remove());
    animate(incoming, { x: [dir > 0 ? 200 : -200, 0], opacity: [0, 1] }, { duration, ease: [0.16, 1, 0.3, 1] });
    slide = incoming;
  }
  controls.append(mk(dt("‹ Back"), -1), mk(dt("Next ›"), 1));
  wrap.append(slide, controls);
  stage.append(wrap);
  return {
    play(p) {
      duration = num(p, "duration", 0.5);
    },
    code: () => `// forward slides left, back slides right\nanimate(out, { x: dir > 0 ? -w : w });\nanimate(in,  { x: dir > 0 ? w : -w });`,
  };
};

/* ---- realistic "use case" variants ---- */

const EASE_OUT: [number, number, number, number] = [0.16, 1, 0.3, 1];

// Gallery: one photo crossfades into the next in the same frame.
const crossfadeUseCase: DemoFactory = (stage) => {
  clearStage(stage);
  const f = frame("width:210px;height:124px;cursor:pointer");
  const a = imageTile({ i: 0, radius: 0 });
  const b = imageTile({ i: 2, radius: 0 });
  a.style.cssText += ";position:absolute;inset:0";
  b.style.cssText += ";position:absolute;inset:0;opacity:0";
  const dots = elem(
    "div",
    undefined,
    "position:absolute;left:0;right:0;bottom:8px;display:flex;gap:6px;justify-content:center;z-index:1"
  );
  const dot = () =>
    elem("span", undefined, "width:6px;height:6px;border-radius:999px;background:#fff;box-shadow:var(--shadow-subtle)");
  const d0 = dot();
  const d1 = dot();
  d1.style.opacity = "0.4";
  dots.append(d0, d1);
  f.append(a, b, dots);
  stage.append(f);
  let second = false;
  let duration = 0.5;
  f.addEventListener("click", () => {
    second = !second;
    animate(a, { opacity: second ? [1, 0] : [0, 1] }, { duration });
    animate(b, { opacity: second ? [0, 1] : [1, 0] }, { duration });
    d0.style.opacity = second ? "0.4" : "1";
    d1.style.opacity = second ? "1" : "0.4";
  });
  return {
    play(p) {
      duration = num(p, "duration", 0.5);
    },
    code: () => `// tap the gallery → crossfade to the next slide\nanimate(prev, { opacity: 0 });\nanimate(next, { opacity: 1 });`,
  };
};

// Search: the bar expands into a results panel — same element keeps you oriented.
const continuityUseCase: DemoFactory = (stage) => {
  clearStage(stage);
  const panel = frame("width:200px;overflow:hidden");
  const field = searchField(dt("Search…"));
  field.style.height = "44px";
  field.style.cursor = "pointer";
  const results = elem("div", undefined, "display:flex;flex-direction:column;gap:6px;padding:2px 8px 8px");
  ["Aurora", "Borealis", "Cascade"].forEach((t, i) =>
    results.append(listRow({ i, title: dt(t), sub: dt("Recent") }))
  );
  panel.append(field, results);
  stage.append(panel);
  panel.style.height = "44px";
  let expanded = false;
  let duration = 0.6;
  field.addEventListener("click", () => {
    expanded = !expanded;
    const from = panel.getBoundingClientRect().height;
    panel.style.height = `${from}px`;
    const to = expanded ? panel.scrollHeight : 44;
    animate(panel, { height: [`${from}px`, `${to}px`] }, { duration, ease: EASE_OUT });
  });
  return {
    play(p) {
      duration = num(p, "duration", 0.6);
    },
    code: () => `// tap search → the same surface grows in place\nanimate(panel, { height: [collapsed, scrollHeight] });`,
  };
};

// A "+" action button morphs into a compose sheet.
const morphUseCase: DemoFactory = (stage) => {
  clearStage(stage);
  const sheet = elem(
    "div",
    undefined,
    "position:relative;display:grid;place-items:center;width:56px;height:56px;border-radius:28px;background:#111111;color:#fff;box-shadow:var(--shadow-floating);overflow:hidden;cursor:pointer"
  );
  const plus = elem("span", undefined, "font-size:34px;font-weight:300;line-height:1");
  plus.textContent = "+";
  const compose = elem(
    "div",
    undefined,
    "position:absolute;inset:0;opacity:0;pointer-events:none;display:flex;flex-direction:column;gap:9px;padding:14px;text-align:left"
  );
  const title = elem("span", undefined, "font-size:12px;font-weight:600;color:var(--color-midnight-ink)");
  title.textContent = dt("New message");
  const send = elem(
    "button",
    undefined,
    "align-self:flex-end;margin-top:auto;font:inherit;font-size:11px;font-weight:600;color:var(--color-phoenix-orange);background:none;border:none;cursor:pointer"
  );
  send.textContent = dt("Send");
  compose.append(title, textLine(150), textLine(112), send);
  sheet.append(plus, compose);
  stage.append(sheet);

  let open = false;
  let duration = 0.5;
  const apply = () => {
    sheet.style.cursor = open ? "default" : "pointer";
    compose.style.pointerEvents = open ? "auto" : "none";
    animate(
      sheet,
      {
        width: open ? "200px" : "56px",
        height: open ? "134px" : "56px",
        borderRadius: open ? "16px" : "28px",
        backgroundColor: open ? "#ffffff" : "#111111",
      },
      { type: "spring", stiffness: 360, damping: 30 }
    );
    animate(plus, { opacity: open ? [1, 0] : [0, 1], rotate: open ? 45 : 0 }, { duration });
    animate(compose, { opacity: open ? [0, 1] : [1, 0] }, { duration });
  };
  sheet.addEventListener("click", () => {
    if (open) return;
    open = true;
    apply();
  });
  send.addEventListener("click", (e) => {
    e.stopPropagation();
    open = false;
    apply();
  });
  return {
    play(p) {
      duration = num(p, "duration", 0.5);
    },
    code: () => `// FAB morphs into a sheet\nanimate(fab, { width, height, borderRadius });`,
  };
};

// Photo thumbnail in a grid expands into a detail view.
const sharedElementUseCase: DemoFactory = (stage) => {
  clearStage(stage);
  const wrap = elem("div", undefined, "position:relative;width:210px;height:150px");
  const thumbs = [0, 1, 2].map((i) => {
    const t = imageTile({ i, radius: 10 });
    t.style.cssText += `;position:absolute;top:8px;left:${8 + i * 60}px;width:52px;height:52px;cursor:pointer`;
    wrap.append(t);
    return t;
  });
  const hero = imageTile({ i: 0, radius: 10 });
  hero.style.cssText += ";position:absolute;top:8px;left:8px;width:52px;height:52px;z-index:1;opacity:0;pointer-events:none";
  const close = elem(
    "button",
    undefined,
    "position:absolute;top:12px;right:12px;z-index:2;display:grid;place-items:center;width:22px;height:22px;border-radius:11px;border:none;background:rgba(0,0,0,.45);color:#fff;font-size:13px;line-height:1;cursor:pointer;opacity:0;pointer-events:none"
  );
  close.textContent = "✕";
  const detail = elem(
    "div",
    undefined,
    "position:absolute;left:8px;top:112px;right:8px;opacity:0;display:flex;flex-direction:column;gap:6px"
  );
  detail.append(textLine(160), textLine(120, 0.7));
  wrap.append(hero, close, detail);
  stage.append(wrap);

  let open = false;
  let activeIdx = 0;
  let duration = 0.6;
  const expand = (i: number) => {
    if (open) return;
    open = true;
    activeIdx = i;
    hero.style.background = gradientFor(i);
    hero.style.left = `${8 + i * 60}px`;
    hero.style.width = "52px";
    hero.style.height = "52px";
    hero.style.opacity = "1";
    hero.style.pointerEvents = "auto";
    close.style.opacity = "0";
    animate(hero, { left: "8px", width: "194px", height: "96px" }, { duration, ease: EASE_OUT }).then(() => {
      // Surface the close affordance only once the element has settled, so it
      // doesn't pop in mid-flight.
      if (open) {
        close.style.pointerEvents = "auto";
        animate(close, { opacity: [0, 1] }, { duration: 0.2 });
      }
    });
    thumbs.forEach((t) => animate(t, { opacity: [1, 0] }, { duration: duration * 0.5 }).then(() => (t.style.opacity = "0")));
    animate(detail, { opacity: [0, 1] }, { duration, delay: duration * 0.4 });
  };
  const collapse = () => {
    if (!open) return;
    open = false;
    close.style.opacity = "0";
    close.style.pointerEvents = "none";
    animate(hero, { left: `${8 + activeIdx * 60}px`, width: "52px", height: "52px" }, { duration, ease: EASE_OUT }).then(() => {
      if (!open) {
        hero.style.opacity = "0";
        hero.style.pointerEvents = "none";
      }
    });
    thumbs.forEach((t) => {
      t.style.opacity = "1";
      animate(t, { opacity: [0, 1] }, { duration: duration * 0.5 });
    });
    animate(detail, { opacity: [1, 0] }, { duration: duration * 0.4 });
  };
  thumbs.forEach((t, i) => t.addEventListener("click", () => expand(i)));
  close.addEventListener("click", collapse);
  return {
    play(p) {
      duration = num(p, "duration", 0.6);
    },
    code: () => `// thumbnail travels + grows into a detail card\nanimate(thumb, { left, width, height });`,
  };
};

// A to-do list: checking an item FLIPs it down to the bottom.
const layoutUseCase: DemoFactory = (stage) => {
  clearStage(stage);
  const list = elem("div", undefined, "display:flex;flex-direction:column;gap:8px;width:210px");
  let duration = 0.5;
  const items = ["Write the copy", "Review the PR", "Ship the build"].map((t, i) => {
    const check = elem("span", "uikit-check", "");
    check.textContent = "○";
    const row = listRow({ i, title: dt(t), trailing: check });
    row.style.cursor = "pointer";
    row.dataset.done = "false";
    row.addEventListener("click", () => toggleDone(row, check));
    list.append(row);
    return row;
  });
  stage.append(list);
  // Done items sink to the bottom; FLIP animates everyone to the new order.
  const reorder = () => {
    const first = items.map((r) => r.getBoundingClientRect());
    const sorted = [...items].sort(
      (a, b) => Number(a.dataset.done === "true") - Number(b.dataset.done === "true")
    );
    sorted.forEach((r) => list.append(r));
    const last = items.map((r) => r.getBoundingClientRect());
    items.forEach((r, i) => {
      const dy = first[i].top - last[i].top;
      if (dy) animate(r, { y: [dy, 0] }, { duration, ease: EASE_OUT });
    });
  };
  const toggleDone = (row: HTMLElement, check: HTMLElement) => {
    const done = row.dataset.done !== "true";
    row.dataset.done = String(done);
    check.textContent = done ? "✓" : "○";
    row.style.opacity = done ? "0.55" : "1";
    reorder();
  };
  return {
    play(p) {
      duration = num(p, "duration", 0.5);
    },
    code: () => `// check an item → it FLIPs to the bottom\nanimate(row, { y: [first.top - last.top, 0] });`,
  };
};

// A real FAQ row expands its answer.
const accordionUseCase: DemoFactory = (stage) => {
  clearStage(stage);
  const panel = frame("width:210px");
  const head = elem(
    "button",
    undefined,
    "display:flex;align-items:center;justify-content:space-between;width:100%;gap:10px;padding:12px 14px;font:inherit;font-size:13px;font-weight:500;color:var(--color-midnight-ink);background:transparent;border:none;text-align:left;cursor:pointer"
  );
  const q = elem("span");
  q.textContent = dt("Can I cancel anytime?");
  // Geometric chevron (a rotated bordered box) instead of a glyph, so it stays
  // optically centered in both the open and closed states.
  const chevron = elem(
    "span",
    undefined,
    "flex:none;width:7px;height:7px;border-right:2px solid var(--color-muted-ash);border-bottom:2px solid var(--color-muted-ash);transform:translateY(-2px) rotate(45deg);transition:transform .2s ease"
  );
  head.append(q, chevron);
  const body = elem("div", undefined, "height:0;overflow:hidden");
  body.innerHTML = `<div style='padding:0 14px 14px;font-size:12px;color:var(--color-muted-ash);line-height:1.5'>${dt(
    "Yes — cancel from settings and your plan stays active until the end of the period."
  )}</div>`;
  panel.append(head, body);
  stage.append(panel);

  let open = false;
  let duration = 0.45;
  const apply = () => {
    const from = body.getBoundingClientRect().height;
    const target = open ? body.scrollHeight : 0;
    chevron.style.transform = open ? "translateY(2px) rotate(225deg)" : "translateY(-2px) rotate(45deg)";
    body.style.height = `${from}px`;
    animate(body, { height: [`${from}px`, `${target}px`] }, { duration, ease: EASE_OUT }).then(() => {
      if (open) body.style.height = "auto";
    });
  };
  head.addEventListener("click", () => {
    open = !open;
    apply();
  });
  return {
    play(p) {
      duration = num(p, "duration", 0.45);
    },
    code: () => `// FAQ row expands its answer\nanimate(answer, { height: [0, scrollHeight] });`,
  };
};

// Tab bar where the view slides in the direction you navigate.
const directionAwareUseCase: DemoFactory = (stage) => {
  clearStage(stage);
  const wrap = elem("div", undefined, "display:flex;flex-direction:column;gap:10px;width:210px");
  const labels = [dt("Home"), dt("Search"), dt("Profile")];
  const { bar, buttons, indicator } = segmented(labels);
  const view = frame("position:relative;height:90px;overflow:hidden");
  let idx = 0;
  let duration = 0.5;
  const makePanel = (i: number) => {
    const pnl = elem(
      "div",
      undefined,
      "position:absolute;inset:0;display:flex;flex-direction:column;gap:8px;justify-content:center;padding:14px"
    );
    const t = elem("span", undefined, "font-size:13px;font-weight:600");
    t.textContent = labels[i];
    if (i === 0) {
      pnl.append(t, listRow({ i: 0, title: dt("Morning digest"), sub: dt("12 new updates") }));
    } else if (i === 1) {
      pnl.append(t, searchField(dt("Search anything")));
    } else {
      pnl.append(t, listRow({ i: 2, title: dt("Sam KaLok"), sub: dt("View profile") }));
    }
    return pnl;
  };
  let panel = makePanel(0);
  view.append(panel);
  const positionIndicator = () => {
    const b = buttons[idx];
    indicator.style.width = `${b.offsetWidth}px`;
    indicator.style.transform = `translateX(${b.offsetLeft - 3}px)`;
  };
  const go = (next: number) => {
    if (next === idx) return;
    const dir = next > idx ? 1 : -1;
    const outgoing = panel;
    const incoming = makePanel(next);
    view.append(incoming);
    animate(outgoing, { x: [0, dir > 0 ? -210 : 210], opacity: [1, 0] }, { duration, ease: EASE_OUT }).then(() =>
      outgoing.remove()
    );
    animate(incoming, { x: [dir > 0 ? 210 : -210, 0], opacity: [0, 1] }, { duration, ease: EASE_OUT });
    panel = incoming;
    idx = next;
    buttons.forEach((b, i) => b.classList.toggle("is-active", i === idx));
    positionIndicator();
  };
  buttons.forEach((b, i) => b.addEventListener("click", () => go(i)));
  buttons[0].classList.add("is-active");
  wrap.append(bar, view);
  stage.append(wrap);
  requestAnimationFrame(positionIndicator);
  return {
    play(p) {
      duration = num(p, "duration", 0.5);
      requestAnimationFrame(positionIndicator);
    },
    code: () => `// tab change slides by direction\nanimate(out, { x: dir > 0 ? -w : w });\nanimate(in,  { x: dir > 0 ? w : -w });`,
  };
};

void SPRING;

export const demos: Record<string, DemoFactory> = {
  crossfade,
  continuity,
  morph,
  sharedElement,
  layout,
  accordion,
  directionAware,
  crossfadeUseCase,
  continuityUseCase,
  morphUseCase,
  sharedElementUseCase,
  layoutUseCase,
  accordionUseCase,
  directionAwareUseCase,
};
