import { animate } from "./anim";
import type { DemoFactory } from "./types";
import { clearStage, createBox, num } from "./utils";

const SPRING = { type: "spring", stiffness: 320, damping: 30 } as const;

const crossfade: DemoFactory = (stage) => {
  clearStage(stage);
  const wrap = document.createElement("div");
  wrap.style.cssText = "position:relative;width:96px;height:96px";
  const a = createBox({ label: "A", size: 96 });
  const b = createBox({ label: "B", size: 96 });
  b.style.background = "var(--color-phoenix-orange)";
  a.style.position = b.style.position = "absolute";
  a.style.inset = b.style.inset = "0";
  wrap.append(a, b);
  stage.append(wrap);
  return {
    play(p) {
      const second = p.second === true;
      const d = num(p, "duration", 0.5);
      animate(a, { opacity: second ? [1, 0] : [0, 1] }, { duration: d });
      animate(b, { opacity: second ? [0, 1] : [1, 0] }, { duration: d });
    },
    code: () => `// both share the same spot\nanimate(out, { opacity: 0 });\nanimate(in,  { opacity: 1 });`,
  };
};

const continuity: DemoFactory = (stage) => {
  clearStage(stage);
  const box = createBox({ label: "" });
  stage.append(box);
  return {
    play(p) {
      const expanded = p.expanded === true;
      animate(
        box,
        { width: expanded ? "150px" : "72px", height: expanded ? "100px" : "72px" },
        { duration: num(p, "duration", 0.6), ease: [0.16, 1, 0.3, 1] }
      );
    },
    code: () => `// same element resized keeps you oriented\nanimate(el, { width: target, height: target });`,
  };
};

const morph: DemoFactory = (stage) => {
  clearStage(stage);
  const island = document.createElement("div");
  island.style.cssText =
    "background:var(--color-midnight-ink);color:#fff;display:grid;place-items:center;font-size:12px;overflow:hidden;white-space:nowrap";
  island.textContent = "•••";
  stage.append(island);
  return {
    play(p) {
      const expanded = p.expanded === true;
      island.textContent = expanded ? "Now playing — Aurora" : "•••";
      animate(
        island,
        { width: expanded ? "220px" : "84px", height: expanded ? "64px" : "32px", borderRadius: ["18px", "18px"] },
        { type: "spring", stiffness: 400, damping: 32 }
      );
    },
    code: () => `// Dynamic-Island style shape morph\nanimate(el, { width, height }, { type: "spring" });`,
  };
};

const sharedElement: DemoFactory = (stage) => {
  clearStage(stage);
  const wrap = document.createElement("div");
  wrap.style.cssText = "position:relative;width:100%;height:140px";
  const thumb = createBox({ label: "", size: 56 });
  thumb.style.cssText += ";position:absolute;left:10px;top:10px";
  wrap.append(thumb);
  stage.append(wrap);
  return {
    play(p) {
      const open = p.open === true;
      const d = num(p, "duration", 0.6);
      if (open)
        animate(thumb, { width: "180px", height: "120px", left: "50%", top: "10px", x: "-90px" }, { duration: d, ease: [0.16, 1, 0.3, 1] });
      else
        animate(thumb, { width: "56px", height: "56px", left: "10px", top: "10px", x: "0px" }, { duration: d, ease: [0.16, 1, 0.3, 1] });
    },
    code: () => `// one element travels + grows into a card\nanimate(thumb, { width, height, x, y });`,
  };
};

const layout: DemoFactory = (stage) => {
  clearStage(stage);
  const row = document.createElement("div");
  row.style.cssText = "display:flex;gap:10px;flex-wrap:wrap;justify-content:center;width:200px";
  const boxes = ["A", "B", "C"].map((l) => {
    const b = createBox({ label: l, size: 48 });
    row.append(b);
    return b;
  });
  stage.append(row);
  const order = [0, 1, 2];
  return {
    play(p) {
      // FLIP: record, reorder, animate from old to new
      const first = boxes.map((b) => b.getBoundingClientRect());
      if (p.alt === true) row.append(boxes[0]);
      else row.prepend(boxes[0]);
      const last = boxes.map((b) => b.getBoundingClientRect());
      boxes.forEach((b, i) => {
        const dx = first[i].left - last[i].left;
        const dy = first[i].top - last[i].top;
        if (dx || dy) animate(b, { x: [dx, 0], y: [dy, 0] }, { duration: num(p, "duration", 0.5), ease: [0.16, 1, 0.3, 1] });
      });
      void order;
    },
    code: () => `// FLIP: measure, reorder, animate the delta\nconst first = el.getBoundingClientRect();\n// ...reorder...\nanimate(el, { x: [first.left - last.left, 0] });`,
  };
};

const accordion: DemoFactory = (stage) => {
  clearStage(stage);
  const panel = document.createElement("div");
  panel.style.cssText =
    "width:200px;border-radius:12px;background:#fff;box-shadow:var(--shadow-floating);overflow:hidden";
  const head = document.createElement("div");
  head.style.cssText = "padding:12px 14px;font-size:13px;font-weight:500";
  head.textContent = "Details";
  const body = document.createElement("div");
  body.style.cssText = "height:0;overflow:hidden";
  body.innerHTML =
    "<div style='padding:0 14px 14px;font-size:12px;color:var(--color-muted-ash);line-height:1.5'>A section smoothly expands and collapses its height to show or hide content.</div>";
  panel.append(head, body);
  stage.append(panel);
  return {
    play(p) {
      const open = p.open === true;
      const target = open ? body.scrollHeight : 0;
      const fromHeight = body.getBoundingClientRect().height;
      animate(body, { height: [`${fromHeight}px`, `${target}px`] }, { duration: num(p, "duration", 0.45), ease: [0.16, 1, 0.3, 1] }).then(() => {
        if (open) body.style.height = "auto";
      });
      body.style.height = open ? body.style.height : "0px";
    },
    code: () => `// animate height from current to scrollHeight\nanimate(body, { height: [from, scrollHeight] });`,
  };
};

const directionAware: DemoFactory = (stage) => {
  clearStage(stage);
  const wrap = document.createElement("div");
  wrap.style.cssText = "position:relative;width:200px;height:90px;overflow:hidden;border-radius:12px;background:#fff;box-shadow:var(--shadow-floating)";
  let idx = 0;
  const labels = ["Page 1", "Page 2", "Page 3"];
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
    const incoming = slide.cloneNode(true) as HTMLElement;
    incoming.textContent = labels[next];
    wrap.insertBefore(incoming, controls);
    animate(slide, { x: [0, dir > 0 ? -200 : 200], opacity: [1, 0] }, { duration, ease: [0.16, 1, 0.3, 1] }).then(() => slide.remove());
    animate(incoming, { x: [dir > 0 ? 200 : -200, 0], opacity: [0, 1] }, { duration, ease: [0.16, 1, 0.3, 1] });
    slide = incoming;
  }
  controls.append(mk("‹ Back", -1), mk("Next ›", 1));
  wrap.append(slide, controls);
  stage.append(wrap);
  return {
    play(p) {
      duration = num(p, "duration", 0.5);
    },
    code: () => `// forward slides left, back slides right\nanimate(out, { x: dir > 0 ? -w : w });\nanimate(in,  { x: dir > 0 ? w : -w });`,
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
};
