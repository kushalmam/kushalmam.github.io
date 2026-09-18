export interface Packet { head: number; tail: number; color: number; strength: number }
interface Event {
  at: number; color: number; strength: number; tail: number;
  speed: number; frequency: number; phase: number;
}

/** Fresh randomness per pulse; analytic travel stays smooth and independent of frame rate. */
export class SignalController {
  time = 0;
  private events: Event[][];
  private next: number[];

  constructor(private readonly random: () => number = Math.random, count = 3) {
    this.events = Array.from({ length: count }, () => []);
    this.next = Array.from({ length: count }, (_, i) => i * .63);
  }

  private event(at: number, color: number, strength: number): Event {
    return { at, color, strength, tail: .9 + this.random() * 1.2,
      speed: 1.8 + this.random() * 1.6, frequency: .65 + this.random() * .9,
      phase: this.random() * Math.PI * 2 };
  }

  advance(seconds: number, speed: number) {
    this.time += Math.max(0, seconds) * Math.max(0, speed);
    // Process emissions in time order so frame subdivision cannot change random draws.
    while (Math.min(...this.next) <= this.time) {
      const wire = this.next.indexOf(Math.min(...this.next));
      const at = this.next[wire];
      this.events[wire].push(this.event(at, this.random() * 5, .8 + this.random() * .35));
      this.next[wire] = at + 2.4 + this.random() * 3.8;
    }
    this.events = this.events.map(events => events.filter(event => this.time - event.at < 25).slice(-6));
  }

  emit(wire: number, color = this.random() * 5, strength = 1.35) {
    if (!this.events[wire]) return;
    this.events[wire].push(this.event(this.time, color, strength));
    this.events[wire] = this.events[wire].slice(-6);
  }

  packets(wire: number): Packet[] {
    return this.events[wire].map(event => {
      const age = this.time - event.at;
      const { frequency: f, phase: p, speed } = event;
      // Integral of two smooth velocity waves. Speed stays positive (>= 28% of base).
      const head = speed * (age + .5 * (Math.sin(f * age + p) - Math.sin(p)) / f
        + .22 * (Math.sin(f * .43 * age + p * 1.7) - Math.sin(p * 1.7)) / (f * .43));
      return { head, tail: event.tail, color: (event.color + age * (.13 + event.frequency * .09)) % 5, strength: event.strength };
    });
  }
}
