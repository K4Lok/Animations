import { loadDemo } from "./demos/index";
import { recordAnimations } from "./demos/anim";
import { clearStage } from "./demos/utils";
import type { ControlSpec, DemoInstance, Params } from "./demos/types";

interface PlaygroundConfig {
  controls: ControlSpec[];
}

interface PlaygroundI18n {
  code: string;
  unavailable: string;
  noSnippet: string;
  useCase?: string;
  abstract?: string;
  demos?: Record<string, string>;
}

const I18N: PlaygroundI18n = (
  typeof window !== "undefined" ? (window as unknown as { __PG_I18N__?: PlaygroundI18n }).__PG_I18N__ : undefined
) ?? {
  code: "Code",
  unavailable: "Demo unavailable",
  noSnippet: "// No snippet for this demo.",
  useCase: "Use case",
  abstract: "Abstract",
  demos: {},
};

class AnimPlayground extends HTMLElement {
  private instance: DemoInstance | null = null;
  private controls: ControlSpec[] = [];
  private inputs = new Map<string, HTMLInputElement | HTMLSelectElement>();
  private stage!: HTMLElement;
  private codePanel!: HTMLElement;
  private codeWrap!: HTMLElement;
  private observer: IntersectionObserver | null = null;
  private booted = false;
  private hovering = false;
  private looping = false;
  private hoverHost: HTMLElement | null = null;
  private abstractId = "";
  private useCaseId = "";
  private activeId = "";
  private hasTabs = false;
  private tabButtons: HTMLButtonElement[] = [];
  private readonly onEnter = () => {
    this.hovering = true;
    void this.startLoop();
  };
  private readonly onLeave = () => {
    this.hovering = false;
  };

