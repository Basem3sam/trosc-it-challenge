'use client';

import { useState } from 'react';
import { Icon, HeartIcon } from '@/lib/icons';
import { BTN_PRIMARY, BTN_GHOST, INPUT } from '@/lib/ui';
import {
  TOTAL,
  QUESTION_TIME,
  HEARTS_MAX,
  POWERUP_EVERY,
  JOIN_FORM_URL,
  SITE_URL,
} from '@/lib/game';

const TICKER = `TROSC ✦ SUEZ CANAL UNIVERSITY ✦ IT CHALLENGE ✦ ${TOTAL} MONSTERS ✦ POWER-UPS ✦ BEAT YOUR BEST ✦\u00A0`;

export default function WelcomeScreen({ best, onStart }) {
  const [name, setName] = useState('');
  const [showError, setShowError] = useState(false);
  const [invalid, setInvalid] = useState(false);
  const [logoOk, setLogoOk] = useState(true);

  const submit = (e) => {
    e.preventDefault();
    const n = name.trim();
    if (!n) {
      setShowError(true);
      setInvalid(true);
      return;
    }
    onStart(n);
  };

  return (
    <section
      aria-labelledby="welcome-title"
      className="m-auto w-full animate-screen-in"
    >
      {/* ticker */}
      <div
        className="mb-5 overflow-hidden rounded-full border border-edge bg-panel"
        aria-hidden="true"
      >
        <div className="flex w-max animate-marquee">
          <span className="whitespace-nowrap py-2 font-mono text-[0.66rem] tracking-[0.16em] text-dust">
            {TICKER}
          </span>
          <span className="whitespace-nowrap py-2 font-mono text-[0.66rem] tracking-[0.16em] text-dust">
            {TICKER}
          </span>
        </div>
      </div>

      {/* brand */}
      <header className="mb-6 flex items-center gap-3">
        {logoOk ? (
          <img
            src="/logo.png"
            alt="TROSC logo"
            onError={() => setLogoOk(false)}
            className="h-[52px] w-[52px] rounded-[14px] border border-edge bg-panel object-contain p-1"
          />
        ) : (
          <span
            aria-hidden="true"
            className="grid h-[52px] w-[52px] place-items-center rounded-[14px] border border-edge bg-blood/10 font-display text-2xl text-blood"
          >
            T
          </span>
        )}
        <div className="flex flex-col leading-tight">
          <span className="font-display text-lg">TROSC</span>
          <span className="font-mono text-[0.6rem] tracking-[0.22em] text-dust">
            SUEZ CANAL UNIVERSITY
          </span>
        </div>
        <span className="ml-auto rounded-full border border-edge bg-panel px-3 py-1.5 font-mono text-[0.6rem] tracking-[0.18em] text-blood">
          IT TEAM
        </span>
      </header>

      <h1
        id="welcome-title"
        className="mb-3 font-display text-[clamp(2.5rem,13vw,4rem)] leading-[1.05]"
      >
        IT
        <br />
        <span className="text-gradient">Challenge</span>
        <span
          className="ml-1 inline-block h-[0.72em] w-[0.45ch] translate-y-[0.06em] animate-blink bg-blood"
          aria-hidden="true"
        />
      </h1>
      <p className="mb-7 text-[clamp(1.05rem,4.2vw,1.25rem)] text-dust">
        {TOTAL} monsters. {QUESTION_TIME} seconds each. Slay them all!
      </p>

      <form onSubmit={submit} noValidate className="grid gap-2.5">
        <label
          htmlFor="name-input"
          className="block font-mono text-[0.78rem] tracking-[0.16em] text-dust"
        >
          &gt; PLAYER NAME
        </label>
        <input
          id="name-input"
          type="text"
          value={name}
          maxLength={24}
          autoComplete="off"
          autoCapitalize="words"
          enterKeyHint="go"
          placeholder="e.g. Mahmoud"
          onChange={(e) => {
            setName(e.target.value);
            setShowError(false);
            setInvalid(false);
          }}
          onAnimationEnd={() => setInvalid(false)}
          className={`${INPUT} ${invalid ? 'animate-shake border-gold' : ''}`}
        />
        {showError && (
          <p
            role="alert"
            className="flex items-center gap-2 text-[0.95rem] text-gold"
          >
            <Icon name="alert" className="h-4 w-4" /> Enter a name to play.
          </p>
        )}
        <button type="submit" className={`${BTN_PRIMARY} mt-2 animate-glow`}>
          <Icon name="play" className="h-5 w-5" /> Start Game
        </button>
      </form>

      <p className="mt-5 font-mono text-[0.7rem] tracking-[0.14em] text-dust">
        NO SIGN-UP · ~3 MIN · {HEARTS_MAX} HEARTS — DON&apos;T LOSE THEM ALL
      </p>

      {best !== null && (
        <p className="mt-3 inline-flex w-fit items-center gap-2 rounded-full border border-gold/35 bg-gold/10 px-3.5 py-2 font-mono text-[0.72rem] tracking-[0.14em] text-gold">
          <Icon name="trophy" className="h-4 w-4" /> YOUR BEST: {best}/{TOTAL}
        </p>
      )}

      {/* how to play */}
      <div className="mt-5 rounded-[14px] border border-edge bg-panel p-4">
        <p className="mb-2.5 font-mono text-[0.66rem] tracking-[0.2em] text-dust">
          HOW TO PLAY
        </p>
        <ul className="grid gap-2 text-[0.9rem] text-dust">
          <li className="flex items-center gap-2.5">
            <Icon name="sword" className="h-4 w-4 shrink-0 text-blood" />
            Answer correctly to attack — every {POWERUP_EVERY}rd correct earns a
            POWER-UP
          </li>
          <li className="flex items-center gap-2.5">
            <HeartIcon className="h-4 w-4 shrink-0 text-blood" />
            Wrong answers and timeouts cost a heart — you have {HEARTS_MAX}
          </li>
          <li className="flex items-center gap-2.5">
            <Icon name="snow" className="h-4 w-4 shrink-0 text-gold" />
            Use 50/50 and FREEZE wisely… the boss is waiting at the end
          </li>
        </ul>
      </div>

      <a
        href={JOIN_FORM_URL}
        target="_blank"
        rel="noopener"
        className={`${BTN_GHOST} mt-4`}
      >
        Join TROSC Community <Icon name="external" className="h-5 w-5" />
      </a>

      <a
        href={SITE_URL}
        target="_blank"
        rel="noopener"
        aria-label="TROSC website — under construction"
        className="mt-5 flex flex-col gap-2 rounded-[14px] border border-dashed border-edge bg-panel p-4 no-underline transition hover:-translate-y-0.5 hover:border-blood"
      >
        <span className="inline-flex w-fit items-center gap-2 font-mono text-[0.66rem] tracking-[0.18em] text-blood">
          <span className="h-2 w-2 animate-live rounded-full bg-blood" /> UNDER
          CONSTRUCTION
        </span>
        <p className="text-[0.95rem] text-dust">
          The official <strong className="text-cream">TROSC website</strong> is
          being built right now at{' '}
          <span className="font-mono text-blood">trosc.vercel.app</span> — tap
          to peek!
        </p>
      </a>
    </section>
  );
}
