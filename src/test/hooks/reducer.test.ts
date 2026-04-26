import { describe, it, expect } from 'vitest';
import { reducer } from '../../hooks/useScoreboard';
import { totalScore } from '../../utils/ranking';
import type { Streamer } from '../../types';

function makeStreamer(overrides: Partial<Streamer> = {}): Streamer {
  return {
    id: 'id-1',
    name: 'Anna',
    history: [],
    ...overrides,
  };
}

describe('reducer — ADD_STREAMER', () => {
  it('adds a streamer with empty history and unique id', () => {
    const state = reducer([], { type: 'ADD_STREAMER', name: 'Anna' });
    expect(state).toHaveLength(1);
    expect(state[0]!.name).toBe('Anna');
    expect(state[0]!.history).toEqual([]);
    expect(state[0]!.id).toBeTruthy();
  });

  it('trims the name', () => {
    const state = reducer([], { type: 'ADD_STREAMER', name: '  Anna  ' });
    expect(state[0]!.name).toBe('Anna');
  });

  it('generates unique ids for different streamers', () => {
    let state = reducer([], { type: 'ADD_STREAMER', name: 'A' });
    state = reducer(state, { type: 'ADD_STREAMER', name: 'B' });
    expect(state[0]!.id).not.toBe(state[1]!.id);
  });

  it('appends without affecting existing streamers', () => {
    const initial = [makeStreamer({ id: 'existing', name: 'Old' })];
    const state = reducer(initial, { type: 'ADD_STREAMER', name: 'New' });
    expect(state).toHaveLength(2);
    expect(state[0]!.name).toBe('Old');
    expect(state[1]!.name).toBe('New');
  });
});

describe('reducer — REMOVE_STREAMER', () => {
  it('removes the streamer with the given id', () => {
    const initial = [
      makeStreamer({ id: 'a', name: 'Anna' }),
      makeStreamer({ id: 'b', name: 'Bob' }),
    ];
    const state = reducer(initial, { type: 'REMOVE_STREAMER', id: 'a' });
    expect(state).toHaveLength(1);
    expect(state[0]!.id).toBe('b');
  });

  it('no-ops when id not found', () => {
    const initial = [makeStreamer({ id: 'a' })];
    const state = reducer(initial, { type: 'REMOVE_STREAMER', id: 'x' });
    expect(state).toHaveLength(1);
  });

  // §1.2.4 — history also removed when streamer removed
  it('removes all history along with the streamer', () => {
    const initial = [
      makeStreamer({
        id: 'a',
        history: [{ id: 'e1', amount: 10, timestamp: 1 }],
      }),
    ];
    const state = reducer(initial, { type: 'REMOVE_STREAMER', id: 'a' });
    expect(state).toHaveLength(0);
  });
});

describe('reducer — ADD_SCORE', () => {
  it('adds an entry to the correct streamer', () => {
    const initial = [
      makeStreamer({ id: 'a', name: 'Anna' }),
      makeStreamer({ id: 'b', name: 'Bob' }),
    ];
    const state = reducer(initial, {
      type: 'ADD_SCORE',
      streamerId: 'a',
      amount: 10,
    });
    expect(state.find((s) => s.id === 'a')!.history).toHaveLength(1);
    expect(state.find((s) => s.id === 'a')!.history[0]!.amount).toBe(10);
    expect(state.find((s) => s.id === 'b')!.history).toHaveLength(0);
  });

  it('appends entries in chronological order', () => {
    let state = [makeStreamer({ id: 'a' })];
    state = reducer(state, { type: 'ADD_SCORE', streamerId: 'a', amount: 10 });
    state = reducer(state, { type: 'ADD_SCORE', streamerId: 'a', amount: 5 });
    state = reducer(state, { type: 'ADD_SCORE', streamerId: 'a', amount: -3 });
    expect(state[0]!.history.map((e) => e.amount)).toEqual([10, 5, -3]);
  });

  it('accepts negative scores', () => {
    const initial = [makeStreamer({ id: 'a' })];
    const state = reducer(initial, {
      type: 'ADD_SCORE',
      streamerId: 'a',
      amount: -5,
    });
    expect(state[0]!.history[0]!.amount).toBe(-5);
  });
});

describe('reducer — REMOVE_SCORE_ENTRY', () => {
  it('removes the specific entry by id', () => {
    const initial = [
      makeStreamer({
        id: 'a',
        history: [
          { id: 'e1', amount: 10, timestamp: 1 },
          { id: 'e2', amount: 5, timestamp: 2 },
        ],
      }),
    ];
    const state = reducer(initial, {
      type: 'REMOVE_SCORE_ENTRY',
      streamerId: 'a',
      entryId: 'e1',
    });
    expect(state[0]!.history).toHaveLength(1);
    expect(state[0]!.history[0]!.id).toBe('e2');
  });

  // §3.5 — total score recalculates after removal
  it('total score recalculates correctly after removal (derived)', () => {
    const initial = [
      makeStreamer({
        id: 'a',
        history: [
          { id: 'e1', amount: 10, timestamp: 1 },
          { id: 'e2', amount: 5, timestamp: 2 },
        ],
      }),
    ];
    const state = reducer(initial, {
      type: 'REMOVE_SCORE_ENTRY',
      streamerId: 'a',
      entryId: 'e1',
    });
    expect(totalScore(state[0]!)).toBe(5); // only e2 remains
  });
});

describe('reducer — RESET_ALL', () => {
  it('clears all streamers', () => {
    const initial = [
      makeStreamer({ id: 'a' }),
      makeStreamer({ id: 'b' }),
    ];
    const state = reducer(initial, { type: 'RESET_ALL' });
    expect(state).toEqual([]);
  });

  it('returns empty array when already empty', () => {
    const state = reducer([], { type: 'RESET_ALL' });
    expect(state).toEqual([]);
  });
});
