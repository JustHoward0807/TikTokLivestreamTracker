import { describe, it, expect } from 'vitest';
import {
  computeRanking,
  totalScore,
  formatScore,
} from '../../utils/ranking';
import type { Streamer } from '../../types';

function makeStreamer(name: string, amounts: number[]): Streamer {
  return {
    id: name,
    name,
    history: amounts.map((amount, i) => ({
      id: `entry-${i}`,
      amount,
      timestamp: i,
    })),
  };
}

// §4.1 / §3 — totalScore is always derived
describe('totalScore', () => {
  it('returns 0 for empty history', () => {
    expect(totalScore(makeStreamer('A', []))).toBe(0);
  });

  it('sums positive amounts', () => {
    expect(totalScore(makeStreamer('A', [10, 5, 20]))).toBe(35);
  });

  it('sums negative amounts', () => {
    expect(totalScore(makeStreamer('A', [-3, -10]))).toBe(-13);
  });

  it('sums mixed amounts', () => {
    expect(totalScore(makeStreamer('A', [10, -3, 5]))).toBe(12);
  });
});

// §3 — formatScore display
describe('formatScore', () => {
  it('prefixes positive numbers with +', () => {
    expect(formatScore(10)).toBe('+10');
  });

  it('keeps - for negative numbers', () => {
    expect(formatScore(-5)).toBe('-5');
  });

  it('treats 0 as positive (shows +0)', () => {
    expect(formatScore(0)).toBe('+0');
  });

  it('formats large numbers with thousand separators', () => {
    const result = formatScore(1000000);
    expect(result).toContain('1');
    expect(result.startsWith('+')).toBe(true);
  });
});

// §4.2 — Standard competition ranking ("1224")
describe('computeRanking', () => {
  it('returns empty array for no streamers', () => {
    expect(computeRanking([])).toEqual([]);
  });

  it('ranks a single streamer as #1', () => {
    const ranked = computeRanking([makeStreamer('A', [10])]);
    expect(ranked[0]!.rank).toBe(1);
    expect(ranked[0]!.totalScore).toBe(10);
  });

  it('sorts by totalScore descending', () => {
    const streamers = [
      makeStreamer('Low', [10]),
      makeStreamer('High', [100]),
      makeStreamer('Mid', [50]),
    ];
    const ranked = computeRanking(streamers);
    expect(ranked.map((r) => r.name)).toEqual(['High', 'Mid', 'Low']);
  });

  // §4.2.1–4.2.5: A=100, B=100, C=80, D=80, E=50
  it('assigns standard competition ranks for tied scores (1224 rule)', () => {
    const streamers = [
      makeStreamer('A', [100]),
      makeStreamer('B', [100]),
      makeStreamer('C', [80]),
      makeStreamer('D', [80]),
      makeStreamer('E', [50]),
    ];
    const ranked = computeRanking(streamers);
    const byName = Object.fromEntries(ranked.map((r) => [r.name, r.rank]));

    expect(byName['A']).toBe(1); // §4.2.1
    expect(byName['B']).toBe(1); // §4.2.2
    expect(byName['C']).toBe(3); // §4.2.3 — not 2
    expect(byName['D']).toBe(3); // §4.2.4
    expect(byName['E']).toBe(5); // §4.2.5 — not 4
  });

  it('all tied → all rank 1', () => {
    const streamers = [
      makeStreamer('A', [50]),
      makeStreamer('B', [50]),
      makeStreamer('C', [50]),
    ];
    const ranked = computeRanking(streamers);
    expect(ranked.every((r) => r.rank === 1)).toBe(true);
  });

  // §10.4 — all negative totals still rank correctly
  it('ranks negative totals correctly (higher value = better rank)', () => {
    const streamers = [
      makeStreamer('A', [-10]),
      makeStreamer('B', [-100]),
    ];
    const ranked = computeRanking(streamers);
    expect(ranked[0]!.name).toBe('A');
    expect(ranked[0]!.rank).toBe(1);
    expect(ranked[1]!.rank).toBe(2);
  });
});
