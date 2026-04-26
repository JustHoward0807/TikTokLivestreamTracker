export type StreamerId = string;

export type ScoreEntry = {
  id: string;
  amount: number;
  timestamp: number;
};

export type Streamer = {
  id: StreamerId;
  name: string;
  history: ScoreEntry[];
};

export type AppState = {
  streamers: Streamer[];
};
