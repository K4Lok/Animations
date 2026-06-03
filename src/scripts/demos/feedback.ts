import { animate } from "motion";
import type { DemoFactory } from "./types";
import { clearStage, createBox, num } from "./utils";

const hint = (text: string) => {
  const el = document.createElement("div");
  el.className = "demo-caption";
  el.textContent = text;
  return el;
};

const hover: DemoFactory = (stage) => {
  clearStage(stage);
  const box = createBox({ label: "Hover" });
  box.style.transition = "transform .25s cubic-bezier(0.34,1.56,0.64,1), box-shadow .25s ease";
  box.style.cursor = "pointer";
  box.addEventListener("pointerenter", () => {
    box.style.transform = "scale(1.1) translateY(-4px)";
    box.style.boxShadow = "var(--shadow-xl)";
  });
  box.addEventListener("pointerleave", () => {
    box.style.transform = "";
    box.style.boxShadow = "";
  });
  stage.append(box, hint("Move your cursor over the box"));
  return { play() {}, continuous: true, code: () => `el:hover { transform: scale(1.1) translateY(-4px); }` };
};

const press: DemoFactory = (stage) => {
  clearStage(stage);
  const btn = document.createElement("button");
  btn.className = "demo-trigger demo-trigger--solid";
  btn.textContent = "Press me";
  btn.style.transition = "transform .12s ease";
  const down = () => (btn.style.transform = "scale(0.94)");
  const up = () => (btn.style.transform = "");
  btn.addEventListener("pointerdown", down);
  btn.addEventListener("pointerup", up);
  btn.addEventListener("pointerleave", up);
  stage.append(btn, hint("Click and hold"));
  return { play() {}, continuous: true, code: () => `el:active { transform: scale(0.94); }` };
};

const holdToConfirm: DemoFactory = (stage) => {
  clearStage(stage);
  const btn = document.createElement("button");
  btn.className = "demo-trigger demo-trigger--solid demo-hold";
  btn.innerHTML = `<span class="demo-hold__fill"></span><span class="demo-hold__label">Hold to confirm</span>`;
  const fill = btn.querySelector(".demo-hold__fill") as HTMLElement;
  const label = btn.querySelector(".demo-hold__label") as HTMLElement;
  let hold = 1.2;
  let anim: { stop: () => void } | null = null;
  const start = () => {
    anim = animate(fill, { width: ["0%", "100%"] }, { duration: hold, ease: "linear" });
    (anim as any).then?.(() => {
      label.textContent = "Confirmed ✓";
      setTimeout(() => (label.textContent = "Hold to confirm"), 900);
    });
  };
  const cancel = () => {
    anim?.stop();
    animate(fill, { width: "0%" }, { duration: 0.2 });
  };
  btn.addEventListener("pointerdown", start);
  btn.addEventListener("pointerup", cancel);
  btn.addEventListener("pointerleave", cancel);
  stage.append(btn, hint("Press and hold until it fills"));
  return {
    play(p) {
      hold = num(p, "hold", 1.2);
    },
    continuous: true,
    code: () => `pointerdown → animate(fill, { width: "100%" }, { duration: hold });\npointerup before done → cancel + reset`,
  };
};

