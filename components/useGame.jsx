'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { ENEMIES, BOSS } from '@/lib/monsters';
import {
  sfx,
  buzz,
  setMuted,
  startMusic,
  stopMusic,
  setMusicDanger,
  setMusicBoss,
  spawnSting,
  startHeartbeat,
  stopHeartbeat,
} from '@/lib/sounds';
import { celebrate, sadRain } from '@/lib/fx';
import {
  TOTAL,
  QUESTION_TIME,
  WARN_AT,
  DANGER_AT,
  HEARTS_MAX,
  FREEZE_TIME,
  POWERUP_EVERY,
  POWERUP_CAP,
  MUTE_KEY,
  loadProgress,
  saveProgress,
  clearProgress,
  loadBest,
  saveBest,
  scoreFromAnswers,
  tierFor,
  badgeList,
  shuffleRun,
  isValidRun,
  VICTORY,
  TAUNTS,
  COMBO_CALLOUTS,
  pick,
} from '@/lib/game';

const FX_COLORS = ['#FF4655', '#FFC53D', '#FDEFEF', '#FF8A9B'];

export default function useGame() {
  /* ---------- screens & run state ---------- */
  const [screen, setScreen] = useState('welcome'); // welcome | battle | result
  const [name, setName] = useState('');
  const [run, setRun] = useState([]); // shuffled questions for this run
  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [xp, setXp] = useState(0);
  const [combo, setCombo] = useState(0);
  const [longestCombo, setLongestCombo] = useState(0);
  const [hearts, setHearts] = useState(HEARTS_MAX);
  const [brokeAt, setBrokeAt] = useState(-1);
  const [answers, setAnswers] = useState([]);
  const [answerTimes, setAnswerTimes] = useState([]);
  const [locked, setLocked] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [result, setResult] = useState(null); // { outcome, attempted, pct, by?, stats, badges, record }
  const [best, setBest] = useState(null);

  /* ---------- power-ups ---------- */
  const [powerups, setPowerups] = useState({ cut: 1, freeze: 1 });
  const [shieldActive, setShieldActive] = useState(false);
  const [eliminated, setEliminated] = useState([]);
  const [frozen, setFrozen] = useState(false);
  const [frozenLeft, setFrozenLeft] = useState(0);

  /* ---------- battle visuals ---------- */
  const [remaining, setRemaining] = useState(QUESTION_TIME);
  const [countdownStep, setCountdownStep] = useState(null);
  const [intro, setIntro] = useState(null);
  const [flash, setFlash] = useState(0);
  const [monsterPhase, setMonsterPhase] = useState('idle');
  const [statusStamp, setStatusStamp] = useState(null);
  const [arenaShake, setArenaShake] = useState(false);
  const [cardShake, setCardShake] = useState(false);

  /* ---------- fx layers ---------- */
  const [bursts, setBursts] = useState([]);
  const [floats, setFloats] = useState([]);
  const [vignette, setVignette] = useState(false);
  const [toastMsg, setToastMsg] = useState(null);

  /* ---------- prefs ---------- */
  const [muted, setMutedState] = useState(false);
  const [reduced, setReduced] = useState(false);

  /* ---------- refs ---------- */
  const spriteRef = useRef(null);
  const remainingRef = useRef(QUESTION_TIME);
  const lastWholeRef = useRef(QUESTION_TIME);
  const warnedRef = useRef({ w15: false, w5: false });
  const lockedRef = useRef(false);
  const introRef = useRef(false);
  const frozenRef = useRef(false);
  const frozenLeftRef = useRef(0);
  const timeoutsRef = useRef(new Set());
  const fxId = useRef(0);
  const bestRef = useRef(null);
  const reducedRef = useRef(false);
  const hydratedRef = useRef(false);
  const toastTimerRef = useRef(null);
  const handleTimeoutRef = useRef(() => {});
  const gameOverRef = useRef(() => {});

  /* ---------- tiny helpers ---------- */
  const later = useCallback((fn, ms) => {
    const id = setTimeout(() => {
      timeoutsRef.current.delete(id);
      fn();
    }, ms);
    timeoutsRef.current.add(id);
  }, []);

  const clearLater = useCallback(() => {
    timeoutsRef.current.forEach(clearTimeout);
    timeoutsRef.current.clear();
  }, []);

  useEffect(() => () => clearLater(), [clearLater]);

  const toast = useCallback((msg) => {
    setToastMsg(msg);
    clearTimeout(toastTimerRef.current);
    toastTimerRef.current = setTimeout(() => setToastMsg(null), 2600);
  }, []);

  /* ---------- fx ---------- */
  const addBurst = useCallback(
    (x, y) => {
      if (reducedRef.current) return;
      const id = ++fxId.current;
      const parts = Array.from({ length: 14 }, (_, i) => {
        const angle = Math.random() * Math.PI * 2;
        const dist = 40 + Math.random() * 55;
        return {
          dx: Math.cos(angle) * dist,
          dy: Math.sin(angle) * dist,
          color: FX_COLORS[i % FX_COLORS.length],
        };
      });
      setBursts((b) => [...b, { id, x, y, parts }]);
      later(() => setBursts((b) => b.filter((p) => p.id !== id)), 800);
    },
    [later],
  );

  const addFloat = useCallback(
    (x, y, text) => {
      if (reducedRef.current) return;
      const id = ++fxId.current;
      setFloats((f) => [...f, { id, x, y, text }]);
      later(() => setFloats((f) => f.filter((p) => p.id !== id)), 950);
    },
    [later],
  );

  const flashVignette = useCallback(() => {
    if (reducedRef.current) return;
    setVignette(true);
    later(() => setVignette(false), 500);
  }, [later]);

  const hitFlash = useCallback(() => {
    if (reducedRef.current) return;
    setFlash(++fxId.current);
    later(() => setFlash(0), 250);
  }, [later]);

  const spawnStatus = useCallback(
    (text, kind) => {
      setStatusStamp({ text, kind, id: ++fxId.current });
      later(() => setStatusStamp(null), 950);
    },
    [later],
  );

  /* ---------- power-ups ---------- */
  const grantPowerup = useCallback(() => {
    const kind = pick(['cut', 'freeze', 'shield']);
    sfx.powerup();
    buzz(15);
    if (kind === 'shield') {
      setShieldActive(true);
      toast('SHIELD UP — your next mistake is free!');
    } else {
      setPowerups((p) => ({
        ...p,
        [kind]: Math.min(POWERUP_CAP, p[kind] + 1),
      }));
      toast(
        kind === 'cut'
          ? 'POWER-UP: 50/50 — cut two wrong answers'
          : 'POWER-UP: FREEZE — stop the clock',
      );
    }
  }, [toast]);

  const useCut = useCallback(() => {
    if (lockedRef.current || introRef.current || countdownStep !== null) return;
    if (powerups.cut <= 0 || eliminated.length > 0) return;
    const q = run[index];
    if (!q) return;
    const wrongs = [0, 1, 2, 3].filter((i) => i !== q.correctAnswer);
    const cut = wrongs.sort(() => Math.random() - 0.5).slice(0, 2);
    setEliminated(cut);
    setPowerups((p) => ({ ...p, cut: p.cut - 1 }));
    sfx.cut();
    buzz(15);
    toast('50/50 — two wrong answers cut!');
  }, [powerups, eliminated, run, index, countdownStep, toast]);

  const useFreeze = useCallback(() => {
    if (lockedRef.current || introRef.current || countdownStep !== null) return;
    if (powerups.freeze <= 0) return;
    setPowerups((p) => ({ ...p, freeze: p.freeze - 1 }));
    frozenLeftRef.current = Math.min(
      15,
      (frozenRef.current ? frozenLeftRef.current : 0) + FREEZE_TIME,
    );
    frozenRef.current = true;
    setFrozen(true);
    setFrozenLeft(frozenLeftRef.current);
    sfx.freeze();
    buzz([10, 30, 10]);
    toast('TIME FROZEN!');
  }, [powerups, countdownStep, toast]);

  /* ---------- run lifecycle ---------- */
  const winGame = useCallback(() => {
    clearProgress();
    const tier = tierFor(score);
    const okTimes = answerTimes.filter((a) => a.ok).map((a) => a.t);
    const allTimes = answerTimes.map((a) => a.t);
    const stats = {
      longestCombo,
      fastest: okTimes.length ? Math.min(...okTimes) : null,
      avg: allTimes.length
        ? allTimes.reduce((s, t) => s + t, 0) / allTimes.length
        : null,
    };
    const badges = badgeList({
      score,
      total: TOTAL,
      longestCombo,
      fastest: stats.fastest,
      heartsLeft: hearts,
    });
    const isRecord = bestRef.current === null || score > bestRef.current;
    if (isRecord) {
      saveBest(score);
      bestRef.current = score;
      setBest(score);
    }

    setResult({
      outcome: 'won',
      attempted: TOTAL,
      pct: Math.round((score / TOTAL) * 100),
      stats,
      badges,
      record: isRecord,
    });
    setScreen('result');
    sfx.finish();
    buzz([30, 40, 30, 40, 80]);
    celebrate(tier.rank);
  }, [score, answerTimes, longestCombo, hearts]);

  const gameOver = useCallback(
    (by) => {
      clearProgress();
      const attempted = Math.max(1, answers.length);
      const times = answerTimes.map((a) => a.t);
      const stats = {
        longestCombo,
        fastest: null,
        avg: times.length
          ? times.reduce((s, t) => s + t, 0) / times.length
          : null,
      };
      setResult({
        outcome: 'lost',
        attempted,
        pct: Math.round((score / attempted) * 100),
        by,
        stats,
        badges: [],
        record: false,
      });
      setScreen('result');
      sfx.gameOver();
      buzz([200, 100, 200, 100, 300]);
      sadRain();
    },
    [answers.length, answerTimes, longestCombo, score],
  );

  useEffect(() => {
    handleTimeoutRef.current = handleTimeout;
  });
  useEffect(() => {
    gameOverRef.current = gameOver;
  });

  const runCountdown = useCallback(
    (done) => {
      if (reducedRef.current) {
        done();
        return;
      }
      const steps = ['3', '2', '1', 'FIGHT!'];
      steps.forEach((s, i) =>
        later(() => {
          setCountdownStep(s);
          s === 'FIGHT!' ? sfx.go() : sfx.blip();
        }, i * 700),
      );
      later(() => {
        setCountdownStep(null);
        done();
      }, steps.length * 700);
    },
    [later],
  );

  /* ---------- level intro: "MONSTER APPEARS!" + that monster's spawn sting ---------- */
  const showIntro = useCallback(
    (monster) => {
      introRef.current = true;
      setIntro({ id: ++fxId.current });
      spawnSting(monster);
      later(() => {
        introRef.current = false;
        setIntro(null);
      }, 1400);
    },
    [later],
  );

  const startGame = useCallback(
    (nm) => {
      clearLater();
      clearTimeout(toastTimerRef.current);
      lockedRef.current = false;
      introRef.current = false;
      frozenRef.current = false;
      frozenLeftRef.current = 0;
      const freshRun = shuffleRun();

      setName(nm);
      setRun(freshRun);
      setIndex(0);
      setScore(0);
      setXp(0);
      setCombo(0);
      setLongestCombo(0);
      setHearts(HEARTS_MAX);
      setBrokeAt(-1);
      setAnswers([]);
      setAnswerTimes([]);
      setLocked(false);
      setFeedback(null);
      setPowerups({ cut: 1, freeze: 1 });
      setShieldActive(false);
      setEliminated([]);
      setFrozen(false);
      setFrozenLeft(0);
      setMonsterPhase('idle');
      setStatusStamp(null);
      setArenaShake(false);
      setCardShake(false);
      setBursts([]);
      setFloats([]);
      setVignette(false);
      setResult(null);
      setToastMsg(null);
      setCountdownStep(null);
      setIntro(null);
      setFlash(0);

      saveProgress({
        name: nm,
        answers: [],
        xp: 0,
        combo: 0,
        hearts: HEARTS_MAX,
        run: freshRun,
        powerups: { cut: 1, freeze: 1 },
        shield: false,
      });
      setScreen('battle');
      // level 1: FIGHT! → first monster's intro card (index 0 → ENEMIES[0])
      runCountdown(() => showIntro(ENEMIES[0]));
    },
    [clearLater, runCountdown, showIntro],
  );

  const retry = useCallback(() => {
    clearLater();
    clearTimeout(toastTimerRef.current);
    lockedRef.current = false;
    introRef.current = false;
    frozenRef.current = false;
    frozenLeftRef.current = 0;
    setIndex(0);
    setScore(0);
    setXp(0);
    setCombo(0);
    setLongestCombo(0);
    setHearts(HEARTS_MAX);
    setBrokeAt(-1);
    setAnswers([]);
    setAnswerTimes([]);
    setLocked(false);
    setFeedback(null);
    setPowerups({ cut: 1, freeze: 1 });
    setShieldActive(false);
    setEliminated([]);
    setFrozen(false);
    setFrozenLeft(0);
    setMonsterPhase('idle');
    setStatusStamp(null);
    setArenaShake(false);
    setCardShake(false);
    setBursts([]);
    setFloats([]);
    setVignette(false);
    setResult(null);
    setToastMsg(null);
    setCountdownStep(null);
    setIntro(null);
    setFlash(0);
    clearProgress();
    setScreen('welcome');
  }, [clearLater]);

  /* ---------- answering ---------- */
  const chooseAnswer = useCallback(
    (choiceIndex) => {
      if (lockedRef.current || introRef.current || countdownStep !== null)
        return;
      lockedRef.current = true;
      setLocked(true);

      const q = run[index];
      const monster =
        index === TOTAL - 1 ? BOSS : ENEMIES[index % ENEMIES.length];
      const correct = choiceIndex === q.correctAnswer;
      const spent =
        Math.round((QUESTION_TIME - remainingRef.current) * 10) / 10;
      const nextAnswers = [...answers, choiceIndex];
      const nextTimes = [...answerTimes, { t: spent, ok: correct }];
      setAnswers(nextAnswers);
      setAnswerTimes(nextTimes);

      if (correct) {
        const nextCombo = combo + 1;
        const speedBonus = Math.round(
          (remainingRef.current / QUESTION_TIME) * 50,
        );
        const streakBonus = Math.min(nextCombo - 1, 4) * 25;
        const gained = 100 + speedBonus + streakBonus;

        setCombo(nextCombo);
        setLongestCombo((c) => Math.max(c, nextCombo));
        setScore(score + 1);
        setXp(xp + gained);

        // slay the monster
        setMonsterPhase('hit');
        sfx.hit();
        later(() => {
          setMonsterPhase('dead');
          sfx.die();
        }, 200);
        const el = spriteRef.current;
        if (el) {
          const r = el.getBoundingClientRect();
          addBurst(r.left + r.width / 2, r.top + r.height / 2);
          addFloat(r.left + r.width / 2, r.top + r.height / 2, `-${gained}`);
        }
        spawnStatus('DEFEATED!', 'good');
        setArenaShake(true);
        later(() => setArenaShake(false), 400);
        hitFlash();
        sfx.correct();
        buzz(25);

        const crit = speedBonus >= 33;
        let flavor = `${crit ? 'CRITICAL HIT! ' : ''}${pick(VICTORY)} ${monster.name} is defeated!`;
        if (nextCombo >= 2) flavor += ` COMBO ×${nextCombo}!`;
        if (nextCombo % POWERUP_EVERY === 0) {
          grantPowerup();
          flavor += ' POWER-UP EARNED!';
        }
        setFeedback({
          ok: true,
          heading: `Correct! +${gained} XP`,
          flavor,
          explain: q.explanation,
        });

        const callout = COMBO_CALLOUTS[nextCombo];
        if (callout) toast(callout);

        saveProgress({
          name,
          answers: nextAnswers,
          xp: xp + gained,
          combo: nextCombo,
          hearts,
          run,
          powerups,
          shield: shieldActive,
        });
      } else {
        setCombo(0);
        setMonsterPhase('attack');
        sfx.attack();
        later(() => setMonsterPhase('idle'), 500);
        setCardShake(true);
        later(() => setCardShake(false), 400);

        if (shieldActive) {
          setShieldActive(false);
          spawnStatus('BLOCKED!', 'good');
          sfx.block();
          buzz(20);
          setFeedback({
            ok: false,
            heading: 'Not quite!',
            flavor: 'Your SHIELD absorbed the hit — no heart lost!',
            explain: q.explanation,
          });
          saveProgress({
            name,
            answers: nextAnswers,
            xp,
            combo: 0,
            hearts,
            run,
            powerups,
            shield: false,
          });
        } else {
          spawnStatus('ENEMY STRIKES!', 'bad');
          sfx.wrong();
          buzz([60, 40, 60]);
          flashVignette();
          setFeedback({
            ok: false,
            heading: 'Not quite!',
            flavor: `"${pick(TAUNTS)}" — ${monster.name}`,
            explain: q.explanation,
          });

          const nextHearts = Math.max(0, hearts - 1);
          setHearts(nextHearts);
          setBrokeAt(nextHearts);
          later(() => setBrokeAt(-1), 600);
          sfx.heart();
          saveProgress({
            name,
            answers: nextAnswers,
            xp,
            combo: 0,
            hearts: nextHearts,
            run,
            powerups,
            shield: false,
          });

          if (nextHearts <= 0) {
            later(() => gameOverRef.current(monster.name), 1000);
            return;
          }
        }
      }
    },
    [
      run,
      index,
      answers,
      answerTimes,
      combo,
      score,
      xp,
      hearts,
      name,
      countdownStep,
      powerups,
      shieldActive,
      later,
      addBurst,
      addFloat,
      spawnStatus,
      flashVignette,
      hitFlash,
      grantPowerup,
      toast,
    ],
  );

  const handleTimeout = useCallback(() => {
    if (lockedRef.current || introRef.current || countdownStep !== null) return;
    lockedRef.current = true;
    setLocked(true);

    const q = run[index];
    const monster =
      index === TOTAL - 1 ? BOSS : ENEMIES[index % ENEMIES.length];
    const nextAnswers = [...answers, -1];
    setAnswers(nextAnswers);
    setCombo(0);

    setMonsterPhase('attack');
    sfx.attack();
    later(() => setMonsterPhase('idle'), 500);
    setCardShake(true);
    later(() => setCardShake(false), 400);

    if (shieldActive) {
      setShieldActive(false);
      spawnStatus('BLOCKED!', 'good');
      sfx.block();
      buzz(20);
      setFeedback({
        ok: false,
        heading: "Time's up!",
        flavor: 'Your SHIELD absorbed it — no heart lost!',
        explain: q.explanation,
      });
      saveProgress({
        name,
        answers: nextAnswers,
        xp,
        combo: 0,
        hearts,
        run,
        powerups,
        shield: false,
      });
    } else {
      spawnStatus("TIME'S UP!", 'bad');
      sfx.timeUp();
      buzz([60, 40, 60]);
      flashVignette();
      setFeedback({
        ok: false,
        heading: "Time's up!",
        flavor: `"${pick(TAUNTS)}" — ${monster.name}`,
        explain: q.explanation,
      });

      const nextHearts = Math.max(0, hearts - 1);
      setHearts(nextHearts);
      setBrokeAt(nextHearts);
      later(() => setBrokeAt(-1), 600);
      saveProgress({
        name,
        answers: nextAnswers,
        xp,
        combo: 0,
        hearts: nextHearts,
        run,
        powerups,
        shield: false,
      });

      if (nextHearts <= 0) later(() => gameOverRef.current(monster.name), 1000);
    }
  }, [
    run,
    index,
    answers,
    xp,
    hearts,
    name,
    countdownStep,
    powerups,
    shieldActive,
    later,
    flashVignette,
  ]);

  const handleNext = useCallback(() => {
    if (!lockedRef.current) return;
    if (index === TOTAL - 1) {
      winGame();
      return;
    }
    lockedRef.current = false;
    setLocked(false);
    const next = index + 1;
    setIndex(next);
    setFeedback(null);
    setMonsterPhase('idle');
    setStatusStamp(null);
    setEliminated([]);
    setBrokeAt(-1);
    // every level after the first gets its own intro card + spawn sting
    if (next > 0) {
      const nextMonster =
        next === TOTAL - 1 ? BOSS : ENEMIES[next % ENEMIES.length];
      showIntro(nextMonster);
    }
  }, [index, winGame, showIntro]);

  const toggleMute = useCallback(() => {
    const next = !muted;
    setMutedState(next);
    setMuted(next);
    try {
      localStorage.setItem(MUTE_KEY, next ? '1' : '0');
    } catch (_) {}
    if (!next) sfx.on();
  }, [muted]);

  /* ---------- per-question timer (pauses when hidden; respects Freeze) ---------- */
  useEffect(() => {
    if (
      screen !== 'battle' ||
      lockedRef.current ||
      countdownStep !== null ||
      intro
    )
      return;
    remainingRef.current = QUESTION_TIME;
    lastWholeRef.current = QUESTION_TIME;
    warnedRef.current = { w15: false, w5: false };
    frozenRef.current = false;
    frozenLeftRef.current = 0;
    setRemaining(QUESTION_TIME);
    setFrozen(false);
    setFrozenLeft(0);

    const id = setInterval(() => {
      if (document.hidden) return;
      if (frozenRef.current) {
        frozenLeftRef.current = Math.max(0, frozenLeftRef.current - 0.1);
        setFrozenLeft(frozenLeftRef.current);
        if (frozenLeftRef.current <= 0) {
          frozenRef.current = false;
          setFrozen(false);
        }
        return;
      }
      remainingRef.current = Math.max(0, remainingRef.current - 0.1);
      setRemaining(remainingRef.current);
      const whole = Math.ceil(remainingRef.current);
      if (whole !== lastWholeRef.current) {
        lastWholeRef.current = whole;
        const w = warnedRef.current;
        if (whole <= WARN_AT && whole > DANGER_AT && !w.w15) {
          w.w15 = true;
          sfx.warn();
          buzz(120);
        }
        if (whole <= DANGER_AT && whole > 0 && !w.w5) {
          w.w5 = true;
          sfx.danger();
          buzz([90, 60, 90]);
        }
        if (whole <= DANGER_AT && whole > 0) sfx.tick();
      }
      if (remainingRef.current <= 0) handleTimeoutRef.current();
    }, 100);
    return () => clearInterval(id);
  }, [screen, index, locked, countdownStep, intro]);

  /* ---------- battle music ---------- */
  useEffect(() => {
    if (screen === 'battle' && !muted) startMusic();
    else stopMusic();
    return () => stopMusic();
  }, [screen, muted]);

  /* ---------- global bits ---------- */
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [screen]);

  /* ---------- init: prefs, best score, resume interrupted run ---------- */
  useEffect(() => {
    if (hydratedRef.current) return;
    hydratedRef.current = true;

    reducedRef.current = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches;
    setReduced(reducedRef.current);

    let m = false;
    try {
      m = localStorage.getItem(MUTE_KEY) === '1';
    } catch (_) {}
    setMutedState(m);
    setMuted(m);

    const savedBest = loadBest();
    if (savedBest !== null) {
      bestRef.current = savedBest;
      setBest(savedBest);
    }

    const data = loadProgress();
    if (!data || typeof data.name !== 'string' || !data.name.trim()) return;
    const nm = data.name.trim();
    setName(nm);

    const restoredRun = isValidRun(data.run) ? data.run : shuffleRun();
    setRun(restoredRun);

    const raw = Array.isArray(data.answers) ? data.answers : [];
    const ans = raw
      .filter(
        (a, i) =>
          i < TOTAL &&
          Number.isInteger(a) &&
          a >= -1 &&
          a < (restoredRun[i]?.options.length ?? 0),
      )
      .slice(0, TOTAL);
    if (ans.length === 0) return; // just a saved name — nothing to resume

    const restoredScore = scoreFromAnswers(ans, restoredRun);
    const misses = ans.filter(
      (a, i) => a !== restoredRun[i].correctAnswer,
    ).length;
    const restoredHearts = Number.isInteger(data.hearts)
      ? Math.max(0, data.hearts)
      : Math.max(1, HEARTS_MAX - misses);

    setAnswers(ans);
    setScore(restoredScore);
    setXp(Number.isInteger(data.xp) ? data.xp : 0);
    setCombo(Number.isInteger(data.combo) ? data.combo : 0);
    setHearts(restoredHearts);
    setPowerups(
      data.powerups && typeof data.powerups === 'object'
        ? {
            cut: Math.max(
              0,
              Math.min(POWERUP_CAP, Math.floor(data.powerups.cut) || 0),
            ),
            freeze: Math.max(
              0,
              Math.min(POWERUP_CAP, Math.floor(data.powerups.freeze) || 0),
            ),
          }
        : { cut: 0, freeze: 0 },
    );
    setShieldActive(Boolean(data.shield) && restoredHearts > 0);
    lockedRef.current = false;

    if (ans.length >= TOTAL || restoredHearts <= 0) {
      if (restoredHearts <= 0) {
        const attempted = Math.max(1, ans.length);
        setResult({
          outcome: 'lost',
          attempted,
          pct: Math.round((restoredScore / attempted) * 100),
          by: 'the monsters',
          stats: null,
          badges: [],
          record: false,
        });
      } else {
        setResult({
          outcome: 'won',
          attempted: TOTAL,
          pct: Math.round((restoredScore / TOTAL) * 100),
          stats: null,
          badges: [],
          record: false,
        });
      }
      setScreen('result');
    } else {
      setIndex(ans.length);
      setScreen('battle');
      toast(`Welcome back, ${nm} — resuming at level ${ans.length + 1}`);
    }
  }, [toast]);

  /* ---------- derived ---------- */
  const monster = index === TOTAL - 1 ? BOSS : ENEMIES[index % ENEMIES.length];
  const answering =
    screen === 'battle' && !locked && countdownStep === null && !intro;
  const warn = answering && remaining <= WARN_AT && remaining > DANGER_AT;
  const danger = answering && remaining <= DANGER_AT && remaining > 0;
  const mood = danger ? 'furious' : warn ? 'angry' : '';

  /* switch the battle loop: boss pattern on the final level, tense pattern in DANGER */
  useEffect(() => {
    setMusicDanger(danger);
    setMusicBoss(index === TOTAL - 1);
  }, [danger, index]);

  /* low-HP heartbeat — only while fighting on your last heart */
  useEffect(() => {
    if (screen === 'battle' && hearts === 1 && !muted) startHeartbeat();
    else stopHeartbeat();
    return () => stopHeartbeat();
  }, [screen, hearts, muted]);

  return {
    // state
    screen,
    name,
    index,
    q: run[index],
    total: TOTAL,
    score,
    xp,
    combo,
    hearts,
    brokeAt,
    answers,
    run,
    locked,
    feedback,
    result,
    best,
    muted,
    reduced,
    remaining,
    warn,
    danger,
    monster,
    monsterPhase,
    mood,
    statusStamp,
    arenaShake,
    cardShake,
    bursts,
    floats,
    vignette,
    toastMsg,
    countdownStep,
    intro,
    flash,
    // power-ups
    powerups,
    shieldActive,
    eliminated,
    frozen,
    frozenLeft,
    canCut: answering && powerups.cut > 0 && eliminated.length === 0,
    canFreeze: answering && powerups.freeze > 0,
    useCut,
    useFreeze,
    // refs & actions
    spriteRef,
    startGame,
    chooseAnswer,
    handleNext,
    retry,
    toggleMute,
  };
}
