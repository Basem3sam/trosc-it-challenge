'use client';

import { useEffect } from 'react';
import useGame from './useGame';
import WelcomeScreen from './WelcomeScreen';
import BattleScreen from './BattleScreen';
import ResultScreen from './ResultScreen';
import { Icon } from '@/lib/icons';
import { unlockAudio } from '@/lib/sounds';
import { SITE_URL } from '@/lib/game';

export default function Game() {
  const g = useGame();

  // browsers need a user gesture before audio can start
  useEffect(() => {
    const unlock = () => unlockAudio();
    document.addEventListener('pointerdown', unlock, { once: true });
    return () => document.removeEventListener('pointerdown', unlock);
  }, []);

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-[600px] flex-col px-[clamp(18px,4.5vw,44px)] pb-[clamp(14px,3.5vw,32px)] pt-[calc(clamp(18px,4.5vw,44px)+56px)]">
      <div className="flex w-full flex-1 flex-col">
        {g.screen === 'welcome' && (
          <WelcomeScreen best={g.best} onStart={g.startGame} />
        )}
        {g.screen === 'battle' && <BattleScreen g={g} />}
        {g.screen === 'result' && <ResultScreen g={g} />}
      </div>

      <footer className="pb-2 pt-8 text-center font-mono text-[0.64rem] tracking-[0.2em] text-dust">
        TROSC · IT TEAM —{' '}
        <a
          href={SITE_URL}
          target="_blank"
          rel="noopener"
          className="border-b border-dotted border-blood text-blood no-underline"
        >
          trosc.vercel.app
        </a>
      </footer>

      {/* combo fire — gold screen edges at streak ×3+ */}
      {g.screen === 'battle' && g.combo >= 3 && (
        <div
          aria-hidden="true"
          className="pointer-events-none fixed inset-0 z-[64] animate-fire [box-shadow:inset_0_0_110px_rgba(255,197,61,.22)]"
        />
      )}

      {/* DANGER — pulsing red screen edges in the last 5 seconds */}
      {g.danger && (
        <div
          aria-hidden="true"
          className="pointer-events-none fixed inset-0 z-[63] animate-veil [box-shadow:inset_0_0_90px_rgba(255,70,85,.4)]"
        />
      )}

      {/* one-shot blue vignette when hit */}
      {g.vignette && (
        <div
          aria-hidden="true"
          className="pointer-events-none fixed inset-0 z-[65] animate-vign [box-shadow:inset_0_0_120px_rgba(77,159,255,.5)]"
        />
      )}

      {/* 3 · 2 · 1 · FIGHT! */}
      {g.countdownStep && (
        <div
          className="fixed inset-0 z-[90] grid place-items-center bg-[rgba(10,4,7,.92)]"
          aria-hidden="true"
        >
          <span
            key={g.countdownStep}
            className="animate-cd font-display text-[clamp(5rem,30vw,9rem)] text-blood [text-shadow:0_0_40px_rgba(255,70,85,.5)]"
          >
            {g.countdownStep}
          </span>
        </div>
      )}

      {/* confetti bursts on hits */}
      {g.bursts.map((b) => (
        <div
          key={b.id}
          aria-hidden="true"
          className="pointer-events-none fixed inset-0 z-[70]"
        >
          {b.parts.map((p, i) => (
            <i
              key={i}
              className="animate-burst absolute h-[7px] w-[7px] rounded-[2px]"
              style={{
                left: b.x,
                top: b.y,
                background: p.color,
                '--dx': `${p.dx}px`,
                '--dy': `${p.dy}px`,
              }}
            />
          ))}
        </div>
      ))}

      {/* floating damage numbers */}
      {g.floats.map((f) => (
        <span
          key={f.id}
          aria-hidden="true"
          className="animate-rise pointer-events-none fixed z-[80] font-mono text-lg font-bold text-gold [text-shadow:0_2px_8px_rgba(0,0,0,.6)]"
          style={{ left: f.x, top: f.y }}
        >
          {f.text}
        </span>
      ))}

      {/* victory confetti rain */}
      {g.confetti.length > 0 && (
        <div
          aria-hidden="true"
          className="pointer-events-none fixed inset-0 z-[70] overflow-hidden"
        >
          {g.confetti.map((p) => (
            <i
              key={p.id}
              className="animate-confetti absolute -top-[6vh]"
              style={{
                left: `${p.left}vw`,
                width: p.size,
                height: p.size,
                borderRadius: p.round ? '50%' : '2px',
                background: p.color,
                '--spin': `${p.spin}deg`,
                '--d': `${p.dur}s`,
                animationDelay: `${p.delay}s`,
              }}
            />
          ))}
        </div>
      )}

      {/* sound toggle — always reachable */}
      <button
        type="button"
        onClick={g.toggleMute}
        aria-pressed={g.muted}
        aria-label={g.muted ? 'Turn sound on' : 'Turn sound off'}
        className="fixed right-[calc(10px+env(safe-area-inset-right))] top-[calc(10px+env(safe-area-inset-top))] z-[60] grid h-[46px] w-[46px] place-items-center rounded-xl border border-edge bg-panel text-dust transition hover:text-cream aria-pressed:text-blood"
      >
        <Icon name={g.muted ? 'soundOff' : 'soundOn'} className="h-5 w-5" />
      </button>

      {/* toast */}
      <div
        role="status"
        aria-live="polite"
        className={`fixed bottom-[calc(24px+env(safe-area-inset-bottom))] left-1/2 z-[95] max-w-[calc(100vw-40px)] -translate-x-1/2 rounded-full border border-edge bg-panel2 px-5 py-2.5 text-center text-[0.95rem] transition-all duration-300 ${g.toastMsg ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-4 opacity-0'}`}
      >
        {g.toastMsg}
      </div>
    </div>
  );
}
