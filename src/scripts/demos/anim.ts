import { animate as baseAnimate } from "motion";

/**
 * Wrapper around Motion's `animate` that always plays, even when the operating
 * system has "Reduce Motion" enabled. Motion honours that setting by default and
 * jumps animations straight to their end frame — but on this site the animations
 * *are* the content, so we opt out via `reduceMotion: false`. The dedicated
 * "Reduced motion" demo re-enables the behaviour explicitly to teach it.
 */
export const animate = ((subject: any, keyframes?: any, options?: any) =>
  baseAnimate(subject, keyframes, { reduceMotion: false, ...(options ?? {}) })) as typeof baseAnimate;
