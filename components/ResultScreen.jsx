"use client";

import { useEffect, useState } from "react";
import { Icon } from "@/lib/icons";
import { BTN_PRIMARY, BTN_GHOST } from "@/lib/ui";
import { JOIN_FORM_URL, tierFor } from "@/lib/game";

function ScoreRing({ pct, reduced }) {
  const C = 2 * Math.PI * 52;
  const [val, setVal] = useState(0);

  useEffect(() => {
    if (reduced) { setVal(pct); return; }
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
    <div role="img" aria-label={`Accuracy ${Math.round(val)} percent`}
      className="relative mx-auto mb-4 w-[clamp(180px,58vw,230px)]">
      <svg viewBox="0 0 120 120" className="-rotate-90 block h-auto w-full" aria-hidden="true">
        <circle cx="60" cy="60" r="52" fill="none" stroke="var(--color-panel2)" strokeWidth="9" />
        <circle cx="60" cy="60" r="52" fill="none" stroke="var(--color-blood)" strokeWidth="9" strokeLinecap="round"
          strokeDasharray={C} strokeDashoffset={C * (1 - val / 100)} />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-[clamp(2.2rem,9vw,2.9rem)] font-bold tracking-tight">{Math.round(val)}%</span>
        <span className="font-mono text-[0.7rem] tracking-[0.25em] text-dust">ACCURACY</span>
      </div>
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div className="rounded-xl border border-edge bg-panel px-2 py-2.5">
      <p className="font-mono text-[0.58rem] tracking-[0.14em] text-dust">{label}</p>
      <p className="font-display text-lg text-cream">{value}</p>
    </div>
  );
}

export default function ResultScreen({ g }) {
  const won = g.result.outcome === "won";
  const { attempted, pct, by, stats, badges } = g.result;
  const tier = won ? tierFor(g.score) : null;

  return (
    <section aria-labelledby="result-kicker" className="m-auto w-full animate-screen-in text-center">
      <p id="result-kicker"
        className={`mb-2 font-mono text-[0.85rem] tracking-[0.22em] text-blood ${won ? "" : "animate-blink"}`}>
        {won ? "GAME COMPLETE!" : "GAME OVER"}
      </p>
      <h2 className="mb-4 text-[clamp(2rem,9vw,2.8rem)] font-bold tracking-tight">{g.name}</h2>

      {!won && (
        <p className="-mt-2 mb-5 flex items-center justify-center gap-2 text-base font-semibold text-blood">
          <Icon name="skull" className="h-5 w-5" />
          <span>Defeated by <b>{by}</b> at Level {attempted}!</span>
        </p>
      )}

      <ScoreRing pct={pct} reduced={g.reduced} />
      <p className="font-mono text-[0.95rem] tracking-[0.12em] text-dust">{g.score} / {attempted} CORRECT</p>
      <p className="mb-5 mt-1 font-mono text-base font-bold tracking-[0.1em] text-gold">{g.xp} XP EARNED</p>

      {/* run stats */}
      {stats && (
        <div className="mx-auto mb-5 grid w-full max-w-[280px] grid-cols-3 gap-2">
          <Stat label="MAX COMBO" value={`×${stats.longestCombo}`} />
          <Stat label="FASTEST" value={stats.fastest !== null ? `${stats.fastest.toFixed(1)}s` : "—"} />
          <Stat label="AVG" value={stats.avg !== null ? `${stats.avg.toFixed(1)}s` : "—"} />
        </div>
      )}

      {won && g.result.record && (
        <p className="animate-stamp mx-auto mb-3 w-fit rounded-full bg-blood px-4 py-2 font-mono text-[0.75rem] font-bold tracking-[0.16em] text-bloodink">
          NEW PERSONAL BEST!
        </p>
      )}

      {/* badges */}
      {badges && badges.length > 0 && (
        <div className="mb-4 flex flex-wrap justify-center gap-2">
          {badges.map((b) => (
            <span key={b.label}
              className="inline-flex items-center gap-1.5 rounded-full border border-gold/40 bg-gold/10 px-3 py-1 font-mono text-[0.66rem] tracking-[0.12em] text-gold">
              <Icon name={b.icon} className="h-3.5 w-3.5" /> {b.label}
            </span>
          ))}
        </div>
      )}

      <p className={`mx-auto mb-5 flex w-fit items-center gap-2 rounded-full border px-4 py-2 font-mono text-[0.78rem] tracking-[0.14em] ${won ? "animate-rank-in border-gold/45 bg-gold/10 text-gold" : "border-blood/45 bg-blood/10 text-blood"}`}>
        {won ? (
          <><Icon name="trophy" className="h-4 w-4" /><b className="font-display text-xl">{tier.rank}</b><span>RANK · {tier.title}</span></>
        ) : (
          <><Icon name="skull" className="h-4 w-4" /><b className="font-display text-xl">F</b><span>RANK · DEFEATED</span></>
        )}
      </p>

      <p className="mx-auto mb-6 flex w-fit items-center gap-2.5 rounded-[18px] border border-edge bg-panel px-5 py-3.5 text-left text-[1.12rem] font-semibold">
        <Icon name={won ? tier.icon : "skull"} className="h-5 w-5 text-blood" />
        <span>{won ? tier.text : "The monsters got you this time. Retry and take revenge!"}</span>
      </p>

      {/* per-level recap — graded against this run's shuffled questions */}
      <div className="mb-6">
        <p className="mb-2.5 font-mono text-[0.7rem] tracking-[0.22em] text-dust">YOUR RUN</p>
        <div className="flex flex-wrap justify-center gap-2">
          {g.answers.map((ans, i) => {
            const ok = g.run[i] && ans === g.run[i].correctAnswer;
            return (
              <span key={i} title={`Level ${i + 1}: ${ok ? "monster defeated" : "you were hit"}`}
                className={`h-4 w-4 rounded-full ${ok ? "bg-blood" : "bg-frost"}`} />
            );
          })}
        </div>
        <p className="mt-3 flex items-center justify-center gap-1.5 font-mono text-[0.7rem] tracking-[0.1em] text-dust">
          <Icon name="bolt" className="h-4 w-4 text-gold" /> Screenshot your rank and challenge your friends!
        </p>
      </div>

      <button onClick={g.retry} className={BTN_PRIMARY}>
        Play Again <Icon name="retry" className="h-5 w-5" />
      </button>
      <a href={JOIN_FORM_URL} target="_blank" rel="noopener" className={`${BTN_GHOST} mt-3`}>
        Join TROSC Community <Icon name="external" className="h-5 w-5" />
      </a>
    </section>
  );
}