function draggable(el: HTMLElement, opts: { onRelease?: (vx: number, vy: number) => void; axis?: "x" | "y" | "both" } = {}) {
  let startX = 0,
    startY = 0,
    lastX = 0,
    lastY = 0,
    lastT = 0,
    vx = 0,
    vy = 0,
    dragging = false;
  const axis = opts.axis ?? "both";
  el.style.touchAction = "none";
  el.style.cursor = "grab";
  el.addEventListener("pointerdown", (e) => {
    dragging = true;
    el.setPointerCapture(e.pointerId);
    el.style.cursor = "grabbing";
    startX = e.clientX - lastX;
    startY = e.clientY - lastY;
    lastT = performance.now();
  });
  el.addEventListener("pointermove", (e) => {
    if (!dragging) return;
    const nx = axis === "y" ? 0 : e.clientX - startX;
    const ny = axis === "x" ? 0 : e.clientY - startY;
    const now = performance.now();
    const dt = Math.max(now - lastT, 1);
    vx = ((nx - lastX) / dt) * 1000;
    vy = ((ny - lastY) / dt) * 1000;
    lastX = nx;
    lastY = ny;
    lastT = now;
    el.style.transform = `translate(${nx}px, ${ny}px)`;
  });
  const end = () => {
    if (!dragging) return;
    dragging = false;
    el.style.cursor = "grab";
    opts.onRelease?.(vx, vy);
  };
  el.addEventListener("pointerup", end);
  el.addEventListener("pointercancel", end);
  return {
    reset() {
      lastX = lastY = 0;
      el.style.transform = "translate(0px, 0px)";
    },
    setPos(x: number, y: number) {
      lastX = x;
      lastY = y;
      el.style.transform = `translate(${x}px, ${y}px)`;
    },
    get pos() {
      return { x: lastX, y: lastY };
    },
  };
}

const drag: DemoFactory = (stage) => {
  clearStage(stage);
  const box = createBox({ label: "Drag" });
  stage.append(box, hint("Throw the box — it carries momentum"));
  const d = draggable(box, {
    onRelease: (vx, vy) => {
      const { x, y } = d.pos;
      animate(box, { x: [x, 0], y: [y, 0] }, { type: "spring", velocity: Math.hypot(vx, vy), stiffness: 200, damping: 22 }).then(() => d.reset());
    },
  });
  return { play() {}, continuous: true, code: () => `onRelease(velocity) =>\n  animate(el, { x: 0, y: 0 }, { type: "spring", velocity });` };
};

const dragReorder: DemoFactory = (stage) => {
  clearStage(stage);
  const list = document.createElement("div");
  list.style.cssText = "display:flex;flex-direction:column;gap:8px;width:200px";
  const items = ["Design", "Build", "Ship", "Learn"].map((t, i) => {
    const row = document.createElement("div");
    row.className = "demo-row";
    row.textContent = t;
    row.dataset.i = String(i);
    list.append(row);
    return row;
  });
  stage.append(list);
  let dragEl: HTMLElement | null = null;
  list.addEventListener("pointerdown", (e) => {
    const row = (e.target as HTMLElement).closest(".demo-row") as HTMLElement | null;
    if (!row) return;
    dragEl = row;
    row.setPointerCapture(e.pointerId);
    row.classList.add("is-dragging");
  });
  list.addEventListener("pointermove", (e) => {
    if (!dragEl) return;
    const after = [...list.querySelectorAll<HTMLElement>(".demo-row:not(.is-dragging)")].find((el) => {
      const r = el.getBoundingClientRect();
      return e.clientY < r.top + r.height / 2;
    });
    const first = items.map((el) => el.getBoundingClientRect());
    if (after) list.insertBefore(dragEl, after);
    else list.append(dragEl);
    items.forEach((el, i) => {
      const last = el.getBoundingClientRect();
      const dy = first[i].top - last.top;
      if (dy && el !== dragEl) animate(el, { y: [dy, 0] }, { type: "spring", stiffness: 500, damping: 36 });
    });
  });
  const end = () => {
    dragEl?.classList.remove("is-dragging");
    dragEl = null;
  };
  list.addEventListener("pointerup", end);
  list.addEventListener("pointercancel", end);
  void void 0;
  return { play() {}, continuous: true, code: () => `// FLIP the other rows as the dragged item moves\nanimate(other, { y: [delta, 0] }, { type: "spring" });` };
};

