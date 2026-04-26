import type { Streamer } from '../types';

export type RankedStreamer = Streamer & {
  totalScore: number;
  rank: number;
};

export function computeRanking(streamers: Streamer[]): RankedStreamer[] {
  const withScores = streamers.map((s) => ({
    ...s,
    totalScore: s.history.reduce((sum, e) => sum + e.amount, 0),
    rank: 0,
  }));

  withScores.sort((a, b) => b.totalScore - a.totalScore);

  // Standard competition ranking (1224)
  for (let i = 0; i < withScores.length; i++) {
    if (i === 0) {
      withScores[i]!.rank = 1;
    } else {
      const prev = withScores[i - 1]!;
      const curr = withScores[i]!;
      curr.rank =
        curr.totalScore === prev.totalScore ? prev.rank : i + 1;
    }
  }

  return withScores as RankedStreamer[];
}

export function totalScore(streamer: Streamer): number {
  return streamer.history.reduce((sum, e) => sum + e.amount, 0);
}

export function formatScore(amount: number): string {
  const sign = amount >= 0 ? '+' : '';
  return `${sign}${Intl.NumberFormat().format(amount)}`;
}
