import { questions as bank } from './questions';

export const TOTAL = bank.length;

/* ---- Tuning ---- */
export const QUESTION_TIME = 45; // seconds per level
export const WARN_AT = 15; // "HURRY UP!" warning
export const DANGER_AT = 5; // "DANGER!" alarm
export const HEARTS_MAX = 5; // hearts per run
export const FREEZE_TIME = 8; // seconds Freeze stops the clock (max 15 stacked)
export const POWERUP_EVERY = 3; // every Nth correct answer grants a power-up
export const POWERUP_CAP = 2; // max stored per type

/* ---- Links — EDIT THESE ---- */
export const JOIN_FORM_URL = 'https://forms.gle/replace-with-your-form'; // TODO: your real form
export const SITE_URL = 'https://trosc.vercel.app';

/* ---- Storage keys ---- */
export const PROGRESS_KEY = 'trosc-it-challenge-progress';
export const BEST_KEY = 'trosc-it-challenge-best';
export const MUTE_KEY = 'trosc-it-challenge-muted';

/* ---- Storage helpers (fail silently if blocked) ---- */
export function loadProgress() {
  try {
    return JSON.parse(localStorage.getItem(PROGRESS_KEY));
  } catch (_) {
    return null;
  }
}
export function saveProgress(data) {
  try {
    localStorage.setItem(PROGRESS_KEY, JSON.stringify(data));
  } catch (_) {}
}
export function clearProgress() {
  try {
    localStorage.removeItem(PROGRESS_KEY);
  } catch (_) {}
}
export function loadBest() {
  try {
    const b = JSON.parse(localStorage.getItem(BEST_KEY));
    return b && Number.isInteger(b.score) ? b.score : null;
  } catch (_) {
    return null;
  }
}
export function saveBest(score) {
  try {
    localStorage.setItem(BEST_KEY, JSON.stringify({ score }));
  } catch (_) {}
}

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/* Build one run: shuffled question order + shuffled answer order each time */
export function shuffleRun() {
  return shuffle(bank).map((q) => {
    const perm = shuffle(q.options.map((_, i) => i));
    return {
      question: q.question,
      options: perm.map((i) => q.options[i]),
      correctAnswer: perm.indexOf(q.correctAnswer),
      explanation: q.explanation,
    };
  });
}

/* Validate a run restored from localStorage (fall back to a fresh shuffle) */
export function isValidRun(run) {
  return (
    Array.isArray(run) &&
    run.length === TOTAL &&
    run.every(
      (q) =>
        q &&
        typeof q.question === 'string' &&
        Array.isArray(q.options) &&
        q.options.length >= 2 &&
        Number.isInteger(q.correctAnswer) &&
        q.correctAnswer >= 0 &&
        q.correctAnswer < q.options.length,
    )
  );
}

/* -1 = timed out — never counts as correct */
export function scoreFromAnswers(answers, run) {
  return answers.reduce(
    (s, a, i) => s + (run[i] && a === run[i].correctAnswer ? 1 : 0),
    0,
  );
}

export function tierFor(score) {
  if (score === TOTAL)
    return {
      icon: 'rocket',
      rank: 'S',
      title: 'IT LEGEND',
      text: 'Perfect! Future IT star',
    };
  if (score >= TOTAL - 2)
    return {
      icon: 'flame',
      rank: 'A',
      title: 'CODE MASTER',
      text: 'Excellent! You have a great start',
    };
  if (score >= Math.ceil(TOTAL / 2))
    return {
      icon: 'code',
      rank: 'B',
      title: 'RISING DEV',
      text: 'Good job! Keep learning',
    };
  return {
    icon: 'sprout',
    rank: 'C',
    title: 'NEW PLAYER',
    text: 'Every expert started somewhere. Keep going!',
  };
}

/* Badges earned in one winning run */
export function badgeList({ score, total, longestCombo, fastest, heartsLeft }) {
  const b = [];
  if (score === total) b.push({ icon: 'rocket', label: 'FLAWLESS' });
  if (longestCombo >= 5) b.push({ icon: 'flame', label: 'COMBO ×5' });
  if (fastest !== null && fastest <= 5)
    b.push({ icon: 'bolt', label: 'SPEED DEMON' });
  if (heartsLeft === 1) b.push({ icon: 'shield', label: 'CLUTCH VICTORY' });
  return b;
}

/* ---- Battle flavor ---- */
export const VICTORY = [
  'BOOM! Direct hit!',
  'Critical hit!',
  'Down it goes!',
  'Slayed!',
  'One-shot!',
  'Flawless strike!',
  'Obliterated!',
  'Perfect aim!',
];
export const TAUNTS = [
  'Hehe! Missed me?',
  'Too slow, human!',
  'Error 404: skill not found',
  'Is that your best shot?',
  "You'll have to try harder!",
  'My grandma codes better!',
  'Ha! Not even close!',
  'Monsters 1 — You 0',
];
export const COMBO_CALLOUTS = {
  3: 'ON FIRE!',
  5: 'UNSTOPPABLE!',
  7: 'GODLIKE!',
};
export const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
