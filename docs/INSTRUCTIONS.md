# TikTok 直播禮物計分網站 — 開發 Instructions

## 1. 專案目的

協助國際 TikTok 直播團隊在直播跳舞時，由 host 即時記錄觀眾送給每位女主播的禮物分數，取代目前手寫紙本計分的流程。網站需即時顯示排行榜，並將資料保存在 localStorage，避免不小心關掉瀏覽器導致資料遺失。

## 2. 技術棧

- **框架**：React 18 + TypeScript
- **建置工具**：Vite
- **樣式**：Tailwind CSS
- **狀態管理**：React 內建 `useState` / `useReducer`，搭配自訂 hook 封裝 localStorage 邏輯
- **部署**：Vercel
- **套件管理**：pnpm（或 npm，依開發者偏好）

不要引入 Redux、Zustand、React Query 等額外狀態管理套件，這個專案規模不需要。

## 3. 功能規格

### 3.1 主播管理

- 主畫面隨時可新增 / 刪除主播，人數不固定
- 新增主播：提供輸入框與「新增」按鈕，輸入名字後加入 grid
- 刪除主播：每位主播卡片上有刪除按鈕（建議用 icon），點擊後出現確認 dialog（避免誤刪導致歷史分數遺失）
- 名字不可重複；若使用者輸入已存在的名字，顯示錯誤提示
- 名字不可為空白；trim 後為空則不接受
- 名字長度上限建議 30 字元（避免破版）
- 支援中英日韓字元

### 3.2 計分流程

1. 使用者點擊某位主播的卡片 → 該卡片進入 selected 狀態（視覺上要明顯，例如邊框加粗 + 背景色變化）
2. 在底部輸入框輸入分數（整數，可正可負，無上限）
3. 點「送出」按鈕 → 分數加到該主播，歷史紀錄新增一筆，排行榜即時更新
4. 送出後輸入框清空，但 selected 主播保持選中狀態（方便連續加分給同一人）
5. 同時只能選一位主播；點另一位會切換選擇
6. 再次點擊已選中的主播 → 取消選擇

**送出按鈕 disable 條件**（任一成立即 disable）：
- 沒有選擇任何主播
- 輸入框為空
- 輸入內容不是合法整數（例如有小數點、非數字字元）

**輸入框驗證**：
- 只接受整數（含負數）
- 不接受小數點
- 不接受非數字字元（除了開頭的負號）
- 建議 input 用 `type="text"` 搭配自訂驗證，不要用 `type="number"`（瀏覽器行為不一致）
- 按 Enter 鍵等同點送出按鈕

### 3.3 歷史紀錄顯示

- 每位主播卡片上顯示：
  - 名字
  - 總分（顯眼，字體較大）
  - 歷史紀錄列表：每一筆顯示為 `+10`、`-5`、`+20` 等，正數要明確帶 `+` 號，負數帶 `-` 號
  - 歷史紀錄按時間順序由新到舊排列
- 每一筆歷史紀錄旁邊有刪除按鈕（小 icon），點擊後出現確認 dialog，確認後刪除該筆紀錄並重算總分（host 打錯時可修正）
- 如果歷史紀錄太多，卡片內要可滾動，不要把整個 layout 撐爆

### 3.4 排行榜（網站右側）

- 即時依總分由高到低排序
- 顯示排名數字（1, 2, 3...）
- **同分並列同排名**：例如兩人都是第 1 名，下一位顯示為第 3 名（標準競賽排名 / "1224" 排名法）
- 每一列顯示：排名、名字、總分
- 沒有任何主播時顯示空狀態提示（例如「尚未加入主播」）
- 排行榜要可滾動（主播很多時）

### 3.5 Reset 按鈕

- 位置：放在送出按鈕旁邊
- 行為：點擊 → 出現確認 dialog（明確說明會清除「所有主播與分數紀錄」） → 確認後完全清空（主播名單 + 所有分數 + localStorage）→ 回到空狀態
- Dialog 要有「確認」與「取消」兩個按鈕

## 4. Layout 設計

### 4.1 桌機（≥ 1024px）

```
┌─────────────────────────────────────────────────────┐
│  Header（標題 + 新增主播輸入區）                      │
├──────────────────────────────────┬──────────────────┤
│                                  │                  │
│  主播 Grid                        │  排行榜          │
│  （多欄卡片）                      │  （sticky）      │
│                                  │                  │
│                                  │                  │
├──────────────────────────────────┴──────────────────┤
│  底部固定區：[已選: XXX] [輸入框] [送出] [Reset]      │
└─────────────────────────────────────────────────────┘
```