const swipeDismiss: DemoFactory = (stage) => {
  clearStage(stage);
  const toast = document.createElement("div");
  toast.className = "demo-toast";
  toast.textContent = "Swipe me away →";
  stage.append(toast, hint("Drag horizontally past the edge to dismiss"));
  const d = draggable(toast, {
    axis: "x",
    onRelease: (vx) => {
      const { x } = d.pos;
      if (Math.abs(x) > 80 || Math.abs(vx) > 500) {
        const dir = x > 0 || vx > 0 ? 1 : -1;
        animate(toast, { x: [x, dir * 320], opacity: [1, 0] }, { duration: 0.3 }).then(() => {
          setTimeout(() => {
            d.setPos(0, 0);
            animate(toast, { opacity: [0, 1] }, { duration: 0.3 });
          }, 600);
        });
      } else {
        animate(toast, { x: [x, 0] }, { type: "spring", stiffness: 400, damping: 30 }).then(() => d.reset());
      }
    },
  });
  return { play() {}, continuous: true, code: () => `if (offset > threshold) animate(el, { x: 320, opacity: 0 });\nelse animate(el, { x: 0 }, { type: "spring" });` };
};

const rubberBanding: DemoFactory = (stage) => {
  clearStage(stage);
  const track = document.createElement("div");
  track.className = "demo-track";
  const box = createBox({ label: "", size: 48 });
  track.append(box);
  stage.append(track, hint("Drag past the edges — it resists"));
  const limit = 60;
  let lastX = 0;
  box.style.touchAction = "none";
  box.style.cursor = "grab";
  let startX = 0,
    dragging = false;
  box.addEventListener("pointerdown", (e) => {
    dragging = true;
    box.setPointerCapture(e.pointerId);
    startX = e.clientX - lastX;
  });
  box.addEventListener("pointermove", (e) => {
    if (!dragging) return;
    let x = e.clientX - startX;
    if (Math.abs(x) > limit) {
      const over = Math.abs(x) - limit;
      x = Math.sign(x) * (limit + over * 0.25); // resistance
    }
    lastX = x;
    box.style.transform = `translateX(${x}px)`;
  });
  const end = () => {
    if (!dragging) return;
    dragging = false;
    const clamped = Math.max(-limit, Math.min(limit, lastX));
    animate(box, { x: [lastX, clamped] }, { type: "spring", stiffness: 500, damping: 30 });
    lastX = clamped;
  };
  box.addEventListener("pointerup", end);
  box.addEventListener("pointercancel", end);
  return { play() {}, continuous: true, code: () => `if (past edge) x = limit + overshoot * 0.25; // resistance\nonRelease → spring back to the boundary` };
};

const shake: DemoFactory = (stage) => {
  clearStage(stage);
  const field = document.createElement("div");
  field.className = "demo-field";
  field.textContent = "wrong password";
  stage.append(field);
  return {
    play(p) {
      const i = num(p, "intensity", 10);
      animate(field, { x: [0, -i, i, -i * 0.7, i * 0.7, -i * 0.4, 0] }, { duration: 0.45, ease: "easeInOut" });
    },
    code: (p) => `animate(el, { x: [0, -${num(p, "intensity", 10)}, ${num(p, "intensity", 10)}, ..., 0] }, { duration: 0.45 });`,
  };
};

const ripple: DemoFactory = (stage) => {
  clearStage(stage);
  const surface = document.createElement("button");
  surface.className = "demo-ripple-surface";
  surface.textContent = "Tap anywhere";
  surface.addEventListener("pointerdown", (e) => {
    const rect = surface.getBoundingClientRect();
    const r = document.createElement("span");
    r.className = "demo-ripple";
    const size = Math.max(rect.width, rect.height);
    r.style.width = r.style.height = `${size}px`;
    r.style.left = `${e.clientX - rect.left - size / 2}px`;
    r.style.top = `${e.clientY - rect.top - size / 2}px`;
    surface.append(r);
    animate(r, { scale: [0, 2], opacity: [0.4, 0] }, { duration: 0.6, ease: "easeOut" }).then(() => r.remove());
  });
  stage.append(surface);
  return { play() {}, continuous: true, code: () => `onPointerDown(e) => {\n  place circle at tap point;\n  animate(circle, { scale: [0, 2], opacity: [0.4, 0] });\n}` };
};

export const demos: Record<string, DemoFactory> = {
  hover,
  press,
  holdToConfirm,
  drag,
  dragReorder,
  swipeDismiss,
  rubberBanding,
  shake,
  ripple,
};
