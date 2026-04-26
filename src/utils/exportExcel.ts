import * as XLSX from 'xlsx';
import type { Streamer } from '../types';
import { computeRanking } from './ranking';

function formatTimestamp(ts: number): string {
  const d = new Date(ts);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

function rankLabel(rank: number): string {
  if (rank === 1) return '🥇 第1名';
  if (rank === 2) return '🥈 第2名';
  if (rank === 3) return '🥉 第3名';
  return `第${rank}名`;
}

export function exportToExcel(streamers: Streamer[]): void {
  const ranked = computeRanking(streamers);
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  const dateStr = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}_${pad(now.getHours())}${pad(now.getMinutes())}`;

  // ── Sheet 1: 排行榜總覽 ──────────────────────────────────────────
  const leaderboardRows = ranked.map((s) => ({
    排名: rankLabel(s.rank),
    主播名稱: s.name,
    總分: s.totalScore,
    計分筆數: s.history.length,
  }));

  const leaderboardSheet = XLSX.utils.json_to_sheet(leaderboardRows);

  // Column widths
  leaderboardSheet['!cols'] = [
    { wch: 12 }, // 排名
    { wch: 20 }, // 主播名稱
    { wch: 10 }, // 總分
    { wch: 10 }, // 計分筆數
  ];

  // ── Sheet 2: 歷史紀錄明細 ────────────────────────────────────────
  // Flatten all entries, sorted by timestamp
  const allEntries = ranked.flatMap((s) =>
    s.history.map((e) => ({
      streamerName: s.name,
      streamerRank: s.rank,
      entry: e,
    }))
  );
  allEntries.sort((a, b) => a.entry.timestamp - b.entry.timestamp);

  const historyRows = allEntries.map((item) => ({
    時間: formatTimestamp(item.entry.timestamp),
    主播名稱: item.streamerName,
    分數: item.entry.amount,
    正負: item.entry.amount >= 0 ? '加分' : '扣分',
  }));

  const historySheet = XLSX.utils.json_to_sheet(
    historyRows.length > 0 ? historyRows : [{ 時間: '（無紀錄）', 主播名稱: '', 分數: '', 正負: '' }]
  );

  historySheet['!cols'] = [
    { wch: 22 }, // 時間
    { wch: 20 }, // 主播名稱
    { wch: 10 }, // 分數
    { wch: 8 },  // 正負
  ];

  // ── Sheet 3: 各主播小計 ──────────────────────────────────────────
  const perStreamerRows = ranked.flatMap((s) => {
    const entries = [...s.history].sort((a, b) => a.timestamp - b.timestamp);
    let running = 0;
    const rows = entries.map((e) => {
      running += e.amount;
      return {
        主播名稱: s.name,
        時間: formatTimestamp(e.timestamp),
        分數: e.amount,
        累計分數: running,
      };
    });
    // Blank separator row between streamers
    if (rows.length > 0) {
      rows.push({ 主播名稱: '', 時間: '', 分數: '' as unknown as number, 累計分數: '' as unknown as number });
    }
    return rows;
  });

  const perStreamerSheet = XLSX.utils.json_to_sheet(
    perStreamerRows.length > 0
      ? perStreamerRows
      : [{ 主播名稱: '（無紀錄）', 時間: '', 分數: 0, 累計分數: 0 }]
  );

  perStreamerSheet['!cols'] = [
    { wch: 20 }, // 主播名稱
    { wch: 22 }, // 時間
    { wch: 10 }, // 分數
    { wch: 12 }, // 累計分數
  ];

  // ── Assemble workbook ────────────────────────────────────────────
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, leaderboardSheet, '排行榜');
  XLSX.utils.book_append_sheet(wb, historySheet, '歷史紀錄');
  XLSX.utils.book_append_sheet(wb, perStreamerSheet, '各主播明細');

  XLSX.writeFile(wb, `TikTok計分_${dateStr}.xlsx`);
}
