export interface Packet { head: number; tail: number; color: number; strength: number }
interface Event {
  at: number; color: number; strength: number; tail: number;
  speed: number; frequency: number; phase: number;
}

/** Fresh randomness per pulse; analytic travel stays smooth and independent of frame rate. */
export class SignalController {
  time = 0;
  private events: Event[][];
  private nextEmission = 0;

  constructor(private readonly random: () => number = Math.random, count = 3) {
    this.events = Array.from({ length: count }, () => []);

  }

  private event(at: number, color: number, strength: number): Event {
    return { at, color, strength, tail: .4 + this.random() * .3,
      speed: 1.8 + this.random() * 1.6, frequency: .65 + this.random() * .9,
      phase: this.random() * Math.PI * 2 };
  }

  advance(seconds: number, speed: number) {
    this.time += Math.max(0, seconds) * Math.max(0, speed);
    // One shared stream: ~0.5 emissions/scene-second versus ~2.6 previously.
    // Adding faint strands therefore does not add more visual interruptions.
    while (this.events.length && this.nextEmission <= this.time) {
      const wire = Math.min(this.events.length - 1, Math.floor(this.random() * this.events.length));
      const color = this.random() < .05 ? 2 : this.random();
      this.events[wire].push(this.event(this.nextEmission, color, .8 + this.random() * .25));
      this.nextEmission += 1.5 + this.random();
    }
    this.events = this.events.map(events => events.filter(event => this.time - event.at < 25).slice(-6));
  }

  emit(wire: number, color = this.random(), strength = 1.35) {
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
      return { head, tail: event.tail, color: event.color >= 2 ? 2 : Math.min(1, event.color + age * .025), strength: event.strength };
    });
  }
}
