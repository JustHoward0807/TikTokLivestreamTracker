import { useState } from 'react';
import type { Streamer } from '../types';
import { totalScore } from '../utils/ranking';
import ScoreHistory from './ScoreHistory';
import ConfirmDialog from './ConfirmDialog';

type Props = {
  streamer: Streamer;
  isSelected: boolean;
  flash: boolean;
  onClick: () => void;
  onRemove: (id: string) => void;
  onRemoveEntry: (streamerId: string, entryId: string) => void;
};

export default function StreamerCard({
  streamer,
  isSelected,
  flash,
  onClick,
  onRemove,
  onRemoveEntry,
}: Props) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const score = totalScore(streamer);

  return (
    <>
      <div
        onClick={onClick}
        className={[
          'relative rounded-2xl p-4 flex flex-col gap-3 cursor-pointer select-none transition-all duration-150',
          isSelected
            ? 'bg-gray-700 ring-2 ring-pink-500 scale-[1.02] shadow-lg shadow-pink-900/30'
            : 'bg-gray-800 hover:bg-gray-750 ring-1 ring-gray-700',
          flash ? 'animate-pulse' : '',
        ]
          .filter(Boolean)
          .join(' ')}
      >
        {/* Delete button */}
        <button
          title="刪除主播"
          className="absolute top-3 right-3 text-gray-500 hover:text-rose-400 transition-colors text-sm cursor-pointer z-10"
          onClick={(e) => {
            e.stopPropagation();
            setConfirmDelete(true);
          }}
        >
          🗑
        </button>

        {/* Name */}
        <p className="text-white font-semibold text-base pr-6 truncate">{streamer.name}</p>

        {/* Total score */}
        <p
          className={[
            'text-3xl font-bold tabular-nums',
            score > 0 ? 'text-emerald-400' : score < 0 ? 'text-rose-400' : 'text-gray-400',
          ].join(' ')}
        >
          {Intl.NumberFormat().format(score)}
        </p>

        {/* History */}
        <ScoreHistory
          history={streamer.history}
          streamerId={streamer.id}
          onRemoveEntry={onRemoveEntry}
        />
      </div>

      <ConfirmDialog
        open={confirmDelete}
        title={`刪除「${streamer.name}」`}
        description="刪除後，該主播的所有分數紀錄也會一併移除，此操作無法復原。"
        confirmLabel="刪除"
        onConfirm={() => {
          onRemove(streamer.id);
          setConfirmDelete(false);
        }}
        onCancel={() => setConfirmDelete(false)}
      />
    </>
  );
}