- 中間 grid 使用 CSS Grid，依寬度自動調整欄數（建議 `grid-template-columns: repeat(auto-fill, minmax(220px, 1fr))`）
- 右側排行榜固定寬度（例如 320px），sticky 定位
- 底部輸入區固定在畫面底部（`position: sticky` 或 `fixed`），確保隨時可操作

### 4.2 手機（< 768px，RWD）

```
┌──────────────────────┐
│  Header              │
├──────────────────────┤
│  Tab: [主播] [排行榜] │  ← 切換顯示
├──────────────────────┤
│                      │
│  主播 Grid（單欄或兩欄）│
│  或 排行榜            │
│                      │
├──────────────────────┤
│ [輸入框] [送出][Reset] │  ← 固定底部
└──────────────────────┘
```

- 排行榜與主播 grid 改用 Tab 切換，避免擠在一起
- 主播卡片改為單欄或兩欄
- 底部輸入區仍固定在底部
- 確保按鈕點擊區域夠大（至少 44x44 px）

### 4.3 中等寬度（768px ~ 1024px）

- 排行榜可改為較窄寬度（例如 240px）
- 或保持桌機 layout 但減少 grid 欄數

## 5. 資料結構

```typescript
type StreamerId = string; // 用 crypto.randomUUID() 生成

type ScoreEntry = {
  id: string;        // 紀錄 ID，用於刪除
  amount: number;    // 整數，可正可負
  timestamp: number; // Date.now()
};

type Streamer = {
  id: StreamerId;
  name: string;
  history: ScoreEntry[]; // 由舊到新儲存，顯示時 reverse
};

type AppState = {
  streamers: Streamer[];
  selectedStreamerId: StreamerId | null;
};
```

- 總分是 derived value（`history.reduce((sum, e) => sum + e.amount, 0)`），不要存在 state 裡，避免不一致
- 排名也是 derived value，從 streamers 即時計算

## 6. localStorage

- 用一個 key（例如 `tiktok-scoreboard-v1`）儲存整個 `streamers` 陣列
- `selectedStreamerId` **不**儲存到 localStorage（重新打開應該是未選擇狀態）
- 寫入時機：每次 streamers 變動時（用 `useEffect`）
- 讀取時機：App 初始化時
- 寫一個 `useLocalStorage` custom hook 封裝邏輯
- key 名稱帶版本號（`-v1`），未來資料結構變動時方便處理 migration
- 讀取時要 try/catch，localStorage 損毀或 JSON parse 失敗時 fallback 到空陣列

## 7. 確認 Dialog

需要 dialog 的場景：
1. 刪除主播
2. 刪除單筆歷史紀錄
3. Reset 全部資料

建議自己寫一個簡單的 `<ConfirmDialog>` 元件，用原生 `<dialog>` 元素或 Tailwind + React state 實作。不要引入 Radix UI 或 shadcn/ui 等大型套件（這個專案規模不需要）。

每個 dialog 要有：
- 明確的標題
- 說明文字（清楚講明後果，例如 reset 要說「將刪除所有主播與分數紀錄，此操作無法復原」）
- 「確認」按鈕（建議紅色 / 警告色）
- 「取消」按鈕
- 按 ESC 或點 backdrop 等同取消

## 8. 元件拆分建議

```
src/
├── App.tsx                    // 根元件，組合所有區塊
├── components/
│   ├── Header.tsx             // 標題 + 新增主播
│   ├── StreamerGrid.tsx       // 主播卡片 grid
│   ├── StreamerCard.tsx       // 單一主播卡片
│   ├── ScoreHistory.tsx       // 卡片內的歷史紀錄列表
│   ├── Leaderboard.tsx        // 右側排行榜
│   ├── ScoreInputBar.tsx      // 底部輸入區（含送出 + reset）
│   └── ConfirmDialog.tsx      // 通用確認 dialog
├── hooks/
│   ├── useLocalStorage.ts
│   └── useScoreboard.ts       // 主要狀態邏輯（useReducer）
├── types.ts
├── utils/
│   └── ranking.ts             // 計算排名（含並列邏輯）
└── main.tsx
```

## 9. 狀態管理建議

