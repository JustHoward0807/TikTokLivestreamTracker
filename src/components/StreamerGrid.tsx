import type { Streamer, StreamerId } from '../types';
import StreamerCard from './StreamerCard';

type Props = {
  streamers: Streamer[];
  selectedStreamerId: StreamerId | null;
  flashId: StreamerId | null;
  onSelect: (id: StreamerId) => void;
  onRemove: (id: StreamerId) => void;
  onRemoveEntry: (streamerId: StreamerId, entryId: string) => void;
};

export default function StreamerGrid({
  streamers,
  selectedStreamerId,
  flashId,
  onSelect,
  onRemove,
  onRemoveEntry,
}: Props) {
  if (streamers.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-500 text-base">
        尚未加入主播，請在上方輸入名字開始
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-4">
      <div
        className="grid gap-4"
        style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))' }}
      >
        {streamers.map((s) => (
          <StreamerCard
            key={s.id}
            streamer={s}
            isSelected={s.id === selectedStreamerId}
            flash={s.id === flashId}
            onClick={() => onSelect(s.id)}
            onRemove={onRemove}
            onRemoveEntry={onRemoveEntry}
          />
        ))}
      </div>
    </div>
  );
}
