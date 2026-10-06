'use client';

import { useEffect, useRef } from 'react';
import { Icon, HeartIcon } from '@/lib/icons';
import { monsterSVG } from '@/lib/monsters';
import { BTN_PRIMARY } from '@/lib/ui';
import {
  QUESTION_TIME,
  WARN_AT,
  DANGER_AT,
  HEARTS_MAX,
  POWERUP_EVERY,
} from '@/lib/game';

const KEY_TONES = [
  'bg-blood/15 text-blood border-blood/40',
  'bg-gold/15 text-gold border-gold/40',
  'bg-[#B388FF]/15 text-[#C9B0FF] border-[#B388FF]/40',
  'bg-[#4DD0E1]/15 text-[#7FE0EC] border-[#4DD0E1]/40',
];

function Hearts({ hearts, brokeAt, max }) {
  return (
    <div className="flex gap-1.5">
      {Array.from({ length: max }, (_, i) => (
        <span
          key={i}
          className={`h-[18px] w-[18px] ${i < hearts ? 'text-blood' : 'text-[#5A3A44] opacity-50'} ${i === brokeAt ? 'animate-heart-break' : ''}`}
        >
          <HeartIcon className="h-full w-full" />
        </span>
      ))}
    </div>
  );
}

function TimerRow({ remaining, total, warn, danger, frozen, frozenLeft }) {
  const secs = Math.ceil(remaining);
  const color = frozen
    ? 'text-[#7FD8FF]'
    : danger
      ? 'text-blood'
      : warn
        ? 'text-warn'
        : 'text-gold';
  const fill = frozen
    ? 'bg-[#7FD8FF]'
    : danger
      ? 'animate-tpulse bg-blood'
      : warn
        ? 'bg-warn'
        : 'bg-gold';
  return (
    <div className="mb-2 flex shrink-0 items-center gap-2" aria-hidden="true">
      <div className="h-2 flex-1 overflow-hidden rounded-full bg-panel2">
        <div
          className={`h-full rounded-full transition-[width] duration-100 ease-linear ${fill}`}
          style={{ width: frozen ? '100%' : `${(remaining / total) * 100}%` }}
        />
      </div>
      <span
        className={`w-[5rem] text-right font-mono text-[0.9rem] font-bold ${color}`}
      >
        {frozen ? `FROZEN ${Math.ceil(frozenLeft)}s` : `${secs}s`}
      </span>
    </div>
  );
}

function PowerButton({ icon, label, hint, count, disabled, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={`${label} power-up — ${hint}`}
      className={`relative flex min-h-[44px] items-center gap-2.5 rounded-xl border-[1.5px] px-3.5 py-2 text-left transition
        ${
          disabled
            ? 'cursor-default border-edge bg-panel2 text-dust opacity-50'
            : 'animate-usable text-gold shadow-[0_3px_0_#8A6A1E] hover:-translate-y-0.5 active:translate-y-[2px] active:shadow-[0_1px_0_#8A6A1E]'
        }`}
    >
      <Icon name={icon} className="h-5 w-5 shrink-0" />
      <span className="flex flex-col leading-tight">
        <span className="whitespace-nowrap font-mono text-[0.7rem] font-bold tracking-[0.1em]">
          {label}
        </span>
        <span
          className={`hidden text-[0.6rem] md:inline ${disabled ? 'text-dust' : 'text-gold/70'}`}
        >
          {hint}
        </span>
      </span>
      <span className="absolute -right-1.5 -top-1.5 grid h-5 w-5 place-items-center rounded-full bg-gold font-mono text-[0.6rem] font-bold text-[#2B070C]">
        {count}
      </span>
    </button>
  );
}

function NextPowerChip({ combo, every }) {
  const filled = combo % every;
  const dots = '●'.repeat(filled) + '○'.repeat(every - filled);
  const hot = filled === every - 1;
  return (
    <span
      title={`Every ${every} correct answers in a row earn a power-up`}
      aria-label={`Streak ${filled} of ${every} toward the next power-up`}
      className={`inline-flex shrink-0 items-center gap-2 whitespace-nowrap rounded-full py-1.5 pl-1.5 pr-3 font-mono ${hot ? 'bg-gold/12 text-gold' : 'bg-panel2 text-dust'}`}
    >
      <span
        className={`grid h-6 w-6 shrink-0 place-items-center rounded-full ${hot ? 'bg-gold/20' : 'bg-edge/60'}`}
      >
        <Icon
          name="bolt"
          className={`h-3.5 w-3.5 ${hot ? 'animate-icon-glow text-gold' : ''}`}
        />
      </span>
      <span className="text-[0.78rem] tracking-[0.06em]">
        <span className="text-[0.6rem] font-bold tracking-[0.16em] opacity-70">
          NEXT
        </span>{' '}
        <span aria-hidden="true">{dots}</span>
      </span>
    </span>
  );
}