用 `useReducer` 統一管理 streamers 狀態，actions 至少包含：
- `ADD_STREAMER`
- `REMOVE_STREAMER`
- `ADD_SCORE`
- `REMOVE_SCORE_ENTRY`
- `RESET_ALL`

selectedStreamerId 用獨立 `useState` 管理即可（因為不需要持久化）。

把 reducer 邏輯封裝在 `useScoreboard` hook 裡，順便處理 localStorage 同步。

## 10. UI / UX 細節

- 主色調建議用 TikTok 風格的對比色（黑、白、粉紅 / 青色），但保持簡潔不要花俏
- selected 狀態的卡片要非常明顯（建議邊框加粗 + 背景色變化 + 微微放大）
- 排行榜前三名可以用不同顏色或 emoji（🥇🥈🥉）標示，提升可讀性
- 加分時可以加一個簡單的動畫（例如卡片短暫高亮），讓 host 知道操作成功
- 字體建議用系統字體（system-ui）或 Noto Sans TC，確保中文顯示正常
- 整體 UI 文字使用**繁體中文**

## 11. 邊界情況處理

- 主播名單為空時：grid 顯示「尚未加入主播」提示；排行榜顯示空狀態
- 歷史紀錄為空時：卡片只顯示總分 0，不顯示歷史列表
- 輸入 0 分時：要不要允許？**建議擋掉**（送出按鈕 disable），避免誤操作
- 輸入超大數字（例如 999999999）：技術上接受，但 UI 顯示要能容納（用 `Intl.NumberFormat` 加千分位）
- 同名檢查：trim 後比對，大小寫敏感（"Anna" 和 "anna" 視為不同）

## 12. 部署到 Vercel

1. push 到 GitHub repo
2. 在 Vercel 連結 repo
3. Framework preset 選 Vite
4. Build command: `pnpm build`（或 `npm run build`）
5. Output directory: `dist`
6. 不需要任何環境變數

## 13. 不需要做的事（避免 over-engineering）

- 不需要後端、API、資料庫
- 不需要使用者登入 / 多帳號
- 不需要多直播間管理
- 不需要匯出 CSV / 報表（除非後續需求提出）
- 不需要 i18n 框架（直接寫繁體中文即可）
- 不需要寫測試（這個規模可以靠手動測試）
- 不需要 PWA / 離線支援（localStorage 已經夠用）

## 14. 開發順序建議

1. 用 Vite 建立 React + TS 專案，裝 Tailwind
2. 定義 types 與 reducer
3. 實作 `useLocalStorage` 與 `useScoreboard` hook
4. 做出主播 grid + 新增 / 刪除主播
5. 做出底部輸入區與計分邏輯
6. 做出排行榜與排名計算
7. 做出歷史紀錄顯示與單筆刪除
8. 做出 Reset 功能與所有 confirm dialog
9. RWD 調整（手機 tab 切換）
10. 視覺打磨（動畫、配色、空狀態）
11. 部署到 Vercel

## 15. 匯出 Excel 功能

### 15.1 功能描述

- 按下「📊 匯出 Excel」按鈕後，自動下載一份 `.xlsx` 檔案
- 檔名格式：`TikTok計分_YYYYMMDD_HHmm.xlsx`（依當下時間命名）
- 按鈕位置：排行榜（右側 sidebar）底部
- 沒有任何主播時按鈕 disabled

### 15.2 Excel 工作表結構

| 工作表名稱 | 內容 | 欄位 |
|------------|------|------|
| 排行榜 | 依總分排序的名次摘要 | 排名、主播名稱、總分、計分筆數 |
| 歷史紀錄 | 所有計分事件依時間正序 | 時間、主播名稱、分數、加/扣分 |
| 各主播明細 | 各主播分開顯示，含累計分數流水帳 | 主播名稱、時間、分數、累計分數 |

### 15.3 技術實作

- 使用 `xlsx`（SheetJS）套件生成 `.xlsx` 檔
- 實作位於 `src/utils/exportExcel.ts`，由 `Leaderboard.tsx` 呼叫
- 只用於生成（write），不解析使用者上傳的檔案，已知的套件漏洞（prototype pollution in parsing）不影響此使用情境

## 16. 需要 host / 使用者確認的細節（開發中再問）

- 配色與品牌風格是否有特定要求
- 是否有 logo
- 主播卡片要不要顯示頭像（如果要，需要規劃上傳機制，這會是額外工作）
