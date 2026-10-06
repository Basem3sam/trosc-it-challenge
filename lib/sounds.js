/* Tiny WebAudio synth — no audio files needed. */

let ctx = null;
let muted = false;

export function setMuted(v) {
  muted = v;
}

/* Browsers require a user gesture before audio — call on first tap. */
export function unlockAudio() {
  if (!ctx) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (AC) ctx = new AC();
  }
  if (ctx && ctx.state === 'suspended') ctx.resume();
}

function tone(freq, dur, opts = {}) {
  if (muted) return;
  unlockAudio();
  if (!ctx) return;
  const { type = 'square', vol = 0.045, delay = 0, slideTo } = opts;
  const t = ctx.currentTime + delay;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t);
  if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, t + dur);
  gain.gain.setValueAtTime(vol, t);
  gain.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  osc.connect(gain).connect(ctx.destination);
  osc.start(t);
  osc.stop(t + dur + 0.02);
}

export function buzz(pattern) {
  if (muted || typeof navigator === 'undefined' || !('vibrate' in navigator))
    return;
  try {
    navigator.vibrate(pattern);
  } catch (_) {}
}

export const sfx = {
  correct() {
    tone(523, 0.09);
    tone(659, 0.09, { delay: 0.08 });
    tone(784, 0.1, { delay: 0.16 });
    tone(1047, 0.16, { delay: 0.24, type: 'triangle', vol: 0.05 });
  },
  wrong() {
    tone(180, 0.28, { type: 'sawtooth', slideTo: 85, vol: 0.055 });
  },
  tick() {
    tone(1250, 0.045, { vol: 0.03 });
  },
  blip() {
    tone(520, 0.08, { vol: 0.04 });
  },
  on() {
    tone(660, 0.08);
  },
  go() {
    tone(440, 0.1);
    tone(880, 0.22, { delay: 0.1 });
  },
  finish() {
    [523, 659, 784, 1047].forEach((f, i) =>
      tone(f, 0.14, { delay: i * 0.12, type: 'triangle', vol: 0.055 }),
    );
  },
  timeUp() {
    tone(300, 0.35, { type: 'sawtooth', slideTo: 110, vol: 0.055 });
  },
  warn() {
    tone(700, 0.09, { vol: 0.05 });
    tone(700, 0.09, { delay: 0.16, vol: 0.05 });
  },
  danger() {
    tone(880, 0.12, { vol: 0.055 });
    tone(660, 0.12, { delay: 0.14, vol: 0.055 });
    tone(880, 0.12, { delay: 0.28, vol: 0.055 });
  },
  hit() {
    tone(150, 0.14, { type: 'sawtooth', slideTo: 55, vol: 0.06 });
    tone(900, 0.05, { vol: 0.05 });
  },
  die() {
    tone(500, 0.1, { vol: 0.05 });
    tone(400, 0.1, { delay: 0.1, vol: 0.05 });
    tone(300, 0.16, { delay: 0.2, slideTo: 120, vol: 0.05 });
  },
  attack() {
    tone(120, 0.25, { type: 'sawtooth', slideTo: 60, vol: 0.06 });
  },
  heart() {
    tone(220, 0.2, { type: 'triangle', slideTo: 140, vol: 0.05 });
  },
  gameOver() {
    [392, 330, 262, 196].forEach((f, i) =>
      tone(f, 0.22, { delay: i * 0.22, type: 'triangle', vol: 0.055 }),
    );
  },
};
