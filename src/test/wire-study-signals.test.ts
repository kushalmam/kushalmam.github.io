import { expect, it } from "vitest";
import { SignalController } from "../scene/wireStudy/signals";

function seeded() {
  let state = 173;
  return () => { state = (state * 1664525 + 1013904223) >>> 0; return state / 4294967296; };
}

it("preserves random emissions and travel regardless of frame subdivision", () => {
  const coarse = new SignalController(seeded()), fine = new SignalController(seeded());
  coarse.advance(6, 1);
  for (let i = 0; i < 120; i++) fine.advance(.05, 1);
  for (let wire = 0; wire < 3; wire++) {
    const a = coarse.packets(wire), b = fine.packets(wire);
    expect(a.length).toBe(b.length);
    a.forEach((packet, i) => expect(packet.head).toBeCloseTo(b[i].head, 8));
  }
});

it("accelerates smoothly, always moves forward, and freezes at speed zero", () => {
  const signals = new SignalController(seeded());
  signals.advance(0, 1);
  signals.emit(2);
  const steps: number[] = [];
  let previous = 0;
  for (let i = 0; i < 300; i++) {
    signals.advance(.01, 1);
    const head = signals.packets(2).find(p => p.strength === 1.35)!.head;
    steps.push(head - previous); previous = head;
  }
  expect(Math.min(...steps)).toBeGreaterThan(0);
  expect(Math.max(...steps) - Math.min(...steps)).toBeGreaterThan(.005);
  steps.slice(1).forEach((step, i) => expect(Math.abs(step - steps[i])).toBeLessThan(.001));
  const frozen = signals.packets(2);
  signals.advance(10, 0);
  expect(signals.packets(2)).toEqual(frozen);
});

it("gives separate pulses distinct motion profiles and bounds shader capacity", () => {
  const signals = new SignalController(seeded());
  for (let i = 0; i < 30; i++) signals.emit(0);
  expect(signals.packets(0)).toHaveLength(6);
  signals.advance(1, 1);
  expect(new Set(signals.packets(0).map(p => p.head)).size).toBeGreaterThan(1);
  signals.advance(30, 1);
  expect(signals.packets(0).every(p => p.strength !== 1.35)).toBe(true);
  expect(signals.packets(0).length).toBeLessThanOrEqual(6);
});

it("schedules all eleven hero wires with evolving colors across the palette", () => {
  const signals = new SignalController(seeded(), 11);
  signals.advance(8, 1);
  const colors: number[] = [];
  for (let wire = 0; wire < 11; wire++) {
    expect(signals.packets(wire).length).toBeGreaterThan(0);
    colors.push(...signals.packets(wire).map(p => p.color));
  }
  expect(colors.every(color => color >= 0 && color < 5)).toBe(true);
  expect(new Set(colors.map(Math.floor)).size).toBe(5);
  const before = signals.packets(10)[0].color;
  signals.advance(.2, 1);
  expect(signals.packets(10)[0].color).not.toBe(before);
});
