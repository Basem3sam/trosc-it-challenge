/* Unit tests for the pure game logic — run with `npm test` (node --test). */
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { questions } from '../lib/questions.js';
import {
  TOTAL,
  QUESTION_TIME,
  HEARTS_MAX,
  shuffleRun,
  isValidRun,
  scoreFromAnswers,
  tierFor,
  badgeList,
} from '../lib/game.js';

describe('question bank', () => {
  it('exposes every question with 4 options and a valid correctAnswer', () => {
    assert.equal(TOTAL, questions.length);
    assert.ok(TOTAL > 0);
    assert.ok(QUESTION_TIME > 0);
    assert.ok(HEARTS_MAX >= 1);
    for (const q of questions) {
      assert.equal(q.options.length, 4);
      assert.ok(Number.isInteger(q.correctAnswer));
      assert.ok(q.correctAnswer >= 0 && q.correctAnswer < q.options.length);
    }
  });
});

describe('shuffleRun', () => {
  it('builds a full run that still maps correct answers back to the bank', () => {
    const run = shuffleRun();
    assert.equal(run.length, TOTAL);
    for (const q of run) {
      const bankQ = questions.find((b) => b.question === q.question);
      assert.ok(bankQ, `unknown question in run: ${q.question}`);
      // options are a permutation of the bank's options
      assert.deepEqual([...q.options].sort(), [...bankQ.options].sort());
      // the remapped index still points at the correct answer text
      assert.equal(
        q.options[q.correctAnswer],
        bankQ.options[bankQ.correctAnswer],
      );
      assert.equal(q.explanation, bankQ.explanation);
    }
  });

  it('keeps the correct answer within bounds on every entry', () => {
    const run = shuffleRun();
    run.forEach((q) => {
      assert.ok(Number.isInteger(q.correctAnswer));
      assert.ok(q.correctAnswer >= 0 && q.correctAnswer < q.options.length);
    });
  });
});

describe('isValidRun', () => {
  it('accepts a freshly shuffled run', () => {
    assert.equal(isValidRun(shuffleRun()), true);
  });

  it('rejects missing, short or corrupted runs', () => {
    const run = shuffleRun();
    assert.equal(isValidRun(null), false);
    assert.equal(isValidRun(undefined), false);
    assert.equal(isValidRun('run'), false);
    assert.equal(isValidRun([]), false);
    assert.equal(isValidRun(run.slice(0, TOTAL - 1)), false);
    assert.equal(
      isValidRun(run.map((q) => ({ ...q, correctAnswer: 99 }))),
      false,
    );
    assert.equal(isValidRun(run.map((q) => ({ ...q, options: 'nope' }))), false);
    assert.equal(isValidRun(run.map((q) => ({ ...q, question: 42 }))), false);
  });
});

describe('scoreFromAnswers', () => {
  it('scores only exact matches as correct', () => {
    const run = shuffleRun();
    const perfect = run.map((q) => q.correctAnswer);
    assert.equal(scoreFromAnswers(perfect, run), TOTAL);
    assert.equal(scoreFromAnswers([], run), 0);
  });

  it('treats timeouts (-1) and wrong picks as misses', () => {
    const run = shuffleRun();
    const mixed = run.map((q, i) => {
      if (i === 0) return -1; // timed out
      if (i === 1) return (q.correctAnswer + 1) % q.options.length; // wrong
      return q.correctAnswer;
    });
    assert.equal(scoreFromAnswers(mixed, run), TOTAL - 2);
    assert.equal(scoreFromAnswers(run.map(() => -1), run), 0);
  });
});

describe('tierFor', () => {
  it('ranks by score', () => {
    assert.equal(tierFor(TOTAL).rank, 'S');
    assert.equal(tierFor(TOTAL - 2).rank, 'A');
    assert.equal(tierFor(Math.ceil(TOTAL / 2)).rank, 'B');
    assert.equal(tierFor(0).rank, 'C');
  });
});

describe('badgeList', () => {
  it('grants every badge a standout run earns', () => {
    const labels = badgeList({
      score: TOTAL,
      total: TOTAL,
      longestCombo: 6,
      fastest: 4.2,
      heartsLeft: 1,
    }).map((b) => b.label);
    assert.deepEqual(labels, [
      'FLAWLESS',
      'COMBO ×5',
      'SPEED DEMON',
      'CLUTCH VICTORY',
    ]);
  });

  it('grants nothing for an ordinary run', () => {
    assert.deepEqual(
      badgeList({
        score: 3,
        total: TOTAL,
        longestCombo: 2,
        fastest: 9.5,
        heartsLeft: 4,
      }),
      [],
    );
  });
});
