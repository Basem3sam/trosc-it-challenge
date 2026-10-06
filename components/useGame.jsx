'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { questions } from '@/lib/questions';
import { ENEMIES, BOSS } from '@/lib/monsters';
import { sfx, buzz, setMuted } from '@/lib/sounds';
import {
  TOTAL,
  QUESTION_TIME,
  WARN_AT,
  DANGER_AT,
  HEARTS_MAX,
  MUTE_KEY,
  loadProgress,
  saveProgress,
  clearProgress,
  loadBest,
  saveBest,
  scoreFromAnswers,
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
  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [xp, setXp] = useState(0);
  const [combo, setCombo] = useState(0);
  const [hearts, setHearts] = useState(HEARTS_MAX);
  const [brokeAt, setBrokeAt] = useState(-1);
  const [answers, setAnswers] = useState([]);
  const [locked, setLocked] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [result, setResult] = useState(null); // { outcome: "won"|"lost", attempted, pct, by }
  const [record, setRecord] = useState(false);
  const [best, setBest] = useState(null);

  /* ---------- battle visuals ---------- */
  const [remaining, setRemaining] = useState(QUESTION_TIME);
  const [countdownStep, setCountdownStep] = useState(null); // "3"|"2"|"1"|"FIGHT!"|null
  const [monsterPhase, setMonsterPhase] = useState('idle'); // idle|hit|dead|attack
  const [statusStamp, setStatusStamp] = useState(null); // {text, kind, id}
  const [arenaShake, setArenaShake] = useState(false);
  const [cardShake, setCardShake] = useState(false);

  /* ---------- fx layers ---------- */
  const [bursts, setBursts] = useState([]);
  const [floats, setFloats] = useState([]);
  const [confetti, setConfetti] = useState([]);
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

  const launchConfetti = useCallback(
    (count) => {
      if (reducedRef.current) return;
      const parts = Array.from({ length: count }, (_, i) => ({
        id: ++fxId.current,
        left: Math.random() * 100,
        size: 6 + Math.random() * 6,
        round: Math.random() > 0.5,
        color: FX_COLORS[i % FX_COLORS.length],
        spin: 360 + Math.random() * 540,
        dur: 2.4 + Math.random() * 1.8,
        delay: Math.random() * 1.2,
      }));
      setConfetti(parts);
      later(() => setConfetti([]), 5500);
    },
    [later],
  );

  const flashVignette = useCallback(() => {
    if (reducedRef.current) return;
    setVignette(true);
    later(() => setVignette(false), 500);
  }, [later]);

  const spawnStatus = useCallback(
    (text, kind) => {
      setStatusStamp({ text, kind, id: ++fxId.current });
      later(() => setStatusStamp(null), 950);
    },
    [later],
  );

  /* ---------- run lifecycle ---------- */
  const winGame = useCallback(() => {
    clearProgress();
    const pct = Math.round((score / TOTAL) * 100);
    const isRecord = bestRef.current === null || score > bestRef.current;
    if (isRecord) {
      saveBest(score);
      bestRef.current = score;
      setBest(score);
    }
    setRecord(isRecord);
    setResult({ outcome: 'won', attempted: TOTAL, pct });
    setScreen('result');
    sfx.finish();
    buzz([30, 40, 30, 40, 80]);
    launchConfetti(isRecord ? 130 : 80);
  }, [score, launchConfetti]);

  const gameOver = useCallback(
    (by) => {
      clearProgress();
      const attempted = Math.max(1, answers.length);
      const pct = Math.round((score / attempted) * 100);
      setResult({ outcome: 'lost', attempted, pct, by });
      setScreen('result');
      sfx.gameOver();
      buzz([200, 100, 200, 100, 300]);
      flashVignette();
    },
    [answers.length, score, flashVignette],
  );

  useEffect(() => {
    handleTimeoutRef.current = handleTimeout;
  });
  useEffect(() => {
    gameOverRef.current = gameOver;
  });

  const loseHeart = useCallback(() => {
    const next = Math.max(0, hearts - 1);
    setHearts(next);
    setBrokeAt(next);
    later(() => setBrokeAt(-1), 600);
    sfx.heart();
    buzz(80);
    return next > 0;
  }, [hearts, later]);

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

  const startGame = useCallback(
    (nm) => {
      clearLater();
      clearTimeout(toastTimerRef.current);
      lockedRef.current = false;
      setName(nm);
      setIndex(0);
      setScore(0);
      setXp(0);
      setCombo(0);
      setHearts(HEARTS_MAX);
      setBrokeAt(-1);
      setAnswers([]);
      setLocked(false);
      setFeedback(null);
      setMonsterPhase('idle');
      setStatusStamp(null);
      setArenaShake(false);
      setCardShake(false);
      setBursts([]);
      setFloats([]);
      setConfetti([]);
      setVignette(false);
      setResult(null);
      setRecord(false);
      setToastMsg(null);
      setCountdownStep(null);
      saveProgress({
        name: nm,
        answers: [],
        xp: 0,
        combo: 0,
        hearts: HEARTS_MAX,
      });
      setScreen('battle');
      runCountdown(() => {});
    },
    [clearLater, runCountdown],
  );

  const retry = useCallback(() => {
    clearLater();
    clearTimeout(toastTimerRef.current);
    lockedRef.current = false;
    setIndex(0);
    setScore(0);
    setXp(0);
    setCombo(0);
    setHearts(HEARTS_MAX);
    setBrokeAt(-1);
    setAnswers([]);
    setLocked(false);
    setFeedback(null);
    setMonsterPhase('idle');
    setStatusStamp(null);
    setArenaShake(false);
    setCardShake(false);
    setBursts([]);
    setFloats([]);
    setConfetti([]);
    setVignette(false);
    setResult(null);
    setRecord(false);
    setToastMsg(null);
    setCountdownStep(null);
    clearProgress();
    setScreen('welcome');
  }, [clearLater]);

  /* ---------- answering ---------- */
  const chooseAnswer = useCallback(
    (choiceIndex) => {
      if (lockedRef.current || countdownStep !== null) return;
      lockedRef.current = true;
      setLocked(true);

      const q = questions[index];
      const monster =
        index === TOTAL - 1 ? BOSS : ENEMIES[index % ENEMIES.length];
      const correct = choiceIndex === q.correctAnswer;
      const nextAnswers = [...answers, choiceIndex];
      setAnswers(nextAnswers);

      if (correct) {
        const nextCombo = combo + 1;
        const speedBonus = Math.round(
          (remainingRef.current / QUESTION_TIME) * 50,
        ); // up to +50
        const streakBonus = Math.min(nextCombo - 1, 4) * 25; // up to +100
        const gained = 100 + speedBonus + streakBonus;
        const nextXp = xp + gained;

        setCombo(nextCombo);
        setScore(score + 1);
        setXp(nextXp);

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

        sfx.correct();
        buzz(25);

        const crit = speedBonus >= 33; // answered in the top third of the time
        let flavor = `${crit ? 'CRITICAL HIT! ' : ''}${pick(VICTORY)} ${monster.name} is defeated!`;
        if (nextCombo >= 2) flavor += ` COMBO ×${nextCombo}!`;
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
          xp: nextXp,
          combo: nextCombo,
          hearts,
        });
      } else {
        setCombo(0);
        setMonsterPhase('attack');
        sfx.attack();
        later(() => setMonsterPhase('idle'), 500);
        setCardShake(true);
        later(() => setCardShake(false), 400);
        flashVignette();
        sfx.wrong();
        buzz([60, 40, 60]);
        spawnStatus('ENEMY STRIKES!', 'bad');
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
        });

        if (nextHearts <= 0) {
          later(() => gameOverRef.current(monster.name), 1000); // let the attack play out
          return;
        }
      }
    },
    [
      index,
      answers,
      combo,
      score,
      xp,
      hearts,
      name,
      countdownStep,
      later,
      addBurst,
      addFloat,
      spawnStatus,
      flashVignette,
      toast,
    ],
  );

  const handleTimeout = useCallback(() => {
    if (lockedRef.current || countdownStep !== null) return;
    lockedRef.current = true;
    setLocked(true);

    const q = questions[index];
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
    flashVignette();
    sfx.timeUp();
    buzz([60, 40, 60]);
    spawnStatus("TIME'S UP!", 'bad');
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
    });

    if (nextHearts <= 0) later(() => gameOverRef.current(monster.name), 1000);
  }, [index, answers, xp, hearts, name, countdownStep, later, flashVignette]);

  const handleNext = useCallback(() => {
    if (!lockedRef.current) return;
    if (index === TOTAL - 1) {
      winGame();
      return;
    }
    lockedRef.current = false;
    setLocked(false);
    setIndex(index + 1);
    setFeedback(null);
    setMonsterPhase('idle');
    setStatusStamp(null);
    setBrokeAt(-1);
  }, [index, winGame]);

  const toggleMute = useCallback(() => {
    const next = !muted;
    setMutedState(next);
    setMuted(next);
    try {
      localStorage.setItem(MUTE_KEY, next ? '1' : '0');
    } catch (_) {}
    if (!next) sfx.on();
  }, [muted]);

  /* ---------- per-question timer (pauses when tab is hidden) ---------- */
  useEffect(() => {
    if (screen !== 'battle' || lockedRef.current || countdownStep !== null)
      return;
    remainingRef.current = QUESTION_TIME;
    lastWholeRef.current = QUESTION_TIME;
    warnedRef.current = { w15: false, w5: false };
    setRemaining(QUESTION_TIME);

    const id = setInterval(() => {
      if (document.hidden) return;
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
  }, [screen, index, locked, countdownStep]);

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

    const raw = Array.isArray(data.answers) ? data.answers : [];
    const ans = raw
      .filter(
        (a, i) =>
          i < TOTAL &&
          Number.isInteger(a) &&
          a >= -1 &&
          a < questions[i].options.length,
      )
      .slice(0, TOTAL);
    if (ans.length === 0) return; // just a saved name — nothing to resume

    const restoredScore = scoreFromAnswers(ans);
    const restoredXp = Number.isInteger(data.xp) ? data.xp : 0;
    const restoredCombo = Number.isInteger(data.combo) ? data.combo : 0;
    const misses = ans.filter(
      (a, i) => a !== questions[i].correctAnswer,
    ).length;
    const restoredHearts = Number.isInteger(data.hearts)
      ? Math.max(0, data.hearts)
      : Math.max(1, HEARTS_MAX - misses);

    setAnswers(ans);
    setScore(restoredScore);
    setXp(restoredXp);
    setCombo(restoredCombo);
    setHearts(restoredHearts);
    lockedRef.current = false;

    if (ans.length >= TOTAL || restoredHearts <= 0) {
      // run was effectively finished — show the matching result quietly
      if (restoredHearts <= 0) {
        const attempted = Math.max(1, ans.length);
        setResult({
          outcome: 'lost',
          attempted,
          pct: Math.round((restoredScore / attempted) * 100),
          by: 'the monsters',
        });
      } else {
        setResult({
          outcome: 'won',
          attempted: TOTAL,
          pct: Math.round((restoredScore / TOTAL) * 100),
        });
      }
      setScreen('result');
    } else {
      setIndex(ans.length);
      setScreen('battle'); // no countdown on resume — get back in fast
      toast(`Welcome back, ${nm} — resuming at level ${ans.length + 1}`);
    }
  }, [toast]);

  /* ---------- derived ---------- */
  const monster = index === TOTAL - 1 ? BOSS : ENEMIES[index % ENEMIES.length];
  const active = screen === 'battle' && !locked && countdownStep === null;
  const warn = active && remaining <= WARN_AT && remaining > DANGER_AT;
  const danger = active && remaining <= DANGER_AT && remaining > 0;
  const mood = danger ? 'furious' : warn ? 'angry' : '';

  return {
    // state
    screen,
    name,
    index,
    q: questions[index],
    total: TOTAL,
    score,
    xp,
    combo,
    hearts,
    brokeAt,
    answers,
    locked,
    feedback,
    result,
    record,
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
    confetti,
    vignette,
    toastMsg,
    countdownStep,
    // refs & actions
    spriteRef,
    startGame,
    chooseAnswer,
    handleNext,
    retry,
    toggleMute,
  };
}
