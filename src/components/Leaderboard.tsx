import type { Streamer } from '../types';
import { computeRanking } from '../utils/ranking';
import { exportToExcel } from '../utils/exportExcel';

type Props = {
  streamers: Streamer[];
};

const MEDALS = ['🥇', '🥈', '🥉'];

export default function Leaderboard({ streamers }: Props) {
  const ranked = computeRanking(streamers);

  return (
    <aside className="w-80 shrink-0 bg-gray-900 border-l border-gray-800 flex flex-col">
      <div className="px-4 py-3 border-b border-gray-800">
        <h2 className="text-white font-bold text-base">排行榜</h2>
      </div>
      <div className="overflow-y-auto flex-1 py-2">
        {ranked.length === 0 ? (
          <p className="text-gray-500 text-sm text-center mt-8">尚未加入主播</p>
        ) : (
          <ol className="flex flex-col">
            {ranked.map((s) => {
              const medal = MEDALS[s.rank - 1];
              return (
                <li
                  key={s.id}
                  className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-800 transition-colors"
                >
                  <span className="w-8 text-center text-sm font-bold text-gray-400 shrink-0">
                    {medal ?? `#${s.rank}`}
                  </span>
                  <span className="flex-1 text-white text-sm truncate">{s.name}</span>
                  <span
                    className={[
                      'text-sm font-bold tabular-nums shrink-0',
                      s.totalScore > 0
                        ? 'text-emerald-400'
                        : s.totalScore < 0
                          ? 'text-rose-400'
                          : 'text-gray-400',
                    ].join(' ')}
                  >
                    {Intl.NumberFormat().format(s.totalScore)}
                  </span>
                </li>
              );
            })}
          </ol>
        )}
      </div>

      {/* Export button */}
      <div className="px-4 py-3 border-t border-gray-800">
        <button
          onClick={() => exportToExcel(streamers)}
          disabled={streamers.length === 0}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-emerald-700 hover:bg-emerald-600 disabled:bg-gray-700 disabled:text-gray-500 disabled:cursor-not-allowed text-white text-sm font-semibold transition-colors cursor-pointer"
        >
          <span>📊</span>
          <span>匯出 Excel</span>
        </button>
      </div>
    </aside>
  );
}