function ShieldChip({ active }) {
  return (
    <span
      title={
        active
          ? 'Shield active — your next mistake is free'
          : 'No shield — earn one with a 3-answer streak'
      }
      className={`inline-flex shrink-0 items-center gap-2 whitespace-nowrap rounded-full py-1.5 pl-1.5 pr-3 font-mono text-[0.78rem] tracking-[0.06em] ${active ? 'bg-gold/12 text-gold' : 'bg-panel2 text-dust opacity-80'}`}
    >
      <span
        className={`grid h-6 w-6 shrink-0 place-items-center rounded-full ${active ? 'bg-gold/20' : 'bg-edge/60'}`}
      >
        <Icon
          name="shield"
          className={`h-3.5 w-3.5 ${active ? 'animate-icon-glow text-gold' : ''}`}
        />
      </span>
      <span>
        <span className="text-[0.6rem] font-bold tracking-[0.16em] opacity-70">
          SHIELD
        </span>{' '}
        {active ? 'ON' : '—'}
      </span>
    </span>
  );
}

function Option({ i, text, correct, chosen, locked, cut, onPick }) {
  const isChosen = chosen === i;
  const isCorrect = i === correct;
  const isCut = cut.includes(i);

  let cls = 'border-edge hover:border-[#5C3542]';
  let keyCls = KEY_TONES[i];
  let state = null;

  if (locked) {
    if (isCorrect && isChosen) {
      cls = 'border-blood bg-blood/10';
      keyCls = 'border-blood bg-blood text-bloodink';
      state = 'yes';
    } else if (isCorrect) {
      cls = 'border-blood';
      keyCls = 'border-blood bg-blood text-bloodink';
      state = 'reveal';
    } else if (isChosen) {
      cls = 'border-frost bg-frost/10';
      keyCls = 'border-frost bg-frost text-frostink';
      state = 'no';
    } else {
      cls = 'border-edge opacity-50';
      keyCls = 'border-edge text-dust';
    }
  } else if (isCut) {
    cls = 'border-edge bg-panel/40 line-through opacity-40';
    keyCls = 'border-edge text-dust';
  }

  return (
    <button
      type="button"
      onClick={onPick}
      disabled={locked || isCut}
      style={{ animationDelay: `${i * 60}ms` }}
      className={`group flex min-h-[58px] w-full items-center gap-3.5 rounded-xl border-[1.5px] bg-panel2 px-4 py-2.5 text-left font-medium leading-snug text-cream transition active:scale-[.97] disabled:cursor-default md:min-h-[70px] animate-opt-in ${cls} ${locked && isChosen ? 'animate-stamp' : ''}`}
    >
      <span
        className={`grid h-[34px] w-[34px] shrink-0 place-items-center rounded-lg border font-mono text-sm font-bold transition-transform group-hover:scale-110 ${keyCls}`}
      >
        {'ABCD'[i]}
      </span>
      <span className="flex-1">{text}</span>
      {state === 'yes' && (
        <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-blood text-bloodink">
          <Icon name="check" className="h-4 w-4" />
        </span>
      )}
      {state === 'no' && (
        <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-frost text-frostink">
          <Icon name="cross" className="h-4 w-4" />
        </span>
      )}
      {state === 'reveal' && (
        <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full border-[1.5px] border-dashed border-blood text-blood">
          <Icon name="check" className="h-4 w-4" />
        </span>
      )}
    </button>
  );
}

