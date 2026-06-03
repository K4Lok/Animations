export type ControlSpec =
  | {
      kind: "range";
      key: string;
      label: string;
      min: number;
      max: number;
      step: number;
      default: number;
      unit?: string;
    }
  | {
      kind: "select";
      key: string;
      label: string;
      options: { label: string; value: string }[];
      default: string;
    }
  | { kind: "toggle"; key: string; label: string; default: boolean };

export type Params = Record<string, number | string | boolean>;

export interface DemoInstance {
  /** (Re)run the demo with the current control values. */
  play(params: Params): void;
  /** Optional teardown when the element leaves the DOM. */
  cleanup?(): void;
  /** Optional CSS / Motion snippet reflecting current params, shown in the Code panel. */
  code?(params: Params): string;
  /** If true, the demo drives itself continuously and the Replay button is hidden. */
  readonly continuous?: boolean;
}

export type DemoFactory = (stage: HTMLElement) => DemoInstance;
