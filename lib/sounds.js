/* Tiny WebAudio synth: SFX, per-monster spawn stings, chiptune battle loop,
   and a low-HP heartbeat. No audio files needed. */

let ctx = null;
let muted = false;

export function setMuted(v) {
  muted = v;
  if (v) {
    stopMusic();
    stopHeartbeat();
  }
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
  powerup() {
    tone(660, 0.08);
    tone(880, 0.1, { delay: 0.09 });
    tone(1175, 0.14, { delay: 0.2, type: 'triangle', vol: 0.05 });
  },
  cut() {
    tone(900, 0.05, { vol: 0.04 });
    tone(650, 0.06, { delay: 0.07, vol: 0.04 });
  },
  freeze() {
    tone(1500, 0.3, { type: 'sine', slideTo: 420, vol: 0.05 });
  },
  shieldUp() {
    tone(392, 0.1, { type: 'triangle' });
    tone(523, 0.16, { delay: 0.1, type: 'triangle' });
  },
  block() {
    tone(500, 0.06, { vol: 0.05 });
    tone(750, 0.1, { delay: 0.06, type: 'triangle', vol: 0.05 });
  },
};

/* ---------- Spawn stings — one per monster, deterministic ---------- */

/* Regular monsters: a short arpeggio derived from the monster's name,
   so each enemy has its own recognizable call every time it appears. */
export function spawnSting(enemy) {
  if (!enemy) return;
  if (enemy.boss) {
    bossSting();
    return;
  }

  let h = 0;
  for (let i = 0; i < enemy.name.length; i++)
    h = (h * 31 + enemy.name.charCodeAt(i)) >>> 0;

  const roots = [196, 220, 233, 247, 262, 294]; // G3…D4
  const root = roots[h % roots.length];
  const shapes = [
    [0, 4, 7, 12], // bright rise
    [0, 3, 7, 10], // minor climb
    [0, 5, 9, 12], // wide steps
    [12, 7, 4, 0], // descending fall
  ];
  /* >>> (unsigned shift) keeps the index non-negative for hashes >= 2^31 —
     a signed >> here made shapes[...] undefined for ~half of all names. */
  const shape = shapes[(h >>> 4) % shapes.length] || shapes[0];
  shape.forEach((semi, i) => {
    tone(root * Math.pow(2, semi / 12), 0.11, {
      type: 'square',
      vol: 0.045,
      delay: i * 0.085,
    });
  });
  tone(root / 2, 0.35, { type: 'triangle', vol: 0.04, delay: 0.05 }); // low anchor
}

/* Final boss: slow, low, dissonant — something big is waking up. */
function bossSting() {
  tone(62, 0.7, { type: 'sawtooth', vol: 0.07 }); // low growl
  tone(66, 0.7, { type: 'sawtooth', vol: 0.05, delay: 0.06 }); // dissonant neighbor
  tone(124, 0.8, { type: 'triangle', vol: 0.05, delay: 0.15 });
  tone(248, 0.5, { slideTo: 124, type: 'square', vol: 0.05, delay: 0.4 });
  tone(65, 0.6, { type: 'sawtooth', slideTo: 40, vol: 0.06, delay: 0.75 });
}

/* ---------- Low-HP heartbeat (fighting on your last heart) ---------- */
let hbTimer = null;

export function startHeartbeat() {
  if (muted || hbTimer) return;
  unlockAudio();
  if (!ctx) return;
  const thump = () => {
    if (muted) {
      stopHeartbeat();
      return;
    }
    tone(58, 0.12, { type: 'sine', vol: 0.1 });
    tone(48, 0.16, { type: 'sine', vol: 0.09, delay: 0.22 });
  };
  thump();
  hbTimer = setInterval(thump, 950);
}

export function stopHeartbeat() {
  if (hbTimer) {
    clearInterval(hbTimer);
    hbTimer = null;
  }
}

/* ---------- Chiptune battle loop (lookahead scheduler) ---------- */
let musicTimer = null,
  musicStep = 0,
  musicNext = 0;
let musicDanger = false,
  musicBoss = false,
  playing = false;

const PATTERNS = {
  calm: {
    step: 0.19,
    bass: [110, 110, 0, 131, 98, 98, 0, 110],
    lead: [440, 0, 523, 659, 587, 0, 523, 440],
  },
  danger: {
    step: 0.145,
    bass: [110, 116.5, 0, 110, 87.3, 87.3, 0, 98],
    lead: [587, 622, 0, 587, 466, 0, 522, 587],
  },
  /* boss: slow, heavy, tritone pulses — the final level sounds wrong on purpose */
  boss: {
    step: 0.24,
    bass: [55, 0, 55, 0, 58.3, 0, 49, 0],
    lead: [0, 220, 0, 233, 0, 208, 0, 196],
  },
};

function pluck(f, t, d, type, v) {
  const o = ctx.createOscillator();
  const g = ctx.createGain();
  o.type = type;
  o.frequency.value = f;
  g.gain.setValueAtTime(v, t);
  g.gain.exponentialRampToValueAtTime(0.0001, t + d);
  o.connect(g).connect(ctx.destination);
  o.start(t);
  o.stop(t + d + 0.02);
}

function schedule() {
  const p = musicBoss
    ? PATTERNS.boss
    : musicDanger
      ? PATTERNS.danger
      : PATTERNS.calm;
  while (musicNext < ctx.currentTime + 0.25) {
    const s = musicStep % 8;
    if (p.bass[s]) pluck(p.bass[s], musicNext, p.step * 0.9, 'square', 0.03);
    if (p.lead[s]) pluck(p.lead[s], musicNext, p.step * 0.7, 'triangle', 0.022);
    if (s % 2 === 0) pluck(6000, musicNext, 0.03, 'square', 0.006); // hat tick
    musicStep++;
    musicNext += p.step;
  }
}

export function startMusic() {
  if (muted || playing) return;
  unlockAudio();
  if (!ctx) return;
  playing = true;
  musicStep = 0;
  musicNext = ctx.currentTime + 0.1;
  musicTimer = setInterval(schedule, 70);
}

export function stopMusic() {
  if (musicTimer) clearInterval(musicTimer);
  musicTimer = null;
  playing = false;
}

export function setMusicDanger(d) {
  musicDanger = d;
}
export function setMusicBoss(b) {
  musicBoss = b;
}
