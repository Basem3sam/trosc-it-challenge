'use client';

import { useEffect, useState } from 'react';
import { Icon } from '@/lib/icons';
import { BTN_PRIMARY, BTN_GHOST } from '@/lib/ui';
import { JOIN_FORM_URL, tierFor } from '@/lib/game';

function ScoreRing({ pct, reduced }) {
  const C = 2 * Math.PI * 52;
  const [val, setVal] = useState(0);

  useEffect(() => {
    if (reduced) {
      setVal(pct);
      return;
    }
    let raf;
    const t0 = performance.now();
    const tick = (now) => {
      const t = Math.min((now - t0) / 1000, 1);
      setVal((1 - Math.pow(1 - t, 3)) * pct);
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [pct, reduced]);

  return (
    <div
      role="img"
      aria-label={`Accuracy ${Math.round(val)} percent`}
      className="relative mx-auto mb-2 w-[clamp(150px,46vw,190px)]"
    >
      <svg
        viewBox="0 0 120 120"
        className="-rotate-90 block h-auto w-full"
        aria-hidden="true"
      >
        <circle
          cx="60"
          cy="60"
          r="52"
          fill="none"
          stroke="var(--color-panel2)"
          strokeWidth="9"
        />
        <circle
          cx="60"
          cy="60"
          r="52"
          fill="none"
          stroke="var(--color-blood)"
          strokeWidth="9"
          strokeLinecap="round"
          strokeDasharray={C}
          strokeDashoffset={C * (1 - val / 100)}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-[clamp(1.9rem,8vw,2.5rem)] font-bold tracking-tight">
          {Math.round(val)}%
        </span>
        <span className="font-mono text-[0.64rem] tracking-[0.25em] text-dust">
          ACCURACY
        </span>
      </div>
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div className="rounded-xl border border-edge bg-panel px-2 py-2">
      <p className="font-mono text-[0.58rem] tracking-[0.14em] text-dust">
        {label}
      </p>
      <p className="mt-0.5 font-display text-lg text-cream">{value}</p>
    </div>
  );
}

export default function ResultScreen({ g }) {
  const won = g.result.outcome === 'won';
  const { attempted, pct, by, stats, badges } = g.result;
  const tier = won ? tierFor(g.score) : null;

  return (
    <section aria-labelledby="result-kicker" className="w-full text-center">
      <h1
        id="result-kicker"
        className={`mb-1.5 font-display text-[clamp(1.4rem,6vw,2rem)] tracking-[0.06em] ${
          won
            ? 'text-gold [text-shadow:0_0_28px_rgba(255,197,61,.45)]'
            : 'animate-blink text-blood [text-shadow:0_0_28px_rgba(255,70,85,.5)]'
        }`}
      >
        {won ? 'GAME COMPLETE!' : 'GAME OVER'}
      </h1>
      <h2 className="mb-3 text-[clamp(1.8rem,8vw,2.5rem)] font-bold tracking-tight">
        {g.name}
      </h2>

      {!won && (
        <p className="mb-3 flex items-center justify-center gap-2 text-[1.02rem] font-semibold text-blood">
          <Icon name="skull" className="h-5 w-5" />
          <span>
            Defeated by <b>{by}</b> at Level {attempted}!
          </span>
        </p>
      )}

      <ScoreRing pct={pct} reduced={g.reduced} />
      <p className="font-mono text-[0.95rem] tracking-[0.1em] text-dust">
        {g.score} / {attempted} CORRECT ·{' '}
        <span className="font-bold text-gold">{g.xp} XP</span>
      </p>

      {stats && (
        <div className="mx-auto mt-3 grid w-full max-w-[300px] grid-cols-3 gap-2">
          <Stat label="MAX COMBO" value={`×${stats.longestCombo}`} />
          <Stat
            label="FASTEST"
            value={
              stats.fastest !== null ? `${stats.fastest.toFixed(1)}s` : '—'
            }
          />
          <Stat
            label="AVG"
            value={stats.avg !== null ? `${stats.avg.toFixed(1)}s` : '—'}
          />
        </div>
      )}

      {won && g.result.record && (
        <p className="animate-stamp mx-auto mt-3 w-fit rounded-full bg-blood px-4 py-1.5 font-mono text-[0.74rem] font-bold tracking-[0.16em] text-bloodink">
          NEW PERSONAL BEST!
        </p>
      )}

      {badges && badges.length > 0 && (
        <div className="mt-3 flex flex-wrap justify-center gap-2">
          {badges.map((b) => (
            <span
              key={b.label}
              className="inline-flex items-center gap-1.5 rounded-full border border-gold/40 bg-gold/10 px-3 py-1 font-mono text-[0.7rem] tracking-[0.12em] text-gold"
            >
              <Icon name={b.icon} className="h-3.5 w-3.5" /> {b.label}
            </span>
          ))}
        </div>
      )}

      <p
        className={`mx-auto mt-3 flex w-fit items-center gap-2.5 rounded-full border px-4 py-2 font-mono text-[0.84rem] tracking-[0.14em] ${won ? 'animate-rank-in border-gold/45 bg-gold/10 text-gold' : 'border-blood/45 bg-blood/10 text-blood'}`}
      >
        {won ? (
          <>
            <Icon name="trophy" className="h-5 w-5" />
            <b
              className={`font-display text-2xl ${tier.rank === 'S' ? 'text-gold [text-shadow:0_0_18px_rgba(255,197,61,.65)]' : ''}`}
            >
              {tier.rank}
            </b>
            <span>RANK · {tier.title}</span>
          </>
        ) : (
          <>
            <Icon name="skull" className="h-5 w-5" />
            <b className="font-display text-2xl">F</b>
            <span>RANK · DEFEATED</span>
          </>
        )}
      </p>

      <p className="mx-auto mt-3 flex w-fit items-center gap-2.5 rounded-[18px] border border-edge bg-panel px-4 py-2.5 text-left text-[1.05rem] font-semibold">
        <Icon name={won ? tier.icon : 'skull'} className="h-5 w-5 text-blood" />
        <span>
          {won
            ? tier.text
            : 'The monsters got you this time. Retry and take revenge!'}
        </span>
      </p>

      <div className="mt-4">
        <div className="flex flex-wrap justify-center gap-2">
          {g.answers.map((ans, i) => {
            const ok = g.run[i] && ans === g.run[i].correctAnswer;
            return (
              <span
                key={i}
                title={`Level ${i + 1}: ${ok ? 'monster defeated' : 'you were hit'}`}
                style={{ animationDelay: `${i * 55}ms` }}
                className={`animate-dot-pop h-3.5 w-3.5 rounded-full ${ok ? 'bg-blood' : 'bg-frost'}`}
              />
            );
          })}
        </div>
        <p className="mt-2 flex items-center justify-center gap-1.5 font-mono text-[0.72rem] tracking-[0.1em] text-dust">
          <Icon name="bolt" className="h-4 w-4 text-gold" /> Screenshot your
          rank and challenge your friends!
        </p>
      </div>

      <button onClick={g.retry} className={`${BTN_PRIMARY} mt-4`}>
        Play Again <Icon name="retry" className="h-5 w-5" />
      </button>
      <a
        href={JOIN_FORM_URL}
        target="_blank"
        rel="noopener"
        className={`${BTN_GHOST} mt-2.5`}
      >
        Join TROSC Community <Icon name="external" className="h-5 w-5" />
      </a>
    </section>
  );
}
