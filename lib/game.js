import { questions } from './questions';

export const TOTAL = questions.length;

/* ---- Tuning ---- */
export const QUESTION_TIME = 45; // seconds per level
export const WARN_AT = 15; // "HURRY UP!" warning
export const DANGER_AT = 5; // "DANGER!" alarm
export const HEARTS_MAX = 5; // hearts per run

/* ---- Links — EDIT THESE ---- */
export const JOIN_FORM_URL = 'https://forms.gle/replace-with-your-form'; // TODO: your real form
export const SITE_URL = 'https://trosc.vercel.app';

/* ---- Storage keys ---- */
export const PROGRESS_KEY = 'trosc-it-challenge-progress';
export const BEST_KEY = 'trosc-it-challenge-best';
export const MUTE_KEY = 'trosc-it-challenge-muted';

/* ---- Storage helpers (all fail silently if localStorage is blocked) ---- */
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

/* -1 = timed out — never counts as correct */
export function scoreFromAnswers(answers) {
  return answers.reduce(
    (sum, a, i) => sum + (a === questions[i].correctAnswer ? 1 : 0),
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
