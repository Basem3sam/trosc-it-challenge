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

const TICKER = `TROSC ✦ SUEZ CANAL UNIVERSITY ✦ TROSC CHALLENGE ✦ ${TOTAL} MONSTERS ✦ POWER-UPS ✦ BEAT YOUR BEST ✦\u00A0`;

const rise = (i) => ({ animationDelay: `${i * 70}ms` });

function HowToPlay({ every, hearts, total }) {
  const [open, setOpen] = useState(false);

  return (
    <div
      className="mt-4 animate-rise-in overflow-hidden rounded-[14px] border border-edge bg-panel"
      style={rise(6)}
    >
      {/* header = real button, clearly interactive, clearly pretty */}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-controls="howto-body"
        className={`flex w-full items-center gap-3 px-4 py-3 text-left transition-colors duration-200 active:scale-[0.99] hover:bg-panel2/50 ${open ? 'bg-panel2/40' : ''}`}
      >
        <span
          className={`grid h-9 w-9 shrink-0 place-items-center rounded-full transition-colors duration-300 ${open ? 'bg-blood text-bloodink' : 'bg-blood/15 text-blood'}`}
        >
          <Icon name="help" className="h-4.5 w-4.5" />
        </span>
        <span className="min-w-0 flex-1 leading-tight">
          <span className="block font-mono text-[0.74rem] font-bold tracking-[0.24em] text-cream">
            HOW TO PLAY
          </span>
          <span className="block text-[0.7rem] text-dust">
            Rules · power-ups · the final boss
          </span>
        </span>
        <span
          aria-hidden="true"
          className={`grid h-7 w-7 shrink-0 place-items-center rounded-full border transition-all duration-300 ${open ? 'rotate-180 border-blood/40 bg-blood/15 text-blood' : 'border-edge text-dust'}`}
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-3.5 w-3.5"
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </span>
      </button>

      {/* animated body — grid-rows 0fr→1fr, works in all modern browsers */}
      <div
        id="howto-body"
        className="grid transition-[grid-template-rows] duration-300 ease-out"
        style={{ gridTemplateRows: open ? '1fr' : '0fr' }}
        role="region"
        aria-label="How to play"
      >
        <div
          className={`min-h-0 overflow-hidden transition-opacity duration-200 ${open ? 'opacity-100' : 'opacity-0'}`}
        >
          <div className="border-t border-dashed border-edge px-4 pb-4 pt-3.5">
            <ul className="grid gap-2.5 text-[0.9rem] text-dust">
              <li className="flex items-center gap-2.5">
                <Icon name="sword" className="h-4 w-4 shrink-0 text-blood" />
                Answer correctly to attack the monster
              </li>
              <li className="flex items-center gap-2.5">
                <Icon name="bolt" className="h-4 w-4 shrink-0 text-gold" />
                <span>
                  Every{' '}
                  <b className="text-cream">{every} correct answers in a row</b>{' '}
                  earn a random POWER-UP
                </span>
              </li>
              <li className="flex items-center gap-2.5">
                <HeartIcon className="h-4 w-4 shrink-0 text-blood" />
                Wrong answers and timeouts cost a heart — you have {hearts}
              </li>
              <li className="flex items-center gap-2.5">
                <Icon name="trophy" className="h-4 w-4 shrink-0 text-gold" />
                Beat all {total} levels — the FINAL BOSS guards the last one
              </li>
            </ul>

            <div className="mt-3 grid grid-cols-3 gap-2 border-t border-dashed border-edge pt-3">
              <div className="rounded-xl border border-edge bg-panel2 p-2.5 text-center">
                <Icon name="cut" className="mx-auto h-4 w-4 text-gold" />
                <p className="mt-1 font-mono text-[0.62rem] font-bold tracking-[0.08em] text-cream">
                  50/50
                </p>
                <p className="mt-0.5 text-[0.68rem] leading-tight text-dust">
                  cuts 2 wrong answers
                </p>
              </div>
              <div className="rounded-xl border border-edge bg-panel2 p-2.5 text-center">
                <Icon name="snow" className="mx-auto h-4 w-4 text-gold" />
                <p className="mt-1 font-mono text-[0.62rem] font-bold tracking-[0.08em] text-cream">
                  FREEZE
                </p>
                <p className="mt-0.5 text-[0.68rem] leading-tight text-dust">
                  stops the clock
                </p>
              </div>
              <div className="rounded-xl border border-edge bg-panel2 p-2.5 text-center">
                <Icon name="shield" className="mx-auto h-4 w-4 text-gold" />
                <p className="mt-1 font-mono text-[0.62rem] font-bold tracking-[0.08em] text-cream">
                  SHIELD
                </p>
                <p className="mt-0.5 text-[0.68rem] leading-tight text-dust">
                  blocks one hit — automatic
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

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
    <section aria-labelledby="welcome-title" className="w-full">
      <div
        className="mb-4 overflow-hidden rounded-full border border-edge bg-panel"
        aria-hidden="true"
      >
        <div className="flex w-max animate-marquee">
          <span className="whitespace-nowrap py-1.5 font-mono text-[0.66rem] tracking-[0.16em] text-dust">
            {TICKER}
          </span>
          <span className="whitespace-nowrap py-1.5 font-mono text-[0.66rem] tracking-[0.16em] text-dust">
            {TICKER}
          </span>
        </div>
      </div>

      <header
        className="mb-4 flex items-center gap-3 animate-rise-in"
        style={rise(0)}
      >
        {logoOk ? (
          <img
            src="/logo.png"
            alt="TROSC logo"
            onError={() => setLogoOk(false)}
            className="h-12 w-12 animate-bob rounded-[14px] border border-edge bg-panel object-contain p-1"
          />
        ) : (
          <span
            aria-hidden="true"
            className="grid h-12 w-12 animate-bob place-items-center rounded-[14px] border border-edge bg-blood/10 font-display text-2xl text-blood"
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

      <div className="relative mb-1 animate-title-in" style={rise(1)}>
        <h1
          id="welcome-title"
          className="font-display text-[clamp(2.6rem,12vw,4.2rem)] leading-[1.02]"
        >
          TROSC
          <br />
          <span className="text-gradient">Challenge</span>
                  <span aria-hidden="true" className="twinkle" style={{ top: "-8px", right: "6%", fontSize: "16px" }}>✦</span>
        <span aria-hidden="true" className="twinkle" style={{ top: "40%", left: "-6px", fontSize: "11px", animationDelay: "1.4s" }}>✦</span>
          <span
            className="ml-1 inline-block h-[0.72em] w-[0.45ch] translate-y-[0.06em] animate-blink bg-blood"
            aria-hidden="true"
          />
        </h1>
        <span
          aria-hidden="true"
          className="mt-2 block h-[3px] w-2/3 rounded-full bg-gradient-to-r from-blood via-gold to-blood bg-[length:200%_100%] [animation:shimmerSweep_2.4s_linear_infinite]"
        />
      </div>
      <p
        className="mb-5 text-[clamp(1rem,4vw,1.2rem)] text-dust animate-rise-in"
        style={rise(2)}
      >
        {TOTAL} monsters. {QUESTION_TIME} seconds each. Slay them all!
      </p>

      <form
        onSubmit={submit}
        noValidate
        className="grid gap-2.5 animate-rise-in"
        style={rise(3)}
      >
        <div className="flex flex-wrap items-baseline justify-between gap-x-2 font-mono">
          <label
            htmlFor="name-input"
            className="text-[0.78rem] tracking-[0.16em] text-dust"
          >
            &gt; PLAYER NAME
          </label>
          {best !== null && (
            <span
              className="ml-auto inline-flex items-center gap-1 text-[0.7rem] font-bold tracking-[0.1em] text-gold"
              title="Your best score on this phone"
            >
              <Icon name="trophy" className="h-3.5 w-3.5" /> YOUR BEST {best}/
              {TOTAL}
            </span>
          )}
        </div>
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
        <button type="submit" className={`${BTN_PRIMARY} animate-glow`}>
          <Icon name="play" className="h-5 w-5" /> Start Game
        </button>
      </form>

      <p
        className="mt-4 flex flex-wrap items-baseline justify-center gap-x-2 gap-y-0.5 text-center font-mono text-[0.58rem] text-dust animate-rise-in sm:flex-nowrap sm:justify-between sm:text-[clamp(0.5rem,2.5vw,0.72rem)]"
        style={rise(4)}
      >
        <span className="whitespace-nowrap">
          NO SIGN-UP · ~3 MIN · {HEARTS_MAX} HEARTS
        </span>
        <span className="whitespace-nowrap">
          EVERY {POWERUP_EVERY} IN A ROW = POWER-UP
        </span>
      </p>

      <HowToPlay every={POWERUP_EVERY} hearts={HEARTS_MAX} total={TOTAL} />

      <div className="animate-rise-in" style={rise(7)}>
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
          className="mt-4 flex flex-col gap-1.5 rounded-[14px] border border-dashed border-edge bg-panel p-3.5 no-underline transition hover:-translate-y-0.5 hover:border-blood"
        >
          <span className="inline-flex w-fit items-center gap-2 font-mono text-[0.66rem] tracking-[0.18em] text-blood">
            <span className="h-2 w-2 animate-live rounded-full bg-blood" />{' '}
            UNDER CONSTRUCTION
          </span>
          <p className="text-[0.92rem] text-dust">
            The official <strong className="text-cream">TROSC website</strong>{' '}
            is being built at{' '}
            <span className="font-mono text-blood">trosc.vercel.app</span> — tap
            to peek!
          </p>
        </a>
      </div>
    </section>
  );
}
