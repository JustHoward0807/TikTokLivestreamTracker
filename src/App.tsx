import { useState, useCallback } from "react";
import Header from "./components/Header";
import StreamerGrid from "./components/StreamerGrid";
import Leaderboard from "./components/Leaderboard";
import ScoreInputBar from "./components/ScoreInputBar";
import { useScoreboard } from "./hooks/useScoreboard";
import type { StreamerId } from "./types";
import { Analytics } from "@vercel/analytics/next";

type MobileTab = "streamers" | "leaderboard";

export default function App() {
  const {
    streamers,
    selectedStreamerId,
    selectStreamer,
    addStreamer,
    removeStreamer,
    addScore,
    removeScoreEntry,
    resetAll,
  } = useScoreboard();

  const [mobileTab, setMobileTab] = useState<MobileTab>("streamers");
  const [flashId, setFlashId] = useState<StreamerId | null>(null);

  const handleSubmitScore = useCallback(
    (streamerId: StreamerId, amount: number) => {
      addScore(streamerId, amount);
      setFlashId(streamerId);
      setTimeout(() => setFlashId(null), 600);
    },
    [addScore],
  );

  const existingNames = streamers.map((s) => s.name);

  return (
    <>
      <div className="h-dvh flex flex-col bg-gray-950 text-white overflow-hidden">
        <Header existingNames={existingNames} onAdd={addStreamer} />

        {/* Mobile tab bar */}
        <div className="flex lg:hidden border-b border-gray-800 bg-gray-900">
          <button
            className={[
              "flex-1 py-2 text-sm font-semibold transition-colors cursor-pointer",
              mobileTab === "streamers"
                ? "text-pink-400 border-b-2 border-pink-400"
                : "text-gray-400 hover:text-gray-200",
            ].join(" ")}
            onClick={() => setMobileTab("streamers")}
          >
            主播
          </button>
          <button
            className={[
              "flex-1 py-2 text-sm font-semibold transition-colors cursor-pointer",
              mobileTab === "leaderboard"
                ? "text-pink-400 border-b-2 border-pink-400"
                : "text-gray-400 hover:text-gray-200",
            ].join(" ")}
            onClick={() => setMobileTab("leaderboard")}
          >
            排行榜
          </button>
        </div>

        {/* Main content */}
        <div className="flex-1 flex overflow-hidden">
          {/* Desktop: always show grid */}
          <div
            className={[
              "flex-1 flex flex-col overflow-hidden",
              mobileTab !== "streamers" ? "hidden lg:flex" : "flex",
            ].join(" ")}
          >
            <StreamerGrid
              streamers={streamers}
              selectedStreamerId={selectedStreamerId}
              flashId={flashId}
              onSelect={selectStreamer}
              onRemove={removeStreamer}
              onRemoveEntry={removeScoreEntry}
            />
          </div>

          {/* Desktop: sidebar leaderboard; Mobile: full-width tab */}
          <div
            className={[
              mobileTab !== "leaderboard"
                ? "hidden lg:flex"
                : "flex flex-1 flex-col lg:flex-none",
            ].join(" ")}
          >
            <Leaderboard streamers={streamers} />
          </div>
        </div>

        <ScoreInputBar
          streamers={streamers}
          selectedStreamerId={selectedStreamerId}
          onSubmit={handleSubmitScore}
          onReset={resetAll}
        />
      </div>
      <Analytics />
    </>
  );
}
