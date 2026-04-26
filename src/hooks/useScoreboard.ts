import { useReducer, useState } from 'react';
import type { Streamer, ScoreEntry, StreamerId } from '../types';
import { useLocalStorage } from './useLocalStorage';

export type Action =
  | { type: 'ADD_STREAMER'; name: string }
  | { type: 'REMOVE_STREAMER'; id: StreamerId }
  | { type: 'ADD_SCORE'; streamerId: StreamerId; amount: number }
  | { type: 'REMOVE_SCORE_ENTRY'; streamerId: StreamerId; entryId: string }
  | { type: 'RESET_ALL' }
  | { type: 'HYDRATE'; streamers: Streamer[] };

export function reducer(state: Streamer[], action: Action): Streamer[] {
  switch (action.type) {
    case 'HYDRATE':
      return action.streamers;
    case 'ADD_STREAMER': {
      const streamer: Streamer = {
        id: crypto.randomUUID(),
        name: action.name.trim(),
        history: [],
      };
      return [...state, streamer];
    }
    case 'REMOVE_STREAMER':
      return state.filter((s) => s.id !== action.id);
    case 'ADD_SCORE': {
      const entry: ScoreEntry = {
        id: crypto.randomUUID(),
        amount: action.amount,
        timestamp: Date.now(),
      };
      return state.map((s) =>
        s.id === action.streamerId
          ? { ...s, history: [...s.history, entry] }
          : s
      );
    }
    case 'REMOVE_SCORE_ENTRY':
      return state.map((s) =>
        s.id === action.streamerId
          ? { ...s, history: s.history.filter((e) => e.id !== action.entryId) }
          : s
      );
    case 'RESET_ALL':
      return [];
    default:
      return state;
  }
}

export function useScoreboard() {
  const [persisted, setPersisted] = useLocalStorage<Streamer[]>(
    'tiktok-scoreboard-v1',
    []
  );

  const [streamers, dispatch] = useReducer(reducer, persisted);
  const [selectedStreamerId, setSelectedStreamerId] =
    useState<StreamerId | null>(null);

  // Sync to localStorage on every change
  const wrappedDispatch = (action: Action) => {
    const next = reducer(streamers, action);
    dispatch(action);
    setPersisted(next);

    if (action.type === 'RESET_ALL') {
      setSelectedStreamerId(null);
    }
    if (
      action.type === 'REMOVE_STREAMER' &&
      action.id === selectedStreamerId
    ) {
      setSelectedStreamerId(null);
    }
  };

  const selectStreamer = (id: StreamerId) => {
    setSelectedStreamerId((prev) => (prev === id ? null : id));
  };

  return {
    streamers,
    selectedStreamerId,
    selectStreamer,
    addStreamer: (name: string) => wrappedDispatch({ type: 'ADD_STREAMER', name }),
    removeStreamer: (id: StreamerId) =>
      wrappedDispatch({ type: 'REMOVE_STREAMER', id }),
    addScore: (streamerId: StreamerId, amount: number) =>
      wrappedDispatch({ type: 'ADD_SCORE', streamerId, amount }),
    removeScoreEntry: (streamerId: StreamerId, entryId: string) =>
      wrappedDispatch({ type: 'REMOVE_SCORE_ENTRY', streamerId, entryId }),
    resetAll: () => wrappedDispatch({ type: 'RESET_ALL' }),
  };
}