export default function BattleScreen({ g }) {
  const { q } = g;
  const chosen = g.locked ? g.answers[g.answers.length - 1] : null;
  const enemyDown = g.monsterPhase === 'hit' || g.monsterPhase === 'dead';
  const lastLevel = g.index === g.total - 1;

  /* the OPTION LIST + report scroll internally — question text is fixed chrome */
  const scrollRef = useRef(null);
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: 0 });
  }, [g.index]);
  useEffect(() => {
    if (g.locked) {
      const el = scrollRef.current;
      el?.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
    }
  }, [g.locked]);

  return (
    <section
      aria-labelledby="question-text"
      className="flex min-h-0 w-full flex-1 animate-screen-in-soft flex-col"
    >
      {/* HUD */}
      <header className="mb-2 shrink-0">
        <div className="mb-1.5 flex items-center justify-between gap-2 pr-12 font-mono text-[0.85rem] tracking-[0.1em] text-dust md:pr-0">
          <span key={`lvl-${g.index}`} className="animate-stamp">
            LEVEL {String(g.index + 1).padStart(2, '0')}/
            {String(g.total).padStart(2, '0')}
          </span>
          {g.combo >= 2 && (
            <span
              key={`combo-${g.combo}`}
              className="animate-stamp inline-flex items-center gap-1 font-bold text-gold"
            >
              <Icon name="flame" className="h-4 w-4" />×{g.combo}
            </span>
          )}
          <span
            key={`xp-${g.xp}`}
            className="animate-stamp font-bold text-gold"
          >
            {g.xp} XP
          </span>
        </div>
        <div
          className="h-2.5 overflow-hidden rounded-full bg-panel2"
          role="progressbar"
          aria-label="Game progress"
          aria-valuemin={0}
          aria-valuemax={g.total}
          aria-valuenow={g.answers.length}
        >
          <div
            className="stripes animate-stripes h-full rounded-full bg-blood shadow-[0_0_14px_rgba(255,70,85,.5)] transition-[width] duration-500"
            style={{ width: `${(g.answers.length / g.total) * 100}%` }}
          />
        </div>
      </header>

      {/* ARENA */}
      <div
        className={`relative mb-2 shrink-0 overflow-hidden rounded-2xl border border-edge bg-panel px-4 pb-3.5 pt-3 ${g.arenaShake ? 'animate-shake' : ''}`}
      >
        <div className="flex items-center gap-3.5">
          <div
            ref={g.spriteRef}
            className={`monster ${g.monster.boss ? 'boss w-20' : 'w-16'} shrink-0 ${g.mood} ${g.monsterPhase !== 'idle' ? g.monsterPhase : ''}`}
            dangerouslySetInnerHTML={{ __html: monsterSVG(g.monster) }}
          />
          <div className="min-w-0 flex-1">
            <div className="mb-1.5 flex items-center gap-2">
              <span className="truncate font-display text-[0.92rem]">
                {g.monster.name}
              </span>
              {g.monster.boss && (
                <span className="shrink-0 rounded-full border border-gold/45 bg-gold/10 px-1.5 py-0.5 font-mono text-[0.56rem] tracking-[0.14em] text-gold">
                  FINAL BOSS
                </span>
              )}
              <span className="ml-auto shrink-0 font-mono text-xs font-bold text-blood">
                {enemyDown ? '0 HP' : g.monster.boss ? '200 HP' : '100 HP'}
              </span>
            </div>
            <div className="h-[9px] overflow-hidden rounded-full bg-panel2">
              <div
                className={`h-full rounded-full bg-blood shadow-[0_0_10px_rgba(255,70,85,.55)] transition-[width] duration-300 ${enemyDown ? '' : 'shimmer'}`}
                style={{ width: enemyDown ? '0%' : '100%' }}
              />
            </div>
          </div>
        </div>

        <div className="mt-2.5 flex items-center gap-2 border-t border-dashed border-edge pt-2.5">
          <span className="font-mono text-[0.6rem] tracking-[0.2em] text-dust">
            YOUR HP
          </span>
          <Hearts hearts={g.hearts} brokeAt={g.brokeAt} max={HEARTS_MAX} />
          {g.shieldActive && (
            <span
              className="ml-auto inline-flex items-center gap-1.5 font-mono text-[0.62rem] font-bold tracking-[0.1em] text-gold"
              title="Shield active — next mistake is free"
            >
              <span className="grid h-5 w-5 place-items-center rounded-full bg-gold/15">
                <Icon name="shield" className="h-3.5 w-3.5 animate-icon-glow" />
              </span>
              ON
            </span>
          )}
        </div>

        {g.statusStamp && (
          <div className="absolute left-1/2 top-[40%] z-10 -translate-x-1/2 -translate-y-1/2">
            <span
              key={g.statusStamp.id}
              className={`animate-stamp block whitespace-nowrap rounded-[10px] px-3.5 py-1 font-display text-base ${g.statusStamp.kind === 'good' ? 'bg-blood text-bloodink' : 'bg-frost text-frostink'}`}
            >
              {g.statusStamp.text}
            </span>
          </div>
        )}
      </div>

      {/* timer + warnings */}
      <TimerRow
        remaining={g.remaining}
        total={QUESTION_TIME}
        warn={g.warn}
        danger={g.danger}
        frozen={g.frozen}
        frozenLeft={g.frozenLeft}
      />
      {g.warn && (
        <p
          role="alert"
          className="animate-cry mb-1.5 shrink-0 text-center font-display text-[clamp(1rem,4.5vw,1.3rem)] text-warn"
        >
          HURRY UP! {WARN_AT} SECONDS LEFT!
        </p>
      )}
      {g.danger && (
        <p
          role="alert"
          className="animate-cry-fast mb-1.5 shrink-0 text-center font-display text-[clamp(1rem,4.5vw,1.3rem)] text-blood"
        >
          DANGER! {Math.ceil(g.remaining)} SECONDS!
        </p>
      )}

      {/* power buttons + stat chips */}
      <div className="mb-2 flex shrink-0 flex-wrap items-center gap-2 md:flex-nowrap">
        <PowerButton
          icon="cut"
          label="50/50"
          hint="cuts 2 wrong"
          count={g.powerups.cut}
          disabled={!g.canCut}
          onClick={g.useCut}
        />
        <PowerButton
          icon="snow"
          label="FREEZE"
          hint="stops the clock"
          count={g.powerups.freeze}
          disabled={!g.canFreeze}
          onClick={g.useFreeze}
        />
        <div className="ml-auto flex flex-nowrap items-center gap-2">
          <NextPowerChip combo={g.combo} every={POWERUP_EVERY} />
          <ShieldChip active={g.shieldActive} />
        </div>
      </div>

      {/* QUESTION — fixed chrome, always visible */}
      <article
        key={g.index}
        className={`shrink-0 animate-card-in rounded-2xl border border-edge bg-panel p-[clamp(0.95rem,3.4vw,1.4rem)] ${g.cardShake ? 'animate-shake' : ''}`}
      >
        <h2
          id="question-text"
          className="text-[clamp(1.15rem,4.6vw,1.5rem)] font-bold leading-snug tracking-tight"
        >
          {q.question}
        </h2>
      </article>

      {/* OPTIONS + battle report — the ONLY scrolling region (thin retro scrollbar) */}
      <div
        ref={scrollRef}
        className="battle-scroll min-h-0 flex-1 overflow-y-auto pt-2.5"
      >
        <div className="grid gap-2 pb-2.5">
          {q.options.map((opt, i) => (
            <Option
              key={i}
              i={i}
              text={opt}
              correct={q.correctAnswer}
              chosen={chosen}
              locked={g.locked}
              cut={g.eliminated}
              onPick={() => g.chooseAnswer(i)}
            />
          ))}
        </div>

        {g.feedback && (
          <div
            role="status"
            aria-live="polite"
            className={`animate-card-in mb-2 rounded-xl border p-3.5 ${g.feedback.ok ? 'border-blood/45 bg-blood/10' : 'border-frost/45 bg-frost/10'}`}
          >
            <div className="flex items-start gap-3">
              <span
                className={`mt-0.5 grid h-[30px] w-[30px] shrink-0 place-items-center rounded-full ${g.feedback.ok ? 'bg-blood text-bloodink' : 'bg-frost text-frostink'}`}
              >
                <Icon
                  name={g.feedback.ok ? 'check' : 'cross'}
                  className="h-4 w-4"
                />
              </span>
              <div>
                <strong className="block text-[1.08rem]">
                  {g.feedback.heading}
                </strong>
                {g.feedback.flavor && (
                  <span
                    className={`mt-0.5 block text-[0.96rem] font-semibold ${g.feedback.ok ? 'text-gold' : 'text-frost'}`}
                  >
                    {g.feedback.flavor}
                  </span>
                )}
                {g.feedback.explain && (
                  <span className="mt-0.5 block text-[0.98rem] text-dust">
                    {g.feedback.explain}
                  </span>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* CTA — always visible */}
      <div className="shrink-0 pb-[calc(0.6rem+env(safe-area-inset-bottom))] pt-2">
        <button
          onClick={g.handleNext}
          disabled={!g.locked}
          className={`${BTN_PRIMARY} ${g.locked ? 'animate-glow' : ''}`}
        >
          {lastLevel ? (
            <>
              <Icon name="trophy" className="h-5 w-5" /> Finish Game
            </>
          ) : (
            <>
              <Icon name="sword" className="h-5 w-5" /> Next Level
            </>
          )}
        </button>
      </div>
    </section>
  );
}
