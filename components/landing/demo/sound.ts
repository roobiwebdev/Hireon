"use client";

/**
 * The hero film's sound effects, synthesized with Web Audio so the page ships no audio files.
 * Each sound is a few short layers: sine tones with an optional pitch glide, and filtered noise bursts.
 */

type Tone = { type: "tone"; freq: number; to?: number; glide?: number };
type Noise = { type: "noise"; filter: BiquadFilterType; freq: number; to?: number; q?: number };
type Layer = (Tone | Noise) & { at?: number; attack: number; decay: number; peak: number };
type Patch = { layers: Layer[]; air?: number };

export type Sound = "key" | "switch" | "pop" | "tick" | "whoosh" | "sweep" | "chime" | "start" | "stop" | "blip";

const PATCHES: Record<Sound, Patch> = {
  key: {
    layers: [
      { type: "noise", filter: "highpass", freq: 3800, q: 0.7, attack: 0.001, decay: 0.02, peak: 0.09 },
      { type: "tone", freq: 1900, attack: 0.001, decay: 0.028, peak: 0.012 },
    ],
    air: 0.04,
  },
  switch: {
    layers: [
      { type: "noise", filter: "bandpass", freq: 1600, q: 1.4, attack: 0.001, decay: 0.022, peak: 0.08 },
      { type: "tone", freq: 1250, attack: 0.001, decay: 0.045, peak: 0.02 },
    ],
  },
  pop: {
    layers: [
      { type: "tone", freq: 560, to: 980, glide: 0.06, attack: 0.002, decay: 0.11, peak: 0.05 },
      { type: "noise", filter: "bandpass", freq: 2200, q: 2, attack: 0.001, decay: 0.014, peak: 0.025 },
    ],
    air: 0.12,
  },
  tick: { layers: [{ type: "tone", freq: 2400, attack: 0.001, decay: 0.02, peak: 0.02 }] },
  blip: {
    layers: [{ type: "tone", freq: 740, to: 620, glide: 0.08, attack: 0.004, decay: 0.12, peak: 0.022 }],
    air: 0.1,
  },
  whoosh: {
    layers: [{ type: "noise", filter: "lowpass", freq: 240, to: 1500, q: 0.8, attack: 0.09, decay: 0.42, peak: 0.065 }],
    air: 0.1,
  },
  sweep: {
    layers: [
      { type: "noise", filter: "bandpass", freq: 480, to: 4800, q: 1.2, attack: 0.03, decay: 0.48, peak: 0.045 },
      { type: "tone", freq: 330, to: 660, glide: 0.4, attack: 0.02, decay: 0.45, peak: 0.016 },
    ],
    air: 0.15,
  },
  // A rising two-note "call connected".
  start: {
    layers: [
      { type: "tone", freq: 523.25, attack: 0.004, decay: 0.16, peak: 0.05 },
      { type: "tone", freq: 783.99, at: 0.11, attack: 0.004, decay: 0.28, peak: 0.05 },
    ],
    air: 0.2,
  },
  // The same two notes falling: "call ended".
  stop: {
    layers: [
      { type: "tone", freq: 783.99, attack: 0.004, decay: 0.14, peak: 0.045 },
      { type: "tone", freq: 523.25, at: 0.11, attack: 0.004, decay: 0.3, peak: 0.05 },
    ],
    air: 0.2,
  },
  chime: {
    layers: [
      { type: "tone", freq: 659.25, attack: 0.004, decay: 0.7, peak: 0.05 },
      { type: "tone", freq: 987.77, at: 0.1, attack: 0.004, decay: 0.85, peak: 0.045 },
      { type: "tone", freq: 1318.51, at: 0.2, attack: 0.004, decay: 0.6, peak: 0.018 },
    ],
    air: 0.35,
  },
};

type Engine = { ctx: AudioContext; master: GainNode; send: GainNode; noise: AudioBuffer };
let engine: Engine | null = null;

function setup(): Engine | null {
  if (engine) return engine;
  if (typeof window === "undefined" || typeof window.AudioContext !== "function") return null;
  const ctx = new window.AudioContext();

  const master = ctx.createGain();
  master.gain.value = 0.9;
  master.connect(ctx.destination);

  // A short feedback delay through a low-pass gives the louder sounds a little room.
  const send = ctx.createGain();
  const delay = ctx.createDelay(1);
  delay.delayTime.value = 0.12;
  const feedback = ctx.createGain();
  feedback.gain.value = 0.26;
  const tone = ctx.createBiquadFilter();
  tone.type = "lowpass";
  tone.frequency.value = 2600;
  send.connect(delay);
  delay.connect(tone);
  tone.connect(feedback);
  feedback.connect(delay);
  tone.connect(master);

  // Noise only needs to sound random; it is never part of a rendered frame.
  const noise = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
  const data = noise.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;

  engine = { ctx, master, send, noise };
  return engine;
}

/** Creates or resumes the audio context. Browsers only allow this inside a user gesture. */
export function unlock() {
  const e = setup();
  if (e?.ctx.state === "suspended") void e.ctx.resume();
}

/** Plays a sound now. `variant` nudges the pitch so repeated sounds don't sound identical. */
export function play(name: Sound, variant = 0) {
  if (!engine || engine.ctx.state !== "running") return;
  const { ctx, master, send } = engine;
  const patch = PATCHES[name];
  const out = ctx.createGain();
  out.connect(master);
  if (patch.air) {
    const wet = ctx.createGain();
    wet.gain.value = patch.air;
    out.connect(wet);
    wet.connect(send);
  }
  const pitch = 1 + (((variant * 7) % 5) - 2) * 0.025;
  const now = ctx.currentTime + 0.005;
  for (const layer of patch.layers) voice(engine, out, layer, now + (layer.at ?? 0), pitch);
}

function voice({ ctx, noise }: Engine, out: AudioNode, layer: Layer, t0: number, pitch: number) {
  const end = t0 + layer.attack + layer.decay;
  const env = ctx.createGain();
  env.gain.setValueAtTime(0, t0);
  env.gain.linearRampToValueAtTime(layer.peak, t0 + layer.attack);
  env.gain.exponentialRampToValueAtTime(0.0001, end);
  env.connect(out);

  let source: AudioScheduledSourceNode;
  if (layer.type === "tone") {
    const osc = ctx.createOscillator();
    osc.type = "sine";
    osc.frequency.setValueAtTime(layer.freq * pitch, t0);
    if (layer.to) osc.frequency.exponentialRampToValueAtTime(layer.to * pitch, t0 + (layer.glide ?? layer.decay));
    osc.connect(env);
    source = osc;
  } else {
    const buffer = ctx.createBufferSource();
    buffer.buffer = noise;
    const filter = ctx.createBiquadFilter();
    filter.type = layer.filter;
    filter.frequency.setValueAtTime(layer.freq * pitch, t0);
    if (layer.to) filter.frequency.exponentialRampToValueAtTime(layer.to * pitch, end);
    filter.Q.value = layer.q ?? 1;
    buffer.connect(filter);
    filter.connect(env);
    source = buffer;
  }
  source.start(t0);
  source.stop(end + 0.05);
}
