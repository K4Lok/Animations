import type { DemoFactory } from "./types";

/**
 * Demo ids use the form "module:factory" (e.g. "entrances:fade").
 * Each category module exports a `demos` record mapping factory name -> DemoFactory.
 * Modules are imported lazily so a card only loads its demo's code when scrolled into view.
 */
type DemoModule = { demos: Record<string, DemoFactory> };

const modules: Record<string, () => Promise<DemoModule>> = {
  entrances: () => import("./entrances"),
  sequencing: () => import("./sequencing"),
  transforms: () => import("./transforms"),
  transitions: () => import("./transitions"),
  scroll: () => import("./scroll"),
  feedback: () => import("./feedback"),
  easing: () => import("./easing"),
  spring: () => import("./spring"),
  looping: () => import("./looping"),
  polish: () => import("./polish"),
  performance: () => import("./performance"),
  principles: () => import("./principles"),
};

export async function loadDemo(id: string): Promise<DemoFactory | null> {
  const [moduleKey, factoryName] = id.split(":");
  const loader = modules[moduleKey];
  if (!loader) {
    console.warn(`[playground] unknown demo module: ${moduleKey}`);
    return null;
  }
  const mod = await loader();
  const factory = mod.demos[factoryName];
  if (!factory) {
    console.warn(`[playground] unknown demo factory: ${id}`);
    return null;
  }
  return factory;
}
