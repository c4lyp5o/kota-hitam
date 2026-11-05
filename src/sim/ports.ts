// What the simulation needs from the outside world. The browser game fills these in at startup;
// a server can supply its own, or no-ops.
export interface SimPorts {
  sfx: Record<'cash' | 'click' | 'fire' | 'siren' | 'thud', () => void>;
  floatText(lot: number, text: string): void;
  updateHUD(): void;
  renderFile(): void;
  /** Redraws the case file if one is open. */
  refreshFile(): void;
  updateGoals(): void;
  renderLog(): void;
  news(kind: string, lot: number, extra?: string): void;
  vignette(kind: string, text: string, lot?: number): void;
  queuePaper(): void;
  queueTip(): void;
  focusCamera(x: number, z: number): void;
  fall(): void;
  actComplete(): void;
  autosave(): void;
}

export let ports: SimPorts;
export function setPorts(next: SimPorts) {
  ports = next;
}
