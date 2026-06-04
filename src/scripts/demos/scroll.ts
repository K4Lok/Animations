import { scroll, inView } from "motion";
import { animate } from "./anim";
import type { DemoFactory } from "./types";
import { clearStage, dt, num } from "./utils";
import { elem, frame, gradientFor, imageTile, listRow, textLine } from "./kit";

const EASE_OUT: [number, number, number, number] = [0.16, 1, 0.3, 1];

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
  hint.textContent = dt("↕ scroll inside this box");
  stage.append(scroller, hint);
  return { scroller, inner };
}

const scrollReveal: DemoFactory = (stage) => {
  const { scroller, inner } = scrollStage(stage, 640);
  const items: HTMLElement[] = [];
  for (let i = 0; i < 6; i++) {
    const card = document.createElement("div");
    card.className = "demo-reveal-card";
    card.textContent = dt("Item {n}", { n: i + 1 });
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
  bg.textContent = dt("background");
  const fg = document.createElement("div");
  fg.className = "demo-layer demo-layer--fg";
  fg.textContent = dt("foreground");
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
  btn.textContent = dt("Navigate →");
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
  btn.textContent = supported ? dt("Toggle view") : dt("View Transitions unsupported — fallback");
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

/* ---- realistic "use case" variants ---- */

// A content feed inside the scroller: photo+text cards fade + slide in as each
// one scrolls into view (inView with amount:0.6, like the abstract's reveal).
const scrollRevealUseCase: DemoFactory = (stage) => {
  const { scroller, inner } = scrollStage(stage, 760);
  inner.style.padding = "16px";
  inner.style.height = "auto";
  inner.style.display = "flex";
  inner.style.flexDirection = "column";
  inner.style.gap = "14px";
  inner.style.boxSizing = "border-box";
  const titles = [
    dt("Aurora over the fjord"),
    dt("Cascade trailhead"),
    dt("Borealis at midnight"),
    dt("Desert bloom"),
    dt("Coastal fog"),
  ];
  const cards = titles.map((title, i) => {
    const card = frame("padding:10px;display:flex;flex-direction:column;gap:9px");
    const tile = imageTile({ i, radius: 10, label: title });
    tile.style.height = "94px";
    const meta = elem("div", undefined, "display:flex;flex-direction:column;gap:6px;padding:0 2px 2px");
    meta.append(textLine(150), textLine(110, 0.7));
    card.append(tile, meta);
    inner.append(card);
    return card;
  });
  let duration = 0.5;
  const stops: Array<() => void> = [];
  const arm = () => {
    stops.forEach((s) => s());
    stops.length = 0;
    cards.forEach((el) => {
      el.style.opacity = "0";
      el.style.transform = "translateY(24px)";
      const stop = inView(
        el,
        () => {
          animate(el, { opacity: [0, 1], y: [24, 0] }, { duration, ease: EASE_OUT });
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
    code: () => `inView(card, () => {\n  animate(card, { opacity: [0, 1], y: [24, 0] });\n}, { root: scroller, amount: 0.6 });`,
    continuous: true,
  };
};

// An article with a reading-progress bar pinned at the top: scaleX tracks how
// far you've scrolled through the body copy, driven by scroll({ container }).
const scrollDrivenUseCase: DemoFactory = (stage) => {
  const { scroller, inner } = scrollStage(stage, 720);
  inner.style.height = "auto";
  inner.style.padding = "30px 16px 16px";
  inner.style.boxSizing = "border-box";
  inner.style.display = "flex";
  inner.style.flexDirection = "column";
  inner.style.gap = "16px";
  // Progress bar pinned to the top of the scroller (outside the scrolling inner).
  const track = elem(
    "div",
    undefined,
    "position:sticky;top:0;left:0;right:0;z-index:2;height:5px;background:var(--color-whisper-gray)"
  );
  const fill = elem(
    "div",
    undefined,
    "position:absolute;inset:0;background:var(--color-phoenix-orange);transform-origin:left center;transform:scaleX(0)"
  );
  const pct = elem(
    "span",
    undefined,
    "position:absolute;top:10px;right:12px;z-index:2;font-size:11px;font-weight:600;color:var(--color-muted-ash)"
  );
  pct.textContent = "0%";
  track.append(fill);
  scroller.prepend(track);
  scroller.append(pct);
  // The article body: a heading plus stacked paragraph blocks.
  const heading = frame("padding:12px;display:flex;flex-direction:column;gap:8px");
  const htitle = elem("span", undefined, "font-size:14px;font-weight:700;color:var(--color-midnight-ink)");
  htitle.textContent = dt("Designing motion that feels right");
  const byline = elem("span", undefined, "font-size:10px;color:var(--color-muted-ash)");
  byline.textContent = dt("by Sam KaLok");
  heading.append(htitle, byline);
  inner.append(heading);
  for (let b = 0; b < 5; b++) {
    const para = elem("div", undefined, "display:flex;flex-direction:column;gap:7px;padding:0 4px");
    [150, 168, 140, 162, 120].forEach((w, i) => para.append(textLine(w, i === 4 ? 0.6 : 1)));
    inner.append(para);
  }
  const stop = scroll(
    (progress: number) => {
      fill.style.transform = `scaleX(${progress})`;
      pct.textContent = `${Math.round(progress * 100)}%`;
    },
    { container: scroller }
  );
  return {
    play() {},
    cleanup: () => stop(),
    code: () => `scroll((progress) => {\n  bar.style.transform = \`scaleX(\${progress})\`;\n}, { container: scroller });`,
    continuous: true,
  };
};

// A hero cover: the background photo drifts slower than the foreground title
// card, opening a gap that reads as depth (background scaled by `depth`).
const parallaxUseCase: DemoFactory = (stage) => {
  const { scroller, inner } = scrollStage(stage, 760);
  // Background photo, anchored near the top of the scroll content.
  const bg = imageTile({ i: 4, radius: 0 });
  bg.style.cssText += ";position:absolute;left:0;right:0;top:0;height:240px;will-change:transform";
  // Foreground title card floating over the cover.
  const card = frame("position:absolute;left:20px;right:20px;top:150px;padding:14px;display:flex;flex-direction:column;gap:8px;will-change:transform");
  const title = elem("span", undefined, "font-size:15px;font-weight:700;color:var(--color-midnight-ink)");
  title.textContent = dt("Field Notes");
  const sub = elem("span", undefined, "font-size:11px;color:var(--color-muted-ash)");
  sub.textContent = dt("Photographs by Sam KaLok");
  card.append(title, sub, textLine(150), textLine(120, 0.7));
  inner.append(bg, card);
  let depth = 0.4;
  const stop = scroll(
    (progress: number) => {
      bg.style.transform = `translateY(${progress * 120 * depth}px)`;
      card.style.transform = `translateY(${-progress * 120}px)`;
    },
    { container: scroller }
  );
  return {
    play(p) {
      depth = num(p, "depth", 0.4);
    },
    cleanup: () => stop(),
    code: () => `scroll((p) => {\n  bg.style.transform = \`translateY(\${p * 120 * depth}px)\`;\n  card.style.transform = \`translateY(\${-p * 120}px)\`;\n});`,
    continuous: true,
  };
};

// A phone screen with a list of rows: tapping a row pushes a detail "page" in
// from the right; ‹ Back slides it back out. Interaction-driven.
const pageTransitionUseCase: DemoFactory = (stage) => {
  clearStage(stage);
  const W = 210;
  const phone = frame(`width:${W}px;height:280px`);
  // The list "page" sits underneath; detail pages are stacked over it.
  const listPage = elem(
    "div",
    undefined,
    "position:absolute;inset:0;display:flex;flex-direction:column;background:var(--color-canvas-white)"
  );
  const listHead = elem(
    "div",
    undefined,
    "flex:none;display:flex;align-items:center;padding:12px 14px;font-size:14px;font-weight:700;color:var(--color-midnight-ink);border-bottom:1px solid var(--color-whisper-gray)"
  );
  listHead.textContent = dt("Messages");
  const rows = elem("div", undefined, "display:flex;flex-direction:column;gap:8px;padding:10px");
  const people = [
    [dt("Sam KaLok"), dt("Sounds good — ship it")],
    [dt("Aurora"), dt("Did you see the build?")],
    [dt("Cascade"), dt("Lunch at noon?")],
  ];
  listPage.append(listHead, rows);
  phone.append(listPage);
  stage.append(phone);

  let duration = 0.5;
  let detail: HTMLElement | null = null;
  // Build a detail "page" that enters from the right edge of the phone.
  const openDetail = (i: number, name: string, preview: string) => {
    if (detail) return;
    const page = elem(
      "div",
      undefined,
      `position:absolute;inset:0;z-index:2;display:flex;flex-direction:column;background:var(--color-canvas-white);box-shadow:var(--shadow-floating)`
    );
    const head = elem(
      "div",
      undefined,
      "flex:none;display:flex;align-items:center;gap:8px;padding:12px 14px;border-bottom:1px solid var(--color-whisper-gray)"
    );
    const back = elem(
      "button",
      undefined,
      "display:flex;align-items:center;gap:5px;font:inherit;font-size:13px;font-weight:600;color:var(--color-intelligence-blue);background:none;border:none;cursor:pointer"
    );
    // Geometric ‹ chevron (rotated bordered box) over a glyph, so it stays centered.
    const chev = elem(
      "span",
      undefined,
      "flex:none;width:7px;height:7px;border-left:2px solid currentColor;border-bottom:2px solid currentColor;transform:rotate(45deg)"
    );
    const backLabel = elem("span");
    backLabel.textContent = dt("Back");
    back.append(chev, backLabel);
    const headName = elem("span", undefined, "font-size:13px;font-weight:700;color:var(--color-midnight-ink)");
    headName.textContent = name;
    head.append(back, headName);
    const body = elem("div", undefined, "display:flex;flex-direction:column;gap:9px;padding:12px");
    const chip = imageTile({ i, radius: 12, label: name });
    chip.style.height = "76px";
    body.append(
      chip,
      (() => {
        const msg = elem("span", undefined, "font-size:12px;color:var(--color-midnight-ink);line-height:1.5");
        msg.textContent = preview;
        return msg;
      })(),
      textLine(150),
      textLine(120, 0.7)
    );
    page.append(head, body);
    phone.append(page);
    detail = page;
    animate(page, { x: [W, 0], opacity: [0.4, 1] }, { duration, ease: EASE_OUT });
    back.addEventListener("click", () => closeDetail());
  };
  const closeDetail = () => {
    if (!detail) return;
    // Capture the OUTGOING node before clearing `detail`, so .then() removes it.
    const out = detail;
    detail = null;
    animate(out, { x: [0, W], opacity: [1, 0.4] }, { duration, ease: EASE_OUT }).then(() => out.remove());
  };
  people.forEach(([name, preview], i) => {
    const row = listRow({ i, title: name, sub: preview });
    row.style.cursor = "pointer";
    row.addEventListener("click", () => openDetail(i, name, preview));
    rows.append(row);
  });
  return {
    play(p) {
      duration = num(p, "duration", 0.5);
    },
    code: () => `// tap a row → push detail in from the right\nanimate(detail, { x: [w, 0], opacity: [0.4, 1] });\n// ‹ Back → slide it back out\nanimate(detail, { x: [0, w] }).then(remove);`,
  };
};

// A photo grid: tapping a tile expands it into a detail view via the View
// Transition API (shared-element morph), with a FLIP fallback when unsupported.
const viewTransitionUseCase: DemoFactory = (stage) => {
  clearStage(stage);
  const supported = typeof (document as any).startViewTransition === "function";
  const wrap = elem("div", undefined, "position:relative;width:210px;height:200px");
  const grid = elem(
    "div",
    undefined,
    "position:absolute;inset:0;display:grid;grid-template-columns:repeat(3,1fr);gap:8px"
  );
  const photoCount = 6;
  const tiles = Array.from({ length: photoCount }, (_, i) => {
    const t = imageTile({ i, radius: 10 });
    t.style.cssText += ";width:100%;height:100%;cursor:pointer";
    grid.append(t);
    return t;
  });
  // The detail card the tile morphs into (shares the view-transition name).
  const detail = frame("position:absolute;inset:0;z-index:2;display:none;flex-direction:column;cursor:pointer");
  const detailPhoto = elem("div", undefined, "flex:1");
  const detailCap = elem("div", undefined, "padding:10px 12px;display:flex;flex-direction:column;gap:6px");
  detailCap.append(textLine(150), textLine(110, 0.7));
  detail.append(detailPhoto, detailCap);
  wrap.append(grid, detail);
  stage.append(wrap);

  let duration = 0.5;
  let openIdx = -1;
  const showDetail = (i: number) => {
    openIdx = i;
    detailPhoto.style.background = gradientFor(i);
    grid.style.display = "none";
    detail.style.display = "flex";
  };
  const showGrid = () => {
    detail.style.display = "none";
    grid.style.display = "grid";
    openIdx = -1;
  };
  // Both the tile and the detail card carry the same name only while morphing,
  // so the browser pairs them into a single shared-element transition.
  const tag = (node: HTMLElement | null) => {
    if (node) (node.style as any).viewTransitionName = "vt-photo";
  };
  const untag = (node: HTMLElement | null) => {
    if (node) (node.style as any).viewTransitionName = "";
  };
  const open = (i: number) => {
    if (openIdx !== -1) return;
    if (supported) {
      tag(tiles[i]);
      tag(detail);
      const vt = (document as any).startViewTransition(() => showDetail(i));
      vt.finished.finally(() => {
        untag(tiles[i]);
        untag(detail);
      });
    } else {
      // FLIP fallback: measure the tile, swap to the detail, animate from first→last.
      const first = tiles[i].getBoundingClientRect();
      showDetail(i);
      const last = detail.getBoundingClientRect();
      animate(
        detail,
        {
          x: [first.left - last.left, 0],
          y: [first.top - last.top, 0],
          scaleX: [first.width / last.width, 1],
          scaleY: [first.height / last.height, 1],
        },
        { duration, ease: EASE_OUT }
      );
    }
  };
  const close = () => {
    if (openIdx === -1) return;
    if (supported) {
      tag(tiles[openIdx]);
      tag(detail);
      const idx = openIdx;
      const vt = (document as any).startViewTransition(() => showGrid());
      vt.finished.finally(() => {
        untag(tiles[idx]);
        untag(detail);
      });
    } else {
      const first = detail.getBoundingClientRect();
      const target = tiles[openIdx].getBoundingClientRect();
      const idx = openIdx;
      animate(
        detail,
        {
          x: [0, target.left - first.left],
          y: [0, target.top - first.top],
          scaleX: [1, target.width / first.width],
          scaleY: [1, target.height / first.height],
        },
        { duration, ease: EASE_OUT }
      ).then(() => {
        if (openIdx === idx) showGrid();
        detail.style.transform = "";
      });
    }
  };
  tiles.forEach((t, i) => t.addEventListener("click", () => open(i)));
  detail.addEventListener("click", () => close());
  return {
    play(p) {
      duration = num(p, "duration", 0.5);
    },
    code: () => `// tap a tile → morph into the detail view\nif (document.startViewTransition)\n  document.startViewTransition(() => showDetail(i));\nelse\n  animate(detail, { x: [dx, 0], scaleX: [r, 1] }); // FLIP fallback`,
  };
};

export const demos: Record<string, DemoFactory> = {
  scrollReveal,
  scrollDriven,
  parallax,
  pageTransition,
  viewTransition,
  scrollRevealUseCase,
  scrollDrivenUseCase,
  parallaxUseCase,
  pageTransitionUseCase,
  viewTransitionUseCase,
};
