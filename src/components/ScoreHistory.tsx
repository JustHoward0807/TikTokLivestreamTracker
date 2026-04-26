import { useState } from 'react';
import type { ScoreEntry } from '../types';
import { formatScore } from '../utils/ranking';
import ConfirmDialog from './ConfirmDialog';

type Props = {
  history: ScoreEntry[];
  streamerId: string;
  onRemoveEntry: (streamerId: string, entryId: string) => void;
};

export default function ScoreHistory({ history, streamerId, onRemoveEntry }: Props) {
  const [pendingDelete, setPendingDelete] = useState<string | null>(null);

  if (history.length === 0) return null;

  const sorted = [...history].reverse();

  return (
    <>
      <ul className="flex flex-col gap-1 overflow-y-auto max-h-40 pr-1">
        {sorted.map((entry) => {
          const isPositive = entry.amount > 0;
          return (
            <li key={entry.id} className="flex items-center justify-between gap-2 text-sm">
              <span
                className={
                  isPositive ? 'text-emerald-400 font-medium' : 'text-rose-400 font-medium'
                }
              >
                {formatScore(entry.amount)}
              </span>
              <button
                title="刪除此紀錄"
                className="text-gray-600 hover:text-rose-400 transition-colors text-xs leading-none cursor-pointer"
                onClick={() => setPendingDelete(entry.id)}
              >
                ✕
              </button>
            </li>
          );
        })}
      </ul>

      <ConfirmDialog
        open={pendingDelete !== null}
        title="刪除紀錄"
        description="確認要刪除這筆分數紀錄並重算總分嗎？"
        confirmLabel="刪除"
        onConfirm={() => {
          if (pendingDelete) onRemoveEntry(streamerId, pendingDelete);
          setPendingDelete(null);
        }}
        onCancel={() => setPendingDelete(null)}
      />
    </>
  );
}
