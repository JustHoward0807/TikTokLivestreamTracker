import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useLocalStorage } from '../../hooks/useLocalStorage';

beforeEach(() => {
  localStorage.clear();
});

describe('useLocalStorage', () => {
  // §6 — reads initial value when key absent
  it('returns initial value when localStorage is empty', () => {
    const { result } = renderHook(() =>
      useLocalStorage('test-key', [] as string[])
    );
    expect(result.current[0]).toEqual([]);
  });

  // §6.2 — persists value
  it('persists updated value to localStorage', () => {
    const { result } = renderHook(() =>
      useLocalStorage('test-key', [] as string[])
    );
    act(() => {
      result.current[1](['hello']);
    });
    expect(localStorage.getItem('test-key')).toBe('["hello"]');
  });

  // §6.2 — reads persisted value on re-mount
  it('reads pre-existing value from localStorage on mount', () => {
    localStorage.setItem('test-key', JSON.stringify(['persisted']));
    const { result } = renderHook(() =>
      useLocalStorage('test-key', [] as string[])
    );
    expect(result.current[0]).toEqual(['persisted']);
  });

  // §6.7 — graceful fallback on corrupt JSON
  it('falls back to initial value when localStorage contains invalid JSON', () => {
    localStorage.setItem('test-key', 'NOT_VALID_JSON{{');
    const { result } = renderHook(() =>
      useLocalStorage('test-key', [] as string[])
    );
    expect(result.current[0]).toEqual([]);
  });

  // §6.9 — key name used correctly
  it('uses the provided key name', () => {
    const { result } = renderHook(() =>
      useLocalStorage('my-specific-key', 42)
    );
    act(() => {
      result.current[1](99);
    });
    expect(localStorage.getItem('my-specific-key')).toBe('99');
    expect(localStorage.getItem('other-key')).toBeNull();
  });
});
