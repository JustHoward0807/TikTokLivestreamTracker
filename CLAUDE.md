# TikTok 直播計分網站

## 專案概要
協助 TikTok 直播 host 即時記錄觀眾送禮分數，取代手寫計分。

## 技術棧
- React 18 + TypeScript + Vite
- Tailwind CSS
- 狀態管理：useReducer + 自訂 hook，**不要**引入 Redux/Zustand
- 部署：Vercel

## 指令
- `pnpm dev` — 開發
- `pnpm build` — 建置
- `pnpm preview` — 預覽 build

## 架構
- `src/hooks/useScoreboard.ts` — 主要狀態邏輯（reducer + localStorage 同步）
- `src/hooks/useLocalStorage.ts` — localStorage 封裝
- `src/utils/ranking.ts` — 排名計算（標準競賽排名 1,1,3,4）
- `src/components/` — UI 元件，請參考既有檔案的風格

## 重要設計決策
- 總分是 derived value，從 history 即時計算，**不要**存進 state
- localStorage key 帶版本號 `tiktok-scoreboard-v1`，未來改 schema 時要 bump 版本並處理 migration
- `selectedStreamerId` 不持久化（重開應為未選擇）
- 輸入框用 `type="text"` + 自訂驗證，**不要**用 `type="number"`（瀏覽器行為不一致）
- 確認 dialog 自己刻，**不要**引入 Radix/shadcn

## 程式碼慣例
- UI 文字一律繁體中文
- 元件用 function component + hooks
- ID 用 `crypto.randomUUID()`

## 匯出功能
- `src/utils/exportExcel.ts` — 使用 SheetJS (`xlsx`) 產生 .xlsx 檔，共三個工作表：
  - **排行榜**：排名、主播名稱、總分、計分筆數
  - **歷史紀錄**：所有計分事件依時間排序（時間、主播、分數、加/扣分）
  - **各主播明細**：各主播分開的計分流水帳（含累計分數）
- 匯出按鈕位於排行榜底部，無主播時 disabled
- 依賴套件：`xlsx`（只用於生成，不解析使用者上傳檔案，安全無虞）

## 不做的事
- 後端 / API / 資料庫
- 使用者登入
- 多直播間
- i18n 框架
- 單元測試（手動測試為主，見 TESTING.md）

## 文件維護規則

每次新增、移除或修改任何功能（行為、UI、資料結構、限制條件）後，在回應結尾必須：

1. **列出異動項目**（每項一句話即可）。
2. **詢問使用者**是否要同步更新 `CLAUDE.md` 與／或 `docs/INSTRUCTIONS.md`。

未經使用者明確同意，不可自行修改這兩份文件。