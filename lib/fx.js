/* canvas-confetti wrapper — lazily imported so it never slows first paint.
   All failures are non-fatal: no confetti is better than a broken game. */

let confetti = null;
let confettiDead = false; // set after a load failure — don't retry forever

async function get() {
  if (confetti) return confetti;
  if (confettiDead) return null;
  try {
    confetti = (await import('canvas-confetti')).default;
    return confetti;
  } catch (e) {
    console.warn('confetti unavailable — continuing without it:', e);
    confettiDead = true;
    return null;
  }
}

const COLORS = ['#FF4655', '#FFC53D', '#FDEFEF', '#FF8A9B'];

/* Victory fireworks — bigger for higher ranks, stars for S */
export async function celebrate(rank) {
  const c = await get();
  const base = { colors: COLORS, zIndex: 120, disableForReducedMotion: true };

  c({ ...base, particleCount: 90, spread: 75, origin: { y: 0.6 } });
  if (rank === 'A' || rank === 'S') {
    setTimeout(
      () =>
        c({
          ...base,
          particleCount: 60,
          angle: 60,
          spread: 60,
          origin: { x: 0, y: 0.7 },
        }),
      300,
    );
    setTimeout(
      () =>
        c({
          ...base,
          particleCount: 60,
          angle: 120,
          spread: 60,
          origin: { x: 1, y: 0.7 },
        }),
      450,
    );
  }
  if (rank === 'S') {
    setTimeout(
      () =>
        c({
          ...base,
          particleCount: 140,
          spread: 160,
          startVelocity: 30,
          shapes: ['star'],
          scalar: 1.2,
          origin: { y: 0.5 },
        }),
      700,
    );
    setTimeout(
      () => c({ ...base, particleCount: 120, spread: 120, origin: { y: 0.4 } }),
      1000,
    );
  }
}

/* Game over — slow, cold, sad drift */
export async function sadRain() {
  const c = await get();
  if (!c) return;
  c({
    colors: ['#4D9FFF', '#8FA6C4', '#C9A3AD'],
    zIndex: 120,
    disableForReducedMotion: true,
    particleCount: 50,
    spread: 100,
    startVelocity: 22,
    gravity: 0.55,
    scalar: 0.85,
    ticks: 260,
    origin: { y: 0.2 },
  });
}
