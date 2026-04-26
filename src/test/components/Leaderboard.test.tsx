import { describe, it, expect } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import Leaderboard from '../../components/Leaderboard';
import type { Streamer } from '../../types';

function makeStreamer(id: string, name: string, amounts: number[]): Streamer {
  return {
    id,
    name,
    history: amounts.map((amount, i) => ({
      id: `${id}-e${i}`,
      amount,
      timestamp: i,
    })),
  };
}

// §4.1.1 — empty state
describe('Leaderboard — empty state', () => {
  it('shows empty state message when no streamers', () => {
    render(<Leaderboard streamers={[]} />);
    expect(screen.getByText('尚未加入主播')).toBeInTheDocument();
  });
});

// §4.1.3 — sorted by total score descending
describe('Leaderboard — sorting', () => {
  it('displays streamers sorted by total score descending', () => {
    const streamers = [
      makeStreamer('low', 'Low', [10]),
      makeStreamer('high', 'High', [100]),
      makeStreamer('mid', 'Mid', [50]),
    ];
    render(<Leaderboard streamers={streamers} />);
    const items = screen.getAllByRole('listitem');
    expect(within(items[0]!).getByText('High')).toBeInTheDocument();
    expect(within(items[1]!).getByText('Mid')).toBeInTheDocument();
    expect(within(items[2]!).getByText('Low')).toBeInTheDocument();
  });
});

// §4.1.4 — each row shows rank, name, total score
describe('Leaderboard — row content', () => {
  it('shows streamer name and total score', () => {
    const streamers = [makeStreamer('a', 'Anna', [10, 5])];
    render(<Leaderboard streamers={streamers} />);
    expect(screen.getByText('Anna')).toBeInTheDocument();
    // 15 should be displayed (formatted)
    expect(screen.getByText(/15/)).toBeInTheDocument();
  });
});

// §4.3 — medal icons for top 3
describe('Leaderboard — medal icons', () => {
  it('shows 🥇 for 1st place', () => {
    render(<Leaderboard streamers={[makeStreamer('a', 'Anna', [100])]} />);
    expect(screen.getByText('🥇')).toBeInTheDocument();
  });

  it('shows 🥈 for 2nd place', () => {
    const streamers = [
      makeStreamer('a', 'Anna', [100]),
      makeStreamer('b', 'Bob', [50]),
    ];
    render(<Leaderboard streamers={streamers} />);
    expect(screen.getByText('🥈')).toBeInTheDocument();
  });

  it('shows 🥉 for 3rd place', () => {
    const streamers = [
      makeStreamer('a', 'Anna', [100]),
      makeStreamer('b', 'Bob', [80]),
      makeStreamer('c', 'Carol', [60]),
    ];
    render(<Leaderboard streamers={streamers} />);
    expect(screen.getByText('🥉')).toBeInTheDocument();
  });

  it('shows rank number (not medal) for 4th place and beyond', () => {
    const streamers = [
      makeStreamer('a', 'Anna', [100]),
      makeStreamer('b', 'Bob', [80]),
      makeStreamer('c', 'Carol', [60]),
      makeStreamer('d', 'Dave', [40]),
    ];
    render(<Leaderboard streamers={streamers} />);
    expect(screen.getByText('#4')).toBeInTheDocument();
  });

  // §4.3.5 — both tied-1st show 🥇
  it('shows 🥇 for both streamers tied at 1st', () => {
    const streamers = [
      makeStreamer('a', 'Anna', [100]),
      makeStreamer('b', 'Bob', [100]),
    ];
    render(<Leaderboard streamers={streamers} />);
    const medals = screen.getAllByText('🥇');
    expect(medals).toHaveLength(2);
  });
});

// §4.2 — standard competition ranking (1224)
describe('Leaderboard — competition ranking display', () => {
  it('shows 🥉 (not 🥈) after two tied 1st-place streamers', () => {
    const streamers = [
      makeStreamer('a', 'Anna', [100]),
      makeStreamer('b', 'Bob', [100]),
      makeStreamer('c', 'Carol', [80]),
    ];
    render(<Leaderboard streamers={streamers} />);
    // Carol is rank 3 → bronze medal; rank 2 is skipped, so no silver
    expect(screen.getByText('🥉')).toBeInTheDocument();
    expect(screen.queryByText('🥈')).not.toBeInTheDocument();
  });
});
