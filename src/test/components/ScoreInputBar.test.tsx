import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ScoreInputBar from '../../components/ScoreInputBar';
import type { Streamer } from '../../types';

function makeStreamer(id: string, name: string): Streamer {
  return { id, name, history: [] };
}

function setup({
  streamers = [] as Streamer[],
  selectedStreamerId = null as string | null,
} = {}) {
  const onSubmit = vi.fn();
  const onReset = vi.fn();
  render(
    <ScoreInputBar
      streamers={streamers}
      selectedStreamerId={selectedStreamerId}
      onSubmit={onSubmit}
      onReset={onReset}
    />
  );
  return {
    onSubmit,
    onReset,
    input: screen.getByPlaceholderText('輸入分數（整數）'),
    submitBtn: screen.getByRole('button', { name: '送出' }),
    resetBtn: screen.getByRole('button', { name: 'Reset' }),
  };
}

beforeEach(() => {
  vi.clearAllMocks();
});

// §2.1.4 — no streamer selected → disabled
describe('ScoreInputBar — submit button disabled conditions', () => {
  it('is disabled when no streamer is selected', () => {
    const { submitBtn } = setup({
      streamers: [makeStreamer('a', 'Anna')],
      selectedStreamerId: null,
    });
    expect(submitBtn).toBeDisabled();
  });

  // §2.1.5 — selected but empty input → disabled
  it('is disabled when streamer selected but input is empty', () => {
    const { submitBtn } = setup({
      streamers: [makeStreamer('a', 'Anna')],
      selectedStreamerId: 'a',
    });
    expect(submitBtn).toBeDisabled();
  });

  // §2.2.3 — 0 is rejected
  it('is disabled when input is 0', async () => {
    const { submitBtn, input } = setup({
      streamers: [makeStreamer('a', 'Anna')],
      selectedStreamerId: 'a',
    });
    await userEvent.type(input, '0');
    expect(submitBtn).toBeDisabled();
  });

  // §2.2.1 — valid positive integer → enabled
  it('is enabled for a valid positive integer with streamer selected', async () => {
    const { submitBtn, input } = setup({
      streamers: [makeStreamer('a', 'Anna')],
      selectedStreamerId: 'a',
    });
    await userEvent.type(input, '10');
    expect(submitBtn).toBeEnabled();
  });

  // §2.2.2 — valid negative integer → enabled
  it('is enabled for a valid negative integer', async () => {
    const { submitBtn, input } = setup({
      streamers: [makeStreamer('a', 'Anna')],
      selectedStreamerId: 'a',
    });
    await userEvent.type(input, '-5');
    expect(submitBtn).toBeEnabled();
  });
});

// §2.2 — input validation (characters)
describe('ScoreInputBar — input character filtering', () => {
  // §2.2.4 — decimal point rejected
  it('does not allow decimal point input', async () => {
    const { input } = setup({
      streamers: [makeStreamer('a', 'Anna')],
      selectedStreamerId: 'a',
    });
    await userEvent.type(input, '10.5');
    expect(input).toHaveValue('105'); // dot filtered out
  });

  // §2.2.5 — letters rejected
  it('does not allow letter input', async () => {
    const { input } = setup({
      streamers: [makeStreamer('a', 'Anna')],
      selectedStreamerId: 'a',
    });
    await userEvent.type(input, 'abc');
    expect(input).toHaveValue('');
  });

  // §2.2.9 — double minus rejected
  it('does not allow double minus', async () => {
    const { input } = setup({
      streamers: [makeStreamer('a', 'Anna')],
      selectedStreamerId: 'a',
    });
    await userEvent.type(input, '--5');
    expect(input).toHaveValue('-5');
  });
});

// §2.3 — submitting scores
describe('ScoreInputBar — score submission', () => {
  it('calls onSubmit with correct streamerId and amount', async () => {
    const { onSubmit, input, submitBtn } = setup({
      streamers: [makeStreamer('a', 'Anna')],
      selectedStreamerId: 'a',
    });
    await userEvent.type(input, '10');
    await userEvent.click(submitBtn);
    expect(onSubmit).toHaveBeenCalledWith('a', 10);
  });

  // §2.3.4 — input clears after submit
  it('clears input after successful submit', async () => {
    const { input, submitBtn } = setup({
      streamers: [makeStreamer('a', 'Anna')],
      selectedStreamerId: 'a',
    });
    await userEvent.type(input, '10');
    await userEvent.click(submitBtn);
    expect(input).toHaveValue('');
  });

  // §2.3.6 — Enter key submits
  it('submits on Enter key press', async () => {
    const { onSubmit, input } = setup({
      streamers: [makeStreamer('a', 'Anna')],
      selectedStreamerId: 'a',
    });
    await userEvent.type(input, '10{Enter}');
    expect(onSubmit).toHaveBeenCalledWith('a', 10);
  });

  it('submits negative score correctly', async () => {
    const { onSubmit, input, submitBtn } = setup({
      streamers: [makeStreamer('a', 'Anna')],
      selectedStreamerId: 'a',
    });
    await userEvent.type(input, '-3');
    await userEvent.click(submitBtn);
    expect(onSubmit).toHaveBeenCalledWith('a', -3);
  });
});

// §2.1.7 — selected streamer name shown in footer
describe('ScoreInputBar — selected streamer label', () => {
  it('shows selected streamer name', () => {
    setup({
      streamers: [makeStreamer('a', 'Anna')],
      selectedStreamerId: 'a',
    });
    expect(screen.getByText('Anna')).toBeInTheDocument();
  });

  it('shows fallback text when no streamer selected', () => {
    setup({ streamers: [makeStreamer('a', 'Anna')], selectedStreamerId: null });
    expect(screen.getByText('尚未選擇主播')).toBeInTheDocument();
  });
});
