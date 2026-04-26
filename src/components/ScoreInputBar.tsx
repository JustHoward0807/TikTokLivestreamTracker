import { useState } from 'react';
import type { Streamer, StreamerId } from '../types';
import ConfirmDialog from './ConfirmDialog';

type Props = {
  streamers: Streamer[];
  selectedStreamerId: StreamerId | null;
  onSubmit: (streamerId: StreamerId, amount: number) => void;
  onReset: () => void;
};

function isValidInteger(s: string): boolean {
  return /^-?[1-9]\d*$/.test(s);
}

export default function ScoreInputBar({
  streamers,
  selectedStreamerId,
  onSubmit,
  onReset,
}: Props) {
  const [input, setInput] = useState('');
  const [showReset, setShowReset] = useState(false);

  const selectedName = streamers.find((s) => s.id === selectedStreamerId)?.name;
  const canSubmit =
    selectedStreamerId !== null &&
    input !== '' &&
    isValidInteger(input);

  const handleSubmit = () => {
    if (!canSubmit || !selectedStreamerId) return;
    onSubmit(selectedStreamerId, parseInt(input, 10));
    setInput('');
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    // Allow empty, minus sign, or digits (no dots, no other chars)
    if (/^-?\d*$/.test(val)) setInput(val);
  };

  return (
    <>
      <footer className="sticky bottom-0 bg-gray-900 border-t border-gray-800 px-4 py-3">
        <div className="max-w-screen-xl mx-auto flex items-center gap-3 flex-wrap">
          <span className="text-sm text-gray-400 shrink-0 min-w-24">
            {selectedName ? (
              <span>
                已選：<span className="text-pink-400 font-semibold">{selectedName}</span>
              </span>
            ) : (
              '尚未選擇主播'
            )}
          </span>

          <input
            type="text"
            inputMode="numeric"
            value={input}
            placeholder="輸入分數（整數）"
            className="flex-1 min-w-32 rounded-lg bg-gray-800 border border-gray-700 text-white placeholder-gray-500 px-3 py-2 text-sm focus:outline-none focus:border-pink-500 transition-colors"
            onChange={handleInputChange}
            onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
          />

          <button
            disabled={!canSubmit}
            className="px-4 py-2 rounded-lg bg-pink-600 text-white text-sm font-semibold transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed hover:enabled:bg-pink-500"
            onClick={handleSubmit}
          >
            送出
          </button>

          <button
            className="px-4 py-2 rounded-lg bg-gray-700 text-gray-300 text-sm font-semibold hover:bg-gray-600 transition-colors cursor-pointer"
            onClick={() => setShowReset(true)}
          >
            Reset
          </button>
        </div>
      </footer>

      <ConfirmDialog
        open={showReset}
        title="重置所有資料"
        description="將刪除所有主播與分數紀錄，此操作無法復原。"
        confirmLabel="確認重置"
        onConfirm={() => {
          onReset();
          setShowReset(false);
        }}
        onCancel={() => setShowReset(false)}
      />
    </>
  );
}
