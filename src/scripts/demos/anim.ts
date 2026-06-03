import { animate as baseAnimate } from "motion";

type Controls = ReturnType<typeof baseAnimate>;

let recorder: Controls[] | null = null;

/**
 * Runs `fn` (typically a demo's synchronous `play()`) while capturing every
 * animation started through the wrapped `animate` below. Returns the captured
 * playback controls so callers can await their `.finished` promises — this is
 * how the playground loops one-shot demos while a card is hovered.
 */
export function recordAnimations(fn: () => void): Controls[] {
  const previous = recorder;
  const batch: Controls[] = [];
  recorder = batch;
  try {
    fn();
  } finally {
    recorder = previous;
  }
  return batch;
}

/**
 * Wrapper around Motion's `animate` that always plays, even when the operating
 * system has "Reduce Motion" enabled. Motion honours that setting by default and
 * jumps animations straight to their end frame — but on this site the animations
 * *are* the content, so we opt out via `reduceMotion: false`. The dedicated
 * "Reduced motion" demo re-enables the behaviour explicitly to teach it.
 */
export const animate = ((subject: any, keyframes?: any, options?: any) => {
  const controls = baseAnimate(subject, keyframes, { reduceMotion: false, ...(options ?? {}) });
  recorder?.push(controls);
  return controls;
}) as typeof baseAnimate;