  connectedCallback() {
    const configEl = this.querySelector<HTMLScriptElement>(".pg-config");
    let config: PlaygroundConfig = { controls: [] };
    if (configEl?.textContent) {
      try {
        config = JSON.parse(configEl.textContent);
      } catch {
        /* ignore malformed config */
      }
    }
    this.controls = config.controls ?? [];

    this.abstractId = this.dataset.demo ?? "";
    this.useCaseId = this.dataset.useCaseDemo ?? "";
    this.hasTabs = this.useCaseId.length > 0;
    this.activeId = this.hasTabs ? this.useCaseId : this.abstractId;

    this.render();

    this.observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            this.boot();
            this.observer?.disconnect();
            this.observer = null;
          }
        }
      },
      { rootMargin: "120px" }
    );
    this.observer.observe(this);
  }

  disconnectedCallback() {
    this.observer?.disconnect();
    this.hovering = false;
    this.teardownHover();
    this.instance?.cleanup?.();
  }

  private render() {
    this.innerHTML = "";

    this.stage = el("div", "pg-stage");
    this.stage.setAttribute("aria-hidden", "true");
    this.append(this.stage);

    const toolbar = el("div", "pg-toolbar");

    if (this.hasTabs) {
      const tabs = el("div", "pg-tabs");
      const useCaseTab = this.makeTab(I18N.useCase ?? "Use case", this.useCaseId);
      const abstractTab = this.makeTab(I18N.abstract ?? "Abstract", this.abstractId);
      useCaseTab.classList.add("is-active");
      tabs.append(useCaseTab, abstractTab);
      toolbar.append(tabs);
    }

    const codeToggle = el("button", "pg-btn pg-ghost pg-code-toggle") as HTMLButtonElement;
    codeToggle.type = "button";
    codeToggle.textContent = I18N.code;
    codeToggle.addEventListener("click", () => {
      const open = this.codeWrap.classList.toggle("is-open");
      codeToggle.classList.toggle("is-active", open);
      if (open) this.updateCode();
    });

    toolbar.append(codeToggle);
    this.append(toolbar);

    if (this.controls.length) {
      const panel = el("div", "pg-controls");
      for (const c of this.controls) panel.append(this.buildControl(c));
      this.append(panel);
    }

    this.codeWrap = el("div", "pg-code-wrap");
    this.codePanel = el("pre", "pg-code") as HTMLElement;
    this.codeWrap.append(this.codePanel);
    this.append(this.codeWrap);
  }

  private buildControl(c: ControlSpec): HTMLElement {
    const row = el("label", "pg-control");
    const head = el("div", "pg-control-head");
    const name = el("span", "pg-control-label");
    name.textContent = c.label;
    head.append(name);

    if (c.kind === "range") {
      const value = el("span", "pg-control-value");
      const fmt = () => `${input.value}${c.unit ?? ""}`;
      const input = document.createElement("input");
      input.type = "range";
      input.min = String(c.min);
      input.max = String(c.max);
      input.step = String(c.step);
      input.value = String(c.default);
      input.className = "pg-range";
      value.textContent = fmt();
      input.addEventListener("input", () => {
        value.textContent = fmt();
        this.run();
      });
      head.append(value);
      row.append(head, input);
      this.inputs.set(c.key, input);
    } else if (c.kind === "select") {
      const select = document.createElement("select");
      select.className = "pg-select";
      for (const opt of c.options) {
        const o = document.createElement("option");
        o.value = opt.value;
        o.textContent = opt.label;
        if (opt.value === c.default) o.selected = true;
        select.append(o);
      }
      select.addEventListener("change", () => this.run());
      row.classList.add("pg-control--inline");
      row.append(head, select);
      this.inputs.set(c.key, select);
    } else {
      row.classList.add("pg-control--inline");
      const sw = el("span", "pg-switch");
      const input = document.createElement("input");
      input.type = "checkbox";
      input.checked = c.default;
      input.className = "pg-checkbox";
      input.addEventListener("change", () => this.run());
      sw.append(input, el("span", "pg-switch-track"));
      row.append(head, sw);
      this.inputs.set(c.key, input);
    }
    return row;
  }

  private collectParams(): Params {
    const params: Params = {};
    for (const c of this.controls) {
      const input = this.inputs.get(c.key);
      if (!input) continue;
      if (c.kind === "range") params[c.key] = Number((input as HTMLInputElement).value);
      else if (c.kind === "toggle") params[c.key] = (input as HTMLInputElement).checked;
      else params[c.key] = (input as HTMLSelectElement).value;
    }
    return params;
  }

  private async boot() {
    if (this.booted) return;
    this.booted = true;
    const factory = await loadDemo(this.activeId);
    if (!factory) {
      this.stage.classList.add("pg-stage--error");
      this.stage.textContent = I18N.unavailable;
      return;
    }
    this.instance = factory(this.stage);
    this.run();
    if (!this.instance.continuous) this.setupHover();
  }

  private makeTab(label: string, demoId: string): HTMLButtonElement {
    const btn = el("button", "pg-tab") as HTMLButtonElement;
    btn.type = "button";
    btn.textContent = label;
    btn.addEventListener("click", () => void this.switchTo(demoId, btn));
    this.tabButtons.push(btn);
    return btn;
  }

  /** Swap the active demo (Use case ↔ Abstract), rebuilding the stage cleanly. */
  private async switchTo(demoId: string, btn: HTMLButtonElement) {
    if (demoId === this.activeId) return;
    this.activeId = demoId;
    for (const b of this.tabButtons) b.classList.toggle("is-active", b === btn);
    if (!this.booted) return; // boot() will instantiate the active demo

    this.hovering = false;
    this.teardownHover();
    this.instance?.cleanup?.();
    this.instance = null;
    clearStage(this.stage);
    this.stage.classList.remove("pg-stage--error");

    const factory = await loadDemo(demoId);
    if (!factory) {
      this.stage.classList.add("pg-stage--error");
      this.stage.textContent = I18N.unavailable;
      return;
    }
    this.instance = factory(this.stage);
    this.run();
    if (!this.instance.continuous) this.setupHover();
  }

  private run() {
    if (!this.instance) return;
    const params = this.collectParams();
    this.instance.play(params);
    if (this.codeWrap.classList.contains("is-open")) this.updateCode();
  }

  /** Loop the demo for as long as a pointer rests on the card. */
  private setupHover() {
    this.hoverHost = this.closest<HTMLElement>(".term-card") ?? this;
    this.hoverHost.addEventListener("pointerenter", this.onEnter);
    this.hoverHost.addEventListener("pointerleave", this.onLeave);
  }

  private teardownHover() {
    this.hoverHost?.removeEventListener("pointerenter", this.onEnter);
    this.hoverHost?.removeEventListener("pointerleave", this.onLeave);
  }

  private async startLoop() {
    if (this.looping || !this.instance) return;
    this.looping = true;
    try {
      while (this.hovering && this.instance) {
        const params = this.collectParams();
        const batch = recordAnimations(() => this.instance!.play(params));
        if (this.codeWrap.classList.contains("is-open")) this.updateCode();
        if (!batch.length) break;
        try {
          await Promise.all(batch.map((c) => c.finished));
        } catch {
          break;
        }
        if (!this.hovering) break;
        await delay(420);
      }
    } finally {
      this.looping = false;
    }
  }

  private updateCode() {
    if (!this.instance?.code) {
      this.codePanel.textContent = I18N.noSnippet;
      return;
    }
    this.codePanel.textContent = this.instance.code(this.collectParams());
  }
}

function el(tag: string, className: string): HTMLElement {
  const node = document.createElement(tag);
  node.className = className;
  return node;
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

if (!customElements.get("anim-playground")) {
  customElements.define("anim-playground", AnimPlayground);
}